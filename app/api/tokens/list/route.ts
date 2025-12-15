import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    const where = walletAddress ? { creatorId: walletAddress } : {}
    const tokens = await prisma.token.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        creator: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    })

    const formattedTokens = tokens.map((token) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      network: token.network,
      contractAddress: token.contractAddress,
      totalSupply: token.totalSupply,
      logoUrl: token.logoUrl,
      status: token.status,
      createdAt: token.createdAt.toISOString(),
      creator: token.creator,
    }))

    return NextResponse.json({
      tokens: formattedTokens,
    })
  } catch (error) {
    console.error("[v0] Token list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
