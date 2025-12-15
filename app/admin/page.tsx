"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import GL from "@/components/gl"
import Navigation from "@/components/navigation"
import BackButton from "@/components/back-button"
import { GlassCard, GlassButton, GlassInput } from "@/components/glass"
import GlassToggle from "@/components/glass/glass-toggle"
import { useWallet } from "@/lib/wallet-context"
import { Wallet, Copy, Check, TrendingUp, TrendingDown, RefreshCw, Shield } from "lucide-react"
import { SUPPORTED_CHAINS } from "@/lib/constants/gorr-token"

interface PendingToken {
  chainId: number
  address: string
  name: string
  symbol: string
  logoURI: string
  registrationFee?: number
  extensions?: {
    website?: string
    description?: string
  }
}

// Hoofd admin-wallet (voor auth + merchant payments)
const GORR_ADMIN_ADDRESS = process.env.NEXT_PUBLIC_GORR_ADMIN_ADDRESS!
const GORR_TREASURY_ADDRESS = process.env.NEXT_PUBLIC_GORR_TREASURY_ADDRESS!
const ADMIN_WALLET =
  (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || GORR_ADMIN_ADDRESS || "").toLowerCase()

export default function AdminPage() {
  const router = useRouter()
  const { address, chain, balance, gorrBalance, isConnected, disconnect } = useWallet()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [pendingTokens, setPendingTokens] = useState<PendingToken[]>([])
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<"tokens" | "coins">("tokens")
  const [selectedChain, setSelectedChain] = useState<string>("all")
  const [tokens, setTokens] = useState<any[]>([])
  const [balances, setBalances] = useState<any>(null)
  

  
  const [gorrAdminOnchain, setGorrAdminOnchain] = useState<{ GORR: string; USDCc: string } | null>(null)
  const [gorrTreasuryOnchain, setGorrTreasuryOnchain] = useState<{ GORR: string; USDCc: string } | null>(null)

  // ---- REALTIME PAYMENTS ----
  const [wsConnected, setWsConnected] = useState(false)

  // ---- PAYMENT ADMIN STATE ----
  const [adminMerchantPayments, setAdminMerchantPayments] = useState<any[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState("")

  // ----------------------------------------------------
  // AUTH OP BASIS VAN WALLET (admin only)
  // ----------------------------------------------------
  useEffect(() => {
    if (!isConnected || !address || !ADMIN_WALLET) return

    if (address.toLowerCase() === ADMIN_WALLET) {
      setIsAuthenticated(true)
    }
  }, [isConnected, address])

  // ----------------------------------------------------
  // INITIAL DATA LOAD NA AUTH
  // ----------------------------------------------------
  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingTokens()
      fetchTokens()
      fetchBalances()
      fetchAdminPayments()
    }
  }, [isAuthenticated])

  // ----------------------------------------------------
  // REALTIME WEBSOCKET PAYMENT UPDATES
  // ----------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated) return

    const wsUrl = process.env.NEXT_PUBLIC_GORR_WS || "ws://localhost:9001/ws"
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log("[WS] Connected to Gorrillazz payment stream")
      setWsConnected(true)
    }

    ws.onmessage = (msg) => {
      try {
        const packet = JSON.parse(msg.data)

        if (packet.type === "payment_updated") {
          console.log("🔥 Payment updated:", packet.data)
          // Herlaad merchant payments
          fetchAdminPayments()
        }
      } catch (err) {
        console.warn("WS Message parse error:", err)
      }
    }

    ws.onclose = () => {
      console.log("[WS] Disconnected from payment stream")
      setWsConnected(false)
    }

    return () => ws.close()
  }, [isAuthenticated])

  const [systemWallets, setSystemWallets] = useState<{
  admin: string
  treasury: string
} | null>(null)

