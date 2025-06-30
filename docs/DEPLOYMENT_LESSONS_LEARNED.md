# Railway Deployment: Lessons Learned Summary

## Executive Summary

This document summarizes the key lessons from deploying KaivilleMap to Railway, documenting 7+ hours of troubleshooting across 15+ failed deployments.

## Critical Success Factors

### 1. **Build Tool Awareness**
- **Vite outputs to `dist/`**, not `build/`
- Always verify your build tool's output directory
- Cost: 30 minutes debugging "build directory not found"

### 2. **Working Directory Context**
- **WORKDIR in Dockerfile affects all paths**
- Railway's startCommand must match the container's working directory
- Cost: 45 minutes debugging MODULE_NOT_FOUND errors

### 3. **Railway-Specific Requirements**
- **No cache mounts** - Railway has specific syntax requirements
- **Memory limits** - Builds fail with exit code 137 without optimization
- **Port binding** - Must bind to 0.0.0.0, not localhost
- Cost: 2+ hours across multiple issues

### 4. **Environment Variable Pitfalls**
- **No MongoDB URLs** - Don't use localhost services
- **Complete keys** - Truncated Supabase keys cause silent failures
- **No template syntax** - `${{RAILWAY_PUBLIC_DOMAIN}}` doesn't work
- Cost: 1 hour debugging connection issues

## The Journey: From First Deploy to Success

### Phase 1: Initial Setup (Minutes 0-30)
✅ Created Dockerfile
✅ Set up railway.json
✅ Connected GitHub
❌ First deployment failed

### Phase 2: Package Lock Issues (Minutes 30-60)
- **Problem**: npm ci requires package-lock.json
- **Solution**: Changed to npm install
- **Learning**: Check for lock files before using npm ci

### Phase 3: Memory Crisis (Hours 1-2)
- **Problem**: Exit code 137 during build
- **Solutions Applied**:
  - Added NODE_OPTIONS="--max_old_space_size=512"
  - Added flags: --legacy-peer-deps --no-audit --progress=false
  - Removed npm cache clean (was using more memory)

### Phase 4: Cache Mount Syntax (Hours 2-3)
- **Problem**: Railway-specific cache mount requirements
- **Solution**: Removed all cache mounts
- **Learning**: Railway has platform-specific constraints

### Phase 5: Build Directory Mismatch (Hours 3-4)
- **Problem**: Looking for /app/client/build, Vite creates /app/client/dist
- **Solution**: Updated COPY command in Dockerfile
- **Learning**: Always verify build output locations

### Phase 6: Module Path Resolution (Hours 4-5)
- **Problem**: Cannot find module '/app/server/server/index.js'
- **Root Cause**: WORKDIR was /app/server, startCommand was "node server/index.js"
- **Solution**: Changed to "node index.js"
- **Learning**: Understand Docker WORKDIR context

### Phase 7: Database & Environment (Hours 5-6)
- **Problem**: Server wouldn't start due to MongoDB requirement
- **Additional Issue**: Truncated Supabase keys
- **Solutions**: 
  - Removed DATABASE_URL and MongoDB deps
  - Fixed all environment variables
  - Made database connection optional

### Phase 8: Success! (Hour 6+)
- All issues resolved
- Health check passing
- Application deployed and running

## Quick Reference Card

### ✅ DO:
- Use `npm install` not `npm ci` (unless you have lock files)
- Check build output directory (dist vs build)
- Bind to 0.0.0.0 in production
- Include memory limits in NODE_OPTIONS
- Verify environment variables are complete
- Implement /api/health endpoint
- Use simple paths in railway.json

### ❌ DON'T:
- Use DATABASE_URL with localhost
- Include cache mounts in Dockerfile
- Use template syntax in env vars
- Assume standard Docker works in Railway
- Forget about WORKDIR context
- Skip error handling in server startup

## Cost Analysis

### Time Investment:
- Initial setup: 30 minutes
- Debugging npm issues: 30 minutes
- Memory optimization: 90 minutes
- Railway-specific fixes: 60 minutes
- Path resolution: 45 minutes
- Environment fixes: 60 minutes
- Documentation: 30 minutes
- **Total: ~6-7 hours**

### Key Time Sinks:
1. Not reading deploy logs immediately (could save 30+ min)
2. Not understanding Vite output directory (30 min)
3. Cache mount syntax research (45 min)
4. MongoDB removal complexity (45 min)

## Recommendations for Future Deployments

### 1. **Pre-Flight Checklist**
```bash
# Before first deployment:
- [ ] Verify build output directory
- [ ] Check for package-lock.json
- [ ] Remove localhost database URLs
- [ ] Add health check endpoint
- [ ] Test Dockerfile locally if possible
```

### 2. **Debugging Strategy**
1. **Always check Deploy Logs first** (not just build logs)
2. Add verbose logging during development
3. Start with minimal configuration
4. Fix one error at a time
5. Document each fix immediately

### 3. **Optimization Tips**
- Migrate assets to CDN early (saved 167k lines of SVGs)
- Use multi-stage Docker builds
- Set appropriate memory limits
- Remove unused dependencies

### 4. **Environment Setup**
```env
# Minimal required for Supabase app:
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_KEY=...
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

## Conclusion

Railway deployment is straightforward once you understand:
1. Platform-specific constraints
2. Your build tool's behavior
3. Docker working directory context
4. Proper environment configuration

The ~7 hours spent troubleshooting has produced valuable documentation that should reduce future deployment time to under 30 minutes.

### Final Stats:
- **Deployments attempted**: 15+
- **Unique errors encountered**: 7
- **Lines of code changed**: ~200
- **Knowledge gained**: Invaluable

### Success Metrics:
- ✅ Application deployed and running
- ✅ All assets migrated to CDN
- ✅ Comprehensive documentation created
- ✅ Reproducible deployment process
- ✅ Health checks passing
- ✅ Zero MongoDB dependencies