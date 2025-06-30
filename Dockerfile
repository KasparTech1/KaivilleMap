# Multi-stage Dockerfile for KaivilleMap - Optimized for Railway

# Stage 1: Build React frontend
FROM node:18-alpine AS client-build

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install all dependencies (including dev) for build
# Using npm install with cache mount to reduce memory
RUN --mount=type=cache,target=/root/.npm \
    npm install --prefer-offline --no-audit --progress=false

# Copy client source
COPY client/ ./

# Build React app with memory limit
ENV NODE_OPTIONS="--max_old_space_size=512"
RUN npm run build

# Stage 2: Setup Node.js server
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy server package files first
COPY server/package.json ./server/
COPY server/package-lock.json* ./server/

# Install server dependencies with reduced memory
WORKDIR /app/server
ENV NODE_OPTIONS="--max_old_space_size=256"
RUN npm install --production --prefer-offline --no-audit --progress=false || \
    (npm cache clean --force && npm install --production --no-audit --progress=false)

# Copy server source code
COPY server/ ./

# Copy built React app from previous stage
COPY --from=client-build /app/client/build ./public

# Create uploads directory if needed
RUN mkdir -p ./uploads

# Reset NODE_OPTIONS for runtime
ENV NODE_OPTIONS=""
ENV NODE_ENV=production

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "index.js"]