useEffect(() => {
  if (!isAuthenticated) return

  const loadSystemWallets = async () => {
    const res = await fetch("http://localhost:9000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "gorr_getSystemWallets",
        params: [],
        id: 1,
      }),
    })

    const json = await res.json()
    setSystemWallets(json.result)
  }

  loadSystemWallets()
}, [isAuthenticated])

useEffect(() => {
  if (!systemWallets) return

  const loadSystemBalances = async () => {
    const admin = await fetchOnchainBalances(systemWallets.admin)
    const treasury = await fetchOnchainBalances(systemWallets.treasury)

    setGorrAdminOnchain(admin)
    setGorrTreasuryOnchain(treasury)
  }

  loadSystemBalances()
}, [systemWallets])



  // ----------------------------------------------------
  // DATA LOADERS
  // ----------------------------------------------------
  const handleAdminMint = async (
  to: string,
  amount: number,
  token: "GORR" | "USDCc"
) => {
  if (!address) return

  await rpc("gorr_adminMint", [{
    from: address,
    to,
    amount,
    token,
  }])

  // refresh balances na mint
  await fetchBalances()
  await fetchAdminPayments()
}

  
  const fetchPendingTokens = async () => {
    try {
      const response = await fetch("/api/admin/tokens/pending")
      if (response.ok) {
        const data = await response.json()
        setPendingTokens(data.tokens)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch pending tokens:", error)
    }
  }

  const fetchTokens = async () => {
    try {
      const defaultTokens = [
        {
          id: "gorr",
          symbol: "GORR",
          name: "Gorrillazz",
          balance: "1000",
          price: 1,
          value: 1000,
          chain: "gorrillazz",
          logo: "/gorr-logo.svg",
          contractAddress: "gorr_native_token",
          decimals: 18,
          isNative: false,
          change24h: 0,
        },
        {
          id: "usdcc",
          symbol: "USDCc",
          name: "USD Coin Custom",
          balance: "500",
          price: 1,
          value: 500,
          chain: "gorrillazz",
          logo: "/usdcc-logo.png",
          contractAddress: process.env.NEXT_PUBLIC_USDCC_CONTRACT_ADDRESS,
          decimals: 18,
          isNative: false,
          change24h: 0,
        },
      ]
      setTokens(defaultTokens)

      const type = viewMode === "coins" ? "popular" : "all"
      const chainParam = selectedChain !== "all" ? `&chain=${selectedChain}` : ""
      const response = await fetch(`/api/tokens/index?type=${type}${chainParam}`)

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        if (data.tokens && data.tokens.length > 0) {
          setTokens(data.tokens)
        }
      }
    } catch (error) {
      // Keep default tokens on error
    }
  }

  const fetchBalances = async () => {
    try {
      const response = await fetch(`/api/wallet/balance?wallet=${address}&chain=${chain}`)

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        setBalances(data)
        if (data.tokens && data.tokens.length > 0) {
          setTokens((prevTokens) => {
            const balanceMap = new Map(data.tokens.map((t: any) => [t.symbol, t]))
            return prevTokens.map((token) => {
              const balanceData = balanceMap.get(token.symbol)
              return balanceData ? { ...token, ...balanceData } : token
            })
          })
        }
      }
    } catch (error) {
      // Silent fail
    }
  }

  // ---------------------------------------------
