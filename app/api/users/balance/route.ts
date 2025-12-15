import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSolanaBalance } from "@/lib/blockchain/solana"
import { getEthereumBalance } from "@/lib/blockchain/ethereum"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")
    const network = searchParams.get("network") as "solana" | "ethereum" | "bnb" | "gorrillazz" | null

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    // Get GORR balance from database
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    })
    const gorrBalance = user?.gorrBalance || 0

    // Get native token balance from blockchain
    let nativeBalance = 0
    try {
      if (network === "solana") {
        nativeBalance = await getSolanaBalance(walletAddress)
      } else if (network === "ethereum" || network === "bnb") {
        nativeBalance = await getEthereumBalance(walletAddress, network)
      } else if (network === "gorrillazz") {
        // For Gorrillazz network, use the GORR balance from database
        nativeBalance = gorrBalance
      }
    } catch (error) {
      console.error("[v0] Blockchain balance fetch error:", error)
      // Continue with 0 balance if blockchain fetch fails
    }

    return NextResponse.json({
      walletAddress,
      network,
      nativeBalance,
      gorrBalance,
    })
  } catch (error) {
    console.error("[v0] Balance fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
