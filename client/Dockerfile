FROM node:alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install \
    && npm cache clean --force
COPY ./ ./
RUN npm run build

FROM nginx:1.19.0
COPY ./nginx/nginx.conf.template /etc/nginx/nginx.conf.template
COPY ./nginx/docker-entrypoint.sh /
COPY --from=builder /app/dist/client /usr/share/nginx/html
RUN ["chmod", "+x", "/docker-entrypoint.sh"]
ENTRYPOINT [ "/docker-entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]



