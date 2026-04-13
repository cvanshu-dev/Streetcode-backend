# Medusa v2.13.1 Render Deployment Guide

This guide explains how to deploy the Medusa backend to Render using the provided `render.yaml` configuration.

## Overview

The `render.yaml` file includes:
- **PostgreSQL Database**: Primary data store with Render-managed backups
- **Redis Cache**: For event bus and session management
- **Web Service**: Node.js backend running Medusa v2.13.1

## Prerequisites

1. **Render Account**: Create one at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub (Render deploys from Git)
3. **Environment Variables**: Gather Razorpay API credentials and generate secure keys

## Deployment Steps

### 1. Connect Your GitHub Repository

```bash
# Ensure render.yaml is committed to your repository
git add render.yaml RENDER_DEPLOYMENT_GUIDE.md
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Create Infrastructure on Render

**Option A: Using Render Dashboard (Recommended)**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **+ New** → **Blueprint**
3. Select your GitHub repository
4. Paste your `render.yaml` file or point to the existing one
5. Click **Create**

**Option B: Using Render CLI**
```bash
# Install Render CLI
npm install -g @render-com/render-cli

# Deploy
render deploy --git-repo https://github.com/your-username/your-repo
```

### 3. Configure Environment Variables

After deployment, update the following environment variables in Render Dashboard → Settings → Environment:

#### Required Secrets (Generate Unique Values)
- `JWT_SECRET` - Generated automatically, can be regenerated for security
- `COOKIE_SECRET` - Generated automatically, can be regenerated for security

#### Razorpay Configuration
Get these from your [Razorpay Dashboard](https://dashboard.razorpay.com):
```yaml
RAZORPAY_API_KEY: rzp_live_xxxxxxxxxxxxx
RAZORPAY_API_SECRET: xxxxxxxxxxxxxxxx
```

#### Optional Configurations
```yaml
# Admin Settings
MEDUSA_ADMIN_ONBOARDING_DISABLED: "true"

# CORS Settings (adjust for your storefronts)
ADMIN_CORS: "http://localhost:7001,https://admin.yourdomain.com"
STORE_CORS: "http://localhost:3000,https://store.yourdomain.com"
AUTH_CORS: "https://yourdomain.com"

# Logging
LOG_LEVEL: "info"  # or "debug" for more verbose output
```

## Database Setup

### Initial Database Migration
After the first deployment, SSH into your Medusa backend service:

```bash
# On Render Shell / SSH into the web service
npm run migration:run
```

Or trigger it via the Medusa workflow:
```bash
npm run db:seed  # If you have seed data
```

### Backup Strategy
Render automatically backs up your PostgreSQL database:
- **Free tier**: 7-day retention
- **Paid tier**: Up to 35-day retention (configurable)

Enable automatic backups in Render Dashboard → Database → Backups.

## Redis Configuration

The Redis instance is automatically configured with:
- `allkeys-lru` eviction policy for memory management
- Connection pooling for Medusa event bus
- Automatic failover available on paid plans

**REDIS_URL** format: `redis://:password@host:port`

This is automatically injected via `fromService` in render.yaml.

## Health Checks & Monitoring

The configuration includes:
- **Health endpoint**: `/health` (Medusa default)
- **Check interval**: 30 seconds
- **Initial delay**: 300 seconds (5 minutes for startup)

Monitor logs in Render Dashboard → Logs tab.

## Scaling & Performance

### Free Tier Limitations
- Single web instance
- Shared CPU
- Limited to 1 GB RAM
- Automatic shutdown after 15 minutes of inactivity

### Upgrade to Paid for Production
```yaml
plan: standard  # or pro, premium
numInstances: 2  # Add auto-scaling
maxConnections: 100  # Increase connection pool
```

## Custom Domain

To add your custom domain:

1. **Render Dashboard** → Web Service → Settings → Domains
2. Add domain (e.g., `api.yourdomain.com`)
3. **Update DNS records**:
   ```
   CNAME: api -> xxxx.render.com
   ```
   or
   ```
   A: 216.239.32.21  (Render IP)
   ```

4. **SSL/TLS**: Render automatically provisions an SSL certificate

## TypeScript Build Optimization

