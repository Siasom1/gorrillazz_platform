import { type NextRequest, NextResponse } from "next/server"
import { priceFeed } from "@/lib/blockchain/price-feed"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const network = searchParams.get("network")

    if (token && network) {
      const price = await priceFeed.fetchTokenPrice(token, network)
      return NextResponse.json({ price })
    }

    // Return all prices
    const prices = Array.from(priceFeed.getAllPrices().values())
    return NextResponse.json({ prices })
  } catch (error) {
    console.error("[v0] Price fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
