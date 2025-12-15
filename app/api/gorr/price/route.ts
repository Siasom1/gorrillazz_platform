import { NextResponse } from "next/server"
import { getGorrPrice } from "@/lib/blockchain/gorrillazz"

export async function GET() {
  try {
    const price = getGorrPrice()

    return NextResponse.json({
      price,
      currency: "USD",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] GORR price error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
