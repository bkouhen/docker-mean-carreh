#!/bin/bash
# Create self signed Openssl certificate so Nginx can start before having any real certificate
set -eu

echo "----- Development Mode -----";

# Check if folders are available
if [[ ! -f /etc/nginx/certs/self.crt ]]; then
    mkdir -p /etc/nginx/certs && echo "Certs folder created in /etc/nginx";
fi;

# If certificates do not exist, we must create them (Dummy)
if [[ ! -f /etc/nginx/certs/self.crt ]]; then
    echo "Dummy certificates creation started" && \
    openssl req -x509 -out /etc/nginx/certs/self.crt -keyout /etc/nginx/certs/self.key \
    -newkey rsa:2048 \
    -nodes \
    -days 365 \
    -subj "/C=FR/ST=FR/O=localhost, Inc./CN=localhost" \
    -addext "subjectAltName=DNS:localhost" && \
    echo "Dummy certificates successfully created in /etc/nginx/certs";
fi;

# Generate sample password for Admin Locations
htpasswd -bc /etc/nginx/certs/.htpasswd admin password;

# Copy ENV Variables from template file to conf file
envsubst '${NGINX_CLIENT_PORT} ${NGINX_API_PORT} ${NGINX_PORT} ${NGINX_TLS_PORT} ${NGINX_WWW_SERVER_NAME} ${NGINX_SERVER_NAME}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf;

# Start nginx
exec "$@"