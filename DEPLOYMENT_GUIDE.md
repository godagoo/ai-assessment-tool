# AI Assessment Tool - Complete Deployment Guide

This guide walks you through deploying both the backend and frontend from scratch.

## 📋 Prerequisites

- Node.js 18+ installed
- GitHub account (for GitHub Pages)
- Claude API key from https://console.anthropic.com/
- (Optional) OpenRouter API key from https://openrouter.ai/keys
- Git installed and configured

## 🎯 Deployment Overview

**Total Time:** ~30-45 minutes

1. **Backend Setup** (15-20 min) - Deploy secure API proxy to Vercel or Railway
2. **Frontend Configuration** (5 min) - Update frontend to use backend
3. **Frontend Deployment** (10 min) - Deploy to GitHub Pages
4. **Testing** (5-10 min) - Verify everything works

---

## Part 1: Backend Deployment

### Option A: Deploy to Vercel (Recommended)

**Why Vercel?**
- Free tier includes 100GB bandwidth
- Automatic HTTPS
- Easy environment variable management
- Zero configuration deployment

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Navigate to Backend

```bash
cd backend
npm install
```

#### Step 3: Deploy to Vercel

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** (Select your account)
- **Link to existing project?** N
- **Project name?** ai-assessment-backend (or your choice)
- **Directory?** ./ (just press enter)
- **Override settings?** N

Vercel will deploy and give you a URL like: `https://ai-assessment-backend.vercel.app`

**Save this URL - you'll need it for the frontend!**

#### Step 4: Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project (ai-assessment-backend)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx` | Required - Get from https://console.anthropic.com/ |
| `OPENROUTER_API_KEY` | `sk-or-xxxxx` | Optional - Get from https://openrouter.ai/keys |
| `FRONTEND_URL` | `https://godagoo.github.io` | Replace with your GitHub Pages URL |
| `NODE_ENV` | `production` | Recommended |

5. Click **Save**
6. Go to **Deployments** tab and click **Redeploy** to apply variables

#### Step 5: Test Backend

```bash
curl https://your-backend.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-27T...",
  "uptime": 123.45
}
```

Check available providers:
```bash
curl https://your-backend.vercel.app/api/providers
```

You should see a list of AI providers with "available: true" if keys are configured.

---

### Option B: Deploy to Railway

**Why Railway?**
- Simple deployment process
- Good free tier
- Persistent storage option
- PostgreSQL if needed later

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

#### Step 2: Login to Railway

```bash
railway login
```

This opens a browser for authentication.

#### Step 3: Initialize Project

```bash
cd backend
npm install
railway init
```

Follow prompts:
- **Project name?** ai-assessment-backend
- **Environment?** production

#### Step 4: Deploy

```bash
railway up
```

Railway will build and deploy. Get your URL:

```bash
railway domain
```

This gives you a URL like: `https://ai-assessment-backend.railway.app`

**Save this URL for the frontend!**

#### Step 5: Add Environment Variables

```bash
railway variables set ANTHROPIC_API_KEY=sk-ant-xxxxx
railway variables set OPENROUTER_API_KEY=sk-or-xxxxx
railway variables set FRONTEND_URL=https://godagoo.github.io
railway variables set NODE_ENV=production
```

Replace values with your actual keys and frontend URL.

#### Step 6: Test Backend

```bash
curl https://your-backend.railway.app/health
```

---

## Part 2: Frontend Configuration

Now that your backend is deployed, configure the frontend to use it.

### Step 1: Create Production Environment File

```bash
cd ..  # Go back to root directory
cp .env.production.example .env.production.local
```

### Step 2: Edit .env.production.local

Open `.env.production.local` and update with your backend URL:

```bash
# For Vercel backend:
REACT_APP_BACKEND_URL=https://ai-assessment-backend.vercel.app

# Or for Railway backend:
# REACT_APP_BACKEND_URL=https://ai-assessment-backend.railway.app
```

**IMPORTANT:** No trailing slash!

### Step 3: Verify .gitignore

Ensure `.env.production.local` is in `.gitignore`:

```bash
grep ".env.production.local" .gitignore
```

If not listed, add it:

```bash
echo ".env.production.local" >> .gitignore
```

