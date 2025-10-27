import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// CORS configuration - allow GitHub Pages and local development
const allowedOrigins = [
  'https://godagoo.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/analyze', limiter);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Provider configurations
const PROVIDERS = {
  claude: {
    name: 'Claude (Direct)',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    costPer1M: { input: 3.00, output: 15.00 },
    envKey: 'ANTHROPIC_API_KEY'
  },
  openrouter_claude: {
    name: 'Claude (via OpenRouter)',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'anthropic/claude-sonnet-4',
    costPer1M: { input: 3.00, output: 15.00 },
    envKey: 'OPENROUTER_API_KEY'
  },
  openrouter_gpt4: {
    name: 'GPT-4 Turbo (via OpenRouter)',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'openai/gpt-4-turbo',
    costPer1M: { input: 10.00, output: 30.00 },
    envKey: 'OPENROUTER_API_KEY'
  },
  openrouter_haiku: {
    name: 'Claude Haiku (via OpenRouter)',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'anthropic/claude-3.5-haiku',
    costPer1M: { input: 0.80, output: 4.00 },
    envKey: 'OPENROUTER_API_KEY'
  }
};

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const startTime = Date.now();

  try {
    const { responses, provider = 'claude' } = req.body;

    // Validation
    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Missing or invalid responses object'
      });
    }

    // Get provider configuration
    const providerConfig = PROVIDERS[provider];
    if (!providerConfig) {
      return res.status(400).json({
        error: 'Invalid provider',
        message: `Provider must be one of: ${Object.keys(PROVIDERS).join(', ')}`
      });
    }

    // Check API key
    const apiKey = process.env[providerConfig.envKey];
    if (!apiKey) {
      console.error(`Missing API key for provider: ${provider}`);
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Server is not properly configured. Please contact administrator.'
      });
    }

    console.log(`Processing request with provider: ${provider} (${providerConfig.name})`);

    // Prepare the analysis prompt
    const analysisPrompt = `You are an AI security and implementation consultant. Analyze this business assessment and provide specific, actionable recommendations.

Business Assessment:
${JSON.stringify(responses, null, 2)}

CRITICAL CONTEXT:
- Business Location (business_location): Where the company is BASED/REGISTERED
- Customer Locations (customer_locations): Where their CUSTOMERS are located
- These are DIFFERENT and both matter! Customer locations ADD compliance requirements.
- AI Usage Type (ai_usage_type): Can include both "in_product" and "internal_productivity"

Based on this assessment, provide a comprehensive report with:

1. SECURITY APPROACH RECOMMENDATIONS (tailored by AI usage type)
2. ESTIMATED COSTS (breakdown by use type)
3. IMPLEMENTATION TIMELINE (consider both types if applicable)
4. SPECIFIC VENDOR RECOMMENDATIONS (for each usage type)
5. COMPLIANCE & RISK ASSESSMENT (address cross-border requirements)
6. IMMEDIATE NEXT STEPS
7. RED FLAGS & WARNINGS

Be specific with vendor names, cost ranges, and timelines. Address the split between business location and customer locations explicitly.`;

    let analysisText;
    let inputTokens = 0;
    let outputTokens = 0;

    // Call appropriate API based on provider
    if (provider === 'claude') {
      // Direct Claude API call
      const response = await fetch(providerConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: providerConfig.model,
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: analysisPrompt
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      analysisText = data.content[0].text;
      inputTokens = data.usage?.input_tokens || 0;
      outputTokens = data.usage?.output_tokens || 0;

    } else if (provider.startsWith('openrouter_')) {
      // OpenRouter API call (works for all OpenRouter models)
      const response = await fetch(providerConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.FRONTEND_URL || 'https://godagoo.github.io',
          'X-Title': 'AI Business Assessment Tool'
        },
        body: JSON.stringify({
          model: providerConfig.model,
          messages: [{
            role: 'user',
            content: analysisPrompt
          }],
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      analysisText = data.choices[0].message.content;
      inputTokens = data.usage?.prompt_tokens || 0;
      outputTokens = data.usage?.completion_tokens || 0;
    }

    // Calculate cost estimate
    const inputCost = (inputTokens / 1_000_000) * providerConfig.costPer1M.input;
    const outputCost = (outputTokens / 1_000_000) * providerConfig.costPer1M.output;
    const totalCost = inputCost + outputCost;

    const duration = Date.now() - startTime;

    console.log(`Request completed successfully - Provider: ${provider}, Duration: ${duration}ms, Cost: $${totalCost.toFixed(4)}`);

    res.json({
      success: true,
      analysis: analysisText,
      metadata: {
        provider: providerConfig.name,
        model: providerConfig.model,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens
        },
        cost: {
          input: inputCost,
          output: outputCost,
          total: totalCost,
          currency: 'USD'
        },
        duration: duration,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);

    res.status(500).json({
      error: 'Analysis failed',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    });
  }
});

// Get available providers endpoint
app.get('/api/providers', (req, res) => {
  const providers = Object.entries(PROVIDERS).map(([key, config]) => ({
    id: key,
    name: config.name,
    model: config.model,
    costPer1M: config.costPer1M,
    available: !!process.env[config.envKey]
  }));

  res.json({
    providers,
    default: 'claude'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 AI Assessment Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Server running on port ${PORT}
✓ Environment: ${process.env.NODE_ENV || 'development'}
✓ CORS enabled for: ${allowedOrigins.join(', ')}
✓ Rate limiting: 10 requests per 15 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Available providers:
${Object.entries(PROVIDERS).map(([key, config]) =>
  `  • ${config.name} - ${process.env[config.envKey] ? '✓ Configured' : '✗ Missing API key'}`
).join('\n')}

Endpoints:
  • GET  /health          - Health check
  • GET  /api/providers   - List available AI providers
  • POST /api/analyze     - Analyze business assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
