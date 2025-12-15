import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { calculateNetAmount, ADMIN_WALLET_ADDRESS } from "@/lib/payment-providers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, provider, amount, currency, token, destination } = body

    if (!walletAddress || !provider || !amount || !token || !destination) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { fee, netAmount } = calculateNetAmount(provider, "withdrawal", amount, walletAddress)

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "withdrawal",
        amount: amount.toString(),
        network: "gorrillazz",
        status: "pending",
        paymentProvider: provider,
        paymentMethod: "withdrawal",
        fiatAmount: netAmount,
        fiatCurrency: currency || "USD",
        fee,
        netAmount,
        fromAddress: walletAddress,
        toAddress: destination,
      },
    })

    // In production, integrate with actual payment provider APIs
    // Simulate processing
    setTimeout(async () => {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "confirmed" },
      })
    }, 3000)

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: netAmount,
        fee,
        status: transaction.status,
        destination,
        isAdminWallet: walletAddress === ADMIN_WALLET_ADDRESS,
      },
    })
  } catch (error) {
    console.error("[v0] Withdrawal error:", error)
    return NextResponse.json({ error: "Withdrawal failed" }, { status: 500 })
  }
}
