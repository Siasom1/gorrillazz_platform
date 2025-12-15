import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { calculateNetAmount, ADMIN_WALLET_ADDRESS } from "@/lib/payment-providers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, provider, amount, currency, token } = body

    if (!walletAddress || !provider || !amount || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { fee, netAmount } = calculateNetAmount(provider, "deposit", amount, walletAddress)

    // Create user if doesn't exist
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress },
      })
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "deposit",
        amount: netAmount.toString(),
        network: "gorrillazz",
        status: "pending",
        paymentProvider: provider,
        paymentMethod: "deposit",
        fiatAmount: amount,
        fiatCurrency: currency || "USD",
        fee,
        netAmount,
        fromAddress: provider,
        toAddress: walletAddress,
      },
    })

    // In production, integrate with actual payment provider APIs
    // For now, simulate successful payment
    setTimeout(async () => {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "confirmed" },
      })
    }, 2000)

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: netAmount,
        fee,
        status: transaction.status,
        token,
        isAdminWallet: walletAddress === ADMIN_WALLET_ADDRESS,
      },
    })
  } catch (error) {
    console.error("[v0] Deposit error:", error)
    return NextResponse.json({ error: "Deposit failed" }, { status: 500 })
  }
}
