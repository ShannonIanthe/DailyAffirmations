# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies for better-sqlite3 native bindings
RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ---- Runtime Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies for SQLite
RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/daily-affirm.db

VOLUME [ "/data" ]

CMD ["node", "dist/index.js"]