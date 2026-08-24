import argparse
import json
import re
import pysolr
from pathlib import Path
from xml.etree import ElementTree as ET

DEFAULT_OLD_URL = "http://localhost:8983/solr"
DEFAULT_NEW_URL = "http://localhost:8990/solr"
DEFAULT_BATCH_SIZE = 2000
MAX_SKIPPED_LOG_MESSAGES = 20

# Ordered by dependencies (references first, then denormalized entities)
CORE_ORDER = ["metatitle", "edition", "mutation", "owner", "volume", "specimen", "user"]
CORE_DEPENDENCIES = {
    "volume": ["metatitle", "mutation", "owner"],
    "specimen": ["metatitle", "edition", "mutation", "owner", "volume"],
}
SPECIMEN_DIGIT_RUN = re.compile(r"\d+")
EXCLUDED_CONTENT_METATITLES = {
    "2dd007b3-25ad-4402-b548-b86396189004": "Mladá fronta",
    "04bd6ca1-cd25-40fc-be87-dad2b21ddbd0": "Mladá fronta (TESTOVACÍ DATA)",
}


class SkippedDocumentError(ValueError):
    pass


class OrphanedDocumentError(SkippedDocumentError):
    pass


def pick(doc, *keys):
    for key in keys:
        if key in doc and doc[key] is not None:
            return doc[key]
    return None


def put(out, key, value):
    if value is not None:
        out[key] = value


def normalize_attachments_sort(value):
    if value is None:
        return "NONE"
    if isinstance(value, bool):
        return "ASC" if value else "NONE"
    normalized = str(value).strip().upper()
    if normalized in {"ASC", "DESC", "NONE"}:
        return normalized
    if normalized in {"TRUE", "1"}:
        return "ASC"
    if normalized in {"FALSE", "0"}:
        return "NONE"
    return "NONE"


def specimen_natural_sort_key_from(value):
    if value is None:
        return None

    normalized = str(value).strip().lower()
    if not normalized:
        return None

    key_parts = []
    index = 0

    for match in SPECIMEN_DIGIT_RUN.finditer(normalized):
        start, end = match.span()
        if index < start:
            key_parts.append(f"T{normalized[index:start]};")

        digits = match.group(0)
        canonical = re.sub(r"^0+(?!$)", "", digits)
        key_parts.append(f"N{len(canonical):06d}:{canonical};")
        index = end

    if index < len(normalized):
        key_parts.append(f"T{normalized[index:]};")

    return "".join(key_parts)


def parse_schema(schema_path):
    tree = ET.parse(schema_path)
    root = tree.getroot()

    fields = set()
    required = set()
    for field in root.findall("field"):
        name = field.attrib.get("name")
        if not name:
            continue
        fields.add(name)
        if field.attrib.get("required", "false").lower() == "true":
            required.add(name)

    return fields, required


def parse_localized_name(raw_name):
    if isinstance(raw_name, dict):
        parsed = raw_name
    elif isinstance(raw_name, str):
        stripped = raw_name.strip()
        if stripped.startswith("{") and stripped.endswith("}"):
            try:
                parsed = json.loads(stripped)
                if isinstance(parsed, str):
                    parsed = json.loads(parsed)
            except (json.JSONDecodeError, TypeError):
                parsed = None
        else:
            parsed = None
    else:
        parsed = None

    if isinstance(parsed, dict):
        return parsed.get("cs"), parsed.get("sk"), parsed.get("en")
    return None, None, None


def resolve_multilang_name(doc):
    name_cs = pick(doc, "name_cs", "nameCs")
    name_sk = pick(doc, "name_sk", "nameSk")
    name_en = pick(doc, "name_en", "nameEn")

    raw_name = pick(doc, "name")
    parsed_cs, parsed_sk, parsed_en = parse_localized_name(raw_name)

    if name_cs is None:
        name_cs = parsed_cs
    if name_sk is None:
        name_sk = parsed_sk
    if name_en is None:
        name_en = parsed_en

    if isinstance(raw_name, str) and all(value is None for value in (name_cs, name_sk, name_en)):
        name_cs = raw_name
        name_sk = raw_name
        name_en = raw_name

    return name_cs, name_sk, name_en


