import { NextResponse } from "next/server"

const RPC_URL = process.env.GORR_NODE_RPC_URL || "http://localhost:9000"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { merchant, amount, token } = body

    if (!merchant || !amount || !token) {
      return NextResponse.json({ error: "Missing merchant, amount or token" }, { status: 400 })
    }

    const rpcPayload = {
      jsonrpc: "2.0",
      method: "gorr_createPaymentIntent",
      params: [merchant, amount, token],
      id: 1,
    }

    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rpcPayload),
    })

    const json = await res.json()

    if (json.error) {
      return NextResponse.json({ error: json.error }, { status: 500 })
    }

    return NextResponse.json(json.result)
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Internal error" },
      { status: 500 },
    )
  }
}
