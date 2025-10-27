# Project Structure - AI Assessment Tool

## 📁 Directory Layout

```
ai-assessment-tool/
├── backend/                          # Secure backend API proxy
│   ├── server.js                     # Main Express server (API proxy logic)
│   ├── package.json                  # Backend dependencies
│   ├── .env.example                  # Environment variable template
│   ├── .gitignore                    # Prevents committing secrets
│   ├── vercel.json                   # Vercel deployment config
│   ├── railway.json                  # Railway deployment config
│   └── README.md                     # Backend API documentation
│
├── src/                              # React frontend source
│   ├── AIBusinessAssessmentEnhanced.jsx  # Main app component (updated)
│   ├── index.js                      # React entry point
│   └── ...                           # Other React files
│
├── public/                           # Static assets
│   ├── index.html
│   └── ...
│
├── docs/                             # Documentation
│   ├── README.md                     # Main project overview
│   ├── DEPLOYMENT_GUIDE.md           # Step-by-step deployment
│   ├── SECURITY_AUDIT.md             # Security analysis
│   ├── IMPLEMENTATION_SUMMARY.md     # What was built
│   └── PROJECT_STRUCTURE.md          # This file
│
├── .env.example                      # Frontend env template (dev)
├── .env.local.example                # Frontend env template (local)
├── .env.production.example           # Frontend env template (prod)
├── .gitignore                        # Git ignore rules
├── package.json                      # Frontend dependencies
└── README.md                         # Main documentation

```

## 🔑 Key Files Explained

### Backend Files

**`backend/server.js`** (Main Backend)
- Express.js server with API proxy
- Multi-provider support (Claude, OpenRouter)
- Rate limiting (10 req/15min per IP)
- CORS protection
- Request logging
- Input validation
- Security headers (Helmet.js)

**`backend/package.json`**
- Dependencies: express, cors, dotenv, helmet, express-rate-limit
- Scripts: start (production), dev (development with watch)
- Node version: 18+

**`backend/.env.example`**
- Template for environment variables
- Required: ANTHROPIC_API_KEY
- Optional: OPENROUTER_API_KEY, FRONTEND_URL

**`backend/vercel.json`**
- Vercel deployment configuration
- Serverless function setup
- Build configuration

**`backend/railway.json`**
- Railway deployment configuration
- Build and start commands
- Environment setup

**`backend/README.md`**
- Complete API documentation
- Deployment instructions
- Environment variable setup
- Troubleshooting guide

### Frontend Files

**`src/AIBusinessAssessmentEnhanced.jsx`**
- Main React component (1000+ lines)
- No API keys (uses backend proxy)
- Provider selection UI
- Cost display and metrics
- 11-question assessment flow
- Dynamic contextual help

**Changes Made:**
- Removed: `REACT_APP_ANTHROPIC_API_KEY` usage
- Added: `REACT_APP_BACKEND_URL` for proxy
- Added: Provider selection state and UI
- Added: Cost metadata display
- Added: Provider availability detection

**`.env.example`** / **`.env.local.example`** / **`.env.production.example`**
- Templates for different environments
- Only contains: REACT_APP_BACKEND_URL
- NO API KEYS in frontend configuration

### Documentation Files

**`README.md`** (Main)
- Project overview
- Architecture diagram
- Quick start guide
- Deployment instructions (both Vercel & Railway)
- Security features
- Cost optimization
- Troubleshooting
- Complete deployment checklist

**`DEPLOYMENT_GUIDE.md`**
- Step-by-step deployment (30-45 min)
- Part 1: Backend deployment (Vercel or Railway)
- Part 2: Frontend configuration
- Part 3: Frontend deployment to GitHub Pages
- Part 4: Testing and verification
- Common issues and solutions
- Monitoring setup

**`SECURITY_AUDIT.md`**
- Original vulnerability analysis
- Security solution implementation
- Defense-in-depth layers
- Security testing performed
- Compliance considerations
- Incident response plan
- Ongoing maintenance tasks

**`IMPLEMENTATION_SUMMARY.md`**
- What was built and why
- Architecture overview
- Deliverables checklist
- Performance metrics
- Success criteria
- Lessons learned

**`PROJECT_STRUCTURE.md`** (This File)
- Directory layout
- File descriptions
- Configuration overview

## 🔄 Data Flow

### Request Flow (Analysis Generation)

