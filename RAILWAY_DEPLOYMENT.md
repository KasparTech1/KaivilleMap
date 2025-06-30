# Railway Deployment Guide for KaivilleMap

## Project Details
- **Railway Project**: kaiville-railway-01
- **Project ID**: d94c0c6d-e669-4a34-a693-ecccf6e8533e
- **GitHub Repo**: KasparTech1/KaivilleMap
- **URL**: https://kaiville-railway-01.up.railway.app

## 🚀 Quick Deployment Steps

### 1. **Environment Variables**
Go to Railway Dashboard → Your Service → Settings → Variables → RAW Editor

Copy and paste the contents from `RAILWAY_ENV_VARIABLES.txt`

### 2. **Push to GitHub**
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

Railway will automatically:
- Detect the Dockerfile
- Build the container
- Deploy the application
- Provide the public URL

### 3. **Monitor Deployment**
- Watch the build logs in Railway dashboard
- Check the deployment status
- Visit your app at: https://kaiville-railway-01.up.railway.app

## 📁 Files Created

1. **Dockerfile** - Multi-stage build for React + Node.js
2. **.dockerignore** - Excludes unnecessary files from build
3. **railway.json** - Railway-specific configuration
4. **docker-compose.yml** - For local testing
5. **server/index.js** - Production-ready server
6. **.env.example** - Environment variable template

## 🧪 Local Testing

### Test with Docker:
```bash
# Build the image
docker build -t kaiville-map .

# Run with docker-compose
docker-compose up

# Or run directly
docker run -p 3001:3000 \
  -e NODE_ENV=production \
  -e SUPABASE_URL=your_url \
  kaiville-map
```

### Access locally:
- http://localhost:3001

## 🔧 Configuration Details

### Server Configuration:
- Serves React build from `/public` directory
- API routes under `/api/*`
- Health check at `/api/health`
- CORS configured for production domain
- Static file serving for uploads

### React Configuration:
- Built as static files
- API calls use `REACT_APP_API_URL`
- Supabase client uses environment variables
- All routes handled by React Router

## 📊 Health Monitoring

Railway will check `/api/health` endpoint:
```json
{
  "status": "ok",
  "timestamp": "2024-01-30T10:00:00Z",
  "environment": "production",
  "database": "connected"
}
```

## 🐛 Troubleshooting

### Build Fails:
1. Check Railway build logs
2. Ensure all dependencies are in package.json
3. Verify Dockerfile syntax

### App Not Loading:
1. Check environment variables are set
2. Verify PORT is not hardcoded
3. Check CORS configuration

### Database Connection Issues:
1. Verify DATABASE_URL is correct
2. Check MongoDB/Supabase credentials
3. Ensure IPs are whitelisted

### React App Issues:
1. Check REACT_APP_* variables
2. Verify API URL is correct
3. Check browser console for errors

## 🔄 Updates and Redeploys

Railway auto-deploys on push to main branch:
```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
# Railway deploys automatically
```

## 🎯 Next Steps

1. **Custom Domain** (optional):
   - Add custom domain in Railway settings
   - Update CORS in server configuration

2. **Monitoring**:
   - Set up alerts in Railway
   - Monitor resource usage
   - Check logs regularly

3. **Scaling**:
   - Railway handles horizontal scaling
   - Monitor performance metrics
   - Optimize as needed

## 📝 Important Notes

- Railway provides automatic HTTPS
- PORT is automatically assigned by Railway
- All secrets should be in environment variables
- Never commit .env files to Git
- Use Railway's built-in logging

## 🆘 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check logs: Railway Dashboard → Deployments → Logs

---

Your app should now be live at: **https://kaiville-railway-01.up.railway.app** 🎉