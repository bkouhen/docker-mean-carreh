FROM nginx:1.19.0

RUN apt-get update && apt-get install -y certbot python-certbot-nginx inotify-tools procps apache2-utils

WORKDIR /docker

RUN mkdir -p /etc/nginx/ssl-options
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "/etc/nginx/ssl-options/options-ssl-nginx.conf"
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "/etc/nginx/ssl-options/ssl-dhparams.pem"

COPY ./nginx.prod.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /
COPY certbot.sh /

RUN chmod +x /docker-entrypoint.sh && chmod +x /certbot.sh

ENTRYPOINT [ "/docker-entrypoint.sh" ]

CMD ["nginx", "-g", "daemon off;"]