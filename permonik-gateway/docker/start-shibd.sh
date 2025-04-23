#!/bin/bash -v

set -e

if [ ! -d /run/shibboleth ] ; then
  mkdir -p /run/shibboleth
fi
chown _shibd:_shibd /run/shibboleth

exec /usr/sbin/shibd -f -F
