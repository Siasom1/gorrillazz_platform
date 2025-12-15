# Troubleshooting Guide

## Build Errors

### "cn is not exported from '@/components/gl/shaders/utils'"

This error occurs when the build cache is stale. The `cn` utility is correctly imported from `@/lib/utils` in all components.

**Solution:**
\`\`\`bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run dev
\`\`\`

### "Cannot read properties of undefined (reading 'ReactCurrentOwner')"

This error occurs when React Three Fiber tries to render on the server side.

**Solution:**
The GL component now uses dynamic imports with `ssr: false` to prevent server-side rendering of Three.js components. If you still see this error, clear your cache:

\`\`\`bash
rm -rf .next
npm run dev
\`\`\`

## Prisma Database Errors

### "Environment variable not found: DATABASE_URL"

Prisma cannot find the DATABASE_URL environment variable.

**Solution:**

1. **Create .env file from template:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. **Add your Neon database URL:**
   Open `.env` and replace the placeholder with your actual Neon connection string:
   \`\`\`env
   DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
   \`\`\`

3. **Get your Neon connection string:**
   - Go to https://console.neon.tech
   - Select your project
   - Go to "Connection Details"
   - Copy the "Connection string" (Pooled connection)

4. **Push the schema:**
   \`\`\`bash
   npx prisma db push
   \`\`\`

5. **Generate Prisma Client:**
   \`\`\`bash
   npx prisma generate
   \`\`\`

## Wallet Not Displaying

### Wallet shows in terminal but not on screen

The debug logs show that the wallet IS rendering correctly (you can see "Rendering token: GORR" in the logs). If you can't see it on screen, this is likely a CSS/z-index issue.

**Possible causes:**

1. **GL background covering content:**
   The WebGL background might have a higher z-index than the wallet content.

2. **Text color matching background:**
   The text might be the same color as the background, making it invisible.

3. **Content pushed off-screen:**
   The layout might be pushing content outside the viewport.

**Solutions:**

1. **Check browser console:**
   Open DevTools (F12) and look for any CSS errors or warnings.

2. **Inspect the wallet element:**
   Right-click on the page and select "Inspect". Look for the wallet container and check its:
   - `display` property (should not be `none`)
   - `opacity` property (should be `1`)
   - `z-index` property (should be higher than the GL background)
   - `color` property (should contrast with background)

3. **Temporarily disable GL background:**
   In `app/page.tsx` or `app/wallet/page.tsx`, comment out the `<GL />` component to see if the wallet appears.

4. **Check if data is loading:**
   Open browser console and look for these logs:
   - "Setting tokens to: [...]"
   - "Rendering token: GORR"
   - "Rendering token: USDCc"
   
   If you see these logs, the wallet IS working - it's just a visibility issue.

## Cross-Origin Warnings

### "Cross origin request detected"

This warning appears in development when accessing the app from a different origin.

**Solution:**
This is just a warning and doesn't affect functionality. To suppress it, add to `next.config.mjs`:

\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ['100.115.92.206']
  }
}

export default nextConfig
\`\`\`

## Payment Provider Issues

### Revolut/PayPal/Stripe not working

**Check environment variables:**
\`\`\`bash
# Verify all payment provider keys are set
echo $REVOLUT_API_KEY
echo $PAYPAL_CLIENT_ID
echo $STRIPE_SECRET_KEY
\`\`\`

**Verify integration status:**
Check the Connect section in the v0 sidebar to ensure all payment providers are properly connected.

## Database Initialization

### Database is empty / No tokens showing

**Run the initialization script:**
\`\`\`bash
# Initialize database with GORR and USDCc tokens
npx prisma db push
npm run db:init
\`\`\`

This will:
- Create all necessary tables
- Add GORR token (100,000,000 supply)
- Add USDCc token (100,000,000 supply)
- Set admin wallet balance to 100,000,000 GORR

## Still Having Issues?

1. **Clear all caches:**
   \`\`\`bash
   rm -rf .next
   rm -rf node_modules
   npm install
   npm run dev
   \`\`\`

2. **Check environment variables:**
   \`\`\`bash
   # Verify all required env vars are set
   cat .env
   \`\`\`

3. **Check database connection:**
   \`\`\`bash
   npx prisma studio
   \`\`\`
   This opens a GUI to view your database. Check if tables exist and have data.

4. **Enable debug mode:**
   Add to your `.env`:
   \`\`\`env
   DEBUG=true
   NODE_ENV=development
   \`\`\`

5. **Check browser console:**
   Open DevTools (F12) and look for any errors in the Console tab.
