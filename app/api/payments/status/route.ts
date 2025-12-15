import { NextResponse } from "next/server"

const RPC_URL = process.env.GORR_NODE_RPC_URL || "http://localhost:9000"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get("id")

    if (!idParam) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const id = Number(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const rpcPayload = {
      jsonrpc: "2.0",
      method: "gorr_getPaymentIntent",
      params: [id],
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

    return NextResponse.json({ intent: json.result })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Internal error" },
      { status: 500 },
    )
  }
}
