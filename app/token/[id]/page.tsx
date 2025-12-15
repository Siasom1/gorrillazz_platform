"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import GL from "@/components/gl"
import Navigation from "@/components/navigation"
import BackButton from "@/components/back-button"
import GlassCard from "@/components/glass/glass-card"
import GlassButton from "@/components/glass/glass-button"
import { Copy, Check, ExternalLink, TrendingUp, Droplet, Lock, Users, Activity } from "lucide-react"

interface TokenDetails {
  id: string
  name: string
  symbol: string
  network: string
  contractAddress: string
  totalSupply: string
  decimals: number
  status: string
  createdAt: string
  description?: string
  logoUrl?: string
  website?: string
  twitter?: string
  telegram?: string
  price?: number
  marketCap?: number
  holders?: number
  liquidityPool?: {
    poolAddress: string
    locked: boolean
    lockedUntil?: string
  }
}

export default function TokenDetailsPage() {
  const params = useParams()
  const [token, setToken] = useState<TokenDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  useEffect(() => {
    fetchTokenDetails()
  }, [params.id])

  const fetchTokenDetails = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockToken: TokenDetails = {
        id: params.id as string,
        name: "Gorilla Gold",
        symbol: "GGOLD",
        network: "solana",
        contractAddress: "Sol7x8y9z0a1b2c3d4e5f6",
        totalSupply: "1000000",
        decimals: 9,
        status: "deployed",
        createdAt: new Date().toISOString(),
        description: "A premium token for the Gorrillazz ecosystem",
        price: 0.5,
        marketCap: 500000,
        holders: 1234,
        liquidityPool: {
          poolAddress: "Pool1a2b3c4d5e6f7g8h9i0",
          locked: true,
          lockedUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      }

      setToken(mockToken)
    } catch (error) {
      console.error("[v0] Failed to fetch token details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr)
    setCopiedAddress(addr)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <GL hovering={false} />
        <Navigation />
        <BackButton href="/dashboard" />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading token details...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="relative min-h-screen">
        <GL hovering={false} />
        <Navigation />
        <BackButton href="/dashboard" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Token not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <GL hovering={false} />
      <Navigation />
      <BackButton href="/dashboard" />
      <div className="min-h-screen p-4 md:p-8 pt-32">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Token Header - Using GlassCard */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard variant="primary" hover={false}>
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl glass-strong flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{token.symbol.charAt(0)}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h1 className="text-4xl font-bold text-foreground">{token.name}</h1>
                      <p className="text-xl text-muted-foreground">{token.symbol}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full glass-strong text-sm text-foreground capitalize">
                        {token.network}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm">
                        {token.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                      <span>{token.contractAddress}</span>
                      <button
                        onClick={() => copyAddress(token.contractAddress)}
                        className="hover:text-foreground transition-colors"
                      >
                        {copiedAddress === token.contractAddress ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button className="hover:text-foreground transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-3xl font-bold text-foreground">${token.price?.toFixed(4)}</p>
                  <p className="text-sm text-green-500">+12.5% (24h)</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Market Cap</span>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">${token.marketCap?.toLocaleString()}</p>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Total Supply</span>
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{Number(token.totalSupply).toLocaleString()}</p>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Holders</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{token.holders?.toLocaleString()}</p>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Liquidity</span>
                <Droplet className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {token.liquidityPool?.locked ? <Lock className="w-6 h-6 text-green-500" /> : "None"}
              </p>
            </GlassCard>
          </motion.div>

          {/* Description & Liquidity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard hover={false} className="h-full">
                <h2 className="text-xl font-bold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground mb-4">{token.description || "No description available"}</p>
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Decimals</span>
                    <span className="text-foreground font-semibold">{token.decimals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground font-semibold">
                      {new Date(token.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {token.liquidityPool && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <GlassCard hover={false} className="h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Liquidity Pool</h2>
                    {token.liquidityPool.locked && <Lock className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pool Address</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-mono text-xs">
                          {token.liquidityPool.poolAddress.slice(0, 8)}...
                        </span>
                        <button
                          onClick={() => copyAddress(token.liquidityPool!.poolAddress)}
                          className="hover:text-foreground transition-colors"
                        >
                          {copiedAddress === token.liquidityPool.poolAddress ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-foreground font-semibold">
                        {token.liquidityPool.locked ? "Locked" : "Unlocked"}
                      </span>
                    </div>
                    {token.liquidityPool.lockedUntil && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Locked Until</span>
                        <span className="text-foreground font-semibold">
                          {new Date(token.liquidityPool.lockedUntil).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <GlassButton variant="primary" className="w-full">
                    <Droplet className="w-4 h-4 mr-2" />
                    Manage Liquidity
                  </GlassButton>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
