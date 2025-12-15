import pysolr

# edit array to reindex only required cores
CORES = [
    ("metatitle", "metatitle"),
    ("volume", "volume"),
    ("specimen", "specimen"),
    ("user", "user"),
    ("owner", "owner"),
    ("mutation", "mutation"),
    ("edition", "edition"),
]

OLD_BASE = 'http://localhost:8983/solr/{}'
NEW_BASE = 'http://localhost:8990/solr/{}'
BATCH_SIZE = 10000


def reindex_core(core_name):
    print(f"--- Reindexuji core '{core_name}' ---")
    old_solr = pysolr.Solr(OLD_BASE.format(core_name))
    new_solr = pysolr.Solr(NEW_BASE.format(core_name), always_commit=False)

    start = 0
    total = 0

    while True:
        results = old_solr.search(
            '*:*',
            start=start,
            rows=BATCH_SIZE,
            sort='id asc',
        )
        docs = list(results)
        if not docs:
            break

        for doc in docs:
            doc.pop('_version_', None)
            if core_name == "volume" or core_name == "specimen":  # TODO: remove after prod migration
                doc["mutationMarkType"] = "MARK"

        new_solr.add(docs)
        total += len(docs)
        start += BATCH_SIZE
        print(f"  ... přeneseno {total} dokumentů", end="\r")

    new_solr.commit()
    print(f"\nCore '{core_name}': Reindex hotov, celkem {total} dokumentů.")


def main():
    for old_core, new_core in CORES:
        reindex_core(old_core)


if __name__ == "__main__":
    main()
