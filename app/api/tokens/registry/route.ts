import { NextResponse } from "next/server"
import { tokenRegistry } from "@/lib/token-registry"

// GET /api/tokens/registry - Get token list
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get("format") // 'json' or 'uniswap'

  try {
    if (format === "uniswap") {
      // Export in Uniswap token list format
      const tokenList = tokenRegistry.exportTokenList()
      return NextResponse.json(tokenList)
    }

    // Return verified tokens
    const tokens = tokenRegistry.getVerifiedTokens()
    return NextResponse.json({ tokens, count: tokens.length })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch token registry" }, { status: 500 })
  }
}

// POST /api/tokens/registry - Submit token for verification
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { chainId, address, metadata, criteria } = body

    // Add token to registry
    const added = tokenRegistry.addToken({
      chainId,
      address,
      ...metadata,
      verified: false,
    })

    if (!added) {
      return NextResponse.json({ error: "Failed to add token" }, { status: 400 })
    }

    // Verify token if criteria provided
    if (criteria) {
      const verified = await tokenRegistry.verifyToken(chainId, address, criteria)
      return NextResponse.json({ success: true, verified })
    }

    return NextResponse.json({ success: true, verified: false })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit token" }, { status: 500 })
  }
}
