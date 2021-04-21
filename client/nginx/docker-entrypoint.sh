#!/bin/bash
set -eu

envsubst '${NGINX_CLIENT_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec "$@"
