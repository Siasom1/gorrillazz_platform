import { NextResponse } from "next/server"

const ALL_TOKENS = [
  {
    id: "gorr",
    name: "Gorrillazz",
    symbol: "GORR",
    chain: "gorrillazz",
    price: 1.0, // 1:1 USD peg
    change24h: 0.0,
    marketCap: 400000000,
    volume24h: 5000000,
    logo: "/gorr-logo.png",
    isPopular: true,
    balance: 0,
    verified: true,
    type: "stablecoin",
  },
  {
    id: "usdcc",
    name: "USD Coin Custom",
    symbol: "USDCc",
    chain: "gorrillazz", // Changed from ethereum to gorrillazz
    price: 1.0, // 1:1 USD peg
    change24h: 0.0,
    marketCap: 400000000,
    volume24h: 8000000,
    logo: "/usdcc-logo.png",
    isPopular: true,
    balance: 0,
    verified: true,
    type: "stablecoin",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    chain: "ethereum",
    price: 3245.67,
    change24h: 2.34,
    marketCap: 390000000000,
    volume24h: 15000000000,
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    isPopular: true,
    balance: 0,
    verified: true,
  },
  {
    id: "bnb",
    name: "BNB",
    symbol: "BNB",
    chain: "bnb",
    price: 312.45,
    change24h: -1.23,
    marketCap: 48000000000,
    volume24h: 1200000000,
    logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
    isPopular: true,
    balance: 0,
    verified: true,
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    chain: "solana",
    price: 98.76,
    change24h: 5.67,
    marketCap: 42000000000,
    volume24h: 2500000000,
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
    isPopular: true,
    balance: 0,
    verified: true,
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    chain: "ethereum",
    price: 1.0,
    change24h: 0.01,
    marketCap: 25000000000,
    volume24h: 3000000000,
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    isPopular: true,
    balance: 0,
    verified: true,
    type: "stablecoin",
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    chain: "ethereum",
    price: 1.0,
    change24h: -0.01,
    marketCap: 95000000000,
    volume24h: 45000000000,
    logo: "https://cryptologos.cc/logos/tether-usdt-logo.png",
    isPopular: true,
    balance: 0,
    verified: true,
    type: "stablecoin",
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    chain: "bitcoin",
    price: 67234.56,
    change24h: 3.45,
    marketCap: 1300000000000,
    volume24h: 28000000000,
    logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    isPopular: true,
    balance: 0,
    verified: true,
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") // 'all', 'popular', 'chain'
  const chain = searchParams.get("chain")

  try {
    let tokens = ALL_TOKENS

    if (type === "popular") {
      tokens = tokens.filter((t) => t.isPopular)
    }

    if (chain && chain !== "all") {
      tokens = tokens.filter((t) => t.chain === chain)
    }

    return NextResponse.json({ tokens, count: tokens.length })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 })
  }
}
