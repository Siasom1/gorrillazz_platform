// app/api/gorr/admin-transfer/route.ts
import { NextRequest, NextResponse } from "next/server"
import { JsonRpcProvider, Wallet } from "ethers"

const RPC_URL = process.env.GORR_RPC_URL || "http://localhost:9000"
const ADMIN_KEY = process.env.GORR_ADMIN_PRIVATE_KEY

export async function POST(req: NextRequest) {
  if (!ADMIN_KEY) {
    return NextResponse.json(
      { error: "GORR_ADMIN_PRIVATE_KEY is not set on server" },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()
    const { to, amountWei, token } = body as {
      to: string
      amountWei: string
      token?: string
    }

    if (!to || !amountWei) {
      return NextResponse.json({ error: "to and amountWei are required" }, { status: 400 })
    }

    if (token && token !== "GORR") {
      return NextResponse.json({ error: "only GORR transfers supported for now" }, { status: 400 })
    }

    const provider = new JsonRpcProvider(RPC_URL, {
      name: "gorrillazz",
      chainId: 9999,
    })

    const wallet = new Wallet(ADMIN_KEY, provider)

    const tx = await wallet.sendTransaction({
      to,
      value: BigInt(amountWei),
      // je kunt hier nog gasPrice etc. instellen, maar je node heeft static gasPrice
    })

    const receipt = await tx.wait()

    return NextResponse.json({
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      status: receipt?.status ?? 1,
    })
  } catch (err) {
    console.error("[/api/gorr/admin-transfer] error:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
