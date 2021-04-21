#!/bin/bash
# Create self signed Openssl certificate so Nginx can start before having any real certificate
set -eu

# Check if folders are available
if [[ ! -f /etc/nginx/certs/fullchain.pem ]]; then
    mkdir -p /etc/nginx/certs && echo "Certs folder created in /etc/nginx";
fi;

# If certificates do not exist, we must create them (Dummy)
if [[ ! -f /etc/nginx/certs/fullchain.pem ]]; then
    echo "Dummy certificates creation started" && \
    openssl req -x509 -out /etc/nginx/certs/fullchain.pem -keyout /etc/nginx/certs/privkey.pem \
    -newkey rsa:2048 \
    -nodes \
    -days 365 \
    -subj "/C=FR/ST=FR/O=${DOMAIN:-carreh.tk}, Inc./CN=${DOMAIN:-carreh.tk}" && \
    echo "Dummy certificates successfully created in /etc/nginx/certs";
fi;

# Generate sample password for Admin Locations
htpasswd -bc /etc/nginx/certs/.htpasswd admin password;

# Copy ENV Variables from template file to conf file
envsubst '${NGINX_CLIENT_PORT} ${NGINX_API_PORT} ${NGINX_PORT} ${NGINX_TLS_PORT} ${NGINX_WWW_SERVER_NAME} ${NGINX_SERVER_NAME}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf;

# Certbot emission/renewal as a background process
$(while :; do /certbot.sh; sleep "${RENEW_INTERVAL:-12h}"; done) &

# Check for changes in certificate (renewal or first time) and send process to background
$(while inotifywait -e close_write /etc/nginx/certs; do nginx -s reload; done) &

# Start nginx
exec "$@"