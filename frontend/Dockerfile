# ═══════════════════════════════════════════════════════════
#  Citizen Portal — Frontend Dockerfile (Next.js 14)
#  Multi-stage build using Next.js standalone output
# ═══════════════════════════════════════════════════════════

# ─── Stage 1: Dependencies ─────────────────────────────────
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ─── Stage 2: Build ─────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Public API URL baked in at build time (browser-side fetches need this)
ARG NEXT_PUBLIC_API_URL=http://192.168.231.128:30091/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Stage 3: Production ───────────────────────────────────
FROM node:20-alpine AS production

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
