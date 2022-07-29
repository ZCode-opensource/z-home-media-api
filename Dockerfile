FROM node:lts-alpine AS base

RUN apk add --no-cache openssl ffmpeg

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN mkdir -p ~/zhomemedia

WORKDIR ~/zhomemedia

COPY package.json .
COPY yarn.lock .

FROM base AS dependencies

RUN yarn

FROM dependencies AS runtime

COPY . .