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
    const analysisPrompt = `You are a senior AI security and implementation consultant creating a professional enterprise strategy report. Analyze this business assessment and provide a comprehensive, well-formatted report using the EXHIBIT-BASED format.

Business Assessment:
${JSON.stringify(responses, null, 2)}

CRITICAL CONTEXT:
- Business Location (business_location): Where the company is BASED/REGISTERED
- Customer Locations (customer_locations): Where their CUSTOMERS are located
- These are DIFFERENT and both matter! Customer locations ADD compliance requirements.
- AI Usage Type (ai_usage_type): Can include both "in_product" and "internal_productivity"
- ALL financial figures must be in EUROS (€) not dollars
- Use EXHIBIT numbering for all major sections, tables, and diagrams

FORMAT YOUR REPORT AS A PROFESSIONAL ENTERPRISE STRATEGY DOCUMENT:

# AI IMPLEMENTATION STRATEGY
## Enterprise Deployment Roadmap

**CONFIDENTIAL**
Prepared for: [Client/Business Name based on responses]
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

---

## EXECUTIVE SUMMARY

### Exhibit 1: Strategic Assessment Overview

Provide a comprehensive 3-4 paragraph executive summary that includes:

**Strategic Recommendation:**
Deploy a dual-track AI strategy combining [specific approach based on their use case: cloud-first architecture for customer-facing features / hybrid deployment for internal productivity / edge computing for latency-sensitive applications / etc.]

**Investment Requirements:**
- Year 1 Total Investment: €XX,000 - €XX,000
- Ongoing Annual Costs: €XX,000 - €XX,000
- Payback Period: XX-XX months
- Break-even Point: Month XX of Year 2

**Compliance Coverage:**
[List the specific regulations that apply: GDPR, AI Act, HIPAA, etc.] with multi-jurisdictional requirements for [business location] headquarters serving customers in [customer regions].

**Critical Success Factors:**
1. [Specific factor based on their business, e.g., "Deploy EU-region Claude API with data residency guarantees"]
2. [E.g., "Implement token usage monitoring to cap monthly costs at €X,XXX"]
3. [E.g., "Complete GDPR Article 30 processing records before production launch"]
4. [E.g., "Establish AI governance committee with legal, security, and product representation"]
5. [E.g., "Deploy AI gateway (e.g., Portkey, LLMproxy) for unified observability"]

---

## 1. STRATEGIC RECOMMENDATIONS

### Exhibit 2: Recommended AI Architecture

**Primary Recommendation: [Specific Architecture Name]**

Based on your profile ([business type], [industry], [data sensitivity], [geographic requirements]), we recommend the following architecture:

\`\`\`
┌──────────────────────────────────────────────┐
│           Your Application Layer             │
│  [Product Feature / Internal Tool / API]     │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│          AI Gateway / Proxy Layer            │
│  • Request routing & load balancing          │
│  • Cost tracking & budget controls           │
│  • PII detection & redaction                 │
│  • Audit logging for compliance              │
│  Tools: Portkey.ai / LiteLLM / Custom        │
└──────────────────┬───────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│  Primary AI API │  │  Fallback API   │
│  [Provider +    │  │  [Alternative]  │
│   Region]       │  │                 │
│  Claude/GPT/etc │  │  Claude/GPT/etc │
└─────────────────┘  └─────────────────┘
\`\`\`

**Why This Architecture:**
- [Reason 1 based on their compliance needs]
- [Reason 2 based on their scale/budget]
- [Reason 3 based on their use case]

### Exhibit 3: Year 1 Investment Breakdown

<table>
<tr><th>Cost Component</th><th>Setup (One-Time)</th><th>Ongoing Annual</th><th>Total Year 1</th><th>Notes</th></tr>
<tr><td>AI API Services</td><td>€0</td><td>€XX,000</td><td>€XX,000</td><td>Usage-based, estimated at [X] requests/month</td></tr>
<tr><td>AI Gateway/Proxy</td><td>€X,XXX</td><td>€X,XXX</td><td>€XX,XXX</td><td>[Portkey Pro / LiteLLM / Custom deployment]</td></tr>
<tr><td>Infrastructure</td><td>€X,XXX</td><td>€X,XXX</td><td>€XX,XXX</td><td>Cloud hosting, databases, monitoring</td></tr>
<tr><td>Security & Compliance</td><td>€XX,XXX</td><td>€X,XXX</td><td>€XX,XXX</td><td>Legal review, DPA templates, security audit</td></tr>
<tr><td>Development/Integration</td><td>€XX,XXX</td><td>€0</td><td>€XX,XXX</td><td>[Internal team / External consultants]</td></tr>
<tr><td>Training & Documentation</td><td>€X,XXX</td><td>€X,XXX</td><td>€X,XXX</td><td>Team training, internal guidelines</td></tr>
<tr><td><strong>TOTAL INVESTMENT</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td></td></tr>
</table>

**Budget Assumptions:**
- Based on [specific volume assumptions from their responses]
- Currency: Euro (€) for EU-based operations
- Excludes potential cost savings (see Exhibit 11)

### Exhibit 4: Vendor Selection Matrix

<table>
<tr><th>Layer</th><th>Primary Recommendation</th><th>Alternative Option</th><th>Selection Rationale</th><th>Estimated Cost</th></tr>
<tr><td>AI Model Provider</td><td>[e.g., Anthropic Claude - EU Region]</td><td>[e.g., Azure OpenAI - EU West]</td><td>[Rationale: GDPR compliance, data residency, performance]</td><td>€XX per 1M tokens</td></tr>
<tr><td>AI Gateway/Proxy</td><td>[e.g., Portkey.ai]</td><td>[e.g., Custom LiteLLM]</td><td>[Reason: Cost tracking, PII detection, compliance logging]</td><td>€XXX/month</td></tr>
<tr><td>Security Layer</td><td>[e.g., Microsoft Presidio]</td><td>[e.g., AWS Comprehend]</td><td>[Reason: PII detection, open-source vs managed]</td><td>€XXX/month</td></tr>
<tr><td>Monitoring & Observability</td><td>[e.g., LangSmith]</td><td>[e.g., Custom Prometheus]</td><td>[Reason: Debugging, performance tracking]</td><td>€XXX/month</td></tr>
<tr><td>Vector Database (if needed)</td><td>[e.g., Pinecone EU]</td><td>[e.g., Weaviate self-hosted]</td><td>[Reason: RAG use cases, data residency]</td><td>€XXX/month</td></tr>
</table>

---

## 2. COMPLIANCE & REGULATORY FRAMEWORK

### Exhibit 5: Multi-Jurisdictional Compliance Matrix

**CRITICAL: Your business operates in [business_location] but serves customers in [customer_locations]. This triggers MULTIPLE regulatory frameworks.**

<table>
<tr><th>Jurisdiction</th><th>Applicable Regulations</th><th>Key Requirements</th><th>Implementation Status</th><th>Risk Level</th></tr>
<tr><td>[Business Location]</td><td>[Laws applying to HQ location]</td><td>[Specific requirements]</td><td>❌ Not Started / ⚠️ In Progress / ✅ Compliant</td><td>High/Medium/Low</td></tr>
<tr><td>[Customer Location 1]</td><td>[E.g., GDPR for EU customers]</td><td>• Data processing agreements<br>• Right to deletion<br>• Data residency<br>• AI Act compliance</td><td>❌ Not Started</td><td>High</td></tr>
<tr><td>[Customer Location 2]</td><td>[E.g., CCPA for California]</td><td>• Privacy notices<br>• Opt-out mechanisms<br>• Data sale prohibitions</td><td>❌ Not Started</td><td>Medium</td></tr>
<tr><td>[Additional as needed]</td><td>[Other regulations]</td><td>[Requirements]</td><td>[Status]</td><td>[Level]</td></tr>
</table>

**Compliance Priority Actions:**
1. **IMMEDIATE (Week 1):** [Specific action, e.g., "Draft GDPR Article 30 processing records"]
2. **SHORT-TERM (Month 1):** [E.g., "Execute Data Processing Agreement with AI provider"]
3. **MEDIUM-TERM (Month 2-3):** [E.g., "Complete security audit and penetration testing"]

### Exhibit 6: Data Protection & Security Requirements

<table>
<tr><th>Regulation</th><th>Data Storage</th><th>Data Processing</th><th>Data Retention</th><th>Implementation Approach</th></tr>
<tr><td>GDPR (EU)</td><td>EU region only</td><td>DPA required with AI vendor</td><td>Delete after [X] days</td><td>Use Claude EU / Azure EU regions</td></tr>
<tr><td>AI Act (EU)</td><td>Training data documentation</td><td>Risk assessment for high-risk AI</td><td>Audit logs for 6 months</td><td>Classify as [limited-risk / high-risk], implement accordingly</td></tr>
<tr><td>[Industry-specific]</td><td>[Requirements]</td><td>[Requirements]</td><td>[Requirements]</td><td>[Approach]</td></tr>
</table>

### Exhibit 7: Risk Assessment Matrix

<table>
<tr><th>Risk Category</th><th>Impact (1-5)</th><th>Probability (1-5)</th><th>Risk Score</th><th>Mitigation Strategy</th><th>Cost</th></tr>
<tr><td>Data Breach / Unauthorized Access</td><td>5 (Critical)</td><td>[Calculate based on security posture]</td><td>[Impact × Probability]</td><td>• Deploy AI gateway with auth<br>• Implement PII redaction<br>• Regular security audits</td><td>€XX,XXX</td></tr>
<tr><td>Regulatory Non-Compliance</td><td>[4-5]</td><td>[Based on current status]</td><td>[Score]</td><td>• Legal review before launch<br>• DPA with AI vendors<br>• Compliance monitoring</td><td>€XX,XXX</td></tr>
<tr><td>Cost Overruns</td><td>[2-4]</td><td>[Based on usage patterns]</td><td>[Score]</td><td>• Set hard budget caps<br>• Implement rate limiting<br>• Monitor token usage daily</td><td>€X,XXX</td></tr>
<tr><td>Model Hallucinations / Errors</td><td>[3-5]</td><td>[Based on use case]</td><td>[Score]</td><td>• Human review for critical outputs<br>• Confidence thresholds<br>• User disclaimers</td><td>€X,XXX</td></tr>
<tr><td>Vendor Lock-in</td><td>[2-3]</td><td>[Medium]</td><td>[Score]</td><td>• Use OpenAI-compatible APIs<br>• Abstract AI layer<br>• Multi-provider fallback</td><td>€X,XXX</td></tr>
<tr><td>Service Availability / Downtime</td><td>[3-4]</td><td>[Based on SLA needs]</td><td>[Score]</td><td>• Multi-provider fallback<br>• Request queuing<br>• Circuit breakers</td><td>€X,XXX</td></tr>
</table>

---

## 3. IMPLEMENTATION ROADMAP

### Exhibit 8: Phased Deployment Timeline

**Phase 1: FOUNDATION (Months 1-2) - Expected Investment: €XX,XXX**

\`\`\`
Month 1: PLANNING & SETUP
Week 1-2: Legal & Compliance Foundation
├─ Draft GDPR Article 30 records
├─ Review AI vendor contracts
├─ Classify AI system risk level (AI Act)
└─ Identify data residency requirements

Week 3-4: Technical Architecture
├─ Select AI provider & region ([recommendation])
├─ Design gateway/proxy architecture
├─ Plan PII detection strategy
└─ Define monitoring requirements

Month 2: INFRASTRUCTURE DEPLOYMENT
Week 1-2: Core Infrastructure
├─ Deploy AI gateway ([tool name])
├─ Configure cloud infrastructure
├─ Implement authentication & authorization
└─ Set up monitoring & alerting

Week 3-4: Security & Testing
├─ Deploy PII detection pipeline
├─ Configure rate limiting & cost controls
├─ Security testing & penetration testing
└─ Compliance audit of implementation

Expected ROI Impact: €0 (investment phase)
\`\`\`

**Phase 2: PILOT DEPLOYMENT (Month 3) - Expected Investment: €X,XXX**

\`\`\`
Month 3: CONTROLLED ROLLOUT
Week 1-2: Internal Pilot
├─ Deploy to [X] internal users / test group
├─ Monitor usage patterns & costs
├─ Gather feedback & iterate
└─ Validate compliance controls

Week 3-4: Limited Production
├─ Expand to [X]% of [target user group]
├─ A/B testing against baseline
├─ Monitor quality & performance
└─ Adjust budget controls if needed

Expected ROI Impact: €X,XXX in productivity gains (see Exhibit 11)
\`\`\`

**Phase 3: FULL PRODUCTION (Month 4+) - Ongoing: €XX,XXX/year**

\`\`\`
Month 4+: SCALE & OPTIMIZE
└─ Full production rollout to 100% of users
   ├─ Continuous monitoring & optimization
   ├─ Regular compliance audits (quarterly)
   ├─ Cost optimization based on usage patterns
   └─ Feature expansion & improvements

Expected ROI Impact: €XX,XXX annually (see Exhibit 11)
\`\`\`

### Exhibit 9: Immediate Action Plan (Next 30 Days)

<table>
<tr><th>Week</th><th>Critical Actions</th><th>Owner</th><th>Budget Required</th><th>Deliverable</th></tr>
<tr><td>Week 1</td><td>1. Legal review of AI vendor contracts<br>2. Draft GDPR processing records<br>3. Select primary AI provider<br>4. Assign project team</td><td>[Legal, CTO, PM]</td><td>€X,XXX</td><td>• Signed DPA<br>• Risk classification<br>• Project charter</td></tr>
<tr><td>Week 2</td><td>1. Design technical architecture<br>2. Select AI gateway tool<br>3. Plan security controls<br>4. Create budget monitoring plan</td><td>[Engineering, Security]</td><td>€X,XXX</td><td>• Architecture diagram<br>• Tool selection document<br>• Security plan</td></tr>
<tr><td>Week 3</td><td>1. Deploy infrastructure<br>2. Configure AI gateway<br>3. Implement PII detection<br>4. Set up monitoring</td><td>[Engineering, DevOps]</td><td>€X,XXX</td><td>• Working staging environment<br>• Monitoring dashboard</td></tr>
<tr><td>Week 4</td><td>1. Security testing<br>2. Integration testing<br>3. Compliance validation<br>4. Prepare for pilot launch</td><td>[Engineering, Security, Legal]</td><td>€X,XXX</td><td>• Security test report<br>• Compliance checklist<br>• Pilot launch plan</td></tr>
</table>

---

## 4. FINANCIAL ANALYSIS

### Exhibit 10: Three-Year Total Cost of Ownership (TCO)

<table>
<tr><th>Cost Category</th><th>Year 1</th><th>Year 2</th><th>Year 3</th><th>3-Year Total</th><th>Notes</th></tr>
<tr><td colspan="6"><strong>CAPITAL EXPENDITURE (One-Time)</strong></td></tr>
<tr><td>Initial Development & Integration</td><td>€XX,XXX</td><td>€0</td><td>€0</td><td>€XX,XXX</td><td>[Internal team / external consultants]</td></tr>
<tr><td>Legal & Compliance Setup</td><td>€XX,XXX</td><td>€0</td><td>€0</td><td>€XX,XXX</td><td>Contract review, DPA negotiation, initial audit</td></tr>
<tr><td>Infrastructure Setup</td><td>€X,XXX</td><td>€0</td><td>€0</td><td>€X,XXX</td><td>Gateway deployment, initial configuration</td></tr>
<tr><td><strong>Total CapEx</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€0</strong></td><td><strong>€0</strong></td><td><strong>€XX,XXX</strong></td><td></td></tr>
<tr><td colspan="6"><strong>OPERATIONAL EXPENDITURE (Recurring)</strong></td></tr>
<tr><td>AI API Services (Usage-Based)</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XXX,XXX</td><td>Assumes [X]% annual growth</td></tr>
<tr><td>AI Gateway / Proxy Platform</td><td>€X,XXX</td><td>€X,XXX</td><td>€X,XXX</td><td>€XX,XXX</td><td>[Tool name] subscription</td></tr>
<tr><td>Cloud Infrastructure</td><td>€X,XXX</td><td>€X,XXX</td><td>€X,XXX</td><td>€XX,XXX</td><td>Hosting, databases, storage</td></tr>
<tr><td>Monitoring & Observability</td><td>€X,XXX</td><td>€X,XXX</td><td>€X,XXX</td><td>€X,XXX</td><td>Logging, alerting, debugging tools</td></tr>
<tr><td>Security & Compliance (Ongoing)</td><td>€X,XXX</td><td>€X,XXX</td><td>€X,XXX</td><td>€XX,XXX</td><td>Annual audits, legal reviews</td></tr>
<tr><td>Maintenance & Support</td><td>€X,XXX</td><td>€X,XXX</td><td>€X,XXX</td><td>€XX,XXX</td><td>Ongoing development, bug fixes</td></tr>
<tr><td><strong>Total OpEx</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XXX,XXX</strong></td><td></td></tr>
<tr><td colspan="6"><strong>TOTAL COST OF OWNERSHIP</strong></td></tr>
<tr><td><strong>Annual Total</strong></td><td><strong>€XXX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XXX,XXX</strong></td><td></td></tr>
<tr><td><strong>Cumulative Total</strong></td><td><strong>€XXX,XXX</strong></td><td><strong>€XXX,XXX</strong></td><td><strong>€XXX,XXX</strong></td><td><strong>€XXX,XXX</strong></td><td></td></tr>
</table>

### Exhibit 11: Return on Investment (ROI) Analysis

**Productivity Gains vs. Investment**

<table>
<tr><th>Benefit Category</th><th>Year 1 Savings</th><th>Year 2 Savings</th><th>Year 3 Savings</th><th>3-Year Total</th><th>Calculation Basis</th></tr>
<tr><td colspan="6"><strong>DIRECT PRODUCTIVITY GAINS</strong></td></tr>
<tr><td>[E.g., Customer Support Automation]</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XXX,XXX</td><td>[X]% of [Y] support tickets automated at €[Z] per ticket</td></tr>
<tr><td>[E.g., Content Generation]</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XXX,XXX</td><td>[X] hours saved per week × €[Y] fully-loaded hourly cost</td></tr>
<tr><td>[E.g., Code Development Acceleration]</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XXX,XXX</td><td>[X]% productivity increase for [Y] developers</td></tr>
<tr><td><strong>Total Direct Gains</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XXX,XXX</strong></td><td></td></tr>
<tr><td colspan="6"><strong>INDIRECT BENEFITS</strong></td></tr>
<tr><td>Revenue Growth (Customer-Facing AI)</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XXX,XXX</td><td>Improved conversion, upsells, retention</td></tr>
<tr><td>Cost Avoidance (Hiring)</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XXX,XXX</td><td>Deferred headcount needs</td></tr>
<tr><td>Quality Improvements</td><td>€X,XXX</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XX,XXX</td><td>Reduced errors, faster issue resolution</td></tr>
<tr><td><strong>Total Indirect Benefits</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XXX,XXX</strong></td><td></td></tr>
<tr><td colspan="6"><strong>NET ROI CALCULATION</strong></td></tr>
<tr><td>Total Benefits</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XX,XXX</td><td>€XXX,XXX</td><td></td></tr>
<tr><td>Total Costs (from Exhibit 10)</td><td>-€XX,XXX</td><td>-€XX,XXX</td><td>-€XX,XXX</td><td>-€XXX,XXX</td><td></td></tr>
<tr><td><strong>Net Benefit / (Cost)</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XXX,XXX</strong></td><td></td></tr>
<tr><td><strong>ROI Percentage</strong></td><td><strong>[X]%</strong></td><td><strong>[X]%</strong></td><td><strong>[X]%</strong></td><td><strong>[X]%</strong></td><td></td></tr>
<tr><td><strong>Cumulative Cash Flow</strong></td><td><strong>-€XX,XXX</strong></td><td><strong>€XX,XXX</strong></td><td><strong>€XXX,XXX</strong></td><td><strong>€XXX,XXX</strong></td><td></td></tr>
</table>

**Key Financial Metrics:**
- **Payback Period:** Month [X] of Year [Y]
- **Break-Even Point:** [Date/Month] when cumulative benefits exceed cumulative costs
- **3-Year ROI:** [X]% return on total investment
- **Internal Rate of Return (IRR):** [X]% (if calculable)

**Sensitivity Analysis:**
- **Best Case** (usage 50% higher): 3-year ROI = [X]%, payback in [Y] months
- **Base Case** (as modeled): 3-year ROI = [X]%, payback in [Y] months
- **Worst Case** (usage 50% lower): 3-year ROI = [X]%, payback in [Y] months

---

## 5. RISK MITIGATION & SUCCESS FACTORS

### Exhibit 12: Critical Success Factors

<table>
<tr><th>Success Factor</th><th>Importance</th><th>Current Status</th><th>Required Actions</th><th>Timeline</th><th>Owner</th></tr>
<tr><td>Executive Sponsorship</td><td>Critical</td><td>❌ / ⚠️ / ✅</td><td>[Specific actions needed]</td><td>[Timeline]</td><td>[Role]</td></tr>
<tr><td>Budget Secured</td><td>Critical</td><td>❌ / ⚠️ / ✅</td><td>[Finalize budget approval for €XX,XXX]</td><td>[Timeline]</td><td>[Role]</td></tr>
<tr><td>Legal/Compliance Approval</td><td>Critical</td><td>❌ / ⚠️ / ✅</td><td>[Complete legal review, sign DPA]</td><td>[Timeline]</td><td>[Role]</td></tr>
<tr><td>Technical Architecture Validated</td><td>High</td><td>❌ / ⚠️ / ✅</td><td>[Architecture review, security signoff]</td><td>[Timeline]</td><td>[Role]</td></tr>
<tr><td>Team Training Completed</td><td>Medium</td><td>❌ / ⚠️ / ✅</td><td>[Training sessions for [X] team members]</td><td>[Timeline]</td><td>[Role]</td></tr>
<tr><td>Monitoring & Alerting Active</td><td>High</td><td>❌ / ⚠️ / ✅</td><td>[Deploy dashboards, configure alerts]</td><td>[Timeline]</td><td>[Role]</td></tr>
</table>

### Exhibit 13: Common Pitfalls & Avoidance Strategies

<table>
<tr><th>Pitfall</th><th>Warning Signs</th><th>Impact</th><th>Avoidance Strategy</th><th>Contingency Plan</th></tr>
<tr><td>Runaway Costs</td><td>• No usage monitoring<br>• Missing budget caps<br>• Unclear cost per transaction</td><td>Budget overruns by 200-500%</td><td>• Deploy gateway with hard limits (e.g., €X,XXX/month)<br>• Daily cost monitoring<br>• Rate limiting per user/feature</td><td>• Emergency spending freeze<br>• Fallback to cheaper model<br>• Feature flagging</td></tr>
<tr><td>Compliance Violations</td><td>• No legal review<br>• Missing DPA<br>• Data stored in wrong region</td><td>Fines up to €20M or 4% revenue (GDPR)</td><td>• Legal review BEFORE launch<br>• DPA with all AI vendors<br>• Data residency validation<br>• Regular compliance audits</td><td>• Immediate service shutdown<br>• Legal incident response<br>• Customer notification plan</td></tr>
<tr><td>Poor User Adoption</td><td>• Low usage metrics<br>• Negative feedback<br>• Users bypass system</td><td>ROI not realized, project failure</td><td>• User training & onboarding<br>• Clear value demonstration<br>• Iterate based on feedback<br>• Measure adoption metrics</td><td>• User interviews<br>• Feature pivot<br>• Enhanced UX</td></tr>
<tr><td>Security Breach</td><td>• Weak authentication<br>• No PII detection<br>• Missing audit logs</td><td>Data breach, regulatory fines, reputation damage</td><td>• Strong auth (API keys + OAuth)<br>• PII redaction pipeline<br>• Comprehensive audit logging<br>• Regular security testing</td><td>• Incident response plan<br>• Breach notification procedures<br>• Forensic investigation</td></tr>
<tr><td>Vendor Lock-in</td><td>• Direct API integration<br>• Vendor-specific features<br>• No abstraction layer</td><td>Difficulty switching, price increases</td><td>• Use OpenAI-compatible APIs<br>• Abstract AI layer in code<br>• Multi-provider testing<br>• Portable prompt templates</td><td>• Migration plan<br>• Provider alternatives ready<br>• Gradual cutover process</td></tr>
</table>

### Exhibit 14: Governance & Oversight Framework

**AI Governance Structure:**

\`\`\`
┌─────────────────────────────────────┐
│   AI Governance Committee           │
│   (Monthly Reviews)                 │
│   • Legal, Security, Product, Eng   │
└──────────────┬──────────────────────┘
               │
     ┌─────────┼─────────┐
     ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│ Legal & │ │Security │ │ Product  │
│Compliance│ │  Team   │ │   Team   │
│  Review  │ │ Review  │ │  Review  │
└─────────┘ └─────────┘ └──────────┘
\`\`\`

**Oversight Cadence:**
- **Daily:** Automated monitoring of costs, usage, errors (dashboards + alerts)
- **Weekly:** Team review of metrics, user feedback, incident reports
- **Monthly:** Governance committee meeting - compliance status, budget review, roadmap
- **Quarterly:** External audit (legal, security), compliance certification updates
- **Annually:** Comprehensive strategy review, vendor evaluation, risk reassessment

---

## 6. CONCLUSION & NEXT STEPS

### Exhibit 15: Executive Decision Framework

**Bottom Line Recommendation:**

Based on the assessment of [business name]:
- **Industry:** [Industry]
- **Use Case:** [Primary AI use case]
- **Compliance Requirements:** [Key regulations]
- **Scale:** [User/request volume]

**We recommend proceeding with [specific architecture] at a total Year 1 investment of €XX,XXX - €XX,XXX.**

**This approach will deliver:**
1. [Specific business outcome, e.g., "30% reduction in customer support costs"]
2. [E.g., "Full GDPR + AI Act compliance for EU operations"]
3. [E.g., "Payback in 14 months with XX% 3-year ROI"]
4. [E.g., "Scalable foundation for future AI capabilities"]

**Recommended Immediate Next Action (This Week):**

**Action:** Schedule 2-hour AI Strategy Workshop
**Attendees:** [CEO/CTO/Legal/Security leads]
**Agenda:**
1. Review this assessment (30 min)
2. Approve/modify budget of €XX,XXX (30 min)
3. Assign project owner & core team (15 min)
4. Select AI provider & authorize contracts (30 min)
5. Set timeline for Phase 1 kickoff (15 min)

**Budget Required:** €XX,XXX for Phase 1 (Months 1-2)
**Expected Completion:** [Date, ~4 months from start]
**Break-Even:** Month [X] of Year [Y]

---

## APPENDIX

### Exhibit 16: Glossary of Key Terms

- **AI Gateway/Proxy:** Middleware layer that sits between your application and AI providers (e.g., Portkey, LiteLLM)
- **DPA (Data Processing Agreement):** Contract required under GDPR when a vendor processes personal data on your behalf
- **PII (Personally Identifiable Information):** Data that can identify an individual (names, emails, etc.)
- **Token:** Unit of text processing in AI models (~4 characters = 1 token)
- **Data Residency:** Legal requirement to store/process data in specific geographic regions
- **RAG (Retrieval-Augmented Generation):** AI technique combining database search with generation
- **TCO (Total Cost of Ownership):** All costs over system lifetime (CapEx + OpEx)
- **ROI (Return on Investment):** Financial return relative to investment cost

### Exhibit 17: Additional Resources

**For your specific compliance requirements:**
- GDPR Compliance: [https://gdpr.eu/](https://gdpr.eu/)
- EU AI Act: [https://artificialintelligenceact.eu/](https://artificialintelligenceact.eu/)
- [Industry-specific resources based on their industry]

**Recommended AI Providers (EU Region):**
- Anthropic Claude (EU): [https://console.anthropic.com/](https://console.anthropic.com/)
- Azure OpenAI (EU West): [https://azure.microsoft.com/en-us/products/ai-services/openai-service](https://azure.microsoft.com/en-us/products/ai-services/openai-service)

**AI Gateway Tools:**
- Portkey.ai: [https://portkey.ai/](https://portkey.ai/)
- LiteLLM: [https://github.com/BerriAI/litellm](https://github.com/BerriAI/litellm)

---

## DISCLAIMER

**IMPORTANT: This report is provided for informational and strategic planning purposes only.**

This AI implementation strategy report represents a general assessment based on the information provided through the assessment questionnaire. It should **NOT** be considered:

- **Legal Advice:** This is not a substitute for consultation with qualified legal counsel regarding GDPR, AI Act, HIPAA, CCPA, or other applicable regulations
- **Cybersecurity Audit:** This does not replace professional security assessments by certified cybersecurity professionals
- **Compliance Certification:** This report does not guarantee regulatory compliance or serve as official certification
- **Financial Advice:** Cost estimates and ROI projections are illustrative; consult financial advisors for investment decisions
- **Comprehensive Risk Assessment:** Additional due diligence is required for production deployment

**You must consult with qualified professionals before implementation:**

- **Legal Counsel:** For data processing agreements, regulatory compliance, contract negotiations, and jurisdictional requirements
- **Cybersecurity Experts:** For penetration testing, security architecture review, threat modeling, and incident response planning
- **Compliance Specialists:** For industry-specific regulations (HIPAA, PCI-DSS, etc.) and audit preparation
- **Financial Advisors:** For budget planning, ROI validation, and financial risk assessment
- **Insurance Advisors:** For cyber liability and errors & omissions insurance coverage

**Important Disclaimers:**

1. **Cost Estimates:** All costs are approximate ranges based on typical deployments. Actual costs may vary by ±50% based on specific requirements, vendor negotiations, and usage patterns.

2. **Timeline Estimates:** Timelines assume adequate resources and budget. Actual timelines may vary based on organizational readiness, compliance complexity, and technical challenges.

3. **Compliance Statements:** Compliance requirements are based on general understanding of regulations. Legal requirements evolve; consult legal counsel for current obligations.

4. **ROI Projections:** Return on investment figures are illustrative based on industry benchmarks. Actual results depend on implementation quality, user adoption, and business context.

5. **Vendor Recommendations:** Tool and vendor suggestions are examples, not endorsements. Conduct your own evaluation and due diligence.

6. **Currency:** All figures in Euros (€) based on EU operations context. Exchange rates and regional pricing may vary.

**No Warranty:** This report is provided "as is" without warranty of any kind regarding accuracy, completeness, or suitability for your specific situation.

**Limitation of Liability:** The report authors and AI Assessment Tool are not liable for any decisions made or actions taken based on this report.

**Recommendation:** Before proceeding with any implementation, engage qualified professionals to review this strategy and conduct thorough due diligence appropriate to your organization's risk profile, budget, and compliance obligations.

---

*Report generated on ${new Date().toISOString().split('T')[0]}*
*AI Implementation Strategy Assessment Tool v2.0*
*Exhibit-Based Enterprise Format*

---

## INSTRUCTIONS FOR AI GENERATING THIS REPORT:

**CRITICAL REQUIREMENTS:**

1. **Use EXACT Exhibit Numbering:** Every major section and table must have "Exhibit X:" numbering as shown above
2. **Currency:** ALL financial figures must use Euro (€) symbol and European number formatting
3. **Fill ALL Tables:** Every table must have realistic, specific numbers (not placeholder "XX,XXX")
4. **Use Assessment Data:** Generate specific recommendations based on the actual assessment responses
5. **Cross-Reference Exhibits:** Reference other exhibits (e.g., "see Exhibit 11 for ROI details")
6. **Professional Tone:** Write as a senior consultant would for a C-level audience
7. **Specific Not Generic:** Use actual vendor names, specific regulations, real cost ranges
8. **HTML Tables:** Use proper HTML table formatting for all tables (they render correctly)
9. **ASCII Diagrams:** Use ASCII art for architecture and flow diagrams (well-formatted)
10. **Multi-Jurisdictional:** Explicitly address both business_location AND customer_locations compliance

**Table Filling Guidelines:**

- Cost tables: Use realistic ranges based on business size (€5K-€500K range depending on scale)
- Timeline tables: Be specific with weeks/months, not vague
- Compliance tables: List actual regulations (GDPR, AI Act, CCPA, HIPAA, etc.)
- Risk tables: Calculate risk scores (Impact × Probability)
- Vendor tables: Recommend specific tools (Portkey, Claude EU, Azure OpenAI EU, etc.)

**Critical Distinctions:**

- business_location: Where company is based/registered (affects corporate compliance)
- customer_locations: Where customers are located (adds additional compliance requirements)
- ai_usage_type: Can be multiple values - check for both "in_product" AND "internal_productivity"

**Quality Checklist Before Outputting Report:**

- [ ] All exhibits numbered (Exhibit 1 through Exhibit 17)
- [ ] All currency in Euros (€) not dollars ($)
- [ ] All tables filled with realistic numbers (no "XX,XXX" placeholders)
- [ ] Specific vendor/tool recommendations (not generic)
- [ ] Both business and customer locations addressed in compliance section
- [ ] Timeline with specific weeks/months
- [ ] ROI calculation with break-even date
- [ ] Professional formatting throughout
- [ ] Cross-references between exhibits included
- [ ] Disclaimer section prominently included

**Output Length:** This is a comprehensive report. Aim for 3000-4000 words. Do not truncate sections. Fill every exhibit completely with detailed, specific information based on the assessment data provided.

Generate the complete, professional enterprise strategy report following this exhibit-based structure exactly.`;

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
