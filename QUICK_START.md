# Quick Start Guide

## Get Started in 3 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Navigate to: http://localhost:5173/

## First Time Setup

1. **Get API Key**
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Enter API Key**
   - Paste your API key in the welcome dialog
   - Click "Save API Key"
   - Your key is stored locally in browser

## Quick Test

1. **Upload Test Dataset**
   - Click "Upload CSV"
   - Select `sample-dataset.csv` from project root
   - Dataset appears in dropdown

2. **Configure Translation**
   - Select dataset: "sample-dataset"
   - Choose target language: "Spanish (es)"
   - Leave custom instructions empty (optional)

3. **Start Translation**
   - Review estimate: 3 rows, 12 API calls
   - Click "Start Translation"
   - Watch progress in real-time

4. **View Results**
   - Wait ~8-10 seconds for completion
   - Click eye icon on completed job
   - Review translations and quality scores
   - See ACCEPT/REVISE recommendations

5. **Export Results**
   - Click "Export CSV" button
   - Or click "Save" icon to create new dataset

## Sample Dataset Format

Your CSV should have at least one text column:

```csv
prompt
"Hello, how are you today?"
"The weather is beautiful outside."
"I enjoy learning new things."
```

## Common Issues

### API Key Not Working
- Verify key is correct
- Check Google Cloud project has Gemini API enabled
- Ensure billing is set up (free tier available)

### Translation Fails
- Check internet connection
- Verify API key has quota remaining
- Try smaller dataset first

### Build Errors
- Delete `node_modules` and run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Testing
# Use sample-dataset.csv for quick tests
```

## Features to Try

- [ ] Upload different CSV formats
- [ ] Try all 23 languages
- [ ] Add custom translation instructions
- [ ] Modify agent prompts in Advanced settings
- [ ] Cancel a running job
- [ ] Filter results by ACCEPT/REVISE
- [ ] Export results as CSV
- [ ] Save translation as new dataset
- [ ] Delete old jobs and datasets

## Need Help?

1. Check README.md for detailed documentation
2. Review IMPLEMENTATION_SUMMARY.md for technical details
3. Open browser console (F12) to see detailed logs
4. Check localStorage: Application > Local Storage in DevTools

## Production Deployment

```bash
# Build
npm run build

# Deploy dist/ folder to:
# - Vercel: vercel deploy
# - Netlify: drag dist/ folder to https://app.netlify.com/drop
# - GitHub Pages: push dist/ to gh-pages branch
```

## Enjoy translating! 🚀
