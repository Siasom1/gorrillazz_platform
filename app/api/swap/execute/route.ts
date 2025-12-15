import { NextResponse } from "next/server"
import { executeSwap } from "@/lib/swap-engine"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fromToken, toToken, amount, fromChain, toChain, walletAddress, slippage } = body

    if (!fromToken || !toToken || !amount || !fromChain || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await executeSwap({
      fromToken,
      toToken,
      amount: Number.parseFloat(amount),
      fromChain,
      toChain: toChain || fromChain,
      walletAddress,
      slippage,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to execute swap" }, { status: 500 })
  }
}
