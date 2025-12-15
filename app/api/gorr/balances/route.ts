// app/api/gorr/balances/route.ts
import { NextRequest, NextResponse } from "next/server"

const RPC_URL = process.env.GORR_RPC_URL || "http://localhost:9000"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "address query param is required" }, { status: 400 })
    }

    const payload = {
      jsonrpc: "2.0",
      id: 1,
      method: "gorr_getBalances",
      params: [address],
    }

    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("[gorr_getBalances] RPC error:", text)
      return NextResponse.json({ error: "RPC error", detail: text }, { status: 500 })
    }

    const json = await res.json()

    if (json.error) {
      console.error("[gorr_getBalances] RPC returned error:", json.error)
      return NextResponse.json({ error: "RPC returned error", detail: json.error }, { status: 500 })
    }

    const result = json.result as { GORR: string; USDCc: string }

    // hex → bigint → string
    const gorrWei = BigInt(result.GORR || "0x0")
    const usdcWei = BigInt(result.USDCc || "0x0")

    return NextResponse.json({
      address,
      raw: result,
      parsed: {
        GORR: gorrWei.toString(),
        USDCc: usdcWei.toString(),
      },
    })
  } catch (err) {
    console.error("[/api/gorr/balances] error:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
