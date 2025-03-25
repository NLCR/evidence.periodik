#!/bin/bash
set -e

echo "🧩 Copying cores into volume..."

for core in /opt/solr/server/solr/mycores/*; do
  core_name=$(basename "$core")
  if [ ! -d "/var/solr/data/$core_name" ]; then
    echo "➕ Copying core '$core_name'"
    cp -r "$core" "/var/solr/data/$core_name"
  else
    echo "✅ Core '$core_name' already exists, skipping"
  fi
done