def load_target_schemas():
    reindex_dir = Path(__file__).resolve().parent
    database_dir = reindex_dir.parent
    cores_dir = database_dir / "cores"

    schema = {}
    for core in CORE_ORDER:
        fields, required = parse_schema(cores_dir / core / "conf" / "managed-schema.xml")
        schema[core] = {
            "fields": fields,
            "required": required,
        }
    return schema


def transform_edition(doc):
    name_cs, name_sk, name_en = resolve_multilang_name(doc)

    return {
        "id": pick(doc, "id"),
        "name_cs": name_cs,
        "name_sk": name_sk,
        "name_en": name_en,
        "is_default": pick(doc, "is_default", "isDefault"),
        "is_attachment": pick(doc, "is_attachment", "isAttachment"),
        "is_periodic_attachment": pick(doc, "is_periodic_attachment", "isPeriodicAttachment"),
        "created": pick(doc, "created"),
        "created_by": pick(doc, "created_by", "createdBy"),
        "updated": pick(doc, "updated"),
        "updated_by": pick(doc, "updated_by", "updatedBy"),
        "deleted": pick(doc, "deleted"),
        "deleted_by": pick(doc, "deleted_by", "deletedBy"),
    }


def transform_metatitle(doc):
    return {
        "id": pick(doc, "id"),
        "name": pick(doc, "name"),
        "note": pick(doc, "note"),
        "is_public": pick(doc, "is_public", "isPublic"),
        "created": pick(doc, "created"),
        "created_by": pick(doc, "created_by", "createdBy"),
        "updated": pick(doc, "updated"),
        "updated_by": pick(doc, "updated_by", "updatedBy"),
        "deleted": pick(doc, "deleted"),
        "deleted_by": pick(doc, "deleted_by", "deletedBy"),
    }


def transform_mutation(doc):
    name_cs, name_sk, name_en = resolve_multilang_name(doc)

    return {
        "id": pick(doc, "id"),
        "name_cs": name_cs,
        "name_sk": name_sk,
        "name_en": name_en,
        "created": pick(doc, "created"),
        "created_by": pick(doc, "created_by", "createdBy"),
        "updated": pick(doc, "updated"),
        "updated_by": pick(doc, "updated_by", "updatedBy"),
        "deleted": pick(doc, "deleted"),
        "deleted_by": pick(doc, "deleted_by", "deletedBy"),
    }


def transform_owner(doc):
    return {
        "id": pick(doc, "id"),
        "name": pick(doc, "name"),
        "shorthand": pick(doc, "shorthand"),
        "sigla": pick(doc, "sigla"),
        "created": pick(doc, "created"),
        "created_by": pick(doc, "created_by", "createdBy"),
        "updated": pick(doc, "updated"),
        "updated_by": pick(doc, "updated_by", "updatedBy"),
        "deleted": pick(doc, "deleted"),
        "deleted_by": pick(doc, "deleted_by", "deletedBy"),
    }


def transform_user(doc):
    return {
        "id": pick(doc, "id"),
        "email": pick(doc, "email"),
        "username": pick(doc, "username", "userName"),
        "first_name": pick(doc, "first_name", "firstName"),
        "last_name": pick(doc, "last_name", "lastName"),
        "role": pick(doc, "role"),
        "active": pick(doc, "active"),
        "owners": pick(doc, "owners"),
        "password": pick(doc, "password"),
    }


