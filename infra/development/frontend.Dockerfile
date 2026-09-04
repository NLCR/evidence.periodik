FROM node:24-alpine

RUN corepack enable \
    && mkdir -p /workspace/permonik-web \
    && chown node:node /workspace/permonik-web

WORKDIR /workspace/permonik-web

COPY --chown=node:node permonik-web/package.json permonik-web/yarn.lock permonik-web/.yarnrc.yml ./
COPY --chown=node:node permonik-web/.yarn/plugins ./.yarn/plugins

USER node

RUN yarn install --immutable

COPY --chown=node:node permonik-web ./

CMD ["yarn", "dev"]
