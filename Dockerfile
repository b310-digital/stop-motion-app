ARG NODE_VERSION=22
ARG ALPINE_VERSION=3.21
ARG PNPM_VERSION=11.3.0
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.29.2-alpine3.22-slim

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

ENV APP_PATH=/home/node/app
WORKDIR $APP_PATH

# Skip corepack's interactive TOFU prompt so non-interactive builds can
# fetch the pnpm version declared in react-app/package.json.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable \
 && chown node:node $APP_PATH

USER node

ARG PNPM_VERSION
RUN corepack prepare pnpm@${PNPM_VERSION} --activate


# ---------------------------------------------------------------------------
# Development image (pnpm install only; source is bind-mounted at runtime)
# ---------------------------------------------------------------------------

FROM base AS development

COPY --chown=node:node react-app/package.json react-app/pnpm-lock.yaml ./react-app/
WORKDIR $APP_PATH/react-app
RUN pnpm install --frozen-lockfile
WORKDIR $APP_PATH


# ---------------------------------------------------------------------------
# Production builder
# ---------------------------------------------------------------------------

FROM base AS builder

COPY --chown=node:node react-app/package.json react-app/pnpm-lock.yaml ./react-app/
WORKDIR $APP_PATH/react-app
RUN pnpm install --frozen-lockfile

COPY --chown=node:node react-app/ ./
RUN pnpm build
# Vite output lives at $APP_PATH/react-app/dist


# ---------------------------------------------------------------------------
# Production runtime
# ---------------------------------------------------------------------------

FROM ${NGINX_IMAGE} AS production

COPY config/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /home/node/app/react-app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
