#!/bin/bash
set -eu

envsubst '${NGINX_CLIENT_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
