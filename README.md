# 🦍 Gorrillazz Platform

**Production-ready multi-chain token creation platform powered by GORR and USDCc stablecoins on the Gorrillazz blockchain.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/gorrillazz)

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Environment Variables Setup](#-environment-variables-setup)
3. [Database Configuration](#-database-configuration)
4. [Making the Wallet Page Display](#-making-the-wallet-page-display)
5. [Payment Integration](#-payment-integration)
6. [Deployment](#-deployment)
7. [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### 1. Clone & Install

\`\`\`bash
git clone https://github.com/your-org/gorrillazz.git
cd gorrillazz
npm install
\`\`\`

### 2. Configure Environment Variables

\`\`\`bash
cp .env.example .env.local
\`\`\`

**Edit `.env.local` with your actual values** (see [Environment Variables Setup](#-environment-variables-setup) below)

### 3. Initialize Database

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with initial data
npm run db:seed
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

#### 1. Database Configuration (REQUIRED)

\`\`\`bash
# Neon PostgreSQL Database
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
\`\`\`

**How to get this:**
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string from the dashboard
5. Paste it as `DATABASE_URL`

**⚠️ CRITICAL**: Without this, the wallet page will NOT display data.

#### 2. Admin Dashboard (REQUIRED)

\`\`\`bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
ADMIN_WALLET_ADDRESS=gorr_admin_wallet_2024
\`\`\`

**Change the password** before deploying to production!

#### 3. Gorrillazz Blockchain (PRIMARY - REQUIRED)

\`\`\`bash
# Gorrillazz Network Configuration
GORRILLAZZ_RPC_URL=https://rpc.gorrillazz.network
GORRILLAZZ_CHAIN_ID=9999
GORRILLAZZ_PRIVATE_KEY=your_gorrillazz_private_key

# GORR Token Addresses
GORR_CONTRACT_ADDRESS_GORRILLAZZ=gorr_native_token
USDCC_CONTRACT_ADDRESS_GORR=gorr_usdcc

# GORR Price Configuration (1:1 USD peg)
GORR_PRICE_EUR=1.0
GORR_PRICE_USD=1.09
\`\`\`

**For Development**: Use test values:
\`\`\`bash
GORRILLAZZ_RPC_URL=http://localhost:8545
GORRILLAZZ_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
\`\`\`

#### 4. Payment Providers (OPTIONAL but recommended)

\`\`\`bash
# Revolut (Primary Payment Provider)
REVOLUT_API_KEY=your_revolut_api_key
REVOLUT_API_SECRET=your_revolut_api_secret
REVOLUT_MERCHANT_ID=your_revolut_merchant_id

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
\`\`\`

#### 5. Ethereum (OPTIONAL - for cross-chain)

\`\`\`bash
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
ETHEREUM_PRIVATE_KEY=0x...
ETHEREUM_CHAIN_ID=1
\`\`\`

#### 6. Application URL

\`\`\`bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**For Production**: Change to your actual domain:
\`\`\`bash
NEXT_PUBLIC_APP_URL=https://gorrillaz.app
\`\`\`

### Complete .env.local Template

\`\`\`bash
# ============================================
# DATABASE (REQUIRED)
# ============================================
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require

# ============================================
# ADMIN DASHBOARD (REQUIRED)
# ============================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_this_password_in_production
ADMIN_WALLET_ADDRESS=gorr_admin_wallet_2024

# ============================================
# GORRILLAZZ BLOCKCHAIN (REQUIRED)
# ============================================
GORRILLAZZ_RPC_URL=https://rpc.gorrillazz.network
GORRILLAZZ_CHAIN_ID=9999
GORRILLAZZ_PRIVATE_KEY=your_private_key_here
GORR_CONTRACT_ADDRESS_GORRILLAZZ=gorr_native_token
USDCC_CONTRACT_ADDRESS_GORR=gorr_usdcc
GORR_PRICE_EUR=1.0
GORR_PRICE_USD=1.09

# ============================================
# PAYMENT PROVIDERS (OPTIONAL)
# ============================================
REVOLUT_API_KEY=your_revolut_api_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# ============================================
# APPLICATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

---

## 💾 Database Configuration

### Using Neon (Recommended)

**Step 1: Create Neon Account**
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free (no credit card required)
3. Create a new project

**Step 2: Get Connection String**
1. In your Neon dashboard, click on your project
2. Go to "Connection Details"
3. Copy the connection string (it looks like):
   \`\`\`
   postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require
   \`\`\`

**Step 3: Add to Environment**
1. Open `.env.local`
2. Paste the connection string:
   \`\`\`bash
   DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require
   \`\`\`

**Step 4: Initialize Database**
\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Create tables in database
npx prisma db push

# Verify connection
npx prisma studio
\`\`\`

### Database Schema

The application uses the following tables:

- **User**: Stores user wallet addresses and balances
- **Token**: All created tokens (GORR, USDCc, custom tokens)
- **Transaction**: Payment and blockchain transactions
- **LiquidityPool**: Token liquidity pools
- **GorrPrice**: GORR price history

### Viewing Your Database

\`\`\`bash
# Open Prisma Studio (database GUI)
npx prisma studio
\`\`\`

This opens a browser at `http://localhost:5555` where you can view and edit data.

---

## 🎯 Making the Wallet Page Display

### Why the Wallet Page Shows Only Background

The wallet page requires:
1. ✅ Database connection (Neon)
2. ✅ Prisma client generated
3. ✅ API endpoints working
4. ✅ Default tokens configured

### Step-by-Step Fix

#### Step 1: Verify Database Connection

\`\`\`bash
# Test database connection
npx prisma db push
\`\`\`

**Expected output**: `✔ Database synchronized`

**If it fails**: Check your `DATABASE_URL` in `.env.local`

#### Step 2: Generate Prisma Client

\`\`\`bash
npx prisma generate
\`\`\`

**Expected output**: `✔ Generated Prisma Client`

#### Step 3: Verify API Endpoints

\`\`\`bash
# Start dev server
npm run dev

# In another terminal, test the API
curl http://localhost:3000/api/wallet/balance?wallet=gorr_test
\`\`\`

**Expected output**:
\`\`\`json
{
  "tokens": [
    {
      "symbol": "GORR",
      "name": "Gorrillazz Stablecoin",
      "balance": "1000",
      "value": 1000,
      "logo": "/gorr-logo.svg"
    },
    {
      "symbol": "USDCc",
      "name": "USD Coin Custom",
      "balance": "500",
      "value": 500,
      "logo": "/usdcc-logo.png"
    }
  ],
  "totalValue": 1500
}
\`\`\`

**If you get an error**: Check the [Troubleshooting](#-troubleshooting) section below.

#### Step 4: Check Browser Console

1. Open the wallet page: `http://localhost:3000/wallet`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for errors

**Common errors and fixes**:

| Error | Fix |
|-------|-----|
| `Failed to fetch` | Check if dev server is running |
| `500 Internal Server Error` | Check `DATABASE_URL` is correct |
| `Prisma Client not found` | Run `npx prisma generate` |
| `CORS error` | Check `NEXT_PUBLIC_APP_URL` matches your URL |

#### Step 5: Clear Cache and Reload

\`\`\`bash
# Stop dev server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
\`\`\`

### Verifying Wallet Display

The wallet page should show:

✅ **Header**: "My Wallet" with total balance
✅ **Tokens**: GORR and USDCc cards with balances
✅ **Actions**: Send, Receive, Buy, Sell, Swap buttons
✅ **Network Selector**: Gorrillazz, Ethereum options
✅ **Payment Options**: Revolut, PayPal, Stripe, Card

**If you still see only the background**:
1. Check browser console for JavaScript errors
2. Verify all environment variables are set
3. Ensure database has been initialized
4. See [Troubleshooting](#-troubleshooting) section

---

## 💳 Payment Integration

### Revolut (Primary Provider)

**Setup**:
1. Go to [revolut.com/business](https://revolut.com/business)
2. Create a business account
3. Go to Developer → API
4. Create API credentials
5. Add to `.env.local`:
   \`\`\`bash
   REVOLUT_API_KEY=your_api_key
   REVOLUT_API_SECRET=your_api_secret
   REVOLUT_MERCHANT_ID=your_merchant_id
   \`\`\`

**Features**:
- 0% admin withdrawal fees
- Instant deposits
- EUR/USD support

### Stripe

**Setup**:
1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Get API keys from Dashboard → Developers → API keys
4. Add to `.env.local`:
   \`\`\`bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   \`\`\`

### PayPal

**Setup**:
1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Create app
3. Get Client ID and Secret
4. Add to `.env.local`:
   \`\`\`bash
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_MODE=sandbox
   \`\`\`

**For Production**: Change `PAYPAL_MODE=live`

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### Step 1: Push to GitHub

\`\`\`bash
git add .
git commit -m "Ready for deployment"
git push origin main
\`\`\`

#### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel auto-detects Next.js configuration

#### Step 3: Add Environment Variables

1. In Vercel dashboard, go to Settings → Environment Variables
2. Add ALL variables from your `.env.local`
3. Select: ✅ Production ✅ Preview ✅ Development

**Required variables**:
- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `GORRILLAZZ_RPC_URL`
- `GORRILLAZZ_CHAIN_ID`
- `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)

#### Step 4: Connect Neon Database

1. Go to Storage → Connect Store
2. Select "Neon"
3. Follow prompts to connect
4. `DATABASE_URL` is automatically added

#### Step 5: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your site is live!

#### Step 6: Initialize Production Database

\`\`\`bash
# Pull environment variables
vercel env pull .env.local

# Generate Prisma Client
npx prisma generate

# Push schema to production database
npx prisma db push
\`\`\`

### Deploy Blockchain Node (Digital Ocean)

#### Step 1: Create Droplet

1. Go to [digitalocean.com](https://digitalocean.com)
2. Create → Droplets
3. Choose **Ubuntu 22.04 LTS**
4. Select plan: **4GB RAM minimum** ($24/month)
5. Add SSH key
6. Create Droplet

#### Step 2: Connect to Droplet

\`\`\`bash
ssh root@your-droplet-ip
\`\`\`

#### Step 3: Install Dependencies

\`\`\`bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs build-essential git

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
\`\`\`

#### Step 4: Clone and Setup Blockchain Node

\`\`\`bash
# Clone blockchain node repository
git clone https://github.com/your-org/gorrillazz-node.git
cd gorrillazz-node

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
CHAIN_ID=9999
RPC_PORT=8545
WS_PORT=8546
NETWORK_NAME=Gorrillazz
CURRENCY_SYMBOL=GORR
CURRENCY_DECIMALS=18
BLOCK_TIME=3
GAS_LIMIT=30000000
EOF
\`\`\`

#### Step 5: Start Node with PM2

\`\`\`bash
# Install PM2 (process manager)
npm install -g pm2

# Start blockchain node
pm2 start npm --name "gorrillazz-node" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
\`\`\`

#### Step 6: Configure Firewall

\`\`\`bash
# Allow RPC port
ufw allow 8545/tcp

# Allow WebSocket port
ufw allow 8546/tcp

# Allow SSH
ufw allow 22/tcp

# Enable firewall
ufw enable
\`\`\`

#### Step 7: Update Application Environment

Update your Vercel environment variables:

\`\`\`bash
GORRILLAZZ_RPC_URL=http://your-droplet-ip:8545
GORRILLAZZ_WEBSOCKET_URL=ws://your-droplet-ip:8546
\`\`\`

#### Step 8: Verify Node is Running

\`\`\`bash
# Check PM2 status
pm2 status

# View logs
pm2 logs gorrillazz-node

# Test RPC endpoint
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
\`\`\`

---

## 🐛 Troubleshooting

### Wallet Page Shows Only Background

**Symptoms**: Wallet page displays background but no tokens, balances, or buttons.

**Diagnosis**:
\`\`\`bash
# 1. Check if API is working
curl http://localhost:3000/api/wallet/balance?wallet=gorr_test

# 2. Check database connection
npx prisma db push

# 3. Check Prisma Client
npx prisma generate

# 4. Check browser console (F12)
# Look for errors in Console tab
\`\`\`

**Solutions**:

| Issue | Solution |
|-------|----------|
| API returns 500 error | Check `DATABASE_URL` is correct |
| API returns empty array | Database not initialized - run `npx prisma db push` |
| Prisma Client error | Run `npx prisma generate` |
| CORS error | Check `NEXT_PUBLIC_APP_URL` matches your URL |
| Nothing in console | Clear cache: `rm -rf .next && npm run dev` |

### Database Connection Failed

**Error**: `Can't reach database server at host.neon.tech`

**Solutions**:
1. Verify `DATABASE_URL` includes `?sslmode=require`
2. Check Neon database is active (not paused)
3. Test connection:
   \`\`\`bash
   npx prisma db push
   \`\`\`
4. If still failing, regenerate connection string in Neon dashboard

### Build Errors

**Error**: TypeScript or module errors during build

**Solution**:
\`\`\`bash
# Clean install
rm -rf node_modules .next
npm install

# Regenerate Prisma Client
npx prisma generate

# Try build again
npm run build
\`\`\`

### Payment Provider Not Working

**Error**: Payment fails or doesn't show up

**Solutions**:
1. Verify API keys are correct in `.env.local`
2. Check provider is in correct mode (sandbox vs live)
3. For Stripe: Verify webhook secret is set
4. For PayPal: Ensure `PAYPAL_MODE` matches your keys
5. Check browser console for errors

### Wallet Not Connecting

**Error**: "Failed to connect wallet"

**Solutions**:
1. Check if MetaMask/wallet extension is installed
2. Verify network is added to wallet:
   - Network Name: Gorrillazz
   - RPC URL: `https://rpc.gorrillazz.network`
   - Chain ID: 9999
   - Currency: GORR
3. Try different wallet (TrustWallet, Binance Wallet)

### API Endpoint Returns 404

**Error**: `GET /api/wallet/balance 404`

**Solutions**:
1. Verify file exists: `app/api/wallet/balance/route.ts`
2. Check dev server is running: `npm run dev`
3. Clear Next.js cache: `rm -rf .next`
4. Restart dev server

---

## 📚 Additional Resources

### Database Management

\`\`\`bash
# View database in browser
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Create migration
npx prisma migrate dev --name init

# Deploy migrations to production
npx prisma migrate deploy
\`\`\`

### Useful Commands

\`\`\`bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
npx prisma studio    # Open database GUI
npx prisma migrate   # Create/run migrations

# Deployment
vercel               # Deploy to Vercel
vercel env pull      # Pull environment variables
vercel logs          # View deployment logs
\`\`\`

### Environment Variable Checklist

Before deploying, ensure these are set:

- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `ADMIN_USERNAME` - Admin dashboard username
- [ ] `ADMIN_PASSWORD` - Admin dashboard password (changed from default)
- [ ] `GORRILLAZZ_RPC_URL` - Blockchain RPC endpoint
- [ ] `GORRILLAZZ_CHAIN_ID` - Chain ID (9999)
- [ ] `GORR_CONTRACT_ADDRESS_GORRILLAZZ` - GORR token address
- [ ] `USDCC_CONTRACT_ADDRESS_GORR` - USDCc token address
- [ ] `NEXT_PUBLIC_APP_URL` - Your application URL
- [ ] Payment provider keys (at least one)

---

## 🎯 Quick Fixes

### "Wallet page not showing"
\`\`\`bash
npx prisma generate && npx prisma db push && rm -rf .next && npm run dev
\`\`\`

### "Database error"
\`\`\`bash
# Check connection
npx prisma db push

# If fails, verify DATABASE_URL in .env.local
\`\`\`

### "Build failing"
\`\`\`bash
rm -rf node_modules .next && npm install && npm run build
\`\`\`

### "API not working"
\`\`\`bash
# Restart dev server
# Ctrl+C to stop
npm run dev
\`\`\`

---

## 📄 License

MIT License - see LICENSE file

---

## 🙏 Support

- **Documentation**: This README
- **Issues**: [GitHub Issues](https://github.com/your-org/gorrillazz/issues)
- **Email**: support@gorrillazz.network
- **Discord**: [Join our community](https://discord.gg/gorrillazz)

---

**Built with ❤️ by the Gorrillazz Team**

For production deployment assistance: deploy@gorrillazz.network
