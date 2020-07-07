FROM node:alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install \
    && npm cache clean --force

COPY ./ ./

RUN npm run build

FROM nginx

EXPOSE 4200

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/client /usr/share/nginx/html