def transform_volume(doc, cache):
    out = {}
    put(out, "id", pick(doc, "id"))
    put(out, "barcode", pick(doc, "barcode", "barCode"))
    put(out, "date_from", pick(doc, "date_from", "dateFrom"))
    put(out, "date_to", pick(doc, "date_to", "dateTo"))
    put(out, "metatitle_id", pick(doc, "metatitle_id", "metaTitleId"))
    put(out, "subname", pick(doc, "subname", "subName"))
    put(out, "mutation_id", pick(doc, "mutation_id", "mutationId"))
    put(out, "periodicity", pick(doc, "periodicity"))
    put(out, "first_number", pick(doc, "first_number", "firstNumber"))
    put(out, "last_number", pick(doc, "last_number", "lastNumber"))
    put(out, "note", pick(doc, "note"))
    put(out, "attachments_sort", pick(doc, "attachments_sort"))
    put(out, "signature", pick(doc, "signature"))
    put(out, "owner_id", pick(doc, "owner_id", "ownerId"))
    put(out, "year", pick(doc, "year"))
    put(out, "mutation_mark", pick(doc, "mutation_mark", "mutationMark"))
    put(out, "mutation_mark_type", pick(doc, "mutation_mark_type", "mutationMarkType"))
    put(out, "mutation_mark_description", pick(doc, "mutation_mark_description", "mutationMarkDescription"))
    put(out, "created", pick(doc, "created"))
    put(out, "created_by", pick(doc, "created_by", "createdBy"))
    put(out, "updated", pick(doc, "updated"))
    put(out, "updated_by", pick(doc, "updated_by", "updatedBy"))
    put(out, "deleted", pick(doc, "deleted"))
    put(out, "deleted_by", pick(doc, "deleted_by", "deletedBy"))

    if "attachments_sort" not in out:
        out["attachments_sort"] = normalize_attachments_sort(pick(doc, "showAttachmentsAtTheEnd"))
    else:
        out["attachments_sort"] = normalize_attachments_sort(out["attachments_sort"])

    metatitle_id = out.get("metatitle_id", "")
    mutation_id = out.get("mutation_id", "")
    owner_id = out.get("owner_id", "")

    if metatitle_id in EXCLUDED_CONTENT_METATITLES:
        raise SkippedDocumentError(
            f"Volume '{out.get('id', '<no-id>')}' belongs to excluded metatitle "
            f"'{EXCLUDED_CONTENT_METATITLES[metatitle_id]}'"
        )

    metatitle = cache["metatitle"].get(metatitle_id)
    if not metatitle:
        raise OrphanedDocumentError(
            f"Volume '{out.get('id', '<no-id>')}' references unknown metatitle '{metatitle_id}'"
        )
    out["metatitle_name"] = metatitle.get("name")

    mutation = cache["mutation"].get(mutation_id)
    if not mutation:
        raise OrphanedDocumentError(
            f"Volume '{out.get('id', '<no-id>')}' references unknown mutation '{mutation_id}'"
        )
    out["mutation_name_cs"] = mutation.get("name_cs")
    out["mutation_name_sk"] = mutation.get("name_sk")
    out["mutation_name_en"] = mutation.get("name_en")

    owner = cache["owner"].get(owner_id)
    if not owner:
        raise OrphanedDocumentError(
            f"Volume '{out.get('id', '<no-id>')}' references unknown owner '{owner_id}'"
        )
    out["owner_name"] = owner.get("name")
    out["owner_shorthand"] = owner.get("shorthand")
    out["owner_sigla"] = owner.get("sigla")

    return out


