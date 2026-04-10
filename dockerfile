FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY . .

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -S anestlink && adduser -S anestlink -G anestlink

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci --omit=dev
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER anestlink

EXPOSE 3000

CMD ["./entrypoint.sh"]