---

## Part 3: Frontend Deployment to GitHub Pages

### Step 1: Update package.json

Ensure `homepage` field in `package.json` matches your GitHub Pages URL:

```json
{
  "homepage": "https://your-username.github.io/ai-assessment-tool"
}
```

Replace `your-username` with your GitHub username.

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build and Deploy

```bash
npm run build
npm run deploy
```

This:
1. Builds the production bundle with your backend URL
2. Pushes to `gh-pages` branch
3. GitHub Pages automatically deploys

### Step 4: Enable GitHub Pages

1. Go to your repo on GitHub: `https://github.com/your-username/ai-assessment-tool`
2. Click **Settings** → **Pages**
3. Under **Source**, ensure `gh-pages` branch is selected
4. Click **Save**

Wait 1-2 minutes for deployment to complete.

---

## Part 4: Testing & Verification

### Backend Tests

**1. Health Check:**
```bash
curl https://your-backend.vercel.app/health
```

Expected: `{"status":"healthy",...}`

**2. Providers Check:**
```bash
curl https://your-backend.vercel.app/api/providers
```

Expected: List of providers with `available: true` for configured keys

**3. Analysis Test:**
```bash
curl -X POST https://your-backend.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {
      "company_stage": "startup_seed",
      "industry": ["saas"],
      "business_location": "us",
      "customer_locations": ["us"],
      "ai_usage_type": ["internal_productivity"],
      "use_cases": ["content"],
      "data_sensitivity": ["internal"],
      "compliance": ["none"],
      "technical_capability": "small_it",
      "budget": "10k_50k",
      "timeline": "fast"
    },
    "provider": "claude"
  }'
```

Expected: Analysis response with `success: true`

### Frontend Tests

**1. Visit Your Site:**
```
https://your-username.github.io/ai-assessment-tool
```

**2. Complete the Questionnaire:**
- Answer all 11 questions
- On the last step, verify provider selection UI appears
- Click "Generate My Report"

**3. Check Browser Console:**
- Press F12 to open DevTools
- Look for any errors (especially CORS errors)
- Should see successful backend requests

**4. Verify Report:**
- Report should load with analysis
- Cost & Performance section should show provider, cost, tokens
- All sections should be populated

---

## 🔥 Common Issues & Solutions

### Backend Issues

**Issue:** "Missing API key" error in backend logs

**Solution:**
- Verify environment variables in Vercel/Railway dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables (Vercel) or restart (Railway)

---

**Issue:** Backend returns 500 error

**Solution:**
1. Check logs:
   - Vercel: `vercel logs`
   - Railway: `railway logs`
2. Look for specific error message
3. Common causes:
   - Invalid API key format
   - API key has no credits
   - Rate limit exceeded on AI provider

---

**Issue:** CORS error in browser

**Solution:**
- Update `FRONTEND_URL` in backend environment variables
- Must match EXACTLY: `https://godagoo.github.io` (no trailing slash)
- Redeploy backend after changing
- Clear browser cache

---

### Frontend Issues

**Issue:** "Backend server not responding"

**Solution:**
1. Verify backend is running: `curl https://your-backend.vercel.app/health`
2. Check `.env.production.local` has correct backend URL
3. Rebuild and redeploy frontend: `npm run build && npm run deploy`
4. Clear browser cache (Ctrl+Shift+R)

---

**Issue:** No providers showing in dropdown

**Solution:**
- Backend API keys not configured
- Check `/api/providers` endpoint returns providers with `available: true`
- Add missing API keys to backend environment
- Redeploy backend

---

**Issue:** GitHub Pages shows old version

**Solution:**
1. Wait 2-3 minutes after deployment
2. Clear browser cache (Ctrl+Shift+R)
3. Check GitHub Actions tab for deployment status
4. Verify `gh-pages` branch was updated (check commit timestamp)

---

## 🔐 Security Checklist

After deployment, verify security:

- [ ] **No API keys in frontend code** - Search GitHub repo for "sk-ant" or "sk-or"
- [ ] **Backend rate limiting working** - Try 11 rapid requests, should get 429 error
- [ ] **CORS protection active** - Try accessing from unauthorized domain, should fail
- [ ] **Environment files not committed** - Check `.gitignore` includes `.env*`
- [ ] **HTTPS everywhere** - All URLs use `https://`
- [ ] **Request logging enabled** - Backend logs show incoming requests

