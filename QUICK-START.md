# ⚡ Quick Start Guide

Get your AI Assessment Tool live in 10 minutes!

## 🎯 What You'll Have

A live website at: `https://yourusername.github.io/ai-assessment-tool`

## 📋 Before You Start

You'll need:
- [ ] GitHub account ([sign up free](https://github.com/join))
- [ ] Your GitHub username (e.g., "johndoe")

## 🚀 5 Simple Steps

### Step 1: Update Your GitHub Username (1 min)

Open `package.json` and find this line:
```json
"homepage": "https://yourusername.github.io/ai-assessment-tool"
```

**Replace `yourusername` with YOUR GitHub username:**
```json
"homepage": "https://johndoe.github.io/ai-assessment-tool"
```

### Step 2: Create GitHub Repository (2 min)

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `ai-assessment-tool`
3. Choose **Public**
4. Click **"Create repository"**
5. Copy the repository URL (looks like: `https://github.com/yourusername/ai-assessment-tool.git`)

### Step 3: Push Your Code (2 min)

Run these commands in your terminal:

```bash
# Add your GitHub repository (REPLACE WITH YOUR URL!)
git remote add origin https://github.com/YOUR-USERNAME/ai-assessment-tool.git

# Push to GitHub
git push -u origin main
```

### Step 4: Deploy to GitHub Pages (3 min)

```bash
npm run deploy
```

Wait for it to finish (shows "Published" when done).

### Step 5: Enable GitHub Pages (2 min)

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Source", select `gh-pages` branch
4. Click **Save**
5. Wait 1-2 minutes

## 🎉 Done!

Visit: `https://YOUR-USERNAME.github.io/ai-assessment-tool/`

**Example:** `https://johndoe.github.io/ai-assessment-tool/`

## 🎨 Customize It (Optional)

### Change Your Contact Info

Edit `src/AIBusinessAssessmentEnhanced.jsx`:

1. Search for `"AI Productivity Hub"` → Replace with your company name
2. Search for `"hello@goda.go"` → Replace with your email
3. Search for `"www.goda.go"` → Replace with your website

Then redeploy:
```bash
git add .
git commit -m "Updated branding"
git push origin main
npm run deploy
```

## 💡 Test It Locally First

```bash
npm start
```

Opens at `http://localhost:3000`

## 🐛 Problems?

### Can't find terminal?
- **Mac:** Press `Cmd + Space`, type "Terminal"
- **Windows:** Press `Win + R`, type "cmd"

### "npm not found"?
Install Node.js from [nodejs.org](https://nodejs.org)

### Still stuck?
Check `DEPLOYMENT.md` for detailed troubleshooting.

## 📧 Need Help?

Email: hello@goda.go

---

**That's it! Your professional AI Assessment Tool is now live!** 🚀
