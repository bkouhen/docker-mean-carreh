#!/bin/bash

set -eu

if [[ ! -f /var/www/certbot ]]; then
    mkdir -p /var/www/certbot;
fi;

certbot certonly --webroot --expand --noninteractive \
--config-dir "${LETSENCRYPT_DIR:-/etc/letsencrypt}" \
--email "${EMAIL:-b.kouhen@gmail.com}" --agree-tos --no-eff-email \
--webroot-path /var/www/certbot \
-d "${DOMAIN:-carreh.tk}";

if [[ -f "${LETSENCRYPT_DIR:-/etc/letsencrypt}/live/${DOMAIN:-carreh.tk}/privkey.pem" ]]; then
    cp "${LETSENCRYPT_DIR:-/etc/letsencrypt}/live/${DOMAIN:-carreh.tk}/privkey.pem" /etc/nginx/certs/privkey.pem;
    cp "${LETSENCRYPT_DIR:-/etc/letsencrypt}/live/${DOMAIN:-carreh.tk}/fullchain.pem" /etc/nginx/certs/fullchain.pem;
fi;