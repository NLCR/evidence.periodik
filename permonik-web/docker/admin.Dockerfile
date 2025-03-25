# syntax = docker/dockerfile:experimental

## BUILD Image ##
FROM node:22.14-slim AS builder
RUN corepack enable
RUN yarn set version latest

COPY ./permonik-web/ /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=yarn,target=/yarn/store yarn install --frozen-lockfile
RUN yarn build

## RUN Image ##
FROM httpd:alpine
COPY ./permonik-web/docker/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=builder /usr/src/app/dist/ /usr/local/apache2/htdocs/
COPY ./permonik-web/docker/.htaccess /usr/local/apache2/htdocs/
