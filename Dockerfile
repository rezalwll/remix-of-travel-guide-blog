# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run db:generate && npm run build:web && npm run build:api && npm prune --omit=dev

FROM nginx:1.27-alpine AS proxy
COPY ops/nginx.example.conf /etc/nginx/conf.d/default.conf
COPY ops/security-headers.conf /etc/nginx/snippets/kiashi-security-headers.conf

FROM node:20-bookworm-slim AS web
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
RUN groupadd --system --gid 1001 kiashi && useradd --system --uid 1001 --gid kiashi --create-home kiashi
COPY --from=build --chown=kiashi:kiashi /app/.next/standalone ./
COPY --from=build --chown=kiashi:kiashi /app/.next/static ./.next/static
COPY --from=build --chown=kiashi:kiashi /app/public ./public
USER kiashi
EXPOSE 3000
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=15s --timeout=5s --retries=5 CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]

FROM node:20-bookworm-slim AS api
ENV NODE_ENV=production
WORKDIR /app
RUN groupadd --system --gid 1001 kiashi && useradd --system --uid 1001 --gid kiashi --create-home kiashi
COPY --from=build --chown=kiashi:kiashi /app/package.json /app/package-lock.json ./
COPY --from=build --chown=kiashi:kiashi /app/node_modules ./node_modules
COPY --from=build --chown=kiashi:kiashi /app/dist-server ./dist-server
USER kiashi
EXPOSE 8787
STOPSIGNAL SIGTERM
CMD ["node", "dist-server/server/index.js"]
