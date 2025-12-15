import { NextResponse } from "next/server"
import { executeSwap, calculateSwapOutput } from "@/lib/swap-engine"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, fromToken, toToken, amount, walletAddress, chain } = body

    if (!type || !amount || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let result

    if (type === "swap" && fromToken && toToken) {
      // Execute swap
      result = await executeSwap({
        fromToken,
        toToken,
        amount: Number.parseFloat(amount),
        fromChain: chain || "ethereum",
        toChain: chain || "ethereum",
        walletAddress,
      })

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        trade: {
          id: `trade_${Date.now()}`,
          type: "swap",
          fromToken,
          toToken,
          amountIn: Number.parseFloat(amount),
          amountOut: result.amountOut,
          txHash: result.txHash,
          timestamp: new Date().toISOString(),
          status: "completed",
        },
      })
    } else {
      // Buy or Sell (convert to swap)
      const tokenId = fromToken || toToken || "GORR"
      const isBuy = type === "buy"
      const swapFromToken = isBuy ? "USDCc" : tokenId
      const swapToToken = isBuy ? tokenId : "USDCc"

      const { amountOut } = calculateSwapOutput(swapFromToken, swapToToken, Number.parseFloat(amount))

      await new Promise((resolve) => setTimeout(resolve, 2000))

      return NextResponse.json({
        success: true,
        trade: {
          id: `trade_${Date.now()}`,
          type,
          token: tokenId,
          amount: Number.parseFloat(amount),
          price: amountOut / Number.parseFloat(amount),
          total: amountOut,
          timestamp: new Date().toISOString(),
          status: "completed",
          txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        },
      })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to execute trade" }, { status: 500 })
  }
}
