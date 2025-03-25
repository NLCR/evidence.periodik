#!/bin/bash
set -e

echo "Forcing Solr core config override from /opt/solr/server/solr/mycores"

for core in /opt/solr/server/solr/mycores/*; do
  name=$(basename "$core")
  target="/var/solr/data/$name"

  echo "Overwriting core '$name' at $target"
  rm -rf "$target"
  mkdir -p "$target"
  cp "$core/core.properties" "$target/"
  cp -r "$core/conf" "$target/"
done

echo "Cores overwritten"
