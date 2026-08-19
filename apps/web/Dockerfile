FROM node:24-slim AS builder
WORKDIR /app
ENV SKIP_ENV_VALIDATION=1

COPY . .
RUN --mount=type=cache,target=/root/.npm npm install

ARG VITE_SERVER_URL
ARG VITE_APP_VERSION
ENV VITE_SERVER_URL=${VITE_SERVER_URL}
ENV NODE_ENV=production
RUN VITE_APP_VERSION="${VITE_APP_VERSION:-$(date -u +%Y%m%d%H%M%S)}" \
	&& export VITE_APP_VERSION \
	&& echo "VITE_APP_VERSION=${VITE_APP_VERSION}" \
	&& cd apps/web && npm run build

# Produção: react-router-serve aplica compression() (gzip) em HTML/JS/CSS/JSON.
# Imagens (PNG/WebP/JPEG) já são comprimidas — middleware pula image/* (correto).
FROM node:24-slim AS runner
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0
EXPOSE 3001
CMD ["sh", "-c", "cd apps/web && npm run start"]