```
1. User fills questionnaire
   └─> 11 questions answered in React state

2. User selects AI provider
   └─> Claude Sonnet, GPT-4, or Claude Haiku

3. Frontend sends request to backend
   ├─> URL: REACT_APP_BACKEND_URL/api/analyze
   ├─> Body: { responses: {...}, provider: "claude" }
   └─> Headers: { Content-Type: application/json }
         (NO API KEYS!)

4. Backend validates request
   ├─> Rate limit check (10 per 15 min)
   ├─> CORS origin validation
   ├─> Input validation (responses object, provider)
   └─> Retrieve API key from environment

5. Backend calls AI provider
   ├─> Claude API or OpenRouter API
   ├─> Server-side API key attached
   └─> Send analysis prompt

6. AI provider responds
   └─> Analysis text + token usage

7. Backend calculates cost
   ├─> Input tokens * provider.costPer1M.input
   ├─> Output tokens * provider.costPer1M.output
   └─> Total cost in USD

8. Backend returns response
   └─> { success: true, analysis: "...", metadata: {...} }

9. Frontend displays report
   ├─> Parse analysis into sections
   ├─> Display cost and token usage
   └─> Show provider information
```

### Provider Selection Flow

```
1. Frontend loads
   └─> useEffect on mount

2. Fetch available providers
   ├─> GET REACT_APP_BACKEND_URL/api/providers
   └─> Returns: { providers: [...], default: "claude" }

3. Filter available providers
   └─> Only show providers with available: true

4. Display provider selection UI
   ├─> Show provider name and model
   ├─> Calculate estimated cost
   └─> Highlight selected provider

5. User selects provider
   └─> State: setSelectedProvider(providerId)

6. Submit analysis request
   └─> Include selected provider in request
```

## ⚙️ Configuration Overview

### Environment Variables

**Backend (Required):**
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx        # Claude API key
```

**Backend (Optional):**
```bash
OPENROUTER_API_KEY=sk-or-xxxxx        # OpenRouter API key (for cheaper models)
FRONTEND_URL=https://godagoo.github.io # For CORS (production frontend)
PORT=3001                              # Server port (default: 3001)
NODE_ENV=production                    # Environment (production/development)
RATE_LIMIT_WINDOW_MS=900000           # Rate limit window (15 minutes)
RATE_LIMIT_MAX_REQUESTS=10            # Max requests per window
```

**Frontend (Required):**
```bash
REACT_APP_BACKEND_URL=https://backend.vercel.app  # Backend API URL
```

### Port Configuration

**Development:**
- Frontend: http://localhost:3000 (React dev server)
- Backend: http://localhost:3001 (Express server)

**Production:**
- Frontend: https://godagoo.github.io/ai-assessment-tool (GitHub Pages)
- Backend: https://your-backend.vercel.app OR https://your-backend.railway.app

## 🚀 Deployment Configuration

### Vercel (Backend)

**File:** `backend/vercel.json`

```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

**Environment Variables (Set in Vercel Dashboard):**
- ANTHROPIC_API_KEY
- OPENROUTER_API_KEY (optional)
- FRONTEND_URL
- NODE_ENV=production

### Railway (Backend)

**File:** `backend/railway.json`

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Environment Variables (Set via Railway CLI):**
```bash
railway variables set ANTHROPIC_API_KEY=sk-ant-xxxxx
railway variables set OPENROUTER_API_KEY=sk-or-xxxxx
railway variables set FRONTEND_URL=https://godagoo.github.io
```

### GitHub Pages (Frontend)

**Configuration:** `package.json`

```json
{
  "homepage": "https://godagoo.github.io/ai-assessment-tool",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

**Environment:** `.env.production.local` (not committed)

```bash
REACT_APP_BACKEND_URL=https://backend.vercel.app
```

## 📊 Dependencies

### Backend Dependencies

**Production:**
- `express` (^4.18.2) - Web framework
- `cors` (^2.8.5) - CORS middleware
- `dotenv` (^16.3.1) - Environment variables
- `express-rate-limit` (^7.1.5) - Rate limiting
- `helmet` (^7.1.0) - Security headers

**Development:**
- None (uses Node built-in --watch for dev mode)

### Frontend Dependencies

**Production:**
- `react` (^19.2.0) - UI framework
- `react-dom` (^19.2.0) - React DOM rendering
- `lucide-react` (^0.548.0) - Icons
- `jspdf` (^3.0.3) - PDF generation (existing)
- `jspdf-autotable` (^5.0.2) - PDF tables (existing)

**Development:**
- `react-scripts` (5.0.1) - Build tooling
- `gh-pages` (^6.3.0) - GitHub Pages deployment

## 🔐 Security Features by File

### `backend/server.js`

**Lines 14-15:** Helmet.js security headers
```javascript
app.use(helmet());  // XSS, clickjacking, etc.
```

**Lines 19-32:** CORS protection
```javascript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

**Lines 27-39:** Rate limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
});
app.use('/api/analyze', limiter);
```

**Lines 79-86:** Input validation
```javascript
if (!responses || typeof responses !== 'object') {
  return res.status(400).json({ error: 'Invalid request' });
}
```

**Lines 41-46:** Request logging
```javascript
app.use((req, res, next) => {
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});
```

### `.gitignore`

**Lines 16-20:** Environment file protection
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## 📈 Monitoring Endpoints

### Health Check
```
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2025-10-27T...",
  "uptime": 123.45
}
```

### Provider Discovery
```
GET /api/providers

Response:
{
  "providers": [
    {
      "id": "claude",
      "name": "Claude (Direct)",
      "model": "claude-sonnet-4-20250514",
      "costPer1M": { "input": 3.00, "output": 15.00 },
      "available": true
    },
    ...
  ],
  "default": "claude"
}
```

### Analysis Endpoint
```
POST /api/analyze
Content-Type: application/json

Request:
{
  "responses": { ... },
  "provider": "claude"
}

Response:
{
  "success": true,
  "analysis": "...",
  "metadata": {
    "provider": "Claude (Direct)",
    "model": "claude-sonnet-4-20250514",
    "tokens": { "input": 1523, "output": 2847, "total": 4370 },
    "cost": { "input": 0.0046, "output": 0.0427, "total": 0.0473 },
    "duration": 8543,
    "timestamp": "2025-10-27T..."
  }
}
```

## 🎯 File Purposes Summary

| File | Purpose | Contains Secrets? |
|------|---------|------------------|
| `backend/server.js` | API proxy logic | ❌ No (reads from env) |
| `backend/package.json` | Backend deps | ❌ No |
| `backend/.env` | Backend secrets | ✅ YES (gitignored) |
| `backend/.env.example` | Backend template | ❌ No |
| `src/AIBusinessAssessmentEnhanced.jsx` | React app | ❌ No |
| `.env.production.local` | Frontend config | ❌ No (just backend URL) |
| `README.md` | Main docs | ❌ No |
| `DEPLOYMENT_GUIDE.md` | Deployment steps | ❌ No |
| `SECURITY_AUDIT.md` | Security analysis | ❌ No |

## ✅ Verification Checklist

Use this to verify your project structure:

```bash
# Backend files exist
[ -f backend/server.js ] && echo "✅ Backend server"
[ -f backend/package.json ] && echo "✅ Backend package.json"
[ -f backend/.env.example ] && echo "✅ Backend env template"
[ -f backend/vercel.json ] && echo "✅ Vercel config"
[ -f backend/railway.json ] && echo "✅ Railway config"

# Frontend files exist
[ -f src/AIBusinessAssessmentEnhanced.jsx ] && echo "✅ Frontend component"
[ -f .env.example ] && echo "✅ Frontend env template"
[ -f .env.production.example ] && echo "✅ Production env template"

# Documentation exists
[ -f README.md ] && echo "✅ Main README"
[ -f DEPLOYMENT_GUIDE.md ] && echo "✅ Deployment guide"
[ -f SECURITY_AUDIT.md ] && echo "✅ Security audit"
[ -f IMPLEMENTATION_SUMMARY.md ] && echo "✅ Implementation summary"

# Security checks
grep -q ".env" .gitignore && echo "✅ .env files gitignored"
! grep -r "sk-ant" src/ && echo "✅ No API keys in frontend"
```

## 📞 Quick Reference

**Start local development:**
```bash
# Terminal 1 (Backend)
cd backend && npm install && npm start

# Terminal 2 (Frontend)
npm install && npm start
```

**Deploy to production:**
```bash
# Backend (Vercel)
cd backend && vercel

# Frontend (GitHub Pages)
npm run deploy
```

**Check logs:**
```bash
# Vercel
vercel logs

# Railway
railway logs
```

---

**Last Updated:** October 27, 2025
**Project Version:** 2.0.0
