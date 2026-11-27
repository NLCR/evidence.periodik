## Readme

This folder contains only configuration files for solr. Please keep it up to date with the latest version of the solr
index.

Only used when updating Solr and need to re-index. The complete migration runbook is in
[`reindex/README.md`](reindex/README.md). You can create a new helper container from this
configuration, copy the configsets from `cores/`, reindex the data, and then copy the new
index to test/prod.

## Solr/SolrJ version coupling

When updating the Solr server image, update the backend SolrJ dependency in the root
`build.gradle` at the same time. Keep the Solr Testcontainers image and the reindex/test
helper images on the same Solr release as well. Compile the core API and run the Solr
integration regression test before deployment; do not upgrade the server independently
of SolrJ.

## Index layout

Fields used only for presentation or export input have `stored=true`, `indexed=false`
and `docValues=false`: volume `subname`, `first_number`, `last_number`, `note`,
`attachments_sort`, `signature`; metatitle `note`; legacy user `password`.
Volume `periodicity` is already stored-only through its text field type.

ICU `*_sort` fields are copy destinations used only for ordering. They have
`indexed=false`, `docValues=true`, `stored=false`, `useDocValuesAsStored=false`.
Full-text queries use `*_search`; exact filters and facets use the original fields.
Atomic reference-name updates reconstruct the original stored names and regenerate
copy destinations, rather than treating binary collation keys as source text.

Specimen `number_sort_key` is an independent calculated value, not a copy destination.
It has `indexed=false`, `docValues=true`, `stored=false`, `useDocValuesAsStored=true`
so reads and unrelated atomic updates retain its value. ID, date, exact-match, facet
and `_version_` fields retain their existing index/DocValues settings.

These layout changes require a fresh reindex to remove structures from existing
Lucene segments. Updating XML or reloading a core alone does not rewrite old records.
Reindex complete original source documents into a new target built from these configs;
do not feed ICU copy-destination values back as input fields. Verify counts, stored data,
sorting, filters/facets and atomic renames before switching the target.
The script under `reindex/` additionally applies historical migration and cleanup rules;
it is not a lossless layout-only rebuild of current data.

The `wip/issue-317-columns-and-sorting` query paths have also been checked: locale
name sorts and `number_sort_key` use retained DocValues; exact number/attachment-number
filters and page-count ranges use unchanged raw fields. Its per-owner barcode sort
uses `termfreq(owner_name,...)` and `ord(bar_code)`, so the original `owner_name`
inverted index and `bar_code` DocValues must remain enabled. Do not apply the ICU
sort-field optimization to those original fields.

Query and atomic-update verification against isolated Solr 10:

```bash
./gradlew :permonik-api:test --tests '*SolrIndexLayoutTest'
```
