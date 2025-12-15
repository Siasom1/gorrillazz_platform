import { NextResponse } from "next/server"
import { getSwapQuote } from "@/lib/swap-engine"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fromToken, toToken, amount, slippage } = body

    if (!fromToken || !toToken || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const quote = await getSwapQuote(fromToken, toToken, Number.parseFloat(amount), slippage)

    return NextResponse.json({ success: true, quote })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get swap quote" }, { status: 500 })
  }
}
