# AI Business Assessment Tool

Professional McKinsey-style AI implementation reports with beautiful charts, tables, and actionable recommendations.

## 🌐 Live Demo

**https://godagoo.github.io/ai-assessment-tool/**

## ✨ Features

- Professional McKinsey-style report generation
- Advanced PDF export with multi-page layouts, tables, and charts
- Markdown export for easy editing
- Cost breakdown visualization
- Implementation timeline with phases
- Financial analysis & ROI calculations
- Responsive design (mobile-ready)

## 🚀 Quick Start

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Get your Anthropic Claude API key from [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

3. Add your API key to `.env`:
```
REACT_APP_ANTHROPIC_API_KEY=sk-ant-api03-your-actual-api-key-here
```

**Security Note:** The API key will be embedded in the client-side bundle. For production use, consider implementing a backend proxy to keep the API key secure.

### Run Locally

```bash
npm install
npm start
```

Visit http://localhost:3000

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 🎨 Customization

Edit `src/AIBusinessAssessmentEnhanced.jsx` to customize:
- Company name (search: "AI Productivity Hub")
- Contact email (search: "hello@goda.go")
- Website URL (search: "www.goda.go")
- Color scheme (change Tailwind classes: `indigo-600`, `purple-600`)

## 📦 Tech Stack

- React 19.2.0
- jsPDF (PDF generation)
- jspdf-autotable (professional tables)
- lucide-react (icons)
- Tailwind CSS (via CDN)

## 📄 License

MIT License

---

Made with ❤️
