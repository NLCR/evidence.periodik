--liquibase formatted sql

--changeset permonik:1
CREATE TABLE identity_user (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(320) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('user', 'admin', 'digitalization')),
    active BOOLEAN NOT NULL,
    password_hash VARCHAR(255),
    saml_idp_entity_id VARCHAR(512),
    saml_eppn VARCHAR(255),
    CONSTRAINT uq_identity_user_saml_identity UNIQUE (saml_idp_entity_id, saml_eppn),
    CONSTRAINT chk_identity_user_saml_pair CHECK (
        (saml_idp_entity_id IS NULL AND saml_eppn IS NULL)
        OR
        (saml_idp_entity_id IS NOT NULL AND saml_eppn IS NOT NULL)
    )
);

CREATE TABLE identity_user_owner (
    user_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE CASCADE,
    owner_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id, owner_id)
);

--changeset permonik:2
ALTER TABLE identity_user DROP CONSTRAINT IF EXISTS identity_user_email_key;
