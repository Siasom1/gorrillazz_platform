// app/api/payments/merchant/route.ts
import { NextResponse } from "next/server"

const RPC_URL = process.env.GORR_RPC_URL || "http://localhost:8545"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const merchant = searchParams.get("merchant")

    if (!merchant) {
      return NextResponse.json({ error: "Missing merchant parameter" }, { status: 400 })
    }

    const rpcRes = await fetch(`${RPC_URL}/payments/merchant?merchant=${merchant}`)
    const json = await rpcRes.json()

    return NextResponse.json(json)
  } catch (e: any) {
    console.error("[API] Merchant payments error:", e)
    return NextResponse.json({ error: "Server error loading payments" }, { status: 500 })
  }
}