def transform_specimen(doc, cache):
    out = {}
    put(out, "id", pick(doc, "id"))
    put(out, "metatitle_id", pick(doc, "metatitle_id", "metaTitleId"))
    put(out, "volume_id", pick(doc, "volume_id", "volumeId"))
    put(out, "bar_code", pick(doc, "bar_code", "barCode"))
    put(out, "num_exists", pick(doc, "num_exists", "numExists"))
    put(out, "num_missing", pick(doc, "num_missing", "numMissing"))
    put(out, "owner_id", pick(doc, "owner_id", "ownerId"))
    put(out, "damage_types", pick(doc, "damage_types", "damageTypes"))
    put(out, "damaged_pages", pick(doc, "damaged_pages", "damagedPages"))
    put(out, "missing_pages", pick(doc, "missing_pages", "missingPages"))
    put(out, "note", pick(doc, "note"))
    put(out, "name", pick(doc, "name"))
    put(out, "subname", pick(doc, "subname", "subName"))
    put(out, "edition_id", pick(doc, "edition_id", "editionId"))
    put(out, "mutation_id", pick(doc, "mutation_id", "mutationId"))
    put(out, "mutation_mark", pick(doc, "mutation_mark", "mutationMark"))
    put(out, "mutation_mark_type", pick(doc, "mutation_mark_type", "mutationMarkType"))
    put(out, "mutation_mark_description", pick(doc, "mutation_mark_description", "mutationMarkDescription"))
    put(out, "publication_date", pick(doc, "publication_date", "publicationDate"))
    put(out, "pages_count", pick(doc, "pages_count", "pagesCount"))
    put(out, "is_attachment", pick(doc, "is_attachment", "isAttachment"))
    if out.get("is_attachment"):
        put(out, "attachment_number", pick(doc, "attachment_number", "attachmentNumber"))
    else:
        put(out, "number", pick(doc, "number"))
    specimen_number = out.get("attachment_number") if out.get("is_attachment") else out.get("number")
    put(out, "number_sort_key", specimen_natural_sort_key_from(specimen_number))
    put(out, "created", pick(doc, "created"))
    put(out, "created_by", pick(doc, "created_by", "createdBy"))
    put(out, "updated", pick(doc, "updated"))
    put(out, "updated_by", pick(doc, "updated_by", "updatedBy"))
    put(out, "deleted", pick(doc, "deleted"))
    put(out, "deleted_by", pick(doc, "deleted_by", "deletedBy"))

    volume_id = out.get("volume_id", "")
    volume = cache["volume"].get(volume_id)
    if not volume:
        raise OrphanedDocumentError(
            f"Specimen '{out.get('id', '<no-id>')}' references unknown volume '{volume_id}'"
        )

    # Mirrors BE: these fields are always taken from referenced volume, not from input document.
    out["metatitle_id"] = volume.get("metatitle_id")
    out["metatitle_name"] = volume.get("metatitle_name")
    out["bar_code"] = volume.get("bar_code")
    out["owner_id"] = volume.get("owner_id")

    owner_id = out.get("owner_id", "")
    owner = cache["owner"].get(owner_id)
    if not owner:
        raise OrphanedDocumentError(
            f"Specimen '{out.get('id', '<no-id>')}' references unknown owner '{owner_id}'"
        )
    out["owner_name"] = owner.get("name")
    out["owner_shorthand"] = owner.get("shorthand")
    out["owner_sigla"] = owner.get("sigla")

    edition_id = out.get("edition_id", "")
    edition = cache["edition"].get(edition_id)
    if not edition:
        raise OrphanedDocumentError(
            f"Specimen '{out.get('id', '<no-id>')}' references unknown edition '{edition_id}'"
        )
    out["edition_name_cs"] = edition.get("name_cs")
    out["edition_name_sk"] = edition.get("name_sk")
    out["edition_name_en"] = edition.get("name_en")

    mutation_id = out.get("mutation_id", "")
    mutation = cache["mutation"].get(mutation_id)
    if not mutation:
        raise OrphanedDocumentError(
            f"Specimen '{out.get('id', '<no-id>')}' references unknown mutation '{mutation_id}'"
        )
    out["mutation_name_cs"] = mutation.get("name_cs")
    out["mutation_name_sk"] = mutation.get("name_sk")
    out["mutation_name_en"] = mutation.get("name_en")

    return out


def transform_doc(core, doc, cache):
    if core == "edition":
        return transform_edition(doc)
    if core == "metatitle":
        return transform_metatitle(doc)
    if core == "mutation":
        return transform_mutation(doc)
    if core == "owner":
        return transform_owner(doc)
    if core == "user":
        return transform_user(doc)
    if core == "volume":
        return transform_volume(doc, cache)
    if core == "specimen":
        return transform_specimen(doc, cache)
    return dict(doc)


def cache_doc(core, doc, cache):
    doc_id = doc.get("id")
    if not doc_id:
        return

    if core == "metatitle":
        cache["metatitle"][doc_id] = {"name": doc.get("name")}
    elif core == "edition":
        cache["edition"][doc_id] = {
            "name_cs": doc.get("name_cs"),
            "name_sk": doc.get("name_sk"),
            "name_en": doc.get("name_en"),
        }
    elif core == "mutation":
        cache["mutation"][doc_id] = {
            "name_cs": doc.get("name_cs"),
            "name_sk": doc.get("name_sk"),
            "name_en": doc.get("name_en"),
        }
    elif core == "owner":
        cache["owner"][doc_id] = {
            "name": doc.get("name"),
            "shorthand": doc.get("shorthand"),
            "sigla": doc.get("sigla"),
        }
    elif core == "volume":
        cache["volume"][doc_id] = {
            "metatitle_id": doc.get("metatitle_id"),
            "metatitle_name": doc.get("metatitle_name"),
            "bar_code": doc.get("barcode"),
            "owner_id": doc.get("owner_id"),
            "owner_name": doc.get("owner_name"),
            "owner_shorthand": doc.get("owner_shorthand"),
            "owner_sigla": doc.get("owner_sigla"),
        }


