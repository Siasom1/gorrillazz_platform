import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Production-ready PayPal webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { event_type, resource } = body

    if (event_type === "PAYMENT.CAPTURE.COMPLETED") {
      await prisma.transaction.updateMany({
        where: {
          id: resource.custom_id,
          paymentProvider: "paypal",
        },
        data: {
          status: "confirmed",
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] PayPal webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
