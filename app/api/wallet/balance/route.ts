import { NextResponse } from "next/server"
import { GORR_TOKEN, USDCC_TOKEN } from "@/lib/constants/gorr-token"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get("wallet")
  const chain = searchParams.get("chain")

  console.log("[v0] Auto-detecting wallet type for:", wallet)

  if (!wallet) {
    return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
  }

  try {
    const isGorrWallet = wallet.startsWith("gorr_") || wallet === GORR_TOKEN.initialWallet

    if (isGorrWallet) {
      const gorrBalance = wallet === GORR_TOKEN.initialWallet ? GORR_TOKEN.totalSupply : 1000.0
      const usdccBalance = wallet === GORR_TOKEN.initialWallet ? USDCC_TOKEN.totalSupply : 500.0

      const balances = {
        wallet,
        chain: "gorrillazz",
        tokens: [
          {
            id: "gorr",
            symbol: "GORR",
            name: "Gorrillazz",
            balance: gorrBalance.toString(),
            price: GORR_TOKEN.price,
            value: gorrBalance * GORR_TOKEN.price,
            chain: "gorrillazz",
            logo: "/gorr-logo.svg",
            contractAddress: "gorr_native_token",
            decimals: 18,
            isNative: false,
            change24h: 0,
          },
          {
            id: "usdcc",
            symbol: "USDCc",
            name: "USD Coin Custom",
            balance: usdccBalance.toString(),
            price: USDCC_TOKEN.price,
            value: usdccBalance * USDCC_TOKEN.price,
            chain: "gorrillazz",
            logo: "/usdcc-logo.png",
            contractAddress: process.env.NEXT_PUBLIC_USDCC_CONTRACT_ADDRESS,
            decimals: 18,
            isNative: false,
            change24h: 0,
          },
        ],
        totalValue: gorrBalance * GORR_TOKEN.price + usdccBalance * USDCC_TOKEN.price,
      }

      console.log("[v0] Returning mock Gorrillazz balances:", balances)
      return NextResponse.json(balances)
    }

    // For other chains, return mock data
    const nativeBalance = 2.5
    const nativePrice = chain === "ethereum" ? 3245.67 : chain === "bnb" ? 312.45 : chain === "solana" ? 98.76 : 0

    const balances = {
      wallet,
      chain,
      tokens: [
        {
          symbol: chain === "ethereum" ? "ETH" : chain === "bnb" ? "BNB" : "SOL",
          name: chain === "ethereum" ? "Ethereum" : chain === "bnb" ? "BNB" : "Solana",
          balance: nativeBalance.toString(),
          price: nativePrice,
          value: nativeBalance * nativePrice,
          chain: chain || "ethereum",
          logo: `/placeholder.svg?height=32&width=32&query=${chain}`,
        },
      ],
      totalValue: nativeBalance * nativePrice,
    }

    return NextResponse.json(balances)
  } catch (error) {
    console.error("[v0] Balance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