The `buildCommand` includes best practices:

```bash
npm install                    # Install dependencies
npm run build                  # Compile TypeScript to JavaScript
npm prune --production         # Remove dev dependencies for smaller image
```

Medusa backend runs the compiled JavaScript, not raw TypeScript.

## Deployment Troubleshooting

### Build Fails
1. **Check build logs**: Render Dashboard → Build tab
2. **Common issues**:
   - Missing environment variables → Add to Web Service settings
   - Dependency conflicts → Run `npm ci` locally, commit `package-lock.json`
   - TypeScript errors → Fix in code, rebuild

### Application Won't Start
```bash
# SSH into the service and check logs
npm start  # Run manually to see errors
```

Common issues:
- Database migration errors → SSH and run `npm run migration:run`
- Missing Redis connection → Verify REDIS_URL in environment
- Port conflicts → Ensure PORT=9000 is set

### Health Check Failing
- Increase `initialDelaySeconds` if startup takes longer
- Check if `/health` endpoint is accessible
- Review API logs for errors

## Production Checklist

- [ ] Environment variables securely set (not in code)
- [ ] Database migrations completed
- [ ] Razorpay keys properly configured
- [ ] CORS settings updated for your domains
- [ ] SSL/TLS certificate issued (automatic)
- [ ] Backup strategy configured
- [ ] Monitoring & alerts set up
- [ ] Custom domain configured
- [ ] Email service configured (if using)
- [ ] API key rotation policy established

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Runtime environment | `production` |
| `DATABASE_URL` | PostgreSQL connection | Auto-injected |
| `REDIS_URL` | Redis connection | Auto-injected |
| `JWT_SECRET` | JWT signing key | Auto-generated |
| `PORT` | Server port | `9000` |
| `EVENT_BUS` | Event system type | `redis` |
| `RAZORPAY_API_KEY` | Payment gateway | `rzp_live_...` |
| `RAZORPAY_API_SECRET` | Payment secret | `xxxxxxx` |
| `ADMIN_CORS` | Admin frontend URL | `http://localhost:7001` |
| `STORE_CORS` | Store frontend URL | `http://localhost:3000` |

## Connecting Storefront

### For Next.js Storefront (drip-storefront)

Update your storefront's environment variables:

```bash
# .env.local or build configuration
NEXT_PUBLIC_MEDUSA_API_URL=https://medusa-backend.render.com
MEDUSA_API_KEY=your_api_key_here
```

Or deploy the storefront to Render as well:

```yaml
- type: web
  name: medusa-storefront
  runtime: node
  buildCommand: npm install && npm run build
  startCommand: npm start
  envVars:
    - key: NEXT_PUBLIC_MEDUSA_API_URL
      value: https://medusa-backend.render.com
```

## Backup & Recovery

### Manual Database Backup
```bash
# From your local machine
pg_dump postgresql://user:pass@host/medusa_db > backup.sql
```

### Restore from Backup
```bash
# On Render
psql postgresql://user:pass@host/medusa_db < backup.sql
```

## Monitoring & Logging

Access logs in Render Dashboard:
1. **Web Service** → **Logs**: Application output
2. **Database** → **Metrics**: Query performance, connections
3. **Redis** → **Metrics**: Memory usage, commands

### External Monitoring (Optional)
- **Sentry**: Error tracking → Add `SENTRY_DSN` env var
- **DataDog**: Performance monitoring
- **New Relic**: APM suite

## Cost Estimation (Free-to-Production Tier)

| Resource | Free | Standard |
|----------|------|----------|
| Web Service | Free | $7/month |
| PostgreSQL | Free | $15/month |
| Redis | Free | $6/month |
| **Total** | **$0** | **~$28/month** |

## Additional Resources

- **Render Docs**: https://render.com/docs
- **Medusa Docs**: https://docs.medusajs.com
- **Razorpay Integration**: https://docs.medusajs.com/plugins/payment/razorpay
- **Event Bus Setup**: https://docs.medusajs.com/development/events/overview

## Support

For deployment issues:
1. **Render Support**: https://render.com/support
2. **Medusa Community**: https://discord.gg/medusajs
3. **GitHub Issues**: Create a detailed issue with logs
