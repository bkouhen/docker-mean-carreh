FROM node:14.5.0-alpine3.11

WORKDIR /app

COPY package*.json ./

RUN npm install \
    && npm cache clean --force

COPY ./ ./

CMD [ "npm", "run", "start" ]