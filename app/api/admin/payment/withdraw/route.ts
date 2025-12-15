import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ADMIN_WALLET_ADDRESS } from "@/lib/payment-providers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminWallet, provider, amount, currency, destination } = body

    if (adminWallet !== ADMIN_WALLET_ADDRESS) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!provider || !amount || !destination) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const fee = 0
    const netAmount = amount

    let user = await prisma.user.findUnique({
      where: { walletAddress: ADMIN_WALLET_ADDRESS },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: ADMIN_WALLET_ADDRESS, username: "admin" },
      })
    }

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
        fee: 0,
        netAmount,
        fromAddress: ADMIN_WALLET_ADDRESS,
        toAddress: destination,
      },
    })

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
        fee: 0,
        status: transaction.status,
        isAdminWallet: true,
      },
    })
  } catch (error) {
    console.error("[v0] Admin withdrawal error:", error)
    return NextResponse.json({ error: "Withdrawal failed" }, { status: 500 })
  }
}
