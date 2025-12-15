import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contractAddress, chain, walletAddress, name, symbol, decimals, logo } = body

    if (!contractAddress || !chain || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const importedToken = {
      id: contractAddress,
      name: name || "Custom Token",
      symbol: symbol || "CTK",
      chain,
      contractAddress,
      decimals: decimals || 18,
      balance: 0,
      price: 0,
      change24h: 0,
      logo: logo || "https://via.placeholder.com/40",
      imported: true,
      isPopular: false,
    }

    return NextResponse.json({ success: true, token: importedToken })
  } catch (error) {
    return NextResponse.json({ error: "Failed to import token" }, { status: 500 })
  }
}
