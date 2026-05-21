# Etapa 1: Instalación de dependencias
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Etapa 2: Construcción
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Variables de entorno para el build
ENV NEXT_PUBLIC_API_URL=https://app-adopcion-backend-dev.azurewebsites.net
ENV NEXT_PUBLIC_APP_URL=https://app-adopcion-frontend-dev.azurewebsites.net
RUN pnpm run build

# Etapa 3: Producción (Imagen final ligera)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Creamos un usuario de seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]