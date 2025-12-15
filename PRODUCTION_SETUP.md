# GORRILLAZZ Production Setup Guide

This guide provides complete instructions for deploying the GORRILLAZZ platform to production.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Blockchain Configuration](#blockchain-configuration)
3. [Database Setup](#database-setup)
4. [Payment Providers](#payment-providers)
5. [Deployment](#deployment)
6. [Admin Wallet](#admin-wallet)
7. [Token Addresses](#token-addresses)
8. [Security](#security)

---

## Environment Variables

### Required Variables

Copy `.env.production` to `.env` and configure the following:

#### Database
\`\`\`env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
\`\`\`

#### Admin Credentials
\`\`\`env
ADMIN_USERNAME=HomeoAugere
ADMIN_PASSWORD=goRdaPaas09HomeoAugere
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74
\`\`\`

#### Gorrillazz Blockchain (PRIMARY)
\`\`\`env
GORRILLAZZ_RPC_URL=https://rpc.gorrillazz.network
GORRILLAZZ_CHAIN_ID=9999
GORRILLAZZ_PRIVATE_KEY=0x98d51e7c2432d53e831f45debb76c4a2291bb5e0e8d79150a35e9ea042b7bb61
GORRILLAZZ_EXPLORER_URL=https://explorer.gorrillazz.network
GORRILLAZZ_WEBSOCKET_URL=wss://ws.gorrillazz.network
\`\`\`

#### Token Contracts
\`\`\`env
NEXT_PUBLIC_GORR_CONTRACT_ADDRESS=0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74
GORR_CONTRACT_ADDRESS_GORRILLAZZ=0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74
USDCC_CONTRACT_ADDRESS_GORRILLAZZ=gorr_usdcc
GORR_INITIAL_SUPPLY=100000000
\`\`\`

---

## Blockchain Configuration

### Gorrillazz Network (Primary)

The Gorrillazz network is the primary blockchain for the platform.

**Network Details:**
- Chain ID: 9999
- RPC URL: https://rpc.gorrillazz.network
- Explorer: https://explorer.gorrillazz.network
- WebSocket: wss://ws.gorrillazz.network

**Adding to MetaMask:**
1. Open MetaMask
2. Click "Add Network"
3. Enter the following details:
   - Network Name: Gorrillazz
   - RPC URL: https://rpc.gorrillazz.network
   - Chain ID: 9999
   - Currency Symbol: GORR
   - Block Explorer: https://explorer.gorrillazz.network

### Ethereum Integration

**Network Details:**
- Chain ID: 1
- RPC URL: https://mainnet.infura.io/v3/YOUR_INFURA_KEY

### Binance Smart Chain Integration

**Network Details:**
- Chain ID: 56
- RPC URL: https://bsc-dataseed.binance.org

---

## Database Setup

### Neon PostgreSQL

1. **Create Database:**
   - Go to [Neon Console](https://console.neon.tech)
   - Create a new project
   - Copy the connection string

2. **Initialize Schema:**
   \`\`\`bash
   npx prisma db push
   \`\`\`

3. **Seed Initial Data:**
   \`\`\`bash
   npm run db:seed
   \`\`\`

---

## Payment Providers

### Revolut (Primary)

1. **Setup:**
   - Create Revolut Business account
   - Enable API access
   - Generate API keys

2. **Configuration:**
   \`\`\`env
   REVOLUT_API_KEY=your_api_key
   REVOLUT_API_SECRET=your_api_secret
   REVOLUT_MERCHANT_ID=your_merchant_id
   \`\`\`

### Stripe

1. **Setup:**
   - Create Stripe account
   - Get API keys from Dashboard

2. **Configuration:**
   \`\`\`env
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   \`\`\`

### PayPal

1. **Setup:**
   - Create PayPal Business account
   - Get API credentials

2. **Configuration:**
   \`\`\`env
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_MODE=live
   \`\`\`

---

## Deployment

### Vercel Deployment

1. **Install Vercel CLI:**
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Deploy:**
   \`\`\`bash
   vercel --prod
   \`\`\`

3. **Configure Environment Variables:**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add all variables from `.env.production`

4. **Configure Domain:**
   - Add custom domain: gorrillaz.app
   - Configure DNS records
   - Enable SSL

### Manual Deployment

1. **Build:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start:**
   \`\`\`bash
   npm run start
   \`\`\`

3. **Use PM2 for Process Management:**
   \`\`\`bash
   pm2 start npm --name "gorrillazz" -- start
   pm2 save
   pm2 startup
   \`\`\`

---

## Admin Wallet

### Admin Wallet Address
\`\`\`
0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74
\`\`\`

### Admin Capabilities

1. **Token Verification:**
   - Approve/reject new tokens
   - Manage token registry

2. **Fee Management:**
   - GORR Token: FREE
   - USDCc Token: FREE
   - Other Tokens: 200 GORR

3. **Payment Operations:**
   - All user wallet functions
   - Fee-free transactions
   - Withdrawal management

4. **Platform Management:**
   - View global balances
   - Manage platform reserves
   - Update fee structures

### Accessing Admin Dashboard

1. Navigate to `/admin`
2. Login with credentials:
   - Username: `HomeoAugere`
   - Password: `goRdaPaas09HomeoAugere`
3. Or connect with admin wallet address

---

## Token Addresses

### GORR Token
- **Gorrillazz Network:** `0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74`
- **Initial Supply:** 100,000,000 GORR
- **Decimals:** 18
- **Price:** 1.0 EUR / 1.09 USD

### USDCc Stablecoin
- **Gorrillazz Network:** `gorr_usdcc`
- **Initial Supply:** 100,000,000 USDCc
- **Decimals:** 18
- **Price:** 1.0 USD

### Treasury Wallet
\`\`\`
gorr_treasury_wallet
\`\`\`

---

## Security

### Best Practices

1. **Private Keys:**
   - Never commit private keys to Git
   - Use environment variables only
   - Rotate keys regularly

2. **API Keys:**
   - Use separate keys for production
   - Enable IP whitelisting
   - Monitor API usage

3. **Database:**
   - Enable SSL connections
   - Use connection pooling
   - Regular backups

4. **Admin Access:**
   - Use strong passwords
   - Enable 2FA where possible
   - Monitor admin actions

### Monitoring

1. **Blockchain Monitoring:**
   - Monitor contract events
   - Track transaction failures
   - Alert on unusual activity

2. **Application Monitoring:**
   - Use Vercel Analytics
   - Set up error tracking (Sentry)
   - Monitor API response times

3. **Security Audits:**
   - Regular smart contract audits
   - Penetration testing
   - Code reviews

---

## Support

For issues or questions:
- Email: support@gorrillaz.app
- Documentation: https://docs.gorrillaz.app
- Discord: https://discord.gg/gorrillazz

---

## License

Copyright © 2025 Gorrillazz. All rights reserved.
