# Railway Deployment Guide for KaivilleMap

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Key Lessons Learned](#key-lessons-learned)
4. [Technical Specifications](#technical-specifications)
5. [Environment Variables](#environment-variables)
6. [Common Errors and Solutions](#common-errors-and-solutions)
7. [Deployment Checklist](#deployment-checklist)
8. [Best Practices](#best-practices)

## Overview

This guide documents the complete Railway deployment process for the KaivilleMap project, including all issues encountered and their solutions. This deployment involved containerizing a full-stack React/Node.js application with Supabase integration.

### Project Details
- **Railway Project**: kaiville-railway-01
- **Project ID**: d94c0c6d-e669-4a34-a693-ecccf6e8533e
- **Public URL**: https://kaivillemap-production.up.railway.app
- **Stack**: React (Vite) + Node.js (Express) + Supabase
- **Container**: Docker multi-stage build

## Prerequisites

1. **GitHub Repository** with push access
2. **Railway Account** with project created
3. **Supabase Project** with:
   - Project URL
   - Anon Key
   - Service Role Key
   - Project ID
   - Database Password
   - Access Token
4. **Docker** understanding for debugging

## Key Lessons Learned

### 1. **Vite Build Output Directory**
- **Issue**: Dockerfile was looking for `/app/client/build` but Vite outputs to `/app/client/dist`
- **Solution**: Update Dockerfile to copy from correct directory
- **Learning**: Always verify build tool output directories

### 2. **Working Directory Confusion**
- **Issue**: Railway couldn't find `server/index.js` - was looking for `/app/server/server/index.js`
- **Solution**: Update `railway.json` startCommand from `node server/index.js` to `node index.js`
- **Learning**: Be aware of WORKDIR context in Dockerfile when specifying paths

### 3. **Memory Constraints**
- **Issue**: Exit code 137 during npm install (out of memory)
- **Solution**: Add NODE_OPTIONS with memory limits and use flags like `--legacy-peer-deps --no-audit --progress=false`
- **Learning**: Railway has memory limits during build; optimize npm install commands

### 4. **Cache Mount Syntax**
- **Issue**: Railway requires specific cache mount format: `--mount=type=cache,id=<cache-id>`
- **Solution**: Remove cache mounts entirely for Railway compatibility
- **Learning**: Railway has specific requirements that differ from standard Docker

### 5. **Database URL Requirements**
- **Issue**: Server was configured for MongoDB but using Supabase
- **Solution**: Remove MongoDB dependencies and DATABASE_URL requirement
- **Learning**: Clean up unused dependencies and configurations

### 6. **Missing package-lock.json**
- **Issue**: `npm ci` requires package-lock.json files
- **Solution**: Use `npm install` instead of `npm ci`
- **Learning**: Ensure lock files exist or use appropriate install command

### 7. **Root Route Override**
- **Issue**: Test endpoint at `/` was returning JSON instead of React app
- **Solution**: Remove test endpoint, let static file serving handle root
- **Learning**: Don't add test endpoints that override your main app routes

## Technical Specifications

### Dockerfile Structure

```dockerfile
# Multi-stage build optimized for Railway
FROM node:18-alpine AS client-build
WORKDIR /app/client
ENV NODE_OPTIONS="--max_old_space_size=512"
# Copy and install dependencies
# Build React app

FROM node:18-alpine
WORKDIR /app/server
ENV NODE_OPTIONS="--max_old_space_size=256"
# Copy server files
# Copy React build from previous stage
# Start server
```

### Key Dockerfile Considerations:
1. Use multi-stage builds to reduce final image size
2. Set memory limits with NODE_OPTIONS
3. Install dumb-init for proper signal handling
4. Bind to 0.0.0.0 for all interfaces
5. Use absolute paths consistently
6. Set proper working directories

### railway.json Configuration

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node index.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```

### Server Configuration Requirements

1. **Port Binding**: Must use `process.env.PORT` and bind to `0.0.0.0`
2. **Health Check**: Implement `/api/health` endpoint
3. **Environment Detection**: Use `process.env.NODE_ENV`
4. **Graceful Shutdown**: Handle SIGTERM signals
5. **Error Handling**: Proper startup error handling

## Environment Variables

### Required Variables for Railway:

```env
# Automatically provided by Railway
PORT=<dynamic>
NODE_ENV="production"

# Supabase Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
SUPABASE_PROJECT_ID="<project-id>"
SUPABASE_DB_PASSWORD="<db-password>"
SUPABASE_ACCESS_TOKEN="<access-token>"

# React App Variables (prefix with REACT_APP_)
REACT_APP_SUPABASE_URL="https://your-project.supabase.co"
REACT_APP_SUPABASE_ANON_KEY="<anon-key>"
```

### Important Notes:
- Do NOT include DATABASE_URL for MongoDB if using Supabase
- Do NOT use template syntax like `${{RAILWAY_PUBLIC_DOMAIN}}`
- Ensure all keys are complete (not truncated)
- REACT_APP_ prefix is required for React environment variables

## Common Errors and Solutions

### 1. npm ci failing
**Error**: `npm ci can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync`
**Solution**: Change `npm ci` to `npm install` in Dockerfile

### 2. Exit code 137
**Error**: Build process killed due to memory limits
**Solution**: 
- Add `ENV NODE_OPTIONS="--max_old_space_size=512"`
- Use `npm install --legacy-peer-deps --no-audit --progress=false`

### 3. MODULE_NOT_FOUND
**Error**: `Cannot find module '/app/server/server/index.js'`
**Solution**: Fix startCommand in railway.json to match WORKDIR

### 4. Health check failures
**Error**: `1/1 replicas never became healthy!`
**Solutions**:
- Ensure server binds to 0.0.0.0
- Check environment variables are correct
- Verify health endpoint exists
- Check deploy logs for startup errors

### 5. Cache mount errors
**Error**: `Cache mounts MUST be in the format --mount=type=cache,id=<cache-id>`
**Solution**: Remove all cache mount directives from Dockerfile

## Deployment Checklist

### Pre-Deployment:
- [ ] All code committed and pushed to GitHub
- [ ] Dockerfile tested locally if possible
- [ ] Environment variables prepared
- [ ] Health check endpoint implemented
- [ ] Server binds to PORT env variable
- [ ] Build outputs verified (dist vs build)

### Railway Setup:
- [ ] Create new Railway project
- [ ] Connect GitHub repository
- [ ] Add all environment variables
- [ ] Verify no DATABASE_URL if using Supabase
- [ ] Check REACT_APP_ variables are complete

### Post-Deployment:
- [ ] Monitor build logs for errors
- [ ] Check deploy logs if health check fails
- [ ] Verify all endpoints are accessible
- [ ] Test application functionality

## Best Practices

### 1. **Dockerfile Optimization**
- Use multi-stage builds
- Minimize layers
- Set memory limits appropriately
- Copy only necessary files
- Use .dockerignore

### 2. **Error Handling**
- Add comprehensive logging
- Handle startup errors gracefully
- Implement proper health checks
- Use error boundaries in React

### 3. **Environment Management**
- Never commit sensitive keys
- Use consistent naming conventions
- Document all required variables
- Validate environment on startup

### 4. **Debugging Railway Deployments**
- Always check both Build Logs and Deploy Logs
- Add console.log statements for debugging
- Use simple test endpoints
- Start with minimal configuration

### 5. **Asset Management**
- Move large assets to CDN (like Supabase Storage)
- Reduces Docker image size significantly
- Improves deployment speed
- Better caching and performance

## Migration from Local to Railway

### Key Differences:
1. **No localhost**: Services must bind to 0.0.0.0
2. **Dynamic PORT**: Use process.env.PORT
3. **No MongoDB**: Use cloud databases
4. **Build constraints**: Memory limits during build
5. **Path resolution**: Be explicit about working directories

### Migration Steps:
1. Remove local database dependencies
2. Update server to use PORT env variable
3. Implement health check endpoint
4. Test Dockerfile locally
5. Prepare environment variables
6. Deploy and debug iteratively

## Troubleshooting Quick Reference

| Issue | Check | Solution |
|-------|-------|----------|
| Build fails | package-lock.json exists? | Use npm install instead of npm ci |
| Exit 137 | Memory usage | Add NODE_OPTIONS limits |
| Module not found | Working directory | Fix paths in railway.json |
| Health check fails | Deploy logs | Check server startup errors |
| Assets missing | Build output dir | Verify Vite outputs to dist |
| Server not starting | Environment vars | Remove DATABASE_URL |

## Conclusion

Railway deployment requires attention to:
- Proper Docker configuration
- Correct environment variables
- Understanding of working directories
- Memory optimization
- Proper error handling

Following this guide should help avoid the common pitfalls encountered during the KaivilleMap deployment process. Always check logs thoroughly and deploy iteratively when debugging issues.