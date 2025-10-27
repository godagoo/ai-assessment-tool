# AI Business Assessment Tool

Professional AI implementation assessment tool with secure backend proxy and multi-provider support.

## 🌐 Live Demo

**https://godagoo.github.io/ai-assessment-tool/**

## ✨ Features

- **Secure Architecture** - Zero API key exposure in frontend
- **Multi-provider Support** - Claude, OpenRouter (GPT-4, Claude Haiku)
- **Cost Optimization** - Choose providers based on budget (75% savings with Haiku)
- **Professional Reports** - McKinsey-style implementation recommendations
- **Comprehensive Analysis** - Security, compliance, costs, timelines, vendors
- **Interactive Questionnaire** - 11 questions with contextual help
- **Real-time Cost Display** - See actual analysis costs and token usage
- **Responsive Design** - Mobile-ready interface

## 🏗️ Architecture

```
Frontend (GitHub Pages)          Backend (Vercel/Railway)
┌─────────────────────┐         ┌──────────────────────┐
│  React App          │         │  Express Server      │
│  ├─ No API keys     │◄────────┤  ├─ Rate limiting    │
│  ├─ Provider select │  HTTPS  │  ├─ CORS protection  │
│  └─ Cost display    │         │  ├─ API key storage  │
└─────────────────────┘         │  └─ Multi-provider   │
                                └──────────────────────┘
                                          │
                                          ▼
                                ┌──────────────────────┐
                                │  AI Providers        │
                                │  ├─ Claude API       │
                                │  └─ OpenRouter API   │
                                └──────────────────────┘
```

## 🚀 Quick Start

### 1. Deploy Backend First

See detailed instructions in `backend/README.md`

**Option A: Vercel (Recommended)**
```bash
cd backend
npm install
vercel
# Follow prompts, then add environment variables in dashboard
```

**Option B: Railway**
```bash
cd backend
npm install
railway login
railway init
railway up
# Add environment variables
railway variables set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Required environment variables for backend:
- `ANTHROPIC_API_KEY` - Your Claude API key (required)
- `OPENROUTER_API_KEY` - OpenRouter API key (optional, for cost savings)
- `FRONTEND_URL` - Your GitHub Pages URL (for CORS)

### 2. Configure Frontend

1. Copy environment template:
```bash
cp .env.production.example .env.production.local
```

2. Update with your backend URL:
```bash
REACT_APP_BACKEND_URL=https://your-backend.vercel.app
```

### 3. Deploy Frontend to GitHub Pages

```bash
npm install
npm run build
npm run deploy
```

### 4. Local Development

**Terminal 1 - Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and add API keys
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cp .env.local.example .env.local
npm install
npm start
```

Visit http://localhost:3000

## 🔐 Security Features

### Why This Architecture?

**Problem:** Original implementation exposed API keys in the browser bundle, allowing anyone to extract and abuse them.

**Solution:**
1. **Backend Proxy** - API keys stored server-side only
2. **Rate Limiting** - 10 requests per 15 minutes per IP
3. **CORS Protection** - Only configured frontend domains allowed
4. **Request Logging** - Monitor usage and detect abuse
5. **Environment Secrets** - Keys managed via Vercel/Railway dashboards

### Security Best Practices

- Never commit `.env` files with real API keys
- Rotate API keys every 3-6 months
- Monitor backend logs weekly for suspicious activity
- Use separate API keys for development and production
- Keep backend dependencies updated

## 💰 Cost Optimization

The tool supports multiple AI providers with different pricing:

| Provider | Model | Cost (per 1M tokens) | Typical Analysis |
|----------|-------|---------------------|------------------|
| Claude Direct | claude-sonnet-4 | $3 input / $15 output | ~$0.05-0.10 |
| OpenRouter Claude | claude-sonnet-4 | $3 / $15 | ~$0.05-0.10 |
| OpenRouter GPT-4 | gpt-4-turbo | $10 / $30 | ~$0.15-0.30 |
| OpenRouter Haiku | claude-3.5-haiku | $0.80 / $4 | ~$0.01-0.02 |

**Recommendation:** Use Claude Haiku via OpenRouter for 75% cost savings with equivalent quality.

## 🎨 Customization

**Frontend (`src/AIBusinessAssessmentEnhanced.jsx`):**
- Modify questionnaire questions
- Adjust color scheme (Tailwind classes)
- Customize report formatting
- Add/remove provider options

**Backend (`backend/server.js`):**
- Adjust rate limits (`RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS`)
- Add new AI providers (add to `PROVIDERS` object)
- Modify CORS allowed origins
- Customize logging format

## 📦 Tech Stack

**Frontend:**
- React 19.2.0
- lucide-react (icons)
- Tailwind CSS (styling)

**Backend:**
- Express.js 4.18.2
- helmet (security headers)
- cors (cross-origin protection)
- express-rate-limit (rate limiting)
- dotenv (environment variables)

## 🐛 Troubleshooting

### Frontend Issues

**Error: "Backend server not responding"**
- Check backend is deployed and running
- Verify `REACT_APP_BACKEND_URL` in `.env.production.local`
- Check browser console for CORS errors

**Error: "No providers available"**
- Backend API keys not configured
- Check Vercel/Railway environment variables
- Verify backend `/api/providers` endpoint returns data

### Backend Issues

**Error: "Missing API key"**
- Check environment variables in deployment dashboard
- Ensure key names match exactly (case-sensitive)
- Restart backend after adding variables

**Error: "Too many requests"**
- Rate limit reached (10 requests per 15 minutes)
- Wait for reset or increase limits in backend `.env`

**Error: "CORS error"**
- Frontend URL not in allowed origins
- Update `FRONTEND_URL` environment variable
- Ensure URL matches exactly (including https://)

See `backend/README.md` for detailed backend troubleshooting.

## 📊 Monitoring

### View Logs

**Vercel:**
```bash
vercel logs
```

**Railway:**
```bash
railway logs
```

### Key Metrics to Monitor

- Request frequency (should be < 10 per 15 min per user)
- Error rates (should be < 5%)
- Response times (should be < 10 seconds)
- Cost per request (varies by provider)

## 🚢 Deployment Checklist

### Backend Deployment
- [ ] Backend deployed to Vercel or Railway
- [ ] `ANTHROPIC_API_KEY` added to environment
- [ ] `OPENROUTER_API_KEY` added (optional)
- [ ] `FRONTEND_URL` configured for CORS
- [ ] Health check endpoint working (`/health`)
- [ ] Providers endpoint returning available providers (`/api/providers`)

### Frontend Deployment
- [ ] `.env.production.local` created with backend URL
- [ ] `REACT_APP_BACKEND_URL` points to deployed backend
- [ ] Build succeeds (`npm run build`)
- [ ] Deployed to GitHub Pages (`npm run deploy`)
- [ ] Test analysis generation on live site
- [ ] Verify cost display shows correct provider info

## 📝 API Documentation

See `backend/README.md` for complete API documentation.

**Quick Reference:**
- `GET /health` - Health check
- `GET /api/providers` - List available providers
- `POST /api/analyze` - Generate analysis report

## 📄 License

MIT License

## 🙏 Acknowledgments

- Anthropic Claude for AI analysis
- OpenRouter for multi-provider access
- Vercel/Railway for backend hosting
- GitHub Pages for frontend hosting

---

Made with security in mind
