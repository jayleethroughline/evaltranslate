# Deployment Instructions

## Push to GitHub

After creating your GitHub repository, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/evaltranslate.git
git branch -M main
git push -u origin main
```

## Deploy to Vercel

1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Click "Import Project"
4. Select your `evaltranslate` repository
5. Vercel will auto-detect it's a Vite project
6. Click "Deploy"

### Build Settings (auto-detected)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### After First Deployment

Every time you push to GitHub, Vercel will automatically:
1. Pull your latest code
2. Run `npm install`
3. Run `npm run build`
4. Deploy to production

Your app will be live at: `https://evaltranslate.vercel.app` (or custom domain)

## Important Notes

- API keys are stored in browser localStorage (client-side only)
- No environment variables needed
- No backend or database required
- 100% static site deployment

## Custom Domain (Optional)

In Vercel dashboard:
1. Go to your project
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