// GENERIC ON-CHAIN BALANCE FETCH (ANY WALLET)
// ---------------------------------------------
const fetchOnchainBalances = async (wallet: string) => {
  const res = await fetch(
    `/api/wallet/balance?wallet=${wallet}&chain=gorrillazz`,
  )
  const json = await res.json()

  return {
    GORR: json.tokens?.find((t: any) => t.symbol === "GORR")?.balance || "0",
    USDCc: json.tokens?.find((t: any) => t.symbol === "USDCc")?.balance || "0",
  }
}


  const fetchAdminPayments = async () => {
    try {
      setPaymentsLoading(true)
      setPaymentsError("")

      // admin address als merchant
      const merchant = ADMIN_WALLET

      if (!merchant) {
        setPaymentsError("ADMIN_WALLET is not configured")
        return
      }

      const res = await fetch(`/api/payments/merchant?merchant=${merchant}`)
      const json = await res.json()

      if (json.error) {
        setPaymentsError(json.error)
        return
      }

      setAdminMerchantPayments(json.payments || [])
    } catch (err: any) {
      setPaymentsError(err?.message ?? "Failed to load payments")
    } finally {
      setPaymentsLoading(false)
    }
  }

  

  // ----------------------------------------------------
  // UI HANDLERS
  // ----------------------------------------------------
  const handleRefresh = async () => {
    setLoading(true)
    await Promise.all([fetchTokens(), fetchBalances(), fetchPendingTokens(), fetchAdminPayments()])
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
      } else {
        setError("Invalid credentials")
      }
    } catch (error) {
      setError("Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      setIsAuthenticated(false)
      setUsername("")
      setPassword("")
    } catch (error) {
      console.error("[v0] Logout failed:", error)
    }
  }

  const handleApprove = async (chainId: number, tokenAddress: string) => {
    try {
      const response = await fetch("/api/admin/tokens/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chainId, address: tokenAddress }),
      })

      if (response.ok) {
        fetchPendingTokens()
      }
    } catch (error) {
      console.error("[v0] Approval failed:", error)
    }
  }

  const handleReject = async (chainId: number, tokenAddress: string) => {
    try {
      const response = await fetch("/api/admin/tokens/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chainId, address: tokenAddress }),
      })

      if (response.ok) {
        fetchPendingTokens()
      }
    } catch (error) {
      console.error("[v0] Rejection failed:", error)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleViewModeToggle = (checked: boolean) => {
    setViewMode(checked ? "coins" : "tokens")
  }

  const handleChainSelect = (chainId: string) => {
    setSelectedChain(chainId)
  }

  // ---------------------------------------------
// LOAD ON-CHAIN BALANCES (GORR + USDCc)
// ---------------------------------------------
const loadAdminOnchainBalances = async () => {
  try {
    const res = await fetch(`/api/wallet/balance?wallet=${GORR_ADMIN_ADDRESS}&chain=gorrillazz`)
    const json = await res.json()

    setGorrAdminOnchain({
      GORR: json.tokens?.find((t: any) => t.symbol === "GORR")?.balance || "0",
      USDCc: json.tokens?.find((t: any) => t.symbol === "USDCc")?.balance || "0",
    })
  } catch (err) {
    console.error("[ADMIN BALANCE] Failed:", err)
  }
}

const loadTreasuryOnchainBalances = async () => {
  try {
    const res = await fetch(`/api/wallet/balance?wallet=${GORR_TREASURY_ADDRESS}&chain=gorrillazz`)
    const json = await res.json()

    setGorrTreasuryOnchain({
      GORR: json.tokens?.find((t: any) => t.symbol === "GORR")?.balance || "0",
      USDCc: json.tokens?.find((t: any) => t.symbol === "USDCc")?.balance || "0",
    })
  } catch (err) {
    console.error("[TREASURY BALANCE] Failed:", err)
  }
}

useEffect(() => {
  if (isAuthenticated) {
    fetchPendingTokens()
    fetchTokens()
    fetchBalances()
    fetchAdminPayments()

    loadAdminOnchainBalances()
    loadTreasuryOnchainBalances()
  }
}, [isAuthenticated])

const handleAdminBurn = async (
  target: string,
  amount: number,
  token: "GORR" | "USDCc"
) => {
  if (!address) return

  await rpc("gorr_adminBurn", [{
    from: address,
    to: target,
    amount,
    token,
  }])

  // refresh
  await fetchBalances()
  await fetchAdminPayments()
}



  // ----------------------------------------------------
  // LOGIN VIEW
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <>
        <GL hovering={false} />
        <Navigation />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20">
          <BackButton />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <GlassCard className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/30 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 text-center">Admin Login</h1>
              <p className="text-white/60 text-center mb-8">
                Access the Gorrillazz admin dashboard
                {isConnected && <span className="block mt-2 text-sm">Connected wallet: {address}</span>}
              </p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Username</label>
                  <GlassInput
                    label="Username"
                    type="text"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
                  <GlassInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <GlassButton type="submit" disabled={loading} className="w-full">
                  {loading ? "Logging in..." : "Login"}
                </GlassButton>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </>
    )
  }

  // ----------------------------------------------------
  // ADMIN DASHBOARD VIEW
  // ----------------------------------------------------
  return (
    <>
      <GL hovering={false} />
      <Navigation />
      <main className="relative min-h-screen px-6 pt-24 pb-20">
        <BackButton />
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Admin <span className="text-primary">Dashboard</span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">Manage your wallet and token verifications</p>
          </motion.div>

          <div className="space-y-6 mb-8">
            <GlassCard variant="primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>

                  {gorrAdminOnchain && (
  <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
    <h4 className="text-sm font-semibold text-primary mb-2">Admin On-Chain Balances</h4>
    <p className="text-xs text-white/70">GORR: {gorrAdminOnchain.GORR}</p>
    <p className="text-xs text-white/70">USDCc: {gorrAdminOnchain.USDCc}</p>
  </div>
)}

{gorrTreasuryOnchain && (
  <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
    <h4 className="text-sm font-semibold text-accent mb-2">Treasury Wallet</h4>
    <p className="text-xs text-white/70">GORR: {gorrTreasuryOnchain.GORR}</p>
    <p className="text-xs text-white/70">USDCc: {gorrTreasuryOnchain.USDCc}</p>
  </div>
)}

                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Admin Wallet</h3>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground font-mono">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </code>
                      <button onClick={copyAddress} className="p-1 hover:bg-white/10 rounded transition-colors">
                        {copied ? (
                          <Check className="w-3 h-3 text-accent" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {balances && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Portfolio</p>
                    <p className="text-2xl font-bold text-foreground">${balances.totalValue?.toLocaleString()}</p>
                    <p className="text-xs text-accent">+2.34%</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <GlassButton variant="transparent" size="sm" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </GlassButton>
                  <GlassButton variant="danger" size="sm" onClick={handleLogout}>
                    Logout
                  </GlassButton>
                </div>
              </div>
            </GlassCard>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <GlassButton
                  variant={selectedChain === "all" ? "primary" : "transparent"}
                  size="sm"
                  onClick={() => handleChainSelect("all")}
                >
                  All
                </GlassButton>
                {SUPPORTED_CHAINS.map((c) => (
                  <GlassButton
                    key={c.id}
                    variant={selectedChain === c.id ? "primary" : "transparent"}
                    size="sm"
                    onClick={() => handleChainSelect(c.id)}
                  >
                    {c.symbol}
                  </GlassButton>
                ))}
              </div>

              <GlassToggle
                checked={viewMode === "coins"}
                onChange={handleViewModeToggle}
                label={viewMode === "coins" ? "Coins" : "Tokens"}
              />
            </div>

            <GlassCard>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {viewMode === "tokens" ? "Your Tokens" : "Popular Coins"}
              </h3>
              {loading && tokens.length === 0 ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading tokens...</p>
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No tokens found</p>
                  <GlassButton variant="primary" size="sm" onClick={fetchTokens}>
                    Refresh
                  </GlassButton>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {tokens.map((token) => (
                    <div
                      key={token.id}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                          <Image
                            src={
                              token.logo?.startsWith("/")
                                ? token.logo
                                : `/placeholder.svg?height=32&width=32&query=${token.symbol}`
                            }
                            alt={token.symbol}
                            width={32}
                            height={32}
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground truncate">{token.name}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Balance</span>
                          <span className="text-sm font-semibold text-foreground">
                            {token.balance || "0"} {token.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Value</span>
                          <span className="text-sm font-semibold text-foreground">
                            ${(Number(token.balance || 0) * token.price).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">24h</span>
                          <div className="flex items-center gap-1">
                            {token.change24h >= 0 ? (
                              <>
                                <TrendingUp className="w-3 h-3 text-accent" />
                                <span className="text-xs text-accent">+{token.change24h}%</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-3 h-3 text-destructive" />
                                <span className="text-xs text-destructive">{token.change24h}%</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-green-400" : "bg-red-400"}`}></div>
            <span>Realtime payments {wsConnected ? "online" : "offline"}</span>
          </div>

          {/* ADMIN PAYMENT OVERVIEW */}
          <GlassCard className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Merchant Payments (Admin)
              </h2>

              <GlassButton variant="transparent" size="sm" onClick={fetchAdminPayments} disabled={paymentsLoading}>
                <RefreshCw className={`w-4 h-4 ${paymentsLoading ? "animate-spin" : ""}`} />
              </GlassButton>
            </div>

            {paymentsError && <p className="text-red-400 text-sm mb-3">{paymentsError}</p>}

            {paymentsLoading && adminMerchantPayments.length === 0 ? (
              <div className="text-center py-10">
                <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-white/60">Loading payments…</p>
              </div>
            ) : adminMerchantPayments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-white/60">No merchant payments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminMerchantPayments.map((p) => (
                  <motion.div
                    key={p.ID}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <p className="text-white font-semibold text-sm">Payment #{p.ID}</p>
                      <p className="text-white/60 text-xs">
                        Amount: {p.Amount} {p.Token}
                      </p>
                      <p className="text-white/60 text-xs">
                        From: {p.Payer === "0x0000000000000000000000000000000000000000" ? "–" : p.Payer}
                      </p>
                      {p.TxHash && (
                        <p className="text-white/50 text-xs">
                          Tx: {p.TxHash}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-xs text-white/60 space-y-1">
                      <p>
                        Status: <span className="text-primary">{p.Status}</span>
                      </p>
                      <p>Created: {new Date(p.Timestamp * 1000).toLocaleString()}</p>
                      <p>Expires: {new Date(p.Expiry * 1000).toLocaleString()}</p>
                      {p.PaidAt && <p>Paid: {new Date(p.PaidAt * 1000).toLocaleString()}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Fee Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-1">GORR Token</p>
                <p className="text-2xl font-bold text-green-400">FREE</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-1">USDCc Token</p>
                <p className="text-2xl font-bold text-green-400">FREE</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-1">Other Tokens</p>
                <p className="text-2xl font-bold text-blue-400">200 GORR</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Pending Verifications ({pendingTokens.length})</h2>

            {pendingTokens.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">No pending token verifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTokens.map((token) => (
                  <motion.div
                    key={`${token.chainId}-${token.address}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={token.logoURI || "/placeholder.svg"}
                        alt={token.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="text-white font-semibold">
                          {token.name} ({token.symbol})
                        </h3>
                        <p className="text-white/60 text-sm">{token.address}</p>
                        {token.extensions?.website && (
                          <a
                            href={token.extensions.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm hover:underline"
                          >
                            {token.extensions.website}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right mr-4">
                        <p className="text-white/60 text-sm">Registration Fee</p>
                        <p className="text-white font-semibold">
                          {token.symbol === "GORR" || token.symbol === "USDCc" ? "FREE" : "200 GORR"}
                        </p>
                      </div>
                      <GlassButton
                        onClick={() => handleApprove(token.chainId, token.address)}
                        className="bg-green-500/20 hover:bg-green-500/30"
                      >
                        Approve
                      </GlassButton>
                      <GlassButton
                        onClick={() => handleReject(token.chainId, token.address)}
                        className="bg-red-500/20 hover:bg-red-500/30"
                      >
                        Reject
                      </GlassButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </>
  )
}
function rpc(arg0: string, arg1: { from: string; to: string; amount: number; token: "GORR" | "USDCc" }[]) {
  throw new Error("Function not implemented.")
}

