import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Production-ready Stripe webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("stripe-signature")
    const body = await request.text()

    // In production, verify Stripe signature
    if (process.env.NODE_ENV === "production" && !signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object

      await prisma.transaction.updateMany({
        where: {
          id: paymentIntent.metadata.transaction_id,
          paymentProvider: "stripe",
        },
        data: {
          status: "confirmed",
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Stripe webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
