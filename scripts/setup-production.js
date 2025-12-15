const fs = require("fs")
const path = require("path")

console.log("🚀 GORRILLAZZ Production Setup\n")

// Required environment variables
const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "NEXT_PUBLIC_ADMIN_WALLET_ADDRESS",
  "GORRILLAZZ_RPC_URL",
  "GORRILLAZZ_CHAIN_ID",
  "GORRILLAZZ_PRIVATE_KEY",
  "GORR_CONTRACT_ADDRESS_GORRILLAZZ",
  "USDCC_CONTRACT_ADDRESS_GORRILLAZZ",
  "ETHEREUM_RPC_URL",
  "ETHEREUM_PRIVATE_KEY",
]

// Check environment variables
console.log("📋 Checking environment variables...")
const missingVars = []

REQUIRED_ENV_VARS.forEach((varName) => {
  if (!process.env[varName]) {
    missingVars.push(varName)
  }
})

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:")
  missingVars.forEach((v) => console.error(`   - ${v}`))
  console.error("\n💡 Copy .env.production to .env and fill in the values")
  process.exit(1)
}

console.log("✅ All required environment variables are set\n")

// Scan for mock data
console.log("🔍 Scanning for mock data and hardcoded values...")

const mockPatterns = [/mock[A-Z]\w+/g, /placeholder/gi, /test[_-]?\w+/gi, /gorr_admin_wallet_2024/g, /0x\.\.\./g]

const filesToScan = ["lib/blockchain/**/*.ts", "app/api/**/*.ts", "lib/**/*.ts"]

const foundIssues = []

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8")

  mockPatterns.forEach((pattern) => {
    const matches = content.match(pattern)
    if (matches) {
      foundIssues.push({
        file: filePath,
        matches: matches,
      })
    }
  })
}

// Recursively scan files
function scanDirectory(dir) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      scanDirectory(filePath)
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      scanFile(filePath)
    }
  })
}

scanDirectory("lib")
scanDirectory("app/api")

if (foundIssues.length > 0) {
  console.warn("⚠️  Found potential mock data or hardcoded values:")
  foundIssues.forEach((issue) => {
    console.warn(`   ${issue.file}: ${issue.matches.join(", ")}`)
  })
  console.warn("\n💡 Review these files before deploying to production\n")
} else {
  console.log("✅ No mock data or hardcoded values found\n")
}

// Generate production summary
console.log("📊 Production Configuration Summary:")
console.log(`   Admin Wallet: ${process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS}`)
console.log(`   GORR Contract: ${process.env.GORR_CONTRACT_ADDRESS_GORRILLAZZ}`)
console.log(`   USDCc Contract: ${process.env.USDCC_CONTRACT_ADDRESS_GORRILLAZZ}`)
console.log(`   Gorrillazz RPC: ${process.env.GORRILLAZZ_RPC_URL}`)
console.log(`   Ethereum RPC: ${process.env.ETHEREUM_RPC_URL}`)
console.log(`   Database: ${process.env.DATABASE_URL.split("@")[1]?.split("/")[0] || "Connected"}`)
console.log("\n✅ Production setup complete!")
console.log("\n📝 Next steps:")
console.log("   1. Run: npm run build")
console.log("   2. Test: npm run start")
console.log("   3. Deploy to Vercel or your hosting provider")
console.log("   4. Configure DNS for gorrillaz.app")
console.log("   5. Set up SSL certificates")
console.log("\n🎉 Ready for production deployment!")
