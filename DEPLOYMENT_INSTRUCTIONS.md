# Deployment Instructions

## Bug Fix Summary

The report generation was failing due to three critical bugs that have now been fixed:

1. **Missing API Key Header** - The Claude API call was missing the required `x-api-key` header
2. **Poor Error Handling** - Errors were caught but not displayed to users, causing the app to revert to showing questions
3. **No Environment Variable** - API key was hardcoded instead of using environment variables

## How to Deploy the Fixed Version

### Step 1: Set Up Environment Variable

You need to add your Anthropic Claude API key to GitHub Secrets for deployment:

1. Go to your GitHub repository: https://github.com/godagoo/ai-assessment-tool
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `REACT_APP_ANTHROPIC_API_KEY`
5. Value: Your Claude API key from https://console.anthropic.com/settings/keys
6. Click **Add secret**

### Step 2: Deploy with GitHub Actions (Recommended)

Create a GitHub Actions workflow file to automatically deploy with the environment variable:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build with environment variables
      env:
        REACT_APP_ANTHROPIC_API_KEY: ${{ secrets.REACT_APP_ANTHROPIC_API_KEY }}
      run: npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

Then push your changes:

```bash
git add .
git commit -m "Fix: Add missing API key header and improve error handling"
git push origin main
```

The deployment will happen automatically!

### Step 3: Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# 1. Create .env file with your API key
echo "REACT_APP_ANTHROPIC_API_KEY=your-api-key-here" > .env

# 2. Build the project
npm run build

# 3. Deploy to GitHub Pages
npm run deploy
```

## Security Note

⚠️ **Important**: The API key will be embedded in the client-side JavaScript bundle. This means:

- Anyone can view your API key by inspecting the deployed code
- Users could potentially abuse your API key
- You should monitor API usage and set spending limits

### Recommended Security Improvements:

1. **Backend Proxy** (Best practice)
   - Create a backend server to handle API calls
   - Keep the API key on the server side
   - Implement rate limiting and authentication

2. **API Key Restrictions**
   - Set spending limits in Anthropic Console
   - Monitor usage regularly
   - Rotate keys periodically

3. **Usage Monitoring**
   - Set up alerts for unusual activity
   - Track API calls per user/session
   - Implement client-side rate limiting

## Testing Locally

Before deploying, test locally:

```bash
# 1. Copy example env file
cp .env.example .env

# 2. Add your API key to .env
# Edit .env and replace the placeholder with your actual key

# 3. Start development server
npm start

# 4. Test the full flow
# - Answer all 11 questions
# - Click "Generate Report"
# - Verify the report displays correctly
```

## Verifying the Fix

After deployment, test the live site:

1. Go to https://godagoo.github.io/ai-assessment-tool/
2. Complete all 11 assessment questions
3. Click "Generate My Report"
4. The report should now display properly (or show a clear error message if API key is missing)

## What Was Fixed

### Before (Broken):
```javascript
// Missing API key header
headers: {
  "Content-Type": "application/json",
},
// Error handling didn't show errors to user
catch (error) {
  console.error("Error analyzing with Claude:", error);
  setAnalysis("Error generating analysis. Please try again.");
  // setShowReport was NOT called, so user sees questions again
}
```

### After (Fixed):
```javascript
// Proper headers with API key
headers: {
  "Content-Type": "application/json",
  "x-api-key": apiKey,
  "anthropic-version": "2023-06-01"
},
// Better error handling with user-visible messages
catch (error) {
  console.error("Error analyzing with Claude:", error);
  setAnalysis(`# Error Generating Analysis\n\n${error.message}\n\n...`);
  setShowReport(true); // NOW shows the error to the user!
}
```

## Files Modified

1. `src/AIBusinessAssessmentEnhanced.jsx` - Fixed API call and error handling
2. `.env.example` - Added environment variable documentation
3. `.gitignore` - Ensured .env is not committed
4. `README.md` - Added setup instructions

## Questions or Issues?

If you encounter any problems after deploying:

1. Check browser console for errors (F12 → Console tab)
2. Verify API key is set correctly in GitHub Secrets
3. Check Anthropic Console for API usage/errors
4. Ensure you're using a valid API key with sufficient credits
