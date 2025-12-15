export const GORR_TOKEN = {
  name: "Gorrillazz",
  symbol: "GORR",
  decimals: 18,
  totalSupply: 100000000,
  initialWallet: "0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74",
  logoUrl: "/gorr-logo.png",
  description: "Native stablecoin of the Gorrillazz platform",
  price: 1.0,
  chain: "gorrillazz",
  verified: true,
  type: "stablecoin",
  isPrimary: true,
}

export const USDCC_TOKEN = {
  name: "USD Coin Custom",
  symbol: "USDCc",
  decimals: 6,
  totalSupply: 100000000,
  initialWallet: "0x9Fe0B2d8412A7E21195B08D7F119A90907e5aC74",
  logoUrl: "/usdcc-logo.png",
  description: "Custom USD Coin on Gorrillazz network",
  price: 1.0,
  chain: "gorrillazz",
  verified: true,
  type: "stablecoin",
  isPrimary: false,
}

export const SUPPORTED_CHAINS = [
  { id: "gorrillazz", name: "Gorrillazz", symbol: "GORR", color: "#9333EA", isPrimary: true },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", color: "#627EEA", isPrimary: false },
  { id: "bnb", name: "BNB Chain", symbol: "BNB", color: "#F3BA2F", isPrimary: false },
  { id: "solana", name: "Solana", symbol: "SOL", color: "#14F195", isPrimary: false },
] as const