def expand_core_list(core_list):
    selected = set(core_list)
    changed = True
    while changed:
        changed = False
        for core in list(selected):
            for dependency in CORE_DEPENDENCIES.get(core, []):
                if dependency not in selected:
                    selected.add(dependency)
                    changed = True
    return [core for core in CORE_ORDER if core in selected]


def parse_cores(raw):
    if not raw:
        return list(CORE_ORDER)
    result = [item.strip() for item in raw.split(",") if item.strip()]
    unknown = [core for core in result if core not in CORE_ORDER]
    if unknown:
        raise ValueError(f"Unknown cores: {', '.join(unknown)}")
    return expand_core_list(result)


def cleanup_doc(doc, allowed_fields):
    return {key: value for key, value in doc.items() if key in allowed_fields and value is not None}


def validate_required(core, doc, required_fields):
    missing = [field for field in required_fields if field not in doc]
    if missing:
        doc_id = doc.get("id", "<no-id>")
        raise ValueError(f"Core '{core}', doc '{doc_id}' missing required fields: {', '.join(missing)}")


def fetch_docs(solr, fields, batch_size):
    cursor_mark = "*"
    docs = []

    while True:
        results = solr.search(
            "*:*",
            fl=",".join(fields),
            rows=batch_size,
            sort="id asc",
            cursorMark=cursor_mark,
        )
        docs.extend(results.docs)
        next_cursor_mark = results.raw_response.get("nextCursorMark")
        if cursor_mark == next_cursor_mark:
            return docs
        cursor_mark = next_cursor_mark


def delete_ids(solr, ids, batch_size):
    ids = list(ids)
    for start in range(0, len(ids), batch_size):
        solr.delete(id=ids[start:start + batch_size])


def find_orphan_ids(metatitle_ids, volumes, specimens):
    volume_ids = {doc["id"] for doc in volumes}
    referenced_volume_ids = {
        doc.get("volume_id") for doc in specimens if doc.get("volume_id") in volume_ids
    }
    orphan_volume_ids = {
        doc["id"]
        for doc in volumes
        if doc.get("metatitle_id") not in metatitle_ids or doc["id"] not in referenced_volume_ids
    }
    valid_volume_ids = volume_ids - orphan_volume_ids
    orphan_specimen_ids = {
        doc["id"] for doc in specimens if doc.get("volume_id") not in valid_volume_ids
    }
    return orphan_volume_ids, orphan_specimen_ids


def cleanup_target(new_base_url, cores, batch_size, dry_run):
    print("--- Cleaning target data ---")

    if dry_run:
        print("  skipped (dry run does not modify the target)")
        return

    if "specimen" not in cores:
        print("  orphan cleanup skipped (specimen core was not migrated)")
        return

    metatitle_solr = pysolr.Solr(f"{new_base_url}/metatitle", timeout=120)
    volume_solr = pysolr.Solr(f"{new_base_url}/volume", always_commit=False, timeout=120)
    specimen_solr = pysolr.Solr(f"{new_base_url}/specimen", always_commit=False, timeout=120)

    metatitle_ids = {doc["id"] for doc in fetch_docs(metatitle_solr, ["id"], batch_size)}
    volumes = fetch_docs(volume_solr, ["id", "metatitle_id"], batch_size)
    specimens = fetch_docs(specimen_solr, ["id", "volume_id"], batch_size)
    orphan_volume_ids, orphan_specimen_ids = find_orphan_ids(metatitle_ids, volumes, specimens)

    if orphan_specimen_ids:
        delete_ids(specimen_solr, orphan_specimen_ids, batch_size)
        specimen_solr.commit()
    if orphan_volume_ids:
        delete_ids(volume_solr, orphan_volume_ids, batch_size)
        volume_solr.commit()

    print(f"  specimen: removed {len(orphan_specimen_ids)} orphan docs")
    print(f"  volume: removed {len(orphan_volume_ids)} orphan docs")


