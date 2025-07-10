# CodeAI Deployment Guide

## Making Your Application Independent

Your CodeAI platform is designed to be portable and can be deployed on various platforms. Here are your options:

## 1. Export and Deploy to Other Platforms

### Railway
- **Database**: Railway provides PostgreSQL databases
- **Deployment**: Connect your GitHub repo, Railway auto-deploys
- **Cost**: Free tier available, then pay-as-you-go
- **Steps**:
  1. Push code to GitHub repository
  2. Connect Railway to your GitHub repo
  3. Add environment variables (DATABASE_URL, OPENAI_API_KEY, etc.)
  4. Railway will automatically deploy

### Vercel + PlanetScale/Neon
- **Frontend**: Deploy on Vercel (free tier)
- **Backend**: Deploy API routes on Vercel
- **Database**: PlanetScale or Neon (both have free tiers)
- **Steps**:
  1. Push to GitHub
  2. Connect Vercel to your repo
  3. Set up database on PlanetScale/Neon
  4. Configure environment variables

### DigitalOcean App Platform
- **Full-stack deployment** with managed databases
- **Cost**: Starting at $5/month
- **Benefits**: Simple deployment, managed infrastructure

### AWS/Google Cloud/Azure
- **Enterprise-grade** deployment
- **Database**: RDS (AWS), Cloud SQL (GCP), or Azure Database
- **Hosting**: EC2, Compute Engine, or App Service
- **More complex** but highly scalable

## 2. Database Migration Options

### Export Current Data
```bash
# Export your current database
pg_dump $DATABASE_URL > codeai_backup.sql

# Import to new database
psql $NEW_DATABASE_URL < codeai_backup.sql
```

### Database Providers
- **Neon**: Serverless PostgreSQL (free tier: 1GB)
- **PlanetScale**: MySQL-compatible (free tier available)
- **Supabase**: PostgreSQL with real-time features
- **Railway**: Built-in PostgreSQL
- **Amazon RDS**: Enterprise PostgreSQL

## 3. Self-Hosted Options

### Docker Deployment
Your app can be containerized:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### VPS Deployment (DigitalOcean Droplet, Linode, etc.)
- **Cost**: $5-20/month
- **Control**: Full server access
- **Setup**: Install Node.js, PostgreSQL, deploy code

## 4. Required Environment Variables

When deploying elsewhere, you'll need:
```
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=your_openai_key
SESSION_SECRET=your_secure_random_string
REPLIT_DOMAINS=your-domain.com
ISSUER_URL=https://replit.com/oidc
```

## 5. Code Export Process

Your application is completely self-contained:
- All source code is in this workspace
- Database schema is defined in `shared/schema.ts`
- No Replit-specific dependencies (except OAuth, which can be replaced)

### To Export:
1. Download all files from this workspace
2. Set up new database with schema (`npm run db:push`)
3. Configure environment variables
4. Deploy to your chosen platform

## 6. Alternative Authentication

If you want to remove Replit dependency:
- Replace Replit OAuth with Google/GitHub OAuth
- Or implement email/password authentication
- Update `server/replitAuth.ts` accordingly

## Recommendations

### For Beginners:
- **Railway**: Simplest deployment, great free tier
- **Vercel + Neon**: Good for learning, generous free tiers

### For Production:
- **DigitalOcean App Platform**: Reliable, good support
- **AWS/GCP**: Enterprise-scale applications

### For Learning/Experimenting:
- **Render**: Simple deployment, free tier
- **Fly.io**: Modern platform, free allowance

## 7. Export Your Application

### Complete Export Process:
1. **Download all files** from this workspace
2. **Database export** (if you have data to transfer):
   ```bash
   pg_dump $DATABASE_URL > codeai_backup.sql
   ```
3. **Environment setup**: Copy your environment variables
4. **Deploy** using any method above

### Files included for deployment:
- `Dockerfile` - For containerized deployment
- `docker-compose.yml` - For local development with database
- `railway.json` - For Railway deployment
- `vercel.json` - For Vercel deployment
- `package-export.json` - Cleaned package.json for production

### Quick Deploy Commands:

**Railway:**
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

**Docker:**
```bash
docker-compose up -d
```

**Vercel:**
```bash
npm install -g vercel
vercel
```

## 8. Making it Completely Independent

### Replace Replit Authentication:
If you want to remove Replit dependency completely:

1. **Google OAuth**: Replace with Google authentication
2. **GitHub OAuth**: Use GitHub for developer-focused users
3. **Email/Password**: Traditional authentication
4. **Auth0**: Professional authentication service

### Alternative Code Execution:
- **Judge0 API**: For secure code execution
- **Sphere Engine**: Advanced code execution service
- **Custom Docker containers**: Self-hosted execution

Your application is designed to be platform-independent and can run anywhere Node.js and PostgreSQL are supported.

Would you like me to help you set up deployment for any specific platform?