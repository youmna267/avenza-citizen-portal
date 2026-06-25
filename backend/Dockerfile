# ═══════════════════════════════════════════════════════════
#  Citizen Portal — Backend Dockerfile (NestJS)
#  Multi-stage build for a small, secure production image
# ═══════════════════════════════════════════════════════════

# ─── Stage 1: Install all dependencies (incl. dev, needed to compile) ──
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ─── Stage 2: Compile TypeScript ───────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY . .
RUN npm run build

# ─── Stage 3: Install production-only dependencies ─────────
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─── Stage 4: Production runtime ───────────────────────────
FROM node:20-alpine AS production

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/v1/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/main"]
