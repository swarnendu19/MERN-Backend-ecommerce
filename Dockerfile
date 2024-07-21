# Builder stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Set environment to production
ENV NODE_ENV=production

RUN npm ci

COPY --from=builder /app/dist ./dist

# Change ownership from root to Node
RUN chown -R node:node /app && chmod -R 755 /app

RUN npm install pm2 -g

COPY ecosystem.config.mjs .

USER node

EXPOSE 5513

CMD ["pm2-runtime", "start", "ecosystem.config.mjs"]
