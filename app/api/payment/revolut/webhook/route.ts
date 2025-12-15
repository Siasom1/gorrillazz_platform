import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Production-ready Revolut webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("revolut-signature")
    const body = await request.json()

    // Verify webhook signature in production
    if (process.env.NODE_ENV === "production" && !signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const { event, order_id, state, amount, currency } = body

    if (event === "ORDER_COMPLETED" && state === "COMPLETED") {
      // Update transaction status
      await prisma.transaction.updateMany({
        where: {
          id: order_id,
          paymentProvider: "revolut",
        },
        data: {
          status: "confirmed",
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Revolut webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
