# Deployment Guide

This guide covers deploying the personal blog to production using Vercel and Firebase.

## Prerequisites

- [Vercel CLI](https://vercel.com/cli) installed globally: `npm i -g vercel`
- [Firebase CLI](https://firebase.google.com/docs/cli) installed globally: `npm i -g firebase-tools`
- Firebase project set up for production
- Domain name configured (optional)

## Production Setup Checklist

### 1. Firebase Production Project

1. **Create Production Firebase Project**
   ```bash
   firebase projects:create your-blog-prod
   ```

2. **Enable Required Services**
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Analytics (optional)

3. **Configure Firestore Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Deploy Firestore Indexes**
   ```bash
   firebase deploy --only firestore:indexes
   ```

5. **Configure Storage Rules**
   ```bash
   firebase deploy --only storage
   ```

### 2. Environment Variables

1. **Copy production environment template**
   ```bash
   cp .env.production.example .env.production.local
   ```

2. **Update production values in `.env.production.local`**
   - Firebase configuration (production project)
   - Site URLs (production domain)
   - API keys (production keys)
   - Analytics IDs

3. **Configure Vercel Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   # ... add all required environment variables
   ```

### 3. Domain Configuration

1. **Add Custom Domain in Vercel**
   - Go to Vercel Dashboard > Project > Settings > Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Environment Variables**
   ```bash
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

### 4. SEO Configuration

1. **Google Search Console**
   - Add and verify your domain
   - Submit sitemap: `https://yourdomain.com/sitemap.xml`

2. **Google Analytics**
   - Create GA4 property for production
   - Update `NEXT_PUBLIC_GA_MEASUREMENT_ID`

3. **Social Media**
   - Update Open Graph images
   - Test social media previews

## Deployment Process

### Automatic Deployment (Recommended)

1. **Connect GitHub Repository to Vercel**
   ```bash
   vercel --confirm
   ```

2. **Configure Auto-Deploy**
   - Main branch → Production
   - Feature branches → Preview deployments

### Manual Deployment

1. **Build and Test Locally**
   ```bash
   npm run build:production
   npm run preview
   ```

2. **Deploy to Vercel**
   ```bash
   npm run deploy:vercel
   ```

### Firebase Deployment

1. **Deploy Firestore Rules and Indexes**
   ```bash
   firebase use your-blog-prod
   firebase deploy --only firestore
   ```

2. **Deploy Storage Rules**
   ```bash
   firebase deploy --only storage
   ```

## Post-Deployment Checklist

### 1. Functionality Testing

- [ ] Homepage loads correctly
- [ ] Article pages render properly
- [ ] Admin authentication works
- [ ] Article creation/editing functions
- [ ] Image uploads work
- [ ] Newsletter subscription works
- [ ] Contact form sends emails
- [ ] Search functionality works
- [ ] RSS feeds are accessible
- [ ] Sitemap is generated correctly

### 2. Performance Testing

- [ ] Lighthouse score > 90 for all metrics
- [ ] Core Web Vitals are in green
- [ ] Images are optimized and loading fast
- [ ] Page load times < 3 seconds
- [ ] Mobile responsiveness works

### 3. SEO Testing

- [ ] Meta tags are correct
- [ ] Open Graph images display properly
- [ ] Structured data is valid (test with Google Rich Results)
- [ ] Sitemap is accessible and valid
- [ ] Robots.txt is configured correctly
- [ ] Google Search Console shows no errors

### 4. Security Testing

- [ ] HTTPS is enforced
- [ ] Security headers are present
- [ ] Admin routes are protected
- [ ] Firebase security rules are working
- [ ] No sensitive data in client-side code

### 5. Analytics Testing

- [ ] Google Analytics is tracking page views
- [ ] Firebase Analytics is working
- [ ] Custom analytics events are firing
- [ ] Real-time visitor tracking works
- [ ] Admin analytics dashboard shows data

## Monitoring and Maintenance

### 1. Error Monitoring

Set up error monitoring with services like:
- Vercel Analytics (built-in)
- Sentry (recommended)
- LogRocket (optional)

### 2. Performance Monitoring

- Vercel Analytics for Core Web Vitals
- Google PageSpeed Insights
- GTmetrix for detailed performance analysis

### 3. Uptime Monitoring

- Vercel provides built-in uptime monitoring
- Consider additional services like UptimeRobot

### 4. Backup Strategy

- Firebase automatically backs up Firestore data
- Consider exporting data regularly for additional backup
- Version control ensures code backup

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Verify all environment variables are set
   - Check for missing dependencies

2. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check security rules
   - Ensure service account has proper permissions

3. **Image Loading Issues**
   - Verify Firebase Storage rules
   - Check image optimization settings
   - Ensure proper CORS configuration

4. **Performance Issues**
   - Analyze bundle size: `npm run build:analyze`
   - Check for unused dependencies
   - Optimize images and fonts

### Getting Help

- Check Vercel documentation: https://vercel.com/docs
- Firebase documentation: https://firebase.google.com/docs
- Next.js documentation: https://nextjs.org/docs

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` files
   - Use Vercel's environment variable management
   - Rotate API keys regularly

2. **Firebase Security**
   - Review and test Firestore security rules
   - Use least-privilege principle for service accounts
   - Enable audit logging

3. **Content Security**
   - Sanitize user-generated content
   - Implement rate limiting for forms
   - Monitor for suspicious activity

4. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Update Firebase SDK regularly

## Performance Optimization

1. **Image Optimization**
   - Use Next.js Image component
   - Implement lazy loading
   - Serve WebP/AVIF formats

2. **Code Splitting**
   - Implement dynamic imports
   - Use React.lazy for components
   - Optimize bundle size

3. **Caching Strategy**
   - Configure proper cache headers
   - Use ISR for static content
   - Implement service worker (optional)

4. **Database Optimization**
   - Create proper Firestore indexes
   - Implement pagination
   - Use compound queries efficiently