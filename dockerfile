FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -S anestlink && adduser -S anestlink -G anestlink

COPY package*.json ./
COPY prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

RUN npm ci --omit=dev
RUN npx prisma generate

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER anestlink

EXPOSE 3000

CMD ["./entrypoint.sh"]