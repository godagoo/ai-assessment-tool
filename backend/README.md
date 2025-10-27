# AI Assessment Tool - Backend Server

Secure backend proxy for the AI Business Assessment Tool. Protects API keys from browser exposure and provides multi-provider AI support.

## 🔐 Security Features

- **Zero API key exposure** - All API keys stay server-side
- **Rate limiting** - 10 requests per 15 minutes per IP
- **CORS protection** - Only allows configured frontend domains
- **Helmet.js** - Security headers and protection
- **Request logging** - Monitor usage and detect abuse

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Start the server:**
   ```bash
   npm start
   # Or with auto-reload:
   npm run dev
   ```

4. **Test the server:**
   ```bash
   curl http://localhost:3001/health
   ```

### Environment Variables

Required:
- `ANTHROPIC_API_KEY` - Your Claude API key (get from https://console.anthropic.com/)

Optional (for cost savings):
- `OPENROUTER_API_KEY` - OpenRouter API key for cheaper models (get from https://openrouter.ai/)
- `FRONTEND_URL` - Your frontend URL for CORS (default: https://godagoo.github.io)
- `PORT` - Server port (default: 3001)

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

Returns server status and uptime.

### Get Available Providers
```bash
GET /api/providers
```

Returns list of configured AI providers and their costs.

### Analyze Business Assessment
```bash
POST /api/analyze
Content-Type: application/json

{
  "responses": {
    "company_stage": "startup_seed",
    "industry": ["saas", "healthcare"],
    "data_sensitivity": ["pii", "phi"],
    ...
  },
  "provider": "claude"  // or "openrouter_claude", "openrouter_gpt4", "openrouter_haiku"
}
```

Returns:
```json
{
  "success": true,
  "analysis": "...",
  "metadata": {
    "provider": "Claude (Direct)",
    "model": "claude-sonnet-4-20250514",
    "tokens": { "input": 1523, "output": 2847, "total": 4370 },
    "cost": { "input": 0.0046, "output": 0.0427, "total": 0.0473, "currency": "USD" },
    "duration": 8543,
    "timestamp": "2025-10-27T..."
  }
}
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd backend
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add `ANTHROPIC_API_KEY` and optionally `OPENROUTER_API_KEY`
   - Add `FRONTEND_URL` (your GitHub Pages URL)

4. **Get your backend URL:**
   - Copy the production URL (e.g., `https://ai-assessment-backend.vercel.app`)
   - Use this in your frontend configuration

### Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Set environment variables:**
   ```bash
   railway variables set ANTHROPIC_API_KEY=sk-ant-xxxxx
   railway variables set OPENROUTER_API_KEY=sk-or-xxxxx
   railway variables set FRONTEND_URL=https://godagoo.github.io
   ```

4. **Get your backend URL:**
   - Check Railway dashboard for your service URL
   - Use this in your frontend configuration

## 💰 Cost Optimization

The backend supports multiple AI providers with different pricing:

### Direct Claude API
- **Model:** claude-sonnet-4-20250514
- **Cost:** $3/M input tokens, $15/M output tokens
- **Best for:** Highest quality analysis

### OpenRouter - Claude
- **Model:** anthropic/claude-sonnet-4
- **Cost:** Same as direct ($3/$15)
- **Best for:** Easier billing management

### OpenRouter - GPT-4 Turbo
- **Model:** openai/gpt-4-turbo
- **Cost:** $10/M input, $30/M output
- **Best for:** Alternative to Claude

### OpenRouter - Claude Haiku (Cheapest)
- **Model:** anthropic/claude-3.5-haiku
- **Cost:** $0.80/M input, $4/M output tokens
- **Best for:** Cost-conscious users (75% cheaper)

**Typical request costs:**
- Claude Sonnet: ~$0.05-0.10 per analysis
- Claude Haiku: ~$0.01-0.02 per analysis (75% savings)

## 🔧 Monitoring & Maintenance

### View Logs
```bash
# Vercel
vercel logs

# Railway
railway logs
```

### Monitor Usage
Check your logs for:
- Request frequency
- Response times
- Error rates
- Cost per request

### Rate Limiting
Default: 10 requests per 15 minutes per IP

Adjust in `.env`:
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

## 🛡️ Security Best Practices

1. **Never commit `.env` files** - Always use `.env.example` as template
2. **Rotate API keys regularly** - Change keys every 3-6 months
3. **Monitor rate limits** - Adjust if you see legitimate users blocked
4. **Check logs weekly** - Look for suspicious activity
5. **Use environment secrets** - Store keys in Vercel/Railway secrets, not code

## 📊 Architecture

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

## 🐛 Troubleshooting

### Error: "Missing API key"
- Check `.env` file has correct keys
- For Vercel/Railway, check environment variables in dashboard

### Error: "Not allowed by CORS"
- Update `FRONTEND_URL` in environment variables
- Ensure frontend URL matches exactly (including https://)

### Error: "Too many requests"
- Wait 15 minutes for rate limit reset
- Or increase rate limits in environment variables

### Error: "API error: 401"
- API key is invalid or expired
- Check key has correct format and is active

## 📝 License

MIT
