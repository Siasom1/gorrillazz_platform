# Database Setup Guide

## Quick Start

### 1. Create Environment File

The Prisma error occurs because you don't have a `.env` file. Create it from the example:

\`\`\`bash
# Copy the example file
cp .env.example .env
\`\`\`

### 2. Update DATABASE_URL

Open `.env` and update the `DATABASE_URL` with your actual Neon connection string:

\`\`\`env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require"
\`\`\`

**Get your Neon connection string:**
1. Go to https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. Copy the "Connection string" (Pooled connection)
5. Paste it into your `.env` file

### 3. Push Database Schema

\`\`\`bash
npx prisma db push
\`\`\`

This creates all the tables in your Neon database.

### 4. Initialize Database with Admin Wallet

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run the initialization script (if using psql)
psql $DATABASE_URL -f scripts/init-database.sql

# OR use Prisma Studio to manually add the data
npx prisma studio
\`\`\`

### 5. Verify Setup

\`\`\`bash
# Check that tables were created
npx prisma studio
\`\`\`

## Admin Wallet Configuration

The admin wallet is configured with:
- **Address**: `0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74`
- **Initial GORR Supply**: 100,000,000 GORR
- **Initial USDCc Supply**: 100,000,000 USDCc

## Wallet Display Issue

**Good news**: Your wallet IS working! The debug logs show:
\`\`\`
[v0] Rendering token: GORR
[v0] Rendering token: USDCc
[v0] Setting balance to: 1500
\`\`\`

If you can't see the tokens on screen:

1. **Check browser console** - Press F12 and look for errors
2. **Check z-index** - The GL background might be covering content
3. **Try different browser** - Test in Chrome/Firefox
4. **Clear cache** - Hard refresh with Ctrl+Shift+R
5. **Check CSS** - Tokens might be rendering but invisible due to styling

## Environment Variables Checklist

Make sure your `.env` file has:

\`\`\`env
✅ DATABASE_URL - Your Neon connection string
✅ NEXT_PUBLIC_ADMIN_WALLET_ADDRESS - 0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74
✅ GORR_INITIAL_SUPPLY - 100000000
✅ NEXT_PUBLIC_GORR_CONTRACT_ADDRESS - 0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74
\`\`\`

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

**Solution**: You need to create a `.env` file:
\`\`\`bash
cp .env.example .env
\`\`\`
Then add your actual Neon connection string.

### "Wallet not showing on screen"

**Solution**: The wallet IS rendering (check logs). Try:
1. Inspect element on the wallet page
2. Look for the token cards in the DOM
3. Check if they have `display: none` or `opacity: 0`
4. Verify the GL background isn't covering them (z-index issue)

### "ADMIN_WALLET_ADDRESS cannot be accessed on client"

**Solution**: Use `NEXT_PUBLIC_ADMIN_WALLET_ADDRESS` instead in client components.

## Next Steps

1. Create `.env` file from `.env.example`
2. Add your Neon DATABASE_URL
3. Run `npx prisma db push`
4. Run `npx prisma generate`
5. Start the dev server: `npm run dev`
6. Visit http://localhost:3000/wallet

The wallet should display with GORR and USDCc tokens!
