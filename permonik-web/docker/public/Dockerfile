# syntax = docker/dockerfile:1

## BUILD Image ##
FROM node:24 AS builder
ARG VITE_SENTRY_DSN=""
ARG SENTRY_URL=""
ARG SENTRY_ENVIRONMENT=""
ARG SENTRY_RELEASE=""
ENV VITE_SENTRY_DSN="$VITE_SENTRY_DSN" \
    SENTRY_URL="$SENTRY_URL" \
    SENTRY_ENVIRONMENT="$SENTRY_ENVIRONMENT" \
    VITE_SENTRY_ENVIRONMENT="$SENTRY_ENVIRONMENT" \
    SENTRY_RELEASE="$SENTRY_RELEASE" \
    VITE_SENTRY_RELEASE="$SENTRY_RELEASE"
RUN corepack enable
RUN yarn set version latest

COPY ./permonik-web/ /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=yarn-cache,target=.yarn/cache yarn install --immutable
RUN --mount=type=secret,id=sentry-auth-token,env=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=mui-license-key,env=VITE_MUI_LICENCE_KEY \
    yarn build-public

## RUN Image ##
FROM httpd:alpine
COPY ./permonik-web/docker/public/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=builder /usr/src/app/dist/ /usr/local/apache2/htdocs/
COPY ./permonik-web/docker/public/.htaccess /usr/local/apache2/htdocs/
