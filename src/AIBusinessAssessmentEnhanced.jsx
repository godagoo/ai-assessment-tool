/**
 * AI Business Assessment Tool - Updated Version
 * NO ADDITIONAL DEPENDENCIES REQUIRED!
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, Download, ArrowRight, ArrowLeft, Info, BookOpen, DollarSign } from 'lucide-react';

// Enhanced markdown to HTML converter with table and code block support
const MarkdownText = ({ children }) => {
  if (!children) return null;

  const parseMarkdown = (text) => {
    // First, extract and protect code blocks, HTML tables, and markdown tables from processing
    const codeBlocks = [];
    const htmlTables = [];
    const markdownTables = [];

    // Extract code blocks (triple backticks)
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
      const index = codeBlocks.length;
      codeBlocks.push(code.trim());
      return `__CODEBLOCK_${index}__`;
    });

    // Extract HTML tables
    text = text.replace(/(<table[\s\S]*?<\/table>)/gi, (match) => {
      const index = htmlTables.length;
      htmlTables.push(match);
      return `__HTMLTABLE_${index}__`;
    });

    // Parse markdown tables (| header | format)
    text = text.replace(/(\|.+\|[\r\n]+\|[-:\s|]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g, (match) => {
      const lines = match.trim().split('\n').map(l => l.trim());
      if (lines.length < 3) return match; // Need at least header, separator, and one row

      // Parse header row
      const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);

      // Skip separator row (lines[1])

      // Parse data rows
      const rows = lines.slice(2).map(line =>
        line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
      );

      // Build HTML table
      let tableHtml = '<table class="min-w-full border-collapse border border-gray-300 my-4 text-sm">';
      tableHtml += '<thead><tr>';
      headers.forEach(header => {
        tableHtml += `<th class="border border-gray-300 px-4 py-2 bg-indigo-100 font-bold text-left">${header}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';

      rows.forEach(row => {
        if (row.length > 0) {
          tableHtml += '<tr class="hover:bg-gray-50">';
          row.forEach(cell => {
            tableHtml += `<td class="border border-gray-300 px-4 py-2">${cell}</td>`;
          });
          tableHtml += '</tr>';
        }
      });

      tableHtml += '</tbody></table>';

      const index = markdownTables.length;
      markdownTables.push(tableHtml);
      return `__MARKDOWNTABLE_${index}__`;
    });

    // Convert markdown to HTML
    let html = text
      // Headers
      .replace(/### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-gray-900">$1</h3>')
      .replace(/## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">$1</h2>')
      .replace(/# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-6 border-gray-300"/>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Bullet lists
      .replace(/^\- (.*$)/gim, '<li class="ml-6 mb-1 list-disc">$1</li>')
      // Numbered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 mb-1 list-decimal">$1</li>')
      // Paragraphs (double newlines)
      .replace(/\n\n/g, '</p><p class="mb-4">')
      // Single line breaks
      .replace(/\n/g, '<br/>');

    // Wrap consecutive list items in proper <ul> or <ol> tags
    html = html.replace(/(<li class="ml-6 mb-1 list-disc">.*?<\/li>)(?:<br\/>)?(?=<li class="ml-6 mb-1 list-disc">|$)/gs, '$1');
    html = html.replace(/(<li class="ml-6 mb-1 list-decimal">.*?<\/li>)(?:<br\/>)?(?=<li class="ml-6 mb-1 list-decimal">|$)/gs, '$1');

    // Wrap bullet lists
    html = html.replace(/(<li class="ml-6 mb-1 list-disc">[\s\S]*?<\/li>)(?![\s]*<li class="ml-6 mb-1 list-disc">)/g, (match) => {
      const items = match.match(/<li class="ml-6 mb-1 list-disc">[\s\S]*?<\/li>/g);
      if (items && items.length > 0) {
        return '<ul class="my-4">' + items.join('') + '</ul>';
      }
      return match;
    });

    // Wrap numbered lists
    html = html.replace(/(<li class="ml-6 mb-1 list-decimal">[\s\S]*?<\/li>)(?![\s]*<li class="ml-6 mb-1 list-decimal">)/g, (match) => {
      const items = match.match(/<li class="ml-6 mb-1 list-decimal">[\s\S]*?<\/li>/g);
      if (items && items.length > 0) {
        return '<ol class="my-4">' + items.join('') + '</ol>';
      }
      return match;
    });

    // Restore code blocks with styling
    codeBlocks.forEach((code, index) => {
      html = html.replace(
        `__CODEBLOCK_${index}__`,
        `<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4 border border-gray-300"><code class="text-sm font-mono text-gray-800 whitespace-pre">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
      );
    });

    // Restore HTML tables with enhanced styling
    htmlTables.forEach((table, index) => {
      // Add Tailwind classes to table elements
      const styledTable = table
        .replace(/<table/gi, '<table class="min-w-full border-collapse border border-gray-300 my-4 text-sm"')
        .replace(/<th/gi, '<th class="border border-gray-300 px-4 py-2 bg-indigo-100 font-bold text-left"')
        .replace(/<td/gi, '<td class="border border-gray-300 px-4 py-2"')
        .replace(/<tr/gi, '<tr class="hover:bg-gray-50"');
      html = html.replace(`__HTMLTABLE_${index}__`, styledTable);
    });

    // Restore markdown tables
    markdownTables.forEach((table, index) => {
      html = html.replace(`__MARKDOWNTABLE_${index}__`, table);
    });

    // Wrap in paragraph if not starting with a tag
    if (!html.startsWith('<')) {
      html = '<p class="mb-4">' + html + '</p>';
    }

    return html;
  };

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(children) }}
    />
  );
};

const AIBusinessAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [contextHelp, setContextHelp] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('claude');
  const [availableProviders, setAvailableProviders] = useState([]);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);

  // Get backend API URL from environment or default
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  // Generate dynamic context based on previous answers
  const getQuestionContext = (questionId) => {
    const contexts = {
      // Q1: BUSINESS SIZE
      company_stage: {
        title: "🎯 Understanding Your Starting Point",
        content: "Your company size determines your risk tolerance, budget constraints, and implementation complexity. Solopreneurs need simple, cost-effective solutions. Startups can move fast with cloud AI. Enterprises need robust security and compliance frameworks. Getting this right shapes everything that follows.",
        learnMore: "Solo/Small: Cloud AI ($5-50K/year). Startup: Cloud with safeguards ($30-200K). SMB: Hybrid approaches ($50-500K). Enterprise: On-premise or advanced hybrid ($200K-2M+)."
      },

      // Q2: INDUSTRY
      industry: {
        title: "🏭 Industry-Specific Considerations",
        content: (() => {
          const stage = responses.company_stage;
          if (stage === 'solo_freelance' || stage === 'startup_pre_revenue') {
            return "Your industry choices will affect future compliance requirements. Many consultants and freelancers work across multiple industries - select all that apply. Healthcare + Education consultant? Select both. This determines which regulations might apply and helps us give more accurate guidance. It's easier to build with the right security from the start than to retrofit later.";
          } else if (stage === 'enterprise') {
            return "Enterprises often operate across multiple industries or serve diverse clients. Select all industries where you handle sensitive data or have compliance requirements. A healthcare company might also have financial services (payment processing) and need both HIPAA and PCI compliance. Multiple industries mean multiple regulatory frameworks - we'll help you navigate this.";
          } else {
            return "Select ALL industries where your business operates or where your clients are. If you're a consultant serving both healthcare and legal clients, you need to follow BOTH sets of rules. If you're in SaaS and also process payments, that's both 'SaaS/Technology' and 'Financial Services'. Multiple industries = multiple compliance considerations, but we'll help prioritize what matters most.";
          }
        })(),
        learnMore: "Why multiple matters: Healthcare consultant to law firms needs HIPAA + attorney-client privilege protections. SaaS company processing payments needs SOC 2 + PCI DSS. Select all that apply to get comprehensive recommendations."
      },

      // Q3: YOUR BUSINESS LOCATION (NEW - SINGLE SELECT)
      business_location: {
        title: "🏢 Where YOUR Business Operates",
        content: (() => {
          const stage = responses.company_stage;
          const industries = responses.industry || [];

          if (stage === 'solo_freelance') {
            return "Even as a solopreneur, your location matters. This determines the BASE regulations that apply to YOU personally. US-based? You follow US laws. EU-based? GDPR applies to you by default. This is about where YOU are registered and operate from, not where your customers are (that's next question). Your location affects: 1) Which AI services you can access (some are region-restricted), 2) Your baseline compliance requirements, 3) Tax and legal structure.";
          } else if (industries.includes('healthcare') || industries.includes('legal')) {
            return "⚠️ CRITICAL for regulated industries: Your business location determines which regulatory bodies have jurisdiction over you. US healthcare? FDA + HHS oversight. EU healthcare? EMA + local authorities. This isn't just about data laws - it's about who regulates your business operations. Some AI services are only available in certain regions. China-based? Many US AI services are blocked. This is your PRIMARY location, where you're registered/headquartered.";
          } else {
            return "This is YOUR base of operations - where your company is registered and primarily operates. This determines: 1) Which data protection laws apply to YOUR operations, 2) Which AI services are accessible (some regions restrict certain providers), 3) Your baseline compliance requirements before considering customers. Next question asks about customer locations - that's separate and adds ADDITIONAL requirements. Choose ONE primary location.";
          }
        })(),
        learnMore: "Key difference: YOUR location = base regulations on you. Customer locations (next Q) = additional regulations. Example: US company with EU customers must follow BOTH US + GDPR laws."
      },

      // Q4: CUSTOMER LOCATIONS (NEW - MULTI SELECT)
      customer_locations: {
        title: "🌍 Where Your CUSTOMERS Are (CRITICAL!)",
        content: (() => {
          const businessLoc = responses.business_location;
          const stage = responses.company_stage;
          const industries = responses.industry || [];

          let warning = "";
          if (businessLoc === 'us' || businessLoc === 'canada') {
            warning = "⚠️ HUGE MISTAKE companies make: 'We're US-based, so we only follow US laws.' WRONG! If you have ANY EU customers, GDPR applies. If you have California customers, CCPA applies. Regulations follow your CUSTOMERS, not you. ";
          } else if (businessLoc === 'eu' || businessLoc === 'uk') {
            warning = "⚠️ As an EU/UK business, GDPR already applies to you. BUT if you serve US customers, you might need US state privacy laws (CCPA for California, etc.). If you serve Chinese customers, PIPL requires data to stay in China. ";
          } else if (businessLoc === 'china') {
            warning = "⚠️ China's PIPL has strict data localization. If you serve customers OUTSIDE China, you'll face significant restrictions on data transfers. Each region adds compliance complexity. ";
          }

          if (stage === 'startup_pre_revenue') {
            return warning + "Even pre-revenue, WHERE you plan to get customers matters. Planning to serve EU customers? Build GDPR-compliant from day one - retrofitting is 10x harder and more expensive. Planning global? You need to design for multiple jurisdictions now. Select ALL regions where you have or plan to have customers.";
          } else if (industries.includes('healthcare')) {
            return warning + "Healthcare + international = complex. US patients? HIPAA. EU patients? GDPR + medical device regulations. UK patients? UK GDPR + NHS requirements. Each country can have additional healthcare data rules. This isn't optional - patient data has the strictest protections globally. Select EVERY region where you have patients/customers.";
          } else if (industries.includes('finance')) {
            return warning + "Financial services are HEAVILY regulated by customer location. EU customers? MiFID II + GDPR. US customers? State-by-state requirements. Chinese customers? Data must stay in China. You need to comply with regulations in EVERY region where you have customers. Payment processing adds another layer (PCI DSS). Select all customer locations.";
          } else {
            return warning + "This is THE question most businesses get wrong. Your business location matters, but CUSTOMER locations determine most of your compliance burden. Here's the reality: US company + EU customers = MUST comply with GDPR (€20M fines). US company + California customers = MUST comply with CCPA. Chinese customers? Data localization required. Select ALL regions where you have paying customers OR free users whose data you process.";
          }
        })(),
        learnMore: "Real examples: US startup + EU customers = GDPR required (€20M or 4% revenue fines). UK company + California customers = CCPA. China customers = PIPL (data stays in China, limits AI options). Select ALL customer regions - regulations STACK."
      },

      // Q5: AI USAGE TYPE (MOVED UP - MULTI SELECT)
      ai_usage_type: {
        title: "🎯 The CRITICAL Split Decision",
        content: (() => {
          const industries = responses.industry || [];
          const customerLocs = responses.customer_locations || [];
          const hasEU = customerLocs.includes('eu');
          const hasChina = customerLocs.includes('china');

          let specificWarning = "";
          if (industries.includes('healthcare')) {
            specificWarning = "⚠️ HEALTHCARE ALERT: If patients interact with your AI (product AI), you need HIPAA BAA with vendors + much stricter security. If only internal staff use AI to write notes, requirements are looser. This distinction changes your costs by 10x.";
          } else if (industries.includes('legal')) {
            specificWarning = "⚠️ LEGAL ALERT: If clients' data goes into your AI (product), you risk privilege waiver. If only internal lawyers use AI to draft documents, it's safer. This choice is CRITICAL for legal ethics.";
          } else if (hasEU) {
            specificWarning = "⚠️ EU CUSTOMERS: Product AI (customer-facing) has much stricter GDPR requirements. Internal AI (employee tools) is easier. Many companies do BOTH - different security for different purposes.";
          } else if (hasChina) {
            specificWarning = "⚠️ CHINA CUSTOMERS: Product AI requires data to stay in China (limits AI options drastically). Internal AI for YOUR employees has more flexibility.";
          }

          return specificWarning + " This is THE most important question for cost and security. Two types of AI use:\n\n🔵 PRODUCT AI: Customers directly use AI features you build. Examples: AI chatbot on your website, AI-powered search, automated customer diagnosis. Requires: Higher security, BAA agreements, GDPR compliance, can cost $100K-$2M/year.\n\n🟢 INTERNAL AI: Your employees use AI tools to work better. Examples: ChatGPT for email writing, Claude for research, Copilot for coding. Requires: Basic security, ZDR agreements, much cheaper, $5K-$50K/year.\n\nMost companies need BOTH - and that's GOOD because you use different (cheaper) solutions for internal tools. Select both if you do both.";
        })(),
        learnMore: "Cost difference: Product AI (customer-facing) = $100K-$2M+/year for compliance + security. Internal AI (employee tools) = $5K-$50K/year. Most companies do BOTH with different solutions - this is smart strategy, not redundant."
      },

      // Q6: USE CASES (NOW CONTEXTUAL)
      use_cases: {
        title: "📋 Your Specific AI Applications",
        content: (() => {
          const aiTypes = responses.ai_usage_type || [];
          const hasProduct = aiTypes.includes('in_product');
          const hasInternal = aiTypes.includes('internal_productivity');

          if (hasProduct && hasInternal) {
            return "Since you selected BOTH product and internal AI, think about each use case carefully:\n\n🔵 PRODUCT Use Cases (customer-facing): Customer support chatbot, AI-powered search, automated document analysis for clients, AI features in your app.\n\n🟢 INTERNAL Use Cases (employee tools): Email writing, research assistance, code generation, report creation, data analysis.\n\nYour product use cases determine customer-facing costs and compliance. Your internal use cases can often use simpler, cheaper tools. Select all that apply from either category.";
          } else if (hasProduct) {
            return "🔵 You're building PRODUCT AI (customer-facing), so focus on use cases your CUSTOMERS will interact with. Each use case needs to handle customer data securely. Customer support chatbot? Needs GDPR compliance. AI-powered document analysis? Needs to protect client data. The use cases you select here determine which specific AI security measures you need and which vendors can support you. Think about what customers directly interact with.";
          } else if (hasInternal) {
            return "🟢 You're using AI for INTERNAL productivity (employee tools). Great! These use cases are simpler and cheaper because you control the data flow. Content creation for marketing? Low risk. Document processing for internal records? Medium risk. Code generation? Usually safe with proper tools. Select all the ways your TEAM will use AI - this is about employee productivity, not customer-facing features.";
          } else {
            return "Select all the ways you plan to use AI in your business. Different use cases have different security requirements. Public content creation is low risk. Processing customer data is high risk. Document analysis might involve sensitive information. We'll use your selections to recommend the right tools and security measures. Don't worry about being comprehensive - select what you know you'll do, we can adjust later.";
          }
        })(),
        learnMore: "Risk levels: Content creation (LOW) → Internal documents (MEDIUM) → Customer support (HIGH) → Healthcare/Legal document processing (CRITICAL). Your use cases + data type determine security approach."
      },

      // Q7: DATA TYPES (NOW WITH SMART WARNINGS)
      data_sensitivity: {
        title: "🔐 Data Classification - The Foundation",
        content: (() => {
          const industries = responses.industry || [];
          const aiTypes = responses.ai_usage_type || [];
          const customerLocs = responses.customer_locations || [];
          const hasEU = customerLocs.includes('eu');
          const hasProduct = aiTypes.includes('in_product');

          let criticalWarning = "";

          // Healthcare warnings
          if (industries.includes('healthcare')) {
            if (hasProduct) {
              criticalWarning = "⚠️⚠️ CRITICAL: As healthcare with PRODUCT AI (customer-facing), you WILL process Protected Health Information (PHI). This means: HIPAA Business Associate Agreement required, strict access controls, audit logs, encryption at rest and in transit. Even 'just patient names' is PHI. Violations start at $100 per record with $50,000 maximum per violation. Select 'PHI' below - don't underestimate this.";
            } else {
              criticalWarning = "⚠️ HEALTHCARE INTERNAL USE: Even if only your staff use AI, if they're processing patient records or medical notes, that's PHI and requires HIPAA compliance. Internal use has lighter requirements than customer-facing, but PHI is PHI. Select 'PHI' if any patient data touches your AI.";
            }
          }

          // Legal warnings
          else if (industries.includes('legal')) {
            if (hasProduct) {
              criticalWarning = "⚠️⚠️ CRITICAL: Legal work with PRODUCT AI means client data goes into your system. Attorney-client privilege is at stake - if not properly protected, privilege can be WAIVED. This is a career-ending risk. You need either: 1) Fully isolated AI (local/private), 2) AI vendors with attorney-client privilege protections. Select 'Attorney-Client Privileged' below - this is serious.";
            } else {
              criticalWarning = "⚠️ LEGAL INTERNAL USE: Lawyers using AI to draft documents or research must protect client confidentiality. While internal use is safer than client-facing tools, privileged information requires special handling. Most bar associations now have AI guidelines - check yours. Select 'Privileged' if client matters are processed.";
            }
          }

          // Finance warnings
          else if (industries.includes('finance')) {
            criticalWarning = "⚠️ FINANCIAL SERVICES: You'll handle sensitive financial data. Credit card numbers? PCI DSS required. Bank account info? GLBA compliance. Transaction records? Still PII requiring protection. Even 'just' customer investment portfolios are sensitive. If you process payments, PCI DSS is mandatory ($5K-$50K in fines per month of non-compliance). Select all data types that apply.";
          }

          // EU customer warnings
          else if (hasEU && hasProduct) {
            criticalWarning = "⚠️ EU CUSTOMERS + PRODUCT AI: Even basic customer data (names, emails) becomes 'personal data' under GDPR with strict requirements. Email address + IP address? That's PII under GDPR. EU regulations are strict - €20M or 4% of revenue in fines. You need proper consent, data processing agreements, and security measures. Don't underestimate 'basic' customer data with EU customers.";
          }

          return criticalWarning + "\n\nData classification is the FOUNDATION of your AI strategy. Different data types require different security approaches:\n\n🟢 PUBLIC: Marketing content, blogs, public info → ANY cloud AI works\n🟡 INTERNAL: Company documents, emails → Cloud AI with Zero Data Retention\n🟠 PII: Customer names, emails, addresses → Cloud AI with strong security OR gateway\n🔴 PHI/PRIVILEGED/FINANCIAL: Medical records, legal docs, payment data → Local AI OR highly secure cloud with BAAs\n🔴🔴 IP/TRADE SECRETS: Proprietary algorithms, competitive data → NEVER in cloud AI\n\nSelect ALL types you'll process. When in doubt, include it - better to over-protect than under-protect.";
        })(),
        learnMore: "Real costs by data type: PUBLIC ($0-5K/year) → INTERNAL ($5-30K) → PII ($30-100K) → PHI/LEGAL ($100-500K) → CRITICAL IP ($200K-2M). Data type = biggest cost driver."
      },

      // Q8: COMPLIANCE (NOW INTELLIGENT WITH PRE-SELECTION)
      compliance: {
        title: "⚖️ Understanding Your Compliance Requirements",
        content: (() => {
          const industries = responses.industry || [];
          const businessLoc = responses.business_location;
          const customerLocs = responses.customer_locations || [];
          const dataTypes = responses.data_sensitivity || [];
          const aiTypes = responses.ai_usage_type || [];

          // Determine REQUIRED compliance
          let requiredCompliance = [];
          let recommendedCompliance = [];
          let maybeNeeded = [];

          // HIPAA - REQUIRED if healthcare + PHI
          if (industries.includes('healthcare') && dataTypes.includes('phi')) {
            requiredCompliance.push({
              name: 'HIPAA',
              reason: 'Healthcare industry + processing PHI = HIPAA is MANDATORY (federal law)'
            });
          } else if (industries.includes('healthcare')) {
            recommendedCompliance.push({
              name: 'HIPAA',
              reason: 'Healthcare industry - likely needed if you process any patient data'
            });
          }

          // GDPR - REQUIRED if EU customers OR EU business location
          if (customerLocs.includes('eu') || businessLoc === 'eu') {
            requiredCompliance.push({
              name: 'GDPR',
              reason: customerLocs.includes('eu')
                ? 'EU customers = GDPR applies (€20M or 4% revenue fines)'
                : 'EU business location = GDPR applies automatically'
            });
          }

          // UK GDPR
          if (customerLocs.includes('uk') || businessLoc === 'uk') {
            requiredCompliance.push({
              name: 'UK GDPR',
              reason: 'UK customers or UK location = UK GDPR (post-Brexit version)'
            });
          }

          // CCPA - if California customers
          if (customerLocs.includes('us')) {
            maybeNeeded.push({
              name: 'CCPA/CPRA',
              reason: 'US customers - do you have California customers? If yes, CCPA required.'
            });
          }

          // PCI DSS - if financial + payment data
          if ((industries.includes('finance') || industries.includes('ecommerce')) &&
              dataTypes.includes('financial')) {
            requiredCompliance.push({
              name: 'PCI DSS',
              reason: 'Processing payment card data = PCI DSS required ($5K-$50K/month penalties)'
            });
          } else if (industries.includes('finance') || industries.includes('ecommerce')) {
            maybeNeeded.push({
              name: 'PCI DSS',
              reason: 'Financial/ecommerce - do you process credit card data? If yes, PCI DSS required.'
            });
          }

          // SOC 2 - if SaaS wanting enterprise sales
          if (industries.includes('saas') || aiTypes.includes('in_product')) {
            recommendedCompliance.push({
              name: 'SOC 2',
              reason: 'SaaS/Product AI - SOC 2 Type II needed to sell to enterprise customers (not legally required, but sales blocker)'
            });
          }

          // PIPL - China
          if (customerLocs.includes('china')) {
            requiredCompliance.push({
              name: 'PIPL (China)',
              reason: 'Chinese customers = data localization required (severely limits AI options)'
            });
          }

          // Build the contextual message
          let message = "Based on your profile, here's what applies to YOU:\n\n";

          if (requiredCompliance.length > 0) {
            message += "✅ REQUIRED FOR YOU:\n";
            requiredCompliance.forEach(item => {
              message += `• ${item.name}: ${item.reason}\n`;
            });
            message += "\n";
          }

          if (recommendedCompliance.length > 0) {
            message += "⚠️ STRONGLY RECOMMENDED:\n";
            recommendedCompliance.forEach(item => {
              message += `• ${item.name}: ${item.reason}\n`;
            });
            message += "\n";
          }

          if (maybeNeeded.length > 0) {
            message += "❓ MIGHT APPLY (you decide):\n";
            maybeNeeded.forEach(item => {
              message += `• ${item.name}: ${item.reason}\n`;
            });
            message += "\n";
          }

          if (requiredCompliance.length === 0 && recommendedCompliance.length === 0) {
            message += "Good news! Based on your selections, you might not have strict compliance requirements yet. However:\n\n";
            message += "• If you process ANY customer personal data (names, emails), basic data protection applies\n";
            message += "• Consider SOC 2 if you plan to sell to enterprise customers\n";
            message += "• Select 'None' if you truly have no compliance requirements, but err on the side of caution\n\n";
          }

          message += "Select ALL that apply. We'll help you prioritize and understand costs in the report.";

          return message;
        })(),
        learnMore: "Compliance cost ranges: HIPAA ($100-500K/year), GDPR ($30-200K), PCI DSS ($50-300K), SOC 2 ($30-150K), CCPA ($20-100K). Multiple compliance requirements STACK."
      },

      // Q9: TECHNICAL CAPABILITY
      technical_capability: {
        title: "🛠️ Your Technical Resources",
        content: (() => {
          const dataTypes = responses.data_sensitivity || [];
          const compliance = responses.compliance || [];
          const hasHighRisk = dataTypes.includes('phi') || dataTypes.includes('privileged') || dataTypes.includes('financial');
          const hasStrictCompliance = compliance.includes('hipaa') || compliance.includes('pci') || compliance.includes('gdpr');

          if (hasHighRisk || hasStrictCompliance) {
            return "⚠️ IMPORTANT: Based on your data sensitivity and compliance requirements, technical capability is CRITICAL. If you selected 'No IT Team', you'll need to hire managed services or consultants - you cannot implement HIPAA or GDPR compliance alone. Budget accordingly: No IT = add $50-150K/year for managed security. Small IT = likely need outside expertise for compliance ($30-80K for initial setup). Medium+ IT = can handle with some consulting support. Don't underestimate this - technical gaps are the #1 cause of compliance failures.";
          } else {
            return "Your technical capability determines implementation approach. No IT? You'll want turnkey cloud solutions with minimal setup. Small IT? Cloud with some customization. Large IT/DevOps? You can handle local AI or complex hybrid setups. This also affects training time: Basic users need 2-4 weeks, technical teams can deploy in days. Be honest here - overestimating capability leads to failed projects.";
          }
        })(),
        learnMore: "No IT: Cloud-only solutions, $5-50K/year, managed services. Small IT: Cloud with gateways, $30-200K. Medium IT: Hybrid possible, $50-500K. Large IT/DevOps: Any solution including on-premise, $100K-2M+."
      },

      // Q10: BUDGET
      budget: {
        title: "💰 Aligning Budget with Reality",
        content: (() => {
          const dataTypes = responses.data_sensitivity || [];
          const compliance = responses.compliance || [];
          const industries = responses.industry || [];
          const aiTypes = responses.ai_usage_type || [];

          const hasHighRisk = dataTypes.includes('phi') || dataTypes.includes('privileged');
          const hasStrictCompliance = compliance.includes('hipaa') || compliance.includes('pci');
          const hasProduct = aiTypes.includes('in_product');

          if (hasHighRisk || hasStrictCompliance) {
            return "⚠️⚠️ CRITICAL BUDGET REALITY CHECK: Based on your data sensitivity and compliance requirements, you'll need more than a basic cloud AI subscription. Let's be direct:\n\n🏥 Healthcare/Legal with Product AI: $150K-$500K first year (includes infrastructure, compliance, audits, training)\n💰 Financial services: $200K-$800K first year for hybrid setup\n\nThis isn't just software costs - it includes:\n• Secure infrastructure (cloud or local)\n• Compliance audits and legal review\n• Security assessments and penetration testing\n• Staff training and certification\n• BAA negotiations and contract reviews\n• Ongoing monitoring and updates\n\n⚠️ Underbudgeting is the #1 reason AI projects fail in regulated industries. If your budget is under $100K, you'll need to either: 1) Reduce scope (internal only, not product), 2) Delay until you have more budget, 3) Use bare-minimum solutions (risky). Be realistic.";
          } else if (dataTypes.includes('pii') || hasProduct) {
            return "You're handling customer PII or building product AI, so you can't just use ChatGPT directly. Good news: You don't necessarily need expensive on-premise solutions.\n\nRealistic budget ranges:\n• Basic Product AI with PII: $30-100K/year\n• Internal AI with customer data: $10-50K/year\n• Both product + internal: $50-200K/year\n\nThis includes:\n• AI service costs (cloud with Zero Data Retention OR gateway)\n• Security tools and monitoring\n• Integration and development work\n• Team training (don't skip this!)\n• Legal review of vendor contracts\n\nDon't lowball - data breaches cost $4.5M average, plus reputation damage.";
          } else {
            return "Without highly sensitive data or strict compliance, you have flexibility! Cloud AI is cost-effective and fast to implement.\n\nBudget guidance:\n• Solo/Small: $5-20K/year (basic cloud tools)\n• Startup/SMB: $20-100K/year (cloud + some security)\n• Enterprise: $100-500K+ (depends on scale)\n\nInclude these costs:\n• AI service subscriptions ($5-50K)\n• Training for your team ($5-20K) - DON'T SKIP\n• Integration work ($10-50K)\n• Monitoring and management ($5-20K)\n\nMost companies underspend on training and overspend on tools. Start small, prove ROI, then scale up.";
          }
        })(),
        learnMore: "Budget breakdown: Software (30-40%), Infrastructure (20-30%), Training (10-15%), Compliance/Legal (15-25%), Ongoing support (10-20%). First year is always more expensive than ongoing."
      },

      // Q11: TIMELINE
      timeline: {
        title: "⏱️ Implementation Timeline Reality Check",
        content: (() => {
          const compliance = responses.compliance || [];
          const dataTypes = responses.data_sensitivity || [];
          const techCapability = responses.technical_capability || '';
          const aiTypes = responses.ai_usage_type || [];

          const hasStrictCompliance = compliance.includes('hipaa') || compliance.includes('pci') || compliance.includes('gdpr');
          const hasHighRisk = dataTypes.includes('phi') || dataTypes.includes('privileged');
          const lowTech = techCapability === 'no_it' || techCapability === 'small_it';
          const hasProduct = aiTypes.includes('in_product');

          let timelineGuidance = "";

          if (hasStrictCompliance && hasHighRisk && hasProduct) {
            timelineGuidance = "⚠️⚠️ REALITY CHECK: You have strict compliance + sensitive data + product AI. This combination CANNOT be rushed safely.\n\n❌ 1-4 weeks: IMPOSSIBLE - don't even try\n⚠️ 1-3 months: Only possible for internal tools, NOT product AI\n✅ 3-6 months: Minimum realistic timeline for compliant product AI\n✅✅ 6-12 months: RECOMMENDED for proper implementation\n\nWhy it takes time:\n• Legal review: 2-4 weeks\n• Security architecture design: 3-6 weeks\n• Infrastructure setup: 4-8 weeks\n• Compliance audits: 4-6 weeks\n• Testing and validation: 3-4 weeks\n• Staff training: 2-4 weeks\n\nRushing healthcare/legal AI leads to violations and lawsuits. Take the time to do it right.";
          } else if (hasStrictCompliance || hasHighRisk) {
            timelineGuidance = "⚠️ With compliance requirements or sensitive data, you need time for proper setup:\n\n❌ 1-4 weeks: Too fast for compliant implementation\n⚠️ 1-3 months: Possible for internal tools, rushed for product AI\n✅ 3-6 months: Good timeline for most implementations\n✅ 6-12 months: Ideal for complex setups\n\nKey phases:\n• Requirements + vendor selection: 3-4 weeks\n• Legal/compliance review: 2-4 weeks\n• Infrastructure setup: 4-8 weeks\n• Testing: 2-4 weeks\n• Training + rollout: 2-3 weeks\n\nYou CAN move faster for internal tools, slower for customer-facing features.";
          } else if (lowTech) {
            timelineGuidance = "Limited technical resources means you'll want managed solutions:\n\n✅ 1-4 weeks: Possible for basic cloud tools (internal use)\n✅ 1-3 months: Typical for cloud AI with good vendors\n⚠️ 3-6+ months: If you need custom integration\n\nWith limited IT, your timeline depends on vendor selection. Turnkey solutions like Microsoft 365 Copilot can deploy in days. Custom implementations take months. Choose based on your urgency vs control needs.";
          } else if (hasProduct) {
            timelineGuidance = "Product AI (customer-facing) requires careful rollout:\n\n⚠️ 1-4 weeks: Only for MVP/beta with limited users\n✅ 1-3 months: Good for startup product features\n✅ 3-6 months: Standard for SMB/enterprise products\n✅ 6-12 months: If extensive integration needed\n\nProduct AI can't be rushed because:\n• Customer-facing bugs damage reputation\n• Need thorough testing with real scenarios\n• Requires user acceptance testing\n• Must monitor performance closely\n\nYou can deploy internal AI much faster than product AI.";
          } else {
            timelineGuidance = "Internal AI tools (employee productivity) can move faster:\n\n✅ 1-4 weeks: Possible for basic cloud tools (ChatGPT, Claude)\n✅ 1-3 months: Standard for company-wide rollout\n⚠️ 3-6 months: If extensive training or integration needed\n✅ 6-12 months: For complex custom solutions\n\nInternal tools are lower risk, so you can pilot quickly:\n• Week 1-2: Pilot with 5-10 users\n• Week 3-4: Expand to department\n• Month 2-3: Company-wide rollout\n• Ongoing: Optimize and add features\n\nStart fast with cloud tools, prove value, then decide if you need more.";
          }

          return timelineGuidance;
        })(),
        learnMore: "Timeline factors: Compliance adds 2-4 months. Custom integration adds 1-3 months. Limited IT adds 1-2 months. Multiple locations adds 1-2 months. Product AI adds 2-6 months vs internal tools."
      }
    };

    return contexts[questionId] || {
      title: "ℹ️ Context Help",
      content: "This helps us understand your specific situation better.",
      learnMore: ""
    };
  };

  // Effect to update context when step changes
  useEffect(() => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion) {
      const context = getQuestionContext(currentQuestion.id);
      setContextHelp(context);
    }
  }, [currentStep, responses]);

  // Fetch available providers on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/providers`);
        if (response.ok) {
          const data = await response.json();
          setAvailableProviders(data.providers.filter(p => p.available));
          setSelectedProvider(data.default);
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error);
      }
    };
    fetchProviders();
  }, [BACKEND_URL]);

  // UPDATED QUESTIONS ARRAY - NEW ORDER WITH SPLIT LOCATION
  const questions = [
    // Q1: BUSINESS SIZE (SINGLE)
    {
      id: 'company_stage',
      question: 'What is your business size?',
      type: 'single',
      options: [
        { value: 'solo_freelance', label: 'Solo/Freelancer', description: '1 person, minimal budget' },
        { value: 'startup_pre_revenue', label: 'Startup (Pre-revenue)', description: 'Building product, no customers yet' },
        { value: 'startup_seed', label: 'Startup (Seed/Series A)', description: 'Early customers, <50 employees' },
        { value: 'smb', label: 'SMB (Small-Medium Business)', description: '50-500 employees' },
        { value: 'enterprise', label: 'Enterprise', description: '500+ employees' }
      ]
    },

    // Q2: INDUSTRY (MULTI - NEW!)
    {
      id: 'industry',
      question: 'What industry/industries do you operate in? (Select all that apply)',
      type: 'multiple',
      options: [
        { value: 'healthcare', label: 'Healthcare', description: 'Medical, dental, mental health, therapy' },
        { value: 'legal', label: 'Legal', description: 'Law firms, legal services, attorney work' },
        { value: 'finance', label: 'Financial Services', description: 'Banking, fintech, investment, accounting' },
        { value: 'saas', label: 'SaaS/Technology', description: 'Software, tech services, IT' },
        { value: 'ecommerce', label: 'E-commerce/Retail', description: 'Online or retail sales' },
        { value: 'education', label: 'Education', description: 'Schools, training, educational services' },
        { value: 'consulting', label: 'Consulting', description: 'Business consulting, advisory services' },
        { value: 'other', label: 'Other', description: 'Other industry' }
      ]
    },

    // Q3: YOUR BUSINESS LOCATION (SINGLE - NEW!)
    {
      id: 'business_location',
      question: 'Where is YOUR business primarily based/registered?',
      type: 'single',
      options: [
        { value: 'us', label: 'United States', description: 'US-based company/sole proprietor' },
        { value: 'eu', label: 'European Union', description: 'EU-based business (any EU country)' },
        { value: 'uk', label: 'United Kingdom', description: 'UK-based business (post-Brexit)' },
        { value: 'canada', label: 'Canada', description: 'Canadian business' },
        { value: 'australia', label: 'Australia/New Zealand', description: 'AU/NZ based business' },
        { value: 'china', label: 'China', description: 'China-based business' },
        { value: 'latam', label: 'Latin America', description: 'Based in LATAM (Brazil, Mexico, etc.)' },
        { value: 'other', label: 'Other', description: 'Other country/region' }
      ]
    },

    // Q4: CUSTOMER LOCATIONS (MULTI - NEW!)
    {
      id: 'customer_locations',
      question: 'Where are your CUSTOMERS located? (Select ALL regions where you have customers)',
      type: 'multiple',
      options: [
        { value: 'us', label: 'United States', description: 'US customers (triggers state laws like CCPA)' },
        { value: 'eu', label: 'European Union', description: 'EU customers (triggers GDPR - €20M fines)' },
        { value: 'uk', label: 'United Kingdom', description: 'UK customers (UK GDPR post-Brexit)' },
        { value: 'canada', label: 'Canada', description: 'Canadian customers (PIPEDA)' },
        { value: 'australia', label: 'Australia/New Zealand', description: 'AU/NZ customers (Privacy Act)' },
        { value: 'china', label: 'China', description: 'Chinese customers (PIPL - data localization!)' },
        { value: 'latam', label: 'Latin America', description: 'LATAM customers (LGPD in Brazil, etc.)' },
        { value: 'global', label: 'Global/Worldwide', description: 'Customers in many regions' }
      ]
    },

    // Q5: AI USAGE TYPE (MOVED UP, MULTI)
    {
      id: 'ai_usage_type',
      question: 'How will AI be used in your business? (Select all that apply)',
      type: 'multiple',
      options: [
        { value: 'in_product', label: '🔵 In Our Product/Service (Customer-Facing)', description: 'AI features that customers directly interact with - chatbots, AI search, automated analysis in your app' },
        { value: 'internal_productivity', label: '🟢 Internal Team Productivity (Employee Tools)', description: 'Employees using AI to work better - writing, research, coding, data analysis' }
      ]
    },

    // Q6: USE CASES (MULTI)
    {
      id: 'use_cases',
      question: 'What specific AI use cases do you have? (Select all that apply)',
      type: 'multiple',
      options: [
        { value: 'content', label: 'Content Creation', description: 'Marketing, writing, social media, blogs' },
        { value: 'customer_support', label: 'Customer Support', description: 'Chatbots, ticket responses, FAQ automation' },
        { value: 'data_analysis', label: 'Data Analysis', description: 'Reports, insights, analytics, dashboards' },
        { value: 'document_processing', label: 'Document Processing', description: 'Contracts, forms, records, document review' },
        { value: 'coding', label: 'Code Generation', description: 'Development assistance, code review, debugging' },
        { value: 'research', label: 'Research & Analysis', description: 'Market research, competitive intelligence' },
        { value: 'automation', label: 'Process Automation', description: 'Workflows, repetitive tasks, data entry' },
        { value: 'training', label: 'Training & Education', description: 'Employee training, learning materials' }
      ]
    },

    // Q7: DATA TYPES (MULTI)
    {
      id: 'data_sensitivity',
      question: 'What type of data will AI process? (Select all that apply)',
      type: 'multiple',
      options: [
        { value: 'public', label: 'Public/Marketing Content', description: 'Blog posts, social media, public-facing content' },
        { value: 'internal', label: 'Internal Business Data', description: 'Company documents, emails, internal reports' },
        { value: 'pii', label: 'Customer PII', description: 'Names, emails, addresses, phone numbers' },
        { value: 'phi', label: 'Protected Health Info (PHI)', description: 'Medical records, patient data, health information' },
        { value: 'privileged', label: 'Attorney-Client Privileged', description: 'Legal documents, case files, client communications' },
        { value: 'financial', label: 'Financial/Payment Data', description: 'Bank accounts, credit cards, transactions' },
        { value: 'ip', label: 'Trade Secrets/IP', description: 'Proprietary algorithms, formulas, competitive data' }
      ]
    },

    // Q8: COMPLIANCE (MULTI - NOW INTELLIGENT)
    {
      id: 'compliance',
      question: 'What compliance requirements apply to you? (We\'ve pre-identified some based on your profile)',
      type: 'multiple',
      options: [
        { value: 'none', label: 'None', description: 'No specific compliance requirements' },
        { value: 'hipaa', label: 'HIPAA', description: 'US healthcare data protection (PHI)' },
        { value: 'gdpr', label: 'GDPR', description: 'EU data protection (€20M or 4% revenue fines)' },
        { value: 'uk_gdpr', label: 'UK GDPR', description: 'UK data protection (post-Brexit)' },
        { value: 'pci', label: 'PCI DSS', description: 'Payment card data security' },
        { value: 'soc2', label: 'SOC 2', description: 'Service organization controls (enterprise sales)' },
        { value: 'ccpa', label: 'CCPA/CPRA', description: 'California privacy law' },
        { value: 'pipl', label: 'PIPL', description: 'China data localization' },
        { value: 'other', label: 'Other regulations', description: 'Industry-specific or regional' }
      ]
    },

    // Q9: TECHNICAL CAPABILITY (SINGLE)
    {
      id: 'technical_capability',
      question: 'What is your technical capability?',
      type: 'single',
      options: [
        { value: 'no_it', label: 'No IT Team', description: 'No dedicated technical staff - need turnkey solutions' },
        { value: 'small_it', label: 'Small IT (1-2 people)', description: 'Limited technical resources' },
        { value: 'medium_it', label: 'Medium IT (3-10 people)', description: 'Moderate technical capability' },
        { value: 'large_it', label: 'Large IT (10+ people)', description: 'Strong technical team' },
        { value: 'devops', label: 'Advanced DevOps/Engineering', description: 'Expert technical capabilities' }
      ]
    },

    // Q10: BUDGET (SINGLE)
    {
      id: 'budget',
      question: 'What is your annual AI budget?',
      type: 'single',
      options: [
        { value: 'under_10k', label: 'Under $10,000', description: 'Very limited budget, basic cloud tools only' },
        { value: '10k_50k', label: '$10,000 - $50,000', description: 'Small budget, cloud solutions' },
        { value: '50k_200k', label: '$50,000 - $200,000', description: 'Medium budget, cloud + security' },
        { value: '200k_500k', label: '$200,000 - $500,000', description: 'Large budget, hybrid options' },
        { value: 'over_500k', label: 'Over $500,000', description: 'Enterprise budget, any solution' }
      ]
    },

    // Q11: TIMELINE (SINGLE)
    {
      id: 'timeline',
      question: 'What is your implementation timeline?',
      type: 'single',
      options: [
        { value: 'urgent', label: 'Urgent (1-4 weeks)', description: 'Need to start immediately, accepting limitations' },
        { value: 'fast', label: 'Fast (1-3 months)', description: 'Want to move quickly but properly' },
        { value: 'moderate', label: 'Moderate (3-6 months)', description: 'Standard timeline, balanced approach' },
        { value: 'patient', label: 'Patient (6-12 months)', description: 'Can take time to do it perfectly' }
      ]
    }
  ];

  const handleResponse = (questionId, value, isMultiple = false) => {
    setResponses(prev => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        if (current.includes(value)) {
          return { ...prev, [questionId]: current.filter(v => v !== value) };
        }
        return { ...prev, [questionId]: [...current, value] };
      }
      return { ...prev, [questionId]: value };
    });
  };

  const analyzeWithClaude = async () => {
    setLoading(true);
    try {
      // Call secure backend proxy instead of direct API
      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          responses,
          provider: selectedProvider
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Analysis failed');
      }

      setAnalysis(data.analysis);
      setAnalysisMetadata(data.metadata);
      setShowReport(true);
    } catch (error) {
      console.error("Error analyzing with AI:", error);
      setAnalysis(`# Error Generating Analysis\n\n${error.message}\n\nPlease check:\n- Backend server is running\n- You have internet connection\n- Backend has valid API keys configured\n\nIf the problem persists, contact support.`);
      setShowReport(true);
    } finally {
      setLoading(false);
    }
  };


  const downloadPDF = () => {
    const element = document.createElement('a');
    const file = new Blob([analysis], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'ai-implementation-report.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  const currentResponse = responses[currentQuestion?.id];
  const canProceed = currentQuestion?.type === 'multiple'
    ? currentResponse && currentResponse.length > 0
    : currentResponse !== undefined;

  if (showReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Your AI Implementation Report</h1>
              <p className="text-gray-600">Personalized recommendations based on your business profile</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  <Download size={20} />
                  Download Report
                </button>
                <button
                  onClick={() => {
                    setShowReport(false);
                    setCurrentStep(0);
                    setResponses({});
                  }}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Start New Assessment
                </button>
              </div>
            </div>

            {analysisMetadata && (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6 mb-6">
                <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <DollarSign size={20} />
                  Analysis Cost & Performance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-green-700">Provider:</span>
                    <p className="text-green-600">{analysisMetadata.provider}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-green-700">Cost:</span>
                    <p className="text-green-600">${analysisMetadata.cost.total.toFixed(4)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-green-700">Tokens:</span>
                    <p className="text-green-600">{analysisMetadata.tokens.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-green-700">Duration:</span>
                    <p className="text-green-600">{(analysisMetadata.duration / 1000).toFixed(1)}s</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-indigo-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Your Business Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Business Size:</span>
                  <p className="text-gray-600">{responses.company_stage}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Industries:</span>
                  <p className="text-gray-600">{Array.isArray(responses.industry) ? responses.industry.join(', ') : responses.industry}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Business Location:</span>
                  <p className="text-gray-600">{responses.business_location}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Customer Locations:</span>
                  <p className="text-gray-600">{responses.customer_locations?.join(', ')}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">AI Usage:</span>
                  <p className="text-gray-600">{responses.ai_usage_type?.join(', ')}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Budget Range:</span>
                  <p className="text-gray-600">{responses.budget}</p>
                </div>
              </div>
            </div>

            {analysis && (
              <div className="mt-8">
                <div className="prose max-w-none text-gray-700">
                  <MarkdownText>{analysis}</MarkdownText>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">AI Business Assessment Tool</h1>
          <p className="text-xl text-gray-600">Get personalized recommendations for implementing AI in your business</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(((currentStep + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
              <p className="text-xl font-medium text-gray-700">Analyzing your responses with Claude AI...</p>
              <p className="text-sm text-gray-500 mt-2">This will take about 30-60 seconds</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-indigo-100 rounded-full p-3 flex-shrink-0">
                    <span className="text-2xl font-bold text-indigo-700">{currentStep + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentQuestion.question}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {currentQuestion.type === 'multiple'
                        ? '📋 Select all that apply'
                        : '🎯 Select one option'}
                    </p>
                  </div>
                </div>

                {contextHelp && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-5 mt-4">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Info size={20} />
                      {contextHelp.title}
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed mb-3">{contextHelp.content}</p>
                    {contextHelp.learnMore && (
                      <details className="text-sm">
                        <summary className="cursor-pointer font-semibold text-blue-700 hover:text-blue-900">
                          💡 Learn more...
                        </summary>
                        <p className="mt-2 text-blue-700 pl-4 border-l-2 border-blue-300">
                          {contextHelp.learnMore}
                        </p>
                      </details>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.type === 'multiple'
                    ? (responses[currentQuestion.id] || []).includes(option.value)
                    : responses[currentQuestion.id] === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleResponse(currentQuestion.id, option.value, currentQuestion.type === 'multiple')}
                      className={`w-full text-left p-5 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 shadow-md'
                          : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {currentQuestion.type === 'multiple' && (
                <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
                  <Info size={16} />
                  Select all that apply - you can choose multiple options
                </p>
              )}
            </>
          )}

          {isLastStep && availableProviders.length > 0 && (
            <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-indigo-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign size={20} />
                Choose AI Provider (Cost Optimization)
              </h3>
              <div className="space-y-3">
                {availableProviders.map((provider) => {
                  const estimatedCost = ((provider.costPer1M.input * 1.5 + provider.costPer1M.output * 3) / 1000).toFixed(3);
                  const isSelected = selectedProvider === provider.id;

                  return (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 shadow-md'
                          : 'border-gray-300 hover:border-indigo-400 hover:bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-900">{provider.name}</div>
                          <div className="text-sm text-gray-600">{provider.model}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">~${estimatedCost}</div>
                          <div className="text-xs text-gray-500">per analysis</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                All providers generate equivalent quality analysis. Choose based on your budget.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
              Previous
            </button>

            {isLastStep ? (
              <button
                onClick={analyzeWithClaude}
                disabled={!canProceed}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Generate My Report
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBusinessAssessment;
