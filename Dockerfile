# Multi-stage Dockerfile for KaivilleMap

# Stage 1: Build React frontend
FROM node:18-alpine AS client-build

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm install --production

# Copy client source
COPY client/ ./

# Build React app
RUN npm run build

# Stage 2: Setup Node.js server
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Copy server source code
COPY server/ ./

# Copy built React app from previous stage
COPY --from=client-build /app/client/build ./public

# Create uploads directory if needed
RUN mkdir -p ./uploads

# Set environment to production
ENV NODE_ENV=production

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "index.js"]