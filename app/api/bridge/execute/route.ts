import { NextResponse } from "next/server"
import { bridgeToken } from "@/lib/bridge-engine"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, amount, fromChain, toChain, walletAddress } = body

    const result = await bridgeToken({
      token,
      amount,
      fromChain,
      toChain,
      walletAddress,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Bridge execution failed" }, { status: 500 })
  }
}
