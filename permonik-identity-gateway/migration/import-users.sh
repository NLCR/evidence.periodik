#!/bin/sh
set -eu

script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd)
env_file=$script_dir/../../.env.local

if [ -z "${IDENTITY_DATABASE_PASSWORD:-}" ] && [ -f "$env_file" ]; then
    set -a
    . "$env_file"
    set +a
fi

IDENTITY_DATABASE_URL=${IDENTITY_DATABASE_URL:-postgresql://permonik@localhost:5433/permonik_identity}
if [ -z "${PGPASSWORD:-}" ] && [ -n "${IDENTITY_DATABASE_PASSWORD:-}" ]; then
    PGPASSWORD=$IDENTITY_DATABASE_PASSWORD
    export PGPASSWORD
fi

for command in curl jq psql; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "$command is required" >&2
        exit 2
    fi
done

database_url=${IDENTITY_DATABASE_URL#jdbc:}
solr_url=http://localhost:8983/solr/user/select
temp_dir=$(mktemp -d "${TMPDIR:-/tmp}/permonik-users.XXXXXX")
json_file=$temp_dir/users.json
csv_file=$temp_dir/users.csv
trap 'rm -rf "$temp_dir"' EXIT HUP INT TERM

curl --fail --silent --show-error --get "$solr_url" \
    --data-urlencode 'q=*:*' \
    --data-urlencode 'fl=id,email,username,first_name,last_name,role,active,password,owners' \
    --data-urlencode 'rows=100000' \
    --data-urlencode 'wt=json' \
    > "$json_file"

num_found=$(jq -er '.response.numFound' "$json_file")
document_count=$(jq -er '.response.docs | length' "$json_file")
if [ "$num_found" -ne "$document_count" ]; then
    echo "Solr returned $document_count of $num_found users; refusing a partial migration" >&2
    exit 1
fi

printf '%s\n' 'id,email,username,first_name,last_name,role,active,password_hash,owner_ids,saml_idp_entity_id' > "$csv_file"
jq -r '
    .response.docs[]
    | (.username | ascii_downcase) as $username
    | [
        .id,
        .email,
        .username,
        .first_name,
        .last_name,
        (if .role == "super_admin" then "admin" else .role end),
        .active,
        (.password // null),
        ((.owners // []) | join(";")),
        (if (.password // "") != "" then null
         elif $username | endswith("@svkul.cz") then "https://svkul.cz/idp/shibboleth"
         elif $username | endswith("@mzk.cz") then "https://shibboleth.mzk.cz/simplesaml/metadata.xml"
         elif $username | endswith("@nkp.cz") then "https://shibboleth.nkp.cz/idp/shibboleth"
         elif $username | endswith("@vkol.cz") then "https://shibo.vkol.cz/idp/shibboleth"
         else "UNMAPPED" end)
    ]
    | @csv
' "$json_file" >> "$csv_file"

psql "$database_url" --set ON_ERROR_STOP=on --single-transaction <<SQL
CREATE TEMPORARY TABLE identity_user_import (
    id UUID NOT NULL,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL,
    active BOOLEAN NOT NULL,
    password_hash TEXT,
    owner_ids TEXT,
    saml_idp_entity_id TEXT
) ON COMMIT DROP;

\copy identity_user_import FROM '$csv_file' WITH (FORMAT csv, HEADER true, NULL '')

DO \$\$
BEGIN
    IF EXISTS (
        SELECT 1 FROM identity_user_import
        WHERE role NOT IN ('user', 'admin', 'digitalization')
    ) THEN
        RAISE EXCEPTION 'Solr contains an unsupported user role';
    END IF;

    IF EXISTS (
        SELECT 1 FROM identity_user_import
        WHERE saml_idp_entity_id IS NOT NULL
          AND saml_idp_entity_id NOT IN (
              'https://svkul.cz/idp/shibboleth',
              'https://shibboleth.mzk.cz/simplesaml/metadata.xml',
              'https://shibboleth.nkp.cz/idp/shibboleth',
              'https://shibo.vkol.cz/idp/shibboleth'
          )
    ) THEN
        RAISE EXCEPTION 'A passwordless Solr user cannot be mapped to an allowed IdP by ePPN domain';
    END IF;

    IF EXISTS (
        SELECT lower(trim(username))
        FROM identity_user_import
        GROUP BY lower(trim(username))
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Solr contains duplicate normalized usernames';
    END IF;

END \$\$;

INSERT INTO identity_user (
    id,
    username,
    email,
    first_name,
    last_name,
    role,
    active,
    password_hash,
    saml_idp_entity_id,
    saml_eppn
)
SELECT
    id,
    lower(trim(username)),
    lower(trim(email)),
    trim(first_name),
    trim(last_name),
    role,
    active,
    password_hash,
    saml_idp_entity_id,
    CASE WHEN saml_idp_entity_id IS NULL THEN NULL ELSE lower(trim(username)) END
FROM identity_user_import
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    active = EXCLUDED.active,
    password_hash = EXCLUDED.password_hash,
    saml_idp_entity_id = EXCLUDED.saml_idp_entity_id,
    saml_eppn = EXCLUDED.saml_eppn;

DELETE FROM identity_user_owner
WHERE user_id IN (SELECT id FROM identity_user_import);

INSERT INTO identity_user_owner (user_id, owner_id)
SELECT source.id, trim(owner_id)
FROM identity_user_import source
CROSS JOIN LATERAL regexp_split_to_table(coalesce(source.owner_ids, ''), ';') owner_id
WHERE trim(owner_id) <> ''
ON CONFLICT DO NOTHING;
SQL

echo "Migrated $document_count users from Solr"
