"use client"

import { useWallet } from "@/lib/wallet-context"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import GL from "@/components/gl"
import Navigation from "@/components/navigation"
import BackButton from "@/components/back-button"
import GlassCard from "@/components/glass/glass-card"
import GlassButton from "@/components/glass/glass-button"
import { Coins, TrendingUp, Wallet, Plus, ExternalLink, Copy, Check } from "lucide-react"
import Link from "next/link"
import WalletConnectModal from "@/components/wallet-connect-modal"

interface Token {
  id: string
  name: string
  symbol: string
  network: string
  contractAddress: string
  totalSupply: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const { address, isConnected } = useWallet()
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      fetchTokens()
    } else {
      setIsLoading(false)
    }
  }, [isConnected, address])

  const fetchTokens = async () => {
    try {
      const response = await fetch(`/api/tokens/list?wallet=${address}`)
      const data = await response.json()
      setTokens(data.tokens || [])
    } catch (error) {
      console.error("[v0] Failed to fetch tokens:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr)
    setCopiedAddress(addr)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  if (!isConnected) {
    return (
      <>
        <GL hovering={false} />
        <Navigation />
        <BackButton href="/" />
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 max-w-md"
          >
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Connect Your Wallet</h1>
            <p className="text-muted-foreground">
              Please connect your wallet to view your dashboard and manage your tokens.
            </p>
            <GlassButton variant="primary" size="lg" onClick={() => setIsWalletModalOpen(true)}>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </GlassButton>
          </motion.div>
        </div>
        <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      <GL hovering={false} />
      <Navigation />
      <BackButton href="/" />
      <div className="min-h-screen p-4 md:p-8 pt-32">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your tokens and track your portfolio</p>
          </motion.div>

          {/* Stats Cards - Using GlassCard components */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Total Tokens</span>
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{tokens.length}</p>
              <p className="text-xs text-muted-foreground">Across all networks</p>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Portfolio Value</span>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">$0.00</p>
              <p className="text-xs text-green-500">+0.00% (24h)</p>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">GORR Balance</span>
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">0.00</p>
              <p className="text-xs text-muted-foreground">≈ $0.00 USD</p>
            </GlassCard>
          </motion.div>

          {/* Tokens List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Your Tokens</h2>
              <Link href="/create">
                <GlassButton variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Token
                </GlassButton>
              </Link>
            </div>

            {isLoading ? (
              <GlassCard hover={false}>
                <div className="p-12 text-center">
                  <p className="text-muted-foreground">Loading tokens...</p>
                </div>
              </GlassCard>
            ) : tokens.length === 0 ? (
              <GlassCard hover={false}>
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full glass-strong flex items-center justify-center mx-auto">
                    <Coins className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">No tokens yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Create your first token to get started with Gorrillazz platform
                  </p>
                  <Link href="/create">
                    <GlassButton variant="primary" size="lg" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Token
                    </GlassButton>
                  </Link>
                </div>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {tokens.map((token, index) => (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl glass-strong flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">{token.symbol.charAt(0)}</span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">{token.name}</h3>
                              <p className="text-sm text-muted-foreground">{token.symbol}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 rounded-full glass-strong text-xs text-foreground capitalize">
                                {token.network}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  token.status === "deployed"
                                    ? "bg-green-500/20 text-green-500"
                                    : "bg-yellow-500/20 text-yellow-500"
                                }`}
                              >
                                {token.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                              <span>{token.contractAddress}</span>
                              <button
                                onClick={() => copyAddress(token.contractAddress)}
                                className="hover:text-foreground transition-colors"
                              >
                                {copiedAddress === token.contractAddress ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-sm text-muted-foreground">Total Supply</p>
                          <p className="text-lg font-semibold text-foreground">
                            {Number(token.totalSupply).toLocaleString()}
                          </p>
                          <Link href={`/token/${token.id}`}>
                            <GlassButton variant="transparent" size="sm">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </GlassButton>
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}
