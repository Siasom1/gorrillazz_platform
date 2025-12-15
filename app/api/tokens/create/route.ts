import { type NextRequest, NextResponse } from "next/server"
import { deploySolanaToken, createSolanaLiquidityPool } from "@/lib/blockchain/solana"
import { deployEthereumToken, createEthereumLiquidityPool } from "@/lib/blockchain/ethereum"
import { deployGorrillazzToken, createGorrillazzLiquidityPool } from "@/lib/blockchain/gorrillazz"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tokenData, walletAddress } = body

    console.log("[v0] Token creation request:", tokenData)

    // Validate required fields
    if (!tokenData.name || !tokenData.symbol || !tokenData.totalSupply || !tokenData.network) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet not connected" }, { status: 401 })
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          gorrBalance: 0,
        },
      })
    }

    // Deploy token based on network
    let deployResult
    let poolResult

    switch (tokenData.network) {
      case "gorrillazz":
        deployResult = await deployGorrillazzToken(
          {
            name: tokenData.name,
            symbol: tokenData.symbol,
            decimals: tokenData.decimals || 18,
            totalSupply: tokenData.totalSupply,
            logoUrl: tokenData.logoUrl,
          },
          walletAddress,
        )

        if (deployResult.success && tokenData.liquidityAmount && deployResult.contractAddress) {
          poolResult = await createGorrillazzLiquidityPool(
            deployResult.contractAddress,
            tokenData.liquidityAmount,
            tokenData.lockPeriod || 0,
          )
        }
        break

      case "ethereum":
      case "bnb":
        deployResult = await deployEthereumToken(
          {
            name: tokenData.name,
            symbol: tokenData.symbol,
            decimals: tokenData.decimals || 18,
            totalSupply: tokenData.totalSupply,
            logoUrl: tokenData.logoUrl,
            mintable: tokenData.mintable,
            burnable: tokenData.burnable,
            pausable: tokenData.pausable,
          },
          walletAddress,
          tokenData.network,
        )

        if (deployResult.success && tokenData.liquidityAmount && deployResult.contractAddress) {
          poolResult = await createEthereumLiquidityPool(
            deployResult.contractAddress,
            tokenData.liquidityAmount,
            tokenData.lockPeriod || 0,
            tokenData.network,
          )
        }
        break

      case "solana":
        deployResult = await deploySolanaToken(
          {
            name: tokenData.name,
            symbol: tokenData.symbol,
            decimals: tokenData.decimals || 9,
            totalSupply: tokenData.totalSupply,
            logoUrl: tokenData.logoUrl,
          },
          walletAddress,
        )

        if (deployResult.success && tokenData.liquidityAmount && deployResult.contractAddress) {
          poolResult = await createSolanaLiquidityPool(
            deployResult.contractAddress,
            tokenData.liquidityAmount,
            tokenData.lockPeriod || 0,
          )
        }
        break

      default:
        return NextResponse.json({ error: "Unsupported network" }, { status: 400 })
    }

    if (!deployResult.success) {
      return NextResponse.json({ error: deployResult.error || "Token deployment failed" }, { status: 500 })
    }

    const newToken = await prisma.token.create({
      data: {
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description,
        totalSupply: tokenData.totalSupply,
        decimals: tokenData.decimals || (tokenData.network === "solana" ? 9 : 18),
        logoUrl: tokenData.logoUrl,
        network: tokenData.network,
        contractAddress: deployResult.contractAddress,
        creatorId: user.id,
        status: "deployed",
        mintable: tokenData.mintable || false,
        burnable: tokenData.burnable || false,
        pausable: tokenData.pausable || false,
        website: tokenData.website,
        twitter: tokenData.twitter,
        telegram: tokenData.telegram,
        discord: tokenData.discord,
      },
    })

    let liquidityPool = null
    if (poolResult?.success && poolResult.poolAddress) {
      liquidityPool = await prisma.liquidityPool.create({
        data: {
          tokenId: newToken.id,
          initialLiquidity: tokenData.liquidityAmount,
          lockPeriod: tokenData.lockPeriod || 0,
          lockedUntil: tokenData.lockPeriod
            ? new Date(Date.now() + tokenData.lockPeriod * 24 * 60 * 60 * 1000)
            : undefined,
          poolAddress: poolResult.poolAddress,
          status: "active",
        },
      })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      token: {
        id: newToken.id,
        contractAddress: deployResult.contractAddress,
        network: tokenData.network,
        name: tokenData.name,
        symbol: tokenData.symbol,
      },
      liquidityPool: liquidityPool
        ? {
            id: liquidityPool.id,
            poolAddress: liquidityPool.poolAddress,
          }
        : null,
    })
  } catch (error) {
    console.error("[v0] Token creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
