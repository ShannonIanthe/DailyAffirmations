FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/daily-affirm.db

CMD ["node", "dist/index.js"]