---

## 📊 Monitoring Setup

### Vercel Monitoring

1. Go to Vercel Dashboard → Your Project
2. Click **Analytics** to see:
   - Request volume
   - Response times
   - Error rates
   - Geographic distribution

3. Click **Logs** to see:
   - Real-time request logs
   - Error messages
   - API usage

### Railway Monitoring

1. Railway Dashboard → Your Project
2. **Metrics** tab shows:
   - CPU usage
   - Memory usage
   - Network traffic

3. **Logs** tab shows:
   - Real-time application logs
   - Request/response logs
   - Errors

### AI Provider Monitoring

**Claude (Anthropic):**
1. Go to https://console.anthropic.com/
2. **Usage** tab shows:
   - Token consumption
   - Cost per day
   - Request volume

**OpenRouter:**
1. Go to https://openrouter.ai/activity
2. See:
   - Request history
   - Cost breakdown
   - Model usage

---

## 💰 Cost Estimates

### Free Tier Limits

**Vercel:**
- 100GB bandwidth/month
- 100GB-hours serverless function execution
- Unlimited projects
- **Good for:** ~10,000-50,000 analyses/month

**Railway:**
- $5 free credit/month
- 500 hours execution
- 100GB bandwidth
- **Good for:** ~2,000-10,000 analyses/month

**GitHub Pages:**
- 100GB bandwidth/month
- Unlimited static hosting
- **Good for:** Frontend hosting (very light bandwidth usage)

### AI Provider Costs

Per 1,000 analyses (assuming 4,000 tokens per analysis):

| Provider | Cost Range |
|----------|-----------|
| Claude Sonnet Direct | $40-60 |
| OpenRouter GPT-4 | $120-180 |
| OpenRouter Claude Haiku | $10-15 |

**Recommendation:** Use Claude Haiku for 75% cost savings.

---

## 🚀 Going Live Checklist

Before announcing your tool:

- [ ] Backend deployed and tested
- [ ] Frontend deployed and tested
- [ ] Complete test analysis generated successfully
- [ ] All provider options working
- [ ] Cost display showing accurate information
- [ ] Rate limiting tested (11 requests should trigger limit)
- [ ] CORS protection verified
- [ ] Logs monitoring setup
- [ ] Cost alerts configured on AI provider dashboards
- [ ] Custom domain configured (optional)
- [ ] Analytics tracking added (optional - Google Analytics, Plausible)
- [ ] README updated with live URLs
- [ ] GitHub repo description updated

---

## 📞 Support & Resources

### Documentation
- Backend API: `backend/README.md`
- Main README: `README.md`
- This guide: `DEPLOYMENT_GUIDE.md`

### External Resources
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app/
- Claude API Docs: https://docs.anthropic.com/
- OpenRouter Docs: https://openrouter.ai/docs

### Common Commands Reference

**Backend (Vercel):**
```bash
vercel                    # Deploy
vercel logs              # View logs
vercel env ls            # List environment variables
vercel env add          # Add environment variable
```

**Backend (Railway):**
```bash
railway up               # Deploy
railway logs            # View logs
railway variables       # List variables
railway variables set   # Add variable
```

**Frontend:**
```bash
npm run build           # Build production bundle
npm run deploy          # Deploy to GitHub Pages
npm start              # Local development
```

---

## ✅ Success!

If you've completed all steps:

1. Your backend is securely proxying AI requests with rate limiting
2. Your frontend is deployed to GitHub Pages with zero API key exposure
3. Users can select cost-effective AI providers
4. You have monitoring and logging setup

**Next Steps:**
- Monitor usage for first week
- Adjust rate limits if needed
- Consider adding analytics
- Collect user feedback
- Plan feature improvements

**Share your deployment:**
- Tweet about it with screenshots
- Post on Reddit r/webdev or r/SideProject
- Share in relevant Discord communities
- Add to Product Hunt

Congratulations on building and deploying a secure AI assessment tool!
