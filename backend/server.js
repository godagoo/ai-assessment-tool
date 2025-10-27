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

FORMAT YOUR REPORT EXACTLY AS SHOWN BELOW. USE PROPER MARKDOWN TABLES (with | symbols) FOR ALL TABLES.

# AI IMPLEMENTATION STRATEGY
## Enterprise Deployment Roadmap

**CONFIDENTIAL**
Prepared for: [Client Name based on responses]
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

---

## EXECUTIVE SUMMARY

### Bottom Line Up Front

Deploy a comprehensive AI strategy based on your business profile. This approach delivers [specific benefits] while maintaining regulatory compliance.

**Key Findings:**
- **Total Year 1 Investment:** $XX,000–XX,000
- **Ongoing Annual Costs:** $XX,000–XX,000
- **Payback Period:** X–X months through productivity gains
- **Compliance Coverage:** [List relevant regulations]

**Critical Success Factors:**
1. [Factor 1]
2. [Factor 2]
3. [Factor 3]
4. [Factor 4]

---

## 1. STRATEGIC RECOMMENDATIONS

### 1.1 [Recommendation Title Based on Customer Profile]

[Provide context-specific strategic guidance]

**Exhibit 1: [Architecture/Strategy Name]**

\`\`\`
┌─────────────────┐
│  [Component 1]  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  [Component 2]  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  [Component 3]  │
└─────────────────┘
\`\`\`

**Core Components:**
- **[Component 1]:** [Description]
- **[Component 2]:** [Description]
- **[Component 3]:** [Description]

**Exhibit 2: Investment Model**

| Cost Component | Year 1 | Ongoing Annual | Notes |
|----------------|--------|----------------|-------|
| [Component] | $XX,000 | $XX,000 | [Details] |
| [Component] | $XX,000 | $XX,000 | [Details] |
| [Component] | $XX,000 | $XX,000 | [Details] |
| **Total** | **$XX,000–XX,000** | **$XX,000–XX,000** | **[Notes]** |

---

### 1.2 [Additional Recommendations if applicable]

[Continue with detailed sections as needed]

---

## 2. COMPLIANCE & REGULATORY FRAMEWORK

### 2.1 Multi-Jurisdictional Requirements

**Critical Insight:** [Provide context-specific compliance guidance]

**Exhibit X: Jurisdictional Compliance Matrix**

| Your Status | Customer Location | Applicable Regulations | Key Requirements |
|-------------|-------------------|------------------------|------------------|
| [Location] | [Region] | [Regulations] | [Requirements] |
| [Location] | [Region] | [Regulations] | [Requirements] |
| [Location] | [Region] | [Regulations] | [Requirements] |

**Cross-Border Data Transfer Mechanisms:**
- **[Region-Region]:** [Mechanism and details]
- **[Region-Region]:** [Mechanism and details]

---

### 2.2 Risk Assessment

**Exhibit X: AI Implementation Risk Matrix**

| Risk Category | [Use Case 1] | [Use Case 2] | Mitigation Strategy |
|---------------|--------------|--------------|---------------------|
| **Data Breach Impact** | **[Level]** | **[Level]** | [Strategy] |
| **Regulatory Audit** | **[Level]** | **[Level]** | [Strategy] |
| **Vendor Lock-in** | **[Level]** | **[Level]** | [Strategy] |
| **Compliance Drift** | **[Level]** | **[Level]** | [Strategy] |

---

## 3. IMPLEMENTATION ROADMAP

### 3.1 Phased Deployment Strategy

**Design Principle:** [Describe the approach]

**Exhibit X: [X]-Month Implementation Timeline**

\`\`\`
Month 1-2: [PHASE NAME]
├─ Week 1-2: [Activities]
├─ Week 3-4: [Activities]
├─ Week 5-6: [Activities]
└─ Week 7-8: [Activities]
   Expected ROI: [X]%

Month 3-4: [PHASE NAME]
├─ Week 1-2: [Activities]
├─ Week 3-4: [Activities]
└─ Week 5-8: [Activities]
   Expected Milestone: [Milestone]

Month X-X: [PHASE NAME]
├─ [Activities]
└─ [Activities]
   Expected Milestone: [Milestone]
\`\`\`

**Critical Path Items:**
1. [Item] (X–X weeks)
2. [Item] (X–X weeks)
3. [Item] (X–X weeks)

---

### 3.2 Immediate Action Plan

**This Month (Week-by-Week):**

**Week 1:**
- [Action items]
- Success metric: [Metric]

**Week 2:**
- [Action items]
- Success metric: [Metric]

**Week 3:**
- [Action items]
- Success metric: [Metric]

---

## 4. VENDOR RECOMMENDATIONS

### 4.1 [Use Case] AI Stack

**Exhibit X: Recommended Vendor Configuration**

| Layer | Primary Recommendation | Alternative | Rationale |
|-------|------------------------|-------------|-----------|
| **[Layer]** | [Vendor] ($X/month) | [Alternative] ($X/month) | [Reason] |
| **[Layer]** | [Vendor] | [Alternative] | [Reason] |
| **Avoid** | [Vendor] | — | [Reason] |

**Key Selection Criteria:**
1. **[Criteria]:** [Details]
2. **[Criteria]:** [Details]

---

### 4.2 [Additional Vendor Section if needed]

**Exhibit X: Vendor Matrix**

| Use Case | Primary Solution | Cost/User/Month | Alternative |
|----------|------------------|-----------------|-------------|
| **[Use Case]** | [Solution] | $XX | [Alternative] |
| **[Use Case]** | [Solution] | $XX | [Alternative] |

---

## 5. FINANCIAL ANALYSIS

### 5.1 Total Cost of Ownership (3-Year Projection)

**Exhibit X: Three-Year TCO Model**

| Cost Category | Year 1 | Year 2 | Year 3 | 3-Year Total |
|---------------|--------|--------|--------|--------------|
| **[Category]** |
| [Item] | $XX,000 | $XX,000 | $XX,000 | $XX,000 |
| [Item] | $XX,000 | $XX,000 | $XX,000 | $XX,000 |
| **Subtotal** | **$XX,000** | **$XX,000** | **$XX,000** | **$XX,000** |
| **[Category]** |
| [Item] | $XX,000 | $XX,000 | $XX,000 | $XX,000 |
| [Item] | $XX,000 | $XX,000 | $XX,000 | $XX,000 |
| **Subtotal** | **$XX,000** | **$XX,000** | **$XX,000** | **$XX,000** |
| **Grand Total** | **$XX,000** | **$XX,000** | **$XX,000** | **$XX,000** |

**Key Assumptions:**
- [Assumption 1]
- [Assumption 2]

---

### 5.2 Return on Investment

**Exhibit X: Productivity Gains vs. Investment**

| Metric | [Use Case 1] | [Use Case 2] | Combined |
|--------|--------------|--------------|----------|
| **Year 1 Investment** | $XX,000 | $XX,000 | $XX,000 |
| **Productivity Gain** | [%] time savings | [%] improvement | $XX,000 value |
| **ROI Timeline** | X–X months | X–X months | X–X months |
| **Break-Even Point** | QX | QX | QX |

---

## 6. RISK MITIGATION

### 6.1 Critical Success Factors

**Exhibit X: Top 5 Implementation Risks & Mitigations**

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| **1. [Risk]** | [Impact] | [Level] | [Strategy] |
| **2. [Risk]** | [Impact] | [Level] | [Strategy] |
| **3. [Risk]** | [Impact] | [Level] | [Strategy] |
| **4. [Risk]** | [Impact] | [Level] | [Strategy] |
| **5. [Risk]** | [Impact] | [Level] | [Strategy] |

---

### 6.2 Common Pitfalls to Avoid

**Critical Mistakes:**

1. **[Mistake]**
   - **Issue:** [Description]
   - **Solution:** [Description]

2. **[Mistake]**
   - **Issue:** [Description]
   - **Solution:** [Description]

**Budget Reality Checks:**
- **Don't:** [What not to do]
- **Do:** [What to do instead]

---

## 7. CONCLUSION

### Bottom Line

[Provide comprehensive summary and strategic guidance]

**Key Takeaways:**

1. **[Takeaway 1]:** [Details]
2. **[Takeaway 2]:** [Details]
3. **[Takeaway 3]:** [Details]
4. **[Takeaway 4]:** [Details]
5. **[Takeaway 5]:** [Details]

**Recommended Next Action:**
[Specific immediate action with budget and timeline]

---

**This report prepared by AI Business Assessment Tool**
**For questions or implementation support, contact: [relevant contact]**

---

## DISCLAIMER

**IMPORTANT: This report is provided for informational and educational purposes only.**

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

*Confidential and Proprietary – Not for Distribution*

---

CRITICAL INSTRUCTIONS:
1. Use the EXACT structure above with all section numbers and headings
2. ALL TABLES must use Markdown table format with | symbols (NOT HTML)
3. Use ASCII diagrams for architecture/flow visualizations within code blocks
4. Fill in [placeholders] with specific, actionable recommendations based on assessment data
5. Use "Exhibit X:" format for all tables and figures
6. Include specific vendor names, cost ranges ($XX,000 format), and realistic timelines
7. Address the business location vs customer location distinction explicitly
8. Make tables comprehensive with realistic numbers based on the user's profile
9. Use currency symbols appropriate to their region ($ for US/Canada, € for EU, £ for UK)
10. Provide immediate actionable next steps tailored to their situation

Generate a complete, professional report following this structure EXACTLY. Every table MUST use Markdown format (| symbols).`;

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
