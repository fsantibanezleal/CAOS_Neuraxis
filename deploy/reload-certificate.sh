#!/bin/sh
# Certbot invokes this only after a certificate was successfully renewed.
set -eu
nginx -t
systemctl reload nginx
