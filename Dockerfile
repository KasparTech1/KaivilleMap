# Multi-stage Dockerfile for KaivilleMap - Optimized for Railway

# Stage 1: Build React frontend
FROM node:18-alpine AS client-build

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install all dependencies for build
ENV NODE_OPTIONS="--max_old_space_size=512"
RUN npm install --legacy-peer-deps --no-audit --progress=false

# Copy client source
COPY client/ ./

# Build React app
RUN npm run build && ls -la

# Stage 2: Setup Node.js server
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy server package files first
COPY server/package.json ./server/

# Install server dependencies with reduced memory
WORKDIR /app/server
ENV NODE_OPTIONS="--max_old_space_size=256"
RUN npm install --production --legacy-peer-deps --no-audit --progress=false

# Copy server source code
COPY server/ ./

# Copy built React app from previous stage (Vite outputs to dist)
COPY --from=client-build /app/client/dist ./public

# Create uploads directory if needed
RUN mkdir -p ./uploads

# Reset NODE_OPTIONS for runtime
ENV NODE_OPTIONS=""
ENV NODE_ENV=production

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server (already in /app/server directory)
CMD ["node", "index.js"]