FROM node:alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install \
    && npm cache clean --force
COPY ./ ./
RUN npm run build

FROM nginx:1.19.0
EXPOSE 4200
COPY ./nginx/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY ./nginx/docker-entrypoint.sh /
COPY --from=builder /app/dist/client /usr/share/nginx/html
ENTRYPOINT [ "/docker-entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]



