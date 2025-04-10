#!/bin/bash
set -e


service ntp start || true

# Start Shibboleth SP daemon
service shibd start

# Start Apache in foreground
exec apachectl -D FOREGROUND
