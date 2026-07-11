FROM node:24-slim AS base
WORKDIR /app
ENV SKIP_ENV_VALIDATION=1

COPY . .
RUN --mount=type=cache,target=/root/.npm npm install

ENV NODE_ENV=production
RUN cd apps/server && npm run build
ENV SKIP_ENV_VALIDATION=

EXPOSE 3000

WORKDIR /app/apps/server
CMD ["node", "dist/index.mjs"]
