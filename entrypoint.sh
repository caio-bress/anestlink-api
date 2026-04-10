#!/bin/sh
echo "Rodando migrations..."
npx prisma migrate deploy
echo "Subindo servidor..."
exec node dist/server.js