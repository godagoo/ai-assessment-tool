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
    const analysisPrompt = `You are a senior AI security and implementation consultant creating a professional enterprise strategy report. Analyze this business assessment and provide a comprehensive, well-formatted report.

Business Assessment:
${JSON.stringify(responses, null, 2)}

CRITICAL CONTEXT:
- Business Location (business_location): Where the company is BASED/REGISTERED
- Customer Locations (customer_locations): Where their CUSTOMERS are located
- These are DIFFERENT and both matter! Customer locations ADD compliance requirements.
- AI Usage Type (ai_usage_type): Can include both "in_product" and "internal_productivity"

FORMAT YOUR REPORT AS A PROFESSIONAL ENTERPRISE STRATEGY DOCUMENT:

# AI IMPLEMENTATION STRATEGY
## Enterprise Deployment Roadmap

**CONFIDENTIAL**
Prepared for: [Client/Business Name based on responses]
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

---

## EXECUTIVE SUMMARY

### Bottom Line Up Front
Provide a 2-3 paragraph summary with:
- Recommended strategic approach (dual-track, cloud-only, hybrid, etc.)
- Total investment required (Year 1 and ongoing)
- Payback period estimate
- Key compliance coverage
- Critical success factors (3-5 bullet points)

---

## 1. STRATEGIC RECOMMENDATIONS

### 1.1 [Primary Recommendation Title Based on Use Case]

Provide context-specific recommendations. Use ASCII diagrams where helpful:

**Example Architecture Diagram** (use similar format):
\`\`\`
┌─────────────────┐
│  Customer Data  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   AI Gateway    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Services    │
└─────────────────┘
\`\`\`

**Investment Model Table** (use HTML tables):

<table>
<tr><th>Cost Component</th><th>Year 1</th><th>Ongoing Annual</th><th>Notes</th></tr>
<tr><td>AI Services</td><td>$XX,000</td><td>$XX,000</td><td>Usage-based</td></tr>
<tr><td>Infrastructure</td><td>$XX,000</td><td>$XX,000</td><td>Cloud/gateway</td></tr>
<tr><td>Compliance</td><td>$XX,000</td><td>$XX,000</td><td>Audits, legal</td></tr>
<tr><td><strong>Total</strong></td><td><strong>$XX,000</strong></td><td><strong>$XX,000</strong></td><td></td></tr>
</table>

### 1.2 [Secondary Recommendations if applicable]

Continue with detailed sections...

---

## 2. COMPLIANCE & REGULATORY FRAMEWORK

### 2.1 Multi-Jurisdictional Requirements

**Compliance Matrix:**

<table>
<tr><th>Your Status</th><th>Customer Location</th><th>Applicable Regulations</th><th>Key Requirements</th></tr>
<tr><td>[Location]</td><td>[Regions]</td><td>[Laws]</td><td>[Requirements]</td></tr>
</table>

### 2.2 Risk Assessment

**Risk Matrix:**

<table>
<tr><th>Risk Category</th><th>Impact</th><th>Probability</th><th>Mitigation Strategy</th></tr>
<tr><td>Data Breach</td><td>High/Med/Low</td><td>%</td><td>Specific actions</td></tr>
</table>

---

## 3. IMPLEMENTATION ROADMAP

### 3.1 Phased Deployment Strategy

**Timeline Visualization:**

\`\`\`
Month 1-2: FOUNDATION
├─ Week 1-2: Initial setup
├─ Week 3-4: Configuration
└─ Week 5-8: Testing
   Expected ROI: XX%

Month 3-4: DEPLOYMENT
├─ Week 1-2: Pilot launch
└─ Week 3-4: Full rollout
\`\`\`

### 3.2 Immediate Action Plan

**This Week/Month breakdown with specific tasks**

---

## 4. VENDOR RECOMMENDATIONS

**Recommended Vendor Configuration:**

<table>
<tr><th>Layer</th><th>Primary Recommendation</th><th>Alternative</th><th>Rationale</th></tr>
<tr><td>AI Provider</td><td>[Vendor + Region]</td><td>[Alternative]</td><td>[Why]</td></tr>
<tr><td>Security Layer</td><td>[Tool]</td><td>[Alt]</td><td>[Reason]</td></tr>
</table>

---

## 5. FINANCIAL ANALYSIS

### 5.1 Total Cost of Ownership (3-Year Projection)

<table>
<tr><th>Cost Category</th><th>Year 1</th><th>Year 2</th><th>Year 3</th><th>3-Year Total</th></tr>
<tr><td>AI Services</td><td>$XX,000</td><td>$XX,000</td><td>$XX,000</td><td>$XX,000</td></tr>
<tr><td>Infrastructure</td><td>$XX,000</td><td>$XX,000</td><td>$XX,000</td><td>$XX,000</td></tr>
<tr><td><strong>Total</strong></td><td><strong>$XX,000</strong></td><td><strong>$XX,000</strong></td><td><strong>$XX,000</strong></td><td><strong>$XX,000</strong></td></tr>
</table>

### 5.2 Return on Investment

**ROI Analysis:**
- Break-even timeline
- Productivity gains
- Cost avoidance
- Value drivers

---

## 6. RISK MITIGATION

### 6.1 Critical Success Factors

<table>
<tr><th>Risk</th><th>Impact</th><th>Probability</th><th>Mitigation Strategy</th></tr>
</table>

### 6.2 Common Pitfalls to Avoid

List critical mistakes with specific solutions

---

## 7. CONCLUSION

### Bottom Line
Restate key recommendations and next actions.

**Recommended Next Action:**
Specific immediate next step with budget/timeline.

---

## DISCLAIMER

**IMPORTANT: This report is provided for informational and inspirational purposes only.**

This AI implementation strategy report is a general assessment based on the information provided and should NOT be considered:
- Legal advice or a substitute for consultation with qualified legal counsel
- Professional cybersecurity guidance or a replacement for security audits by certified professionals
- Compliance certification or guarantee of regulatory adherence
- Financial advice or a substitute for consultation with financial advisors
- A comprehensive risk assessment

**You should consult with qualified professionals before making implementation decisions:**
- **Legal Counsel**: For compliance with GDPR, HIPAA, CCPA, and other regulations
- **Cybersecurity Experts**: For security architecture and risk assessment
- **Compliance Specialists**: For industry-specific regulatory requirements
- **Financial Advisors**: For budget planning and ROI analysis

The strategies, costs, and timelines presented are estimates based on typical scenarios and may vary significantly based on your specific circumstances. Actual implementation should only proceed after thorough professional review and approval.

**No warranty or guarantee is provided regarding the accuracy, completeness, or suitability of this report for your specific situation.**

---

*Report generated on ${new Date().toISOString().split('T')[0]}*

---

INSTRUCTIONS FOR GENERATING THIS REPORT:
1. Use the EXACT structure above
2. Fill in all sections with specific, actionable recommendations based on the assessment data
3. Use HTML tables for all tabular data (they render properly)
4. Use ASCII diagrams for architecture/flow visualizations
5. Include specific vendor names, cost ranges ($XX,000 format), and timelines
6. Address the business location vs customer location distinction explicitly
7. Make tables with realistic numbers based on the user's profile
8. Keep disclaimers prominent and clear
9. Be specific about risks for their industry/compliance requirements
10. Provide immediate actionable next steps

Generate a complete, professional report following this structure exactly.`;

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
