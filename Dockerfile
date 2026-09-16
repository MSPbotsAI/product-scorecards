# syntax=docker/dockerfile:1.7
#
# App image for the MSPbots platform. Built by the centralized App Publish pipeline
# (mspbots-gitlab-agent-app-deploy), which requires this file at the repo root and passes:
#   --secret id=npm_auth        npm.mspbots.ai credentials, base64("user:pass"), Basic `_auth`
#   --build-arg APP_NAME        app name (= image name)
#   --build-arg APP_VERSION     package.json version (not used for display; IMAGE_TAG is)
#   --build-arg APP_COMMIT      target repo HEAD sha  → GIT_SHA for /api/_version
#   --build-arg IMAGE_TAG       the pushed image tag, e.g. v20260818.1021 → top-bar version
# Build: mspack toolchain (vite frontend + tsup backend → dist/). Runtime needs only dist/
# (tsup bundle:true inlines dependencies, no node_modules). Credentials never reach an image layer.

###### [STAGE] Build ######
FROM node:22-alpine AS builder
WORKDIR /app
ENV CI=true

RUN npm add -g pnpm@10
# node-gyp toolchain, in case a native dependency needs it
RUN apk add --no-cache python3 make g++

COPY . .

# Install (private registry credentials come from the build secret, visible to this RUN only)
RUN --mount=type=secret,id=npm_auth \
    --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    sh -eu -c 'if [ -f /run/secrets/npm_auth ]; then \
        { printf "//npm.mspbots.ai/:_auth=%s\n" "$(cat /run/secrets/npm_auth)"; \
          echo "always-auth=true"; } > /root/.npmrc; \
      fi; \
      pnpm install --frozen-lockfile; \
      rm -f /root/.npmrc'

# Build frontend (vite, loading @mspbots/react's TS config through tsx) + backend (tsup).
# Not `mspack build`: with a service/schema.ts it also runs drizzle-kit migrate, which needs a database;
# the image build must never touch one — per-tenant migration is a separate App Publish step.
# BASE_URL is the frontend asset mount prefix, default /apps/<name>/ (override with --build-arg).
# APP_NAME comes from the pipeline (= image name = repo slug = the path App Publish routes to, /apps/<slug>/);
# package.json name is only the fallback. The two can differ (repo app-workspace vs package app-forms) and the
# route must win, otherwise index.html points at assets under the wrong prefix and the page renders blank.
ARG APP_NAME
ARG BASE_URL
ARG IMAGE_TAG
RUN sh -eu -c 'PKG_NAME="$(node -p "require(\"./package.json\").name")"; \
      APP_NAME="${APP_NAME:-$PKG_NAME}"; \
      APP_ID="$(node -p "require(\"./package.json\").id")"; \
      APP_VERSION="${IMAGE_TAG:-}"; APP_VERSION="${APP_VERSION#v}"; \
      [ -n "$APP_VERSION" ] || APP_VERSION="$(TZ=UTC-8 date +%Y%m%d.%H%M)"; \
      export APP_NAME APP_ID APP_VERSION; \
      export BASE_URL="${BASE_URL:-/apps/$APP_NAME/}"; \
      echo "building with BASE_URL=$BASE_URL"; \
      pnpm exec tsx node_modules/vite/bin/vite.js build; \
      pnpm exec tsup'

###### [STAGE] Runtime ######
FROM node:22-alpine AS app
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# The SOP Agent funnel clones the engagement store at runtime (service/lib/engagement-store.ts):
# a markdown data repo pulled every 5 minutes, so a store push reaches the app without a republish.
# node:alpine ships no git binary, so without this the clone fails and the funnel page has no source.
RUN apk add --no-cache git

# Build identity for GET /api/_version (App Publish compares the running sha with the branch head)
ARG APP_COMMIT
ARG IMAGE_TAG
ENV GIT_SHA=${APP_COMMIT} BUILD_VERSION=${IMAGE_TAG}

# Artifacts only; in production the server serves both the API and the frontend static files
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/server.js"]
