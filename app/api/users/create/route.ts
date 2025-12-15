import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, email, username } = body

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress },
    })

    if (existingUser) {
      return NextResponse.json({
        user: {
          id: existingUser.id,
          walletAddress: existingUser.walletAddress,
          email: existingUser.email,
          username: existingUser.username,
          gorrBalance: existingUser.gorrBalance,
        },
      })
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        walletAddress,
        email,
        username,
        gorrBalance: 0,
      },
    })

    return NextResponse.json({
      user: {
        id: newUser.id,
        walletAddress: newUser.walletAddress,
        email: newUser.email,
        username: newUser.username,
        gorrBalance: newUser.gorrBalance,
      },
    })
  } catch (error) {
    console.error("[v0] User creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
