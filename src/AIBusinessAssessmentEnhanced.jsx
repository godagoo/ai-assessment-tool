/**
 * AI Business Assessment Tool - ENHANCED VERSION
 * Professional McKinsey-Style Reports with Charts & Advanced PDF
 *
 * Features:
 * - Beautiful PDF with tables, charts, and exhibits
 * - Markdown export for easy editing
 * - Professional consulting firm formatting
 * - Cost breakdown charts
 * - Implementation timeline visualization
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle, CheckCircle, Loader2, Download, FileText,
  ArrowRight, ArrowLeft, Info, TrendingUp, DollarSign,
  Calendar, Shield, Users, Zap
} from 'lucide-react';

// Simple Markdown Text Component
const MarkdownText = ({ children }) => {
  return (
    <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
      {children}
    </div>
  );
};

// Chart Component for Cost Visualization
const CostBreakdownChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
      <h3 className="font-bold text-lg text-gray-900 mb-4">Cost Breakdown Analysis</h3>
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">{item.label}</span>
            <span className="font-bold text-indigo-600">€{(item.value / 1000).toFixed(1)}K</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Timeline Component
const ImplementationTimeline = ({ phases }) => {
  return (
    <div className="p-6 bg-white rounded-lg border-2 border-gray-200">
      <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-indigo-600" />
        Implementation Timeline
      </h3>
      <div className="space-y-6">
        {phases.map((phase, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              {index < phases.length - 1 && (
                <div className="w-0.5 h-full bg-indigo-200 mt-2" />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-gray-900">{phase.title}</h4>
                <span className="text-sm text-gray-500">({phase.duration})</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
              <div className="flex flex-wrap gap-2">
                {phase.deliverables.map((deliverable, idx) => (
                  <span key={idx} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                    {deliverable}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Professional Table Component
const ExhibitTable = ({ title, headers, rows, caption }) => {
  return (
    <div className="my-8">
      <h4 className="font-bold text-gray-900 mb-3">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-3 text-left text-sm font-semibold text-white">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-sm text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <p className="text-xs text-gray-500 mt-2 italic">{caption}</p>
      )}
    </div>
  );
};

// Key Metrics Cards
const MetricCard = ({ icon: Icon, label, value, trend, color = "indigo" }) => {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600"
  };

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

// Enhanced Professional Report Component
const EnhancedProfessionalReport = ({ responses, analysis, metadata }) => {
  const reportRef = useRef(null);

  // Sample data structures
  const costData = [
    { label: 'Customer-Facing AI', value: 30000 },
    { label: 'Internal Productivity AI', value: 15000 },
    { label: 'Compliance & Legal', value: 8000 },
    { label: 'Implementation & Training', value: 5000 }
  ];

  const timelinePhases = [
    {
      title: "Phase 1: Internal AI Foundation",
      duration: "Weeks 1-4",
      description: "Deploy internal productivity tools with immediate ROI",
      deliverables: ["M365 Copilot", "GitHub Copilot", "Training Sessions"]
    },
    {
      title: "Phase 2: Compliance Setup",
      duration: "Weeks 5-8",
      description: "Establish legal framework and vendor agreements",
      deliverables: ["DPAs Signed", "AI Gateway Setup", "Policy Documentation"]
    },
    {
      title: "Phase 3: Customer AI Integration",
      duration: "Weeks 9-16",
      description: "Launch customer-facing AI capabilities",
      deliverables: ["Beta Testing", "Full Rollout", "Monitoring Dashboard"]
    }
  ];

  const generateAdvancedMarkdown = () => {
    const date = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return `# AI IMPLEMENTATION STRATEGY
## Enterprise Deployment Roadmap

**CONFIDENTIAL**
Prepared for: ${metadata?.clientName || 'Your Organization'}
Date: ${date}

---

## 📊 KEY METRICS AT A GLANCE

- **Total Year 1 Investment:** €${(costData.reduce((sum, item) => sum + item.value, 0) / 1000).toFixed(0)}K
- **Expected ROI:** 12-15× in productivity gains
- **Implementation Timeline:** 4 months to full deployment
- **Compliance Coverage:** Multi-jurisdictional (GDPR, CCPA, UK GDPR)

---

${analysis}

---

## 💰 COST BREAKDOWN

${costData.map(item => `- **${item.label}:** €${(item.value / 1000).toFixed(0)}K`).join('\n')}

**Total Year 1:** €${(costData.reduce((sum, item) => sum + item.value, 0) / 1000).toFixed(0)}K

---

## 📅 IMPLEMENTATION PHASES

${timelinePhases.map((phase, idx) => `
### Phase ${idx + 1}: ${phase.title}
**Duration:** ${phase.duration}
**Description:** ${phase.description}
**Key Deliverables:** ${phase.deliverables.join(', ')}
`).join('\n')}

---

## 🎯 RECOMMENDED NEXT STEPS

1. **Week 1:** Deploy internal productivity AI (M365 Copilot)
2. **Week 2:** Initiate vendor negotiations for AI Gateway
3. **Week 3:** Draft comprehensive AI governance policy
4. **Week 4:** Begin compliance documentation process

---

**Report prepared by AI Productivity Hub**
**Contact:** hello@goda.go
**Website:** [AI Productivity Hub](https://www.goda.go)

---

*This document contains confidential and proprietary information. Not for distribution.*`;
  };

  const downloadMarkdown = () => {
    const markdown = generateAdvancedMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Strategy-Report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAdvancedPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      const addPageNumber = () => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(150);
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
          );
        }
      };

      // COVER PAGE
      doc.setFillColor(49, 46, 129);
      doc.rect(0, 0, pageWidth, 90, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(36);
      doc.setFont('helvetica', 'bold');
      doc.text('AI IMPLEMENTATION', pageWidth / 2, 35, { align: 'center' });
      doc.text('STRATEGY', pageWidth / 2, 52, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Enterprise Deployment Roadmap', pageWidth / 2, 70, { align: 'center' });

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(11);
      yPos = 110;
      doc.setFont('helvetica', 'bold');
      doc.text('CONFIDENTIAL', margin, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Prepared for: ${metadata?.clientName || 'Your Organization'}`, margin, yPos);
      yPos += 7;
      doc.text(`Date: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, margin, yPos);
      yPos += 7;
      doc.text(`Prepared by: AI Productivity Hub`, margin, yPos);

      yPos = 145;
      const boxWidth = (pageWidth - 3 * margin) / 2;
      const boxHeight = 25;

      doc.setFillColor(238, 242, 255);
      doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, 'F');
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('YEAR 1 INVESTMENT', margin + 5, yPos + 8);
      doc.setFontSize(18);
      doc.text(`€${(costData.reduce((sum, item) => sum + item.value, 0) / 1000).toFixed(0)}K`, margin + 5, yPos + 18);

      doc.setFillColor(220, 252, 231);
      doc.roundedRect(margin + boxWidth + margin, yPos, boxWidth, boxHeight, 3, 3, 'F');
      doc.setTextColor(22, 163, 74);
      doc.setFontSize(9);
      doc.text('EXPECTED ROI', margin + boxWidth + margin + 5, yPos + 8);
      doc.setFontSize(18);
      doc.text('12-15×', margin + boxWidth + margin + 5, yPos + 18);

      yPos += boxHeight + 10;

      doc.setFillColor(243, 232, 255);
      doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, 'F');
      doc.setTextColor(147, 51, 234);
      doc.setFontSize(9);
      doc.text('IMPLEMENTATION', margin + 5, yPos + 8);
      doc.setFontSize(18);
      doc.text('4 Months', margin + 5, yPos + 18);

      doc.setFillColor(219, 234, 254);
      doc.roundedRect(margin + boxWidth + margin, yPos, boxWidth, boxHeight, 3, 3, 'F');
      doc.setTextColor(37, 99, 235);
      doc.setFontSize(9);
      doc.text('COMPLIANCE', margin + boxWidth + margin + 5, yPos + 8);
      doc.setFontSize(18);
      doc.text('Multi-Jurisdictional', margin + boxWidth + margin + 5, yPos + 18);

      // EXECUTIVE SUMMARY
      doc.addPage();
      yPos = margin;

      doc.setFillColor(79, 70, 229);
      doc.rect(0, yPos - 5, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE SUMMARY', margin, yPos + 5);

      yPos += 25;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const summaryText = analysis.substring(0, 800);
      const lines = doc.splitTextToSize(summaryText, pageWidth - 2 * margin);
      doc.text(lines, margin, yPos);

      // COST BREAKDOWN TABLE
      doc.addPage();
      yPos = margin;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Exhibit 1: Year 1 Investment Breakdown', margin, yPos);
      yPos += 10;

      const tableData = costData.map(item => [
        item.label,
        `€${(item.value / 1000).toFixed(1)}K`,
        `${((item.value / costData.reduce((s, i) => s + i.value, 0)) * 100).toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Cost Component', 'Amount', '% of Total']],
        body: tableData,
        foot: [[
          'Total Year 1 Investment',
          `€${(costData.reduce((sum, item) => sum + item.value, 0) / 1000).toFixed(1)}K`,
          '100%'
        ]],
        theme: 'grid',
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11
        },
        footStyles: {
          fillColor: [238, 242, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: margin, right: margin }
      });

      // TIMELINE
      doc.addPage();
      yPos = margin;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Exhibit 2: Implementation Timeline', margin, yPos);
      yPos += 15;

      timelinePhases.forEach((phase, index) => {
        doc.setFillColor(79, 70, 229);
        doc.circle(margin + 5, yPos, 4, 'F');

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(phase.title, margin + 15, yPos + 1);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(phase.duration, margin + 15, yPos + 7);

        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        const descLines = doc.splitTextToSize(phase.description, pageWidth - margin - 30);
        doc.text(descLines, margin + 15, yPos + 13);

        yPos += 25;

        if (index < timelinePhases.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(margin + 5, yPos - 18, margin + 5, yPos - 5);
        }
      });

      // FOOTER
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text(
        'Confidential and Proprietary – Not for Distribution',
        pageWidth / 2,
        pageHeight - 20,
        { align: 'center' }
      );

      addPageNumber();
      doc.save(`AI-Strategy-Report-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF generation failed. Please try again or download Markdown instead.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Download Action Bar */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">🎉 Your Strategy Report is Ready!</h1>
              <p className="text-indigo-100">
                Professional McKinsey-style report with charts, tables, and actionable recommendations
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={downloadAdvancedPDF}
                className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl group"
              >
                <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div>Download PDF</div>
                  <div className="text-xs font-normal opacity-75">Professional Format</div>
                </div>
              </button>

              <button
                onClick={downloadMarkdown}
                className="flex items-center gap-2 bg-indigo-800 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-900 transition-all shadow-lg hover:shadow-xl group"
              >
                <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div>Download Markdown</div>
                  <div className="text-xs font-normal opacity-75">Editable Format</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={DollarSign}
            label="Year 1 Investment"
            value={`€${(costData.reduce((sum, item) => sum + item.value, 0) / 1000).toFixed(0)}K`}
            color="indigo"
          />
          <MetricCard
            icon={TrendingUp}
            label="Expected ROI"
            value="12-15×"
            trend="+380%"
            color="green"
          />
          <MetricCard
            icon={Calendar}
            label="Implementation"
            value="4 Months"
            color="purple"
          />
          <MetricCard
            icon={Shield}
            label="Compliance"
            value="Multi-Jurisdiction"
            color="blue"
          />
        </div>

        {/* Professional Report Preview */}
        <div ref={reportRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">

          {/* Report Header */}
          <div className="bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 text-white p-12">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block bg-red-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
                CONFIDENTIAL
              </div>
              <h1 className="text-5xl font-bold mb-4">
                AI IMPLEMENTATION STRATEGY
              </h1>
              <p className="text-2xl text-gray-300 mb-8">
                Enterprise Deployment Roadmap
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-1">Prepared For</div>
                  <div className="font-semibold">{metadata?.clientName || 'Your Organization'}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-1">Date</div>
                  <div className="font-semibold">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-1">Prepared By</div>
                  <div className="font-semibold">AI Productivity Hub</div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Body */}
          <div className="p-8 md:p-12">
            <div className="max-w-5xl mx-auto space-y-12">

              {/* Executive Summary */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-4 border-indigo-600">
                  EXECUTIVE SUMMARY
                </h2>
                <div className="prose prose-lg max-w-none">
                  <MarkdownText>{analysis.substring(0, 1200)}</MarkdownText>
                </div>
              </section>

              {/* Cost Breakdown Visualization */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-4 border-indigo-600">
                  FINANCIAL OVERVIEW
                </h2>
                <CostBreakdownChart data={costData} />

                <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-500 rounded-full p-3">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 mb-2">Strong ROI Projection</h3>
                      <p className="text-green-800 text-sm">
                        Expected productivity gains of 15-20% translate to <strong>€180K-240K annual value</strong> for a
                        20-person team, delivering <strong>12-15× ROI</strong> within the first year.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Implementation Timeline */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-4 border-indigo-600">
                  IMPLEMENTATION ROADMAP
                </h2>
                <ImplementationTimeline phases={timelinePhases} />
              </section>

              {/* Vendor Recommendations */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-4 border-indigo-600">
                  VENDOR RECOMMENDATIONS
                </h2>
                <ExhibitTable
                  title="Exhibit 4: Recommended Technology Stack"
                  headers={['Category', 'Primary Solution', 'Monthly Cost', 'Purpose']}
                  rows={[
                    ['Customer AI', 'Azure OpenAI (EU)', '€1,500-2,000', 'GDPR-compliant customer interactions'],
                    ['AI Gateway', 'Portkey Enterprise', '€400', 'Request routing & monitoring'],
                    ['Internal Productivity', 'M365 Copilot', '€440 (20 users)', 'Document creation & collaboration'],
                    ['Code Generation', 'GitHub Copilot Enterprise', '€420 (20 users)', 'Development acceleration']
                  ]}
                  caption="Prices shown are typical monthly costs. Actual costs may vary based on usage and contract terms."
                />
              </section>

              {/* Full Analysis */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-4 border-indigo-600">
                  DETAILED ANALYSIS
                </h2>
                <div className="prose prose-lg max-w-none">
                  <MarkdownText>{analysis}</MarkdownText>
                </div>
              </section>

              {/* Next Steps */}
              <section>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-8 h-8 text-indigo-600" />
                    Recommended Next Action
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">
                    Approve <strong className="text-indigo-600">€15,000 immediate deployment</strong> for
                    Microsoft 365 Copilot (Week 1) while finalizing AI Gateway vendor selection (Week 2-3).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <div className="font-bold text-indigo-900 mb-1">Week 1</div>
                      <div className="text-gray-600">Deploy internal AI tools</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <div className="font-bold text-indigo-900 mb-1">Week 2-3</div>
                      <div className="text-gray-600">Vendor selection & contracts</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <div className="font-bold text-indigo-900 mb-1">Week 4+</div>
                      <div className="text-gray-600">Customer AI integration</div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>

          {/* Report Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 p-8">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="font-bold text-gray-900 mb-2">Report Prepared By</h3>
              <p className="text-lg font-semibold text-indigo-600 mb-4">AI Productivity Hub</p>
              <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
                <a href="mailto:hello@goda.go" className="hover:text-indigo-600 transition-colors">
                  📧 hello@goda.go
                </a>
                <span className="text-gray-400">|</span>
                <a href="https://www.goda.go" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                  🌐 www.goda.go
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-6 italic">
                Confidential and Proprietary – Not for Distribution
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Main App Component
const AIBusinessAssessmentEnhanced = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [showReport, setShowReport] = useState(false);

  const generateSampleReport = () => {
    setLoading(true);

    // Simulate report generation
    setTimeout(() => {
      const sampleAnalysis = `# EXECUTIVE SUMMARY

## Bottom Line Up Front
Your organization is positioned for a strategic AI implementation that balances customer-facing innovation with internal productivity gains. Recommended total Year 1 investment: €58,000.

## Key Findings
• **Customer-Facing AI**: Deploy Azure OpenAI Service in EU region (€30K/year) for GDPR-compliant conversational AI
• **Internal Productivity**: Immediate ROI through M365 Copilot and GitHub Copilot (€15K/year)
• **Compliance Foundation**: Multi-jurisdictional framework covering GDPR, CCPA, UK GDPR (€8K setup)
• **Expected ROI**: 12-15× return through 15-20% productivity gains across 20-person team

## Strategic Recommendations

### 1. Customer-Facing AI Strategy
Deploy Azure OpenAI Service in EU West region with dedicated AI Gateway for compliance and cost control.

**Architecture**:
\`\`\`
[Customer Requests] → [AI Gateway - Portkey] → [Azure OpenAI EU]
                           ↓
                    [Monitoring & Logs]
                           ↓
                    [Compliance Layer]
\`\`\`

**Year 1 Costs**:
- Azure OpenAI Service: €18,000-24,000
- AI Gateway (Portkey Enterprise): €4,800
- Implementation & Integration: €5,000
- **Total**: €30,000

### 2. Internal Productivity AI Strategy
Immediate deployment of proven productivity tools with minimal compliance overhead.

**Tools**:
- Microsoft 365 Copilot (20 licenses): €6,600/year
- GitHub Copilot Enterprise (20 developers): €5,040/year
- Training & Change Management: €3,000
- **Total**: €15,000

### 3. Compliance & Legal Framework
Establish robust multi-jurisdictional compliance covering EU, US, UK, Canada, Australia, and Brazil.

**Key Requirements**:
- Data Processing Agreements (DPAs) with all AI vendors
- AI-specific privacy policy updates
- Data residency controls
- Regular compliance audits
- **Setup Cost**: €8,000

## Implementation Roadmap

### Phase 1: Internal Foundation (Weeks 1-4)
**Quick Wins**
- Deploy M365 Copilot to all knowledge workers (Week 1)
- Roll out GitHub Copilot to development team (Week 2)
- Conduct training sessions (Week 3-4)
- **Investment**: €15,000
- **Expected Gains**: 10-15% productivity improvement

### Phase 2: Compliance Setup (Weeks 5-8)
**Legal Foundation**
- Negotiate and sign DPAs with Microsoft, OpenAI, Portkey (Week 5-6)
- Update privacy policies and terms of service (Week 7)
- Implement data residency controls (Week 8)
- **Investment**: €8,000

### Phase 3: Customer AI Launch (Weeks 9-16)
**Customer Innovation**
- Configure Azure OpenAI in EU region (Week 9-10)
- Integrate AI Gateway and monitoring (Week 11-12)
- Beta testing with select customers (Week 13-14)
- Full rollout and optimization (Week 15-16)
- **Investment**: €30,000

## Financial Analysis

### Year 1 Total Cost of Ownership (TCO)
| Category | Cost | Notes |
|----------|------|-------|
| Customer-Facing AI | €30,000 | Azure OpenAI + Gateway |
| Internal Productivity | €15,000 | M365 + GitHub Copilot |
| Compliance & Legal | €8,000 | DPAs, policies, audits |
| Training & Support | €5,000 | Change management |
| **Total Year 1** | **€58,000** | Fully loaded cost |

### ROI Calculation
**20-person team, average loaded cost €60K/person:**
- Total team cost: €1.2M/year
- 15% productivity gain: €180K/year value
- 20% productivity gain: €240K/year value
- **ROI Range**: 12-15× in Year 1

### Break-Even Analysis
With conservative 15% productivity gains (€180K value):
- Break-even: Month 3-4 after full deployment
- Payback period: 3.9 months
- Net Year 1 benefit: €122K

## Risk Mitigation

### Top 5 Risks
1. **Data Residency Compliance**: Mitigate with EU-only Azure OpenAI deployment
2. **Vendor Lock-in**: Use AI Gateway (Portkey) for multi-provider flexibility
3. **User Adoption**: Address with comprehensive training program
4. **Cost Overruns**: Control with usage monitoring and budget alerts
5. **Security Incidents**: Implement logging, monitoring, and incident response

## Conclusion

Your AI implementation strategy balances innovation, compliance, and ROI. The phased approach allows for:
- **Immediate value** from internal productivity tools (Month 1)
- **Risk mitigation** through proper compliance setup (Month 2)
- **Customer innovation** with proper guardrails (Month 3-4)

**Recommended Next Action**: Approve €15,000 immediate deployment for Microsoft 365 Copilot while finalizing AI Gateway vendor selection.`;

      setAnalysis(sampleAnalysis);
      setShowReport(true);
      setLoading(false);
    }, 2000);
  };

  if (showReport && analysis) {
    return <EnhancedProfessionalReport
      responses={{}}
      analysis={analysis}
      metadata={{ clientName: 'Your Organization' }}
    />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Crafting Your Strategy Report...</h2>
          <p className="text-gray-600 mb-2">Analyzing responses and generating recommendations</p>
          <p className="text-sm text-gray-500">This takes 30-60 seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Strategy Assessment</h1>
          <p className="text-xl text-gray-600 mb-8">Get your professional McKinsey-style report in minutes</p>

          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-bold text-gray-900 mb-1">Professional Format</h3>
                <p className="text-sm text-gray-600">McKinsey-style report with exhibits</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">💰</div>
                <h3 className="font-bold text-gray-900 mb-1">Financial Analysis</h3>
                <p className="text-sm text-gray-600">ROI calculations & TCO breakdown</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🚀</div>
                <h3 className="font-bold text-gray-900 mb-1">Action Plan</h3>
                <p className="text-sm text-gray-600">Week-by-week implementation roadmap</p>
              </div>
            </div>

            <button
              onClick={generateSampleReport}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              <FileText className="w-6 h-6" />
              Generate Professional Report
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBusinessAssessmentEnhanced;
