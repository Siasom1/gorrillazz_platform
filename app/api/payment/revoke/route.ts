import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, reason } = body

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    if (transaction.status === "confirmed") {
      return NextResponse.json({ error: "Cannot revoke confirmed transaction" }, { status: 400 })
    }

    // Revoke the transaction
    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "revoked",
        revokedAt: new Date(),
        revokeReason: reason || "Payment not received",
      },
    })

    return NextResponse.json({
      success: true,
      transaction: updated,
    })
  } catch (error) {
    console.error("[v0] Revoke error:", error)
    return NextResponse.json({ error: "Revoke failed" }, { status: 500 })
  }
}