def reindex_core(core, old_base_url, new_base_url, batch_size, schema_info, cache, dry_run, delete_target):
    print(f"--- Migrating core '{core}' ---")
    old_solr = pysolr.Solr(f"{old_base_url}/{core}", timeout=120)
    new_solr = pysolr.Solr(f"{new_base_url}/{core}", always_commit=False, timeout=120)

    if delete_target and not dry_run:
        print("  deleting target documents")
        new_solr.delete(q="*:*")
        new_solr.commit()

    target_fields = schema_info[core]["fields"]
    required_fields = schema_info[core]["required"]
    search_params = {
        "rows": batch_size,
        "sort": "id asc",
    }
    if "deleted" in target_fields:
        search_params["fq"] = "-deleted:[* TO *]"

    cursor_mark = "*"
    total = 0
    skipped_documents = 0

    while True:
        results = old_solr.search(
            "*:*",
            cursorMark=cursor_mark,
            **search_params,
        )
        # Important: iterating over `results` auto-fetches all cursor pages in pysolr.
        # We only want the current page here, otherwise outer cursor loop duplicates work.
        docs = list(results.docs)
        next_cursor_mark = results.raw_response.get("nextCursorMark")

        if len(docs) > batch_size:
            raise RuntimeError(
                f"Core '{core}': fetched {len(docs)} docs in one page while batch_size is {batch_size}. "
                "This indicates unexpected cursor paging behavior."
            )

        prepared_docs = []
        skipped_ids = []
        for doc in docs:
            doc.pop("_version_", None)
            doc.pop("_text_", None)

            try:
                transformed = transform_doc(core, doc, cache)
            except SkippedDocumentError as error:
                skipped_documents += 1
                if doc.get("id"):
                    skipped_ids.append(doc["id"])
                if skipped_documents <= MAX_SKIPPED_LOG_MESSAGES:
                    print(f"\n  skipping document: {error}")
                elif skipped_documents == MAX_SKIPPED_LOG_MESSAGES + 1:
                    print("\n  additional skipped-document messages omitted")
                continue
            transformed = cleanup_doc(transformed, target_fields)
            validate_required(core, transformed, required_fields)

            prepared_docs.append(transformed)
            cache_doc(core, transformed, cache)

        if prepared_docs and not dry_run:
            new_solr.add(prepared_docs)
        if skipped_ids and not dry_run:
            new_solr.delete(id=skipped_ids)

        total += len(prepared_docs)
        print(f"  ... processed {total} docs", end="\r")

        if cursor_mark == next_cursor_mark:
            break
        cursor_mark = next_cursor_mark

    if not dry_run:
        new_solr.commit()
    print(f"\nCore '{core}': done, total {total} docs, skipped {skipped_documents} docs.")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Migrate PerMonik data from old Solr schema to new Solr schema."
    )
    parser.add_argument("--old-url", default=DEFAULT_OLD_URL, help="Old Solr base URL, e.g. http://localhost:8983/solr")
    parser.add_argument("--new-url", default=DEFAULT_NEW_URL, help="New Solr base URL, e.g. http://localhost:8990/solr")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Batch size for cursor-based reads.")
    parser.add_argument(
        "--cores",
        default=",".join(CORE_ORDER),
        help="Comma separated core list (dependencies are auto-added).",
    )
    parser.add_argument("--dry-run", action="store_true",
                        help="Run transformation and validation without writing data.")
    parser.add_argument("--delete-target", action="store_true", help="Delete all docs in target core before migrating.")
    return parser.parse_args()


def main():
    args = parse_args()
    schema_info = load_target_schemas()
    cores = parse_cores(args.cores)

    print("Selected cores:", ", ".join(cores))
    print(f"Source: {args.old_url}")
    print(f"Target: {args.new_url}")
    print(f"Batch size: {args.batch_size}")
    print(f"Dry run: {args.dry_run}")
    print(f"Delete target before import: {args.delete_target}")

    cache = {
        "metatitle": {},
        "edition": {},
        "mutation": {},
        "owner": {},
        "volume": {},
    }

    for core in cores:
        reindex_core(
            core=core,
            old_base_url=args.old_url.rstrip("/"),
            new_base_url=args.new_url.rstrip("/"),
            batch_size=args.batch_size,
            schema_info=schema_info,
            cache=cache,
            dry_run=args.dry_run,
            delete_target=args.delete_target,
        )

    cleanup_target(
        new_base_url=args.new_url.rstrip("/"),
        cores=cores,
        batch_size=args.batch_size,
        dry_run=args.dry_run,
    )

    print("Migration finished.")


if __name__ == "__main__":
    main()
