-- Gorrillazz Platform Database Initialization Script
-- PostgreSQL / Neon Database
-- Version: 2.0.0

-- Drop existing tables if they exist (use with caution in production!)
-- DROP TABLE IF EXISTS "Transaction" CASCADE;
-- DROP TABLE IF EXISTS "LiquidityPool" CASCADE;
-- DROP TABLE IF EXISTS "Token" CASCADE;
-- DROP TABLE IF EXISTS "User" CASCADE;
-- DROP TABLE IF EXISTS "GorrPrice" CASCADE;

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "walletAddress" TEXT UNIQUE NOT NULL,
    "email" TEXT UNIQUE,
    "username" TEXT UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gorrBalance" DOUBLE PRECISION NOT NULL DEFAULT 0
);

-- Create Token table
CREATE TABLE IF NOT EXISTS "Token" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT,
    "totalSupply" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 18,
    "logoUrl" TEXT,
    "network" TEXT NOT NULL,
    "contractAddress" TEXT UNIQUE,
    "creatorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "mintable" BOOLEAN NOT NULL DEFAULT false,
    "burnable" BOOLEAN NOT NULL DEFAULT false,
    "pausable" BOOLEAN NOT NULL DEFAULT false,
    "website" TEXT,
    "twitter" TEXT,
    "telegram" TEXT,
    "discord" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Token_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create LiquidityPool table
CREATE TABLE IF NOT EXISTS "LiquidityPool" (
    "id" TEXT PRIMARY KEY,
    "tokenId" TEXT UNIQUE NOT NULL,
    "initialLiquidity" TEXT NOT NULL,
    "lockPeriod" INTEGER NOT NULL,
    "lockedUntil" TIMESTAMP(3),
    "poolAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LiquidityPool_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Transaction table
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenId" TEXT,
    "type" TEXT NOT NULL,
    "amount" TEXT,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "txHash" TEXT UNIQUE,
    "network" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create GorrPrice table
CREATE TABLE IF NOT EXISTS "GorrPrice" (
    "id" TEXT PRIMARY KEY,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "User_walletAddress_idx" ON "User"("walletAddress");
CREATE INDEX IF NOT EXISTS "Token_network_idx" ON "Token"("network");
CREATE INDEX IF NOT EXISTS "Token_status_idx" ON "Token"("status");
CREATE INDEX IF NOT EXISTS "Token_creatorId_idx" ON "Token"("creatorId");
CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_tokenId_idx" ON "Transaction"("tokenId");
CREATE INDEX IF NOT EXISTS "Transaction_network_idx" ON "Transaction"("network");
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX IF NOT EXISTS "GorrPrice_timestamp_idx" ON "GorrPrice"("timestamp");

-- Insert initial GORR price (1:1 USD peg)
INSERT INTO "GorrPrice" ("id", "price", "timestamp")
VALUES ('initial_gorr_price', 1.00, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Create admin user (optional - for testing)
-- INSERT INTO "User" ("id", "walletAddress", "username", "gorrBalance")
-- VALUES ('admin_user_id', 'gorr_admin_wallet_2024', 'admin', 1000000)
-- ON CONFLICT ("walletAddress") DO NOTHING;

-- Create GORR token entry
INSERT INTO "User" ("id", "walletAddress", "username", "gorrBalance")
VALUES ('gorr_system_user', 'gorr_assdypat2t', 'GORR System', 400000000)
ON CONFLICT ("walletAddress") DO NOTHING;

-- Update admin user with correct wallet address and initial GORR supply of 100M
INSERT INTO "User" ("id", "walletAddress", "username", "gorrBalance")
VALUES ('admin_user', '0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74', 'Admin', 100000000)
ON CONFLICT ("walletAddress") DO UPDATE SET "gorrBalance" = 100000000;

-- Update GORR token with 100M supply and admin wallet
INSERT INTO "Token" ("id", "name", "symbol", "description", "totalSupply", "decimals", "logoUrl", "network", "contractAddress", "creatorId", "status")
VALUES (
    'gorr_native_token',
    'GORR',
    'GORR',
    'Gorrillazz native stablecoin with 1:1 USD peg',
    '100000000',
    18,
    '/gorr-logo.png',
    'gorrillazz',
    '0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74',
    'admin_user',
    'deployed'
)
ON CONFLICT ("contractAddress") DO UPDATE SET "totalSupply" = '100000000';

-- Update USDCc token with 100M supply
INSERT INTO "Token" ("id", "name", "symbol", "description", "totalSupply", "decimals", "logoUrl", "network", "contractAddress", "creatorId", "status")
VALUES (
    'usdcc_gorr_token',
    'USDCc',
    'USDCc',
    'USD Coin Custom stablecoin with 1:1 USD peg on Gorrillazz network',
    '100000000',
    18,
    '/usdcc-logo.png',
    'gorrillazz',
    'gorr_usdcc',
    'admin_user',
    'deployed'
)
ON CONFLICT ("contractAddress") DO UPDATE SET "totalSupply" = '100000000';

-- Create USDCc token entry
INSERT INTO "Token" ("id", "name", "symbol", "description", "totalSupply", "decimals", "logoUrl", "network", "contractAddress", "creatorId", "status")
VALUES (
    'usdcc_gorr_token',
    'USDCc',
    'USDCc',
    'USD Coin Custom stablecoin with 1:1 USD peg on Gorrillazz network',
    '400000000',
    18,
    '/usdcc-logo.png',
    'GORR',
    'gorr_usdcc',
    'gorr_system_user',
    'deployed'
)
ON CONFLICT ("contractAddress") DO NOTHING;

-- Grant necessary permissions (adjust based on your Neon setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_database_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_database_user;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully!';
    RAISE NOTICE 'Tables created: User, Token, LiquidityPool, Transaction, GorrPrice';
    RAISE NOTICE 'Admin wallet: 0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74';
    RAISE NOTICE 'GORR initial supply: 100,000,000 tokens';
    RAISE NOTICE 'USDCc initial supply: 100,000,000 tokens';
END $$;
