"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import GL from "@/components/gl"
import Navigation from "@/components/navigation"
import BackButton from "@/components/back-button"
import GlassCard from "@/components/glass/glass-card"
import GlassButton from "@/components/glass/glass-button"
import GlassInput from "@/components/glass/glass-input"
import GlassModal from "@/components/glass/glass-modal"
import GlassToggle from "@/components/glass/glass-toggle"
import { useWallet } from "@/lib/wallet-context"
import {
  Wallet,
  Plus,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Upload,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  Send,
  LogIn,
  CreditCard,
  DollarSign,
} from "lucide-react"
import { SUPPORTED_CHAINS } from "@/lib/constants/gorr-token"
import { PAYMENT_PROVIDERS } from "@/lib/payment-providers"
import Image from "next/image"

type ViewMode = "tokens" | "coins"
type TradeType = "buy" | "sell" | "trade"
type PaymentModalType = "deposit" | "withdraw" | null

export default function WalletPage() {
  const { address, chain, balance, gorrBalance, isConnected, disconnect } = useWallet()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [walletName, setWalletName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [seedPhrase, setSeedPhrase] = useState<string[]>([])
  const [step, setStep] = useState<"form" | "seed" | "success">("form")
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("tokens")
  const [selectedChain, setSelectedChain] = useState<string>("all")
  const [tokens, setTokens] = useState<any[]>([])
  const [balances, setBalances] = useState<any>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [importAddress, setImportAddress] = useState("")
  const [importChain, setImportChain] = useState("ethereum")
  const [importName, setImportName] = useState("")
  const [importSymbol, setImportSymbol] = useState("")
  const [importDecimals, setImportDecimals] = useState("18")
  const [importLogo, setImportLogo] = useState("")

  const [selectedToken, setSelectedToken] = useState<any>(null)
  const [tradeType, setTradeType] = useState<TradeType>("buy")
  const [tradeAmount, setTradeAmount] = useState("")

  const [sendRecipient, setSendRecipient] = useState("")
  const [sendAmount, setSendAmount] = useState("")
  const [sendMemo, setSendMemo] = useState("")

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentType, setPaymentType] = useState<PaymentModalType>(null)
  const [selectedProvider, setSelectedProvider] = useState("revolut")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentCurrency, setPaymentCurrency] = useState("USD")
  const [withdrawDestination, setWithdrawDestination] = useState("")

  useEffect(() => {
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

    if (isConnected && address) {
      fetchTokens()
      fetchBalances()
      fetchTrades()
    }
  }, [isConnected, address, selectedChain, viewMode])

  const fetchTokens = async () => {
    try {
      const type = viewMode === "coins" ? "popular" : "all"
      const chainParam = selectedChain !== "all" ? `&chain=${selectedChain}` : ""
      const response = await fetch(`/api/tokens/index?type=${type}${chainParam}`)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        return
      }

      const data = await response.json()
      if (data.tokens && data.tokens.length > 0) {
        setTokens(data.tokens)
      }
    } catch (error) {
      // Keep default tokens on error
    }
  }

  const fetchBalances = async () => {
    try {
      const response = await fetch(`/api/wallet/balance?wallet=${address}&chain=${chain}`)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        return
      }

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
    } catch (error) {
      // Silent fail
    }
  }

  const fetchTrades = async () => {
    try {
      const response = await fetch(`/api/wallet/trades?wallet=${address}`)
      const data = await response.json()
      setTrades(data.trades || [])
    } catch (error) {
      // Silent fail
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    await Promise.all([fetchTokens(), fetchBalances(), fetchTrades()])
    setLoading(false)
  }

  const handleImportToken = async () => {
    if (!importAddress) return

    try {
      setLoading(true)
      const response = await fetch("/api/tokens/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: importAddress,
          chain: importChain,
          walletAddress: address,
          name: importName,
          symbol: importSymbol,
          decimals: Number.parseInt(importDecimals),
          logo: importLogo,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setShowImportModal(false)
        setImportAddress("")
        setImportName("")
        setImportSymbol("")
        setImportDecimals("18")
        setImportLogo("")
        await fetchTokens()
      }
    } catch (error) {
      console.error("Failed to import token:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrade = async () => {
    if (!selectedToken || !tradeAmount) return

    try {
      setLoading(true)
      const response = await fetch("/api/wallet/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tradeType,
          tokenId: selectedToken.id,
          amount: tradeAmount,
          walletAddress: address,
          chain: selectedToken.chain,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setShowTradeModal(false)
        setTradeAmount("")
        await Promise.all([fetchTokens(), fetchBalances(), fetchTrades()])
      }
    } catch (error) {
      console.error("Failed to execute trade:", error)
    } finally {
      setLoading(false)
    }
  }

  const openTradeModal = (token: any, type: TradeType) => {
    setSelectedToken(token)
    setTradeType(type)
    setShowTradeModal(true)
  }

  const openSendModal = (token: any) => {
    setSelectedToken(token)
    setShowSendModal(true)
  }

const { sendGORR, refreshBalance } = useWallet()

const handleSendToken = async () => {
  if (!selectedToken || !sendRecipient || !sendAmount) {
    alert("Please fill all fields")
    return
  }

  try {
    setLoading(true)

    // ONLY native GORR supported right now
    if (selectedToken.symbol === "GORR") {
      const txHash = await sendGORR(sendRecipient, sendAmount)

      alert(`GORR sent successfully!\nTx Hash: ${txHash}`)
      setShowSendModal(false)
      setSendRecipient("")
      setSendAmount("")
      setSendMemo("")

      await refreshBalance()
      return
    }

    // TEMP fallback until USDCc token contract exists
    alert("Only GORR transfers are supported right now.")
  } catch (err: any) {
    console.error("[Send GORR Error]", err)
    alert(err.message || "Transfer failed")
  } finally {
    setLoading(false)
  }
}


  const generateSeedPhrase = () => {
    const words = [
      "abandon",
      "ability",
      "able",
      "about",
      "above",
      "absent",
      "absorb",
      "abstract",
      "absurd",
      "abuse",
      "access",
      "accident",
    ]
    return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)])
  }

  const handleCreateWallet = () => {
    if (!walletName || !password || password !== confirmPassword) {
      alert("Please fill all fields correctly")
      return
    }

    const phrase = generateSeedPhrase()
    setSeedPhrase(phrase)
    setStep("seed")
  }

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seedPhrase.join(" "))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFinishCreate = () => {
    setStep("success")
    setTimeout(() => {
      setShowCreateModal(false)
      setStep("form")
      setWalletName("")
      setPassword("")
      setConfirmPassword("")
      setSeedPhrase([])
    }, 2000)
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

  const handleDeposit = async () => {
    if (!paymentAmount || !selectedToken) return

    try {
      setLoading(true)
      const response = await fetch("/api/payment/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          provider: selectedProvider,
          amount: Number.parseFloat(paymentAmount),
          currency: paymentCurrency,
          token: selectedToken.symbol,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert(`Deposit successful! You will receive ${data.transaction.amount} ${selectedToken.symbol}`)
        setShowPaymentModal(false)
        setPaymentAmount("")
        await fetchBalances()
      }
    } catch (error) {
      console.error("Deposit failed:", error)
      alert("Deposit failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!paymentAmount || !selectedToken || !withdrawDestination) return

    try {
      setLoading(true)
      const response = await fetch("/api/payment/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          provider: selectedProvider,
          amount: Number.parseFloat(paymentAmount),
          currency: paymentCurrency,
          token: selectedToken.symbol,
          destination: withdrawDestination,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert(`Withdrawal initiated! You will receive $${data.transaction.amount} ${paymentCurrency}`)
        setShowPaymentModal(false)
        setPaymentAmount("")
        setWithdrawDestination("")
        await fetchBalances()
      }
    } catch (error) {
      console.error("Withdrawal failed:", error)
      alert("Withdrawal failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const openPaymentModal = (token: any, type: "deposit" | "withdraw") => {
    setSelectedToken(token)
    setPaymentType(type)
    setShowPaymentModal(true)
  }

  return (
    <>
    
    <GL hovering={false} />
      <Navigation />
      <BackButton href="/" />

      <main className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Your <span className="text-primary">Wallet</span>
            </h1>
            <p className="text-lg text-muted-foreground">Manage your Gorrillazz wallet and assets</p>
          </motion.div>

          {isConnected ? (
            <div className="space-y-6">
              <GlassCard variant="primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Connected</h3>
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
                    <GlassButton variant="danger" size="sm" onClick={disconnect}>
                      Disconnect
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

                <div className="flex items-center gap-4">
                  <GlassToggle
                    checked={viewMode === "coins"}
                    onChange={handleViewModeToggle}
                    label={viewMode === "coins" ? "Coins" : "Tokens"}
                  />
                  <GlassButton variant="primary" size="sm" onClick={() => setShowImportModal(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </GlassButton>
                </div>
              </div>

              <GlassCard>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {viewMode === "tokens" ? "Your Tokens" : "Popular Coins"}
                </h3>
                <div className="p-3 mb-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-400">
                    Debug: {tokens.length} tokens loaded | Loading: {loading.toString()} | Connected:{" "}
                    {isConnected.toString()}
                  </p>
                  <p className="text-xs text-blue-300 mt-1">Check browser console for detailed logs</p>
                </div>
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
                    {tokens.map((token) => {
                      console.log("[v0] Rendering token:", token.symbol, token)
                      return (
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
                              <span className="text-xs text-muted-foreground">Price</span>
                              <span className="text-sm font-semibold text-foreground">
                                ${token.price.toLocaleString()}
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

                          <div className="grid grid-cols-4 gap-1">
                            <button
                              onClick={() => openTradeModal(token, "buy")}
                              className="px-2 py-1 text-xs rounded-lg bg-accent/20 hover:bg-accent/30 text-accent transition-colors flex items-center justify-center gap-1"
                            >
                              <ArrowDownLeft className="w-3 h-3" />
                              Buy
                            </button>
                            <button
                              onClick={() => openTradeModal(token, "sell")}
                              className="px-2 py-1 text-xs rounded-lg bg-destructive/20 hover:bg-destructive/30 text-destructive transition-colors flex items-center justify-center gap-1"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              Sell
                            </button>
                            <button
                              onClick={() => openTradeModal(token, "trade")}
                              className="px-2 py-1 text-xs rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors flex items-center justify-center gap-1"
                            >
                              <Repeat className="w-3 h-3" />
                              Swap
                            </button>
                            <button
                              onClick={() => openSendModal(token)}
                              className="px-2 py-1 text-xs rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors flex items-center justify-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              Send
                            </button>
                          </div>

                          {(token.symbol === "GORR" || token.symbol === "USDCc") && (
                            <div className="grid grid-cols-2 gap-1 pt-2 border-t border-white/10">
                              <button
                                onClick={() => openPaymentModal(token, "deposit")}
                                className="px-2 py-1 text-xs rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors flex items-center justify-center gap-1"
                              >
                                <CreditCard className="w-3 h-3" />
                                Buy with Fiat
                              </button>
                              <button
                                onClick={() => openPaymentModal(token, "withdraw")}
                                className="px-2 py-1 text-xs rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-colors flex items-center justify-center gap-1"
                              >
                                <DollarSign className="w-3 h-3" />
                                Withdraw
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </GlassCard>

              {/* Recent Trades */}
              <GlassCard>
                <h3 className="text-xl font-semibold text-foreground mb-4">Recent Trades</h3>
                <div className="space-y-3">
                  {trades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-foreground capitalize">
                          {trade.type} {trade.token}
                        </p>
                        <p className="text-sm text-muted-foreground">{new Date(trade.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {trade.amount} {trade.token}
                        </p>
                        <p className="text-sm text-muted-foreground">${trade.total.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Create New Wallet Card */}
              <GlassCard variant="primary">
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-2xl bg-primary/30 flex items-center justify-center mx-auto mb-6">
                    <Plus className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Create New Wallet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Generate a new Gorrillazz wallet with a secure seed phrase. Keep it safe!
                  </p>
                  <GlassButton variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Wallet
                  </GlassButton>
                </div>
              </GlassCard>

              <div className="text-center">
                <p className="text-muted-foreground mb-4">Or login to existing wallet</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <GlassButton variant="default" size="md" onClick={() => setShowImportModal(true)}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login to Wallet
                  </GlassButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Wallet Modal */}
      <GlassModal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        {step === "form" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Create New Wallet</h2>
            <div className="space-y-4">
              <GlassInput
                label="Wallet Name"
                placeholder="My Gorrillazz Wallet"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
              />
              <GlassInput
                label="Password"
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <GlassInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <GlassButton variant="transparent" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </GlassButton>
              <GlassButton variant="primary" onClick={handleCreateWallet} className="flex-1">
                Generate Seed
              </GlassButton>
            </div>
          </div>
        )}

        {step === "seed" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Seed Phrase</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Write down these 12 words in order. Never share them with anyone!
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {seedPhrase.map((word, index) => (
                <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-xs text-muted-foreground mr-2">{index + 1}.</span>
                  <span className="text-sm font-mono text-foreground">{word}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <GlassButton variant="transparent" onClick={handleCopySeed} className="flex-1">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy"}
              </GlassButton>
              <GlassButton variant="primary" onClick={handleFinishCreate} className="flex-1">
                I've Saved It
              </GlassButton>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Wallet Created!</h2>
            <p className="text-muted-foreground">Your new wallet is ready to use</p>
          </div>
        )}
      </GlassModal>

      <GlassModal open={showImportModal} onClose={() => setShowImportModal(false)}>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Import Custom Token</h2>
          <div className="space-y-4">
            <GlassInput
              label="Contract Address"
              placeholder="0x..."
              value={importAddress}
              onChange={(e) => setImportAddress(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Token Name"
                placeholder="My Token"
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
              />
              <GlassInput
                label="Symbol"
                placeholder="MTK"
                value={importSymbol}
                onChange={(e) => setImportSymbol(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Decimals"
                type="number"
                placeholder="18"
                value={importDecimals}
                onChange={(e) => setImportDecimals(e.target.value)}
              />
              <GlassInput
                label="Logo URL (optional)"
                placeholder="https://..."
                value={importLogo}
                onChange={(e) => setImportLogo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Chain</label>
              <div className="flex gap-2 flex-wrap">
                {SUPPORTED_CHAINS.map((c) => (
                  <GlassButton
                    key={c.id}
                    variant={importChain === c.id ? "primary" : "transparent"}
                    size="sm"
                    onClick={() => setImportChain(c.id)}
                  >
                    {c.symbol}
                  </GlassButton>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <GlassButton variant="transparent" onClick={() => setShowImportModal(false)} className="flex-1">
              Cancel
            </GlassButton>
            <GlassButton variant="primary" onClick={handleImportToken} disabled={loading} className="flex-1">
              {loading ? "Importing..." : "Import Token"}
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      <GlassModal open={showTradeModal} onClose={() => setShowTradeModal(false)}>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 capitalize">
            {tradeType} {selectedToken?.symbol}
          </h2>
          {selectedToken && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
                    <Image
                      src={selectedToken.logo || "/placeholder.svg"}
                      alt={selectedToken.symbol}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "https://via.placeholder.com/40"
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedToken.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedToken.symbol}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Price</span>
                  <span className="font-semibold text-foreground">${selectedToken.price.toLocaleString()}</span>
                </div>
              </div>

              <GlassInput
                label="Amount"
                type="number"
                placeholder="0.00"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
              />

              {tradeAmount && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Estimated Total</span>
                    <span className="font-semibold text-foreground">
                      ${(Number.parseFloat(tradeAmount) * selectedToken.price).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="text-muted-foreground">~$2.50</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <GlassButton variant="transparent" onClick={() => setShowTradeModal(false)} className="flex-1">
              Cancel
            </GlassButton>
            <GlassButton
              variant={tradeType === "sell" ? "danger" : "primary"}
              onClick={handleTrade}
              disabled={loading || !tradeAmount}
              className="flex-1"
            >
              {loading ? "Processing..." : `Confirm ${tradeType}`}
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      <GlassModal open={showSendModal} onClose={() => setShowSendModal(false)}>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Send {selectedToken?.symbol}</h2>
          {selectedToken && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
                    <Image
                      src={selectedToken.logo || "/placeholder.svg"}
                      alt={selectedToken.symbol}
                      width={40}
                      height={40}
                      className="object-cover"
                      unoptimized={selectedToken.logo?.startsWith("http")}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=40&width=40"
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedToken.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedToken.symbol}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available Balance</span>
                  <span className="font-semibold text-foreground">
                    {selectedToken.balance || "0"} {selectedToken.symbol}
                  </span>
                </div>
              </div>

              <GlassInput
                label="Recipient Address"
                placeholder="Enter wallet address"
                value={sendRecipient}
                onChange={(e) => setSendRecipient(e.target.value)}
              />

              <GlassInput
                label="Amount"
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />

              <GlassInput
                label="Memo (Optional)"
                placeholder="Add a note"
                value={sendMemo}
                onChange={(e) => setSendMemo(e.target.value)}
              />

              {sendAmount && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">You're sending</span>
                    <span className="font-semibold text-foreground">
                      {sendAmount} {selectedToken.symbol} + Fee
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="text-muted-foreground">~$2.50</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-semibold text-foreground">
                      {sendAmount} {selectedToken.symbol} + Fee
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <GlassButton variant="transparent" onClick={() => setShowSendModal(false)} className="flex-1">
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleSendToken}
              disabled={loading || !sendRecipient || !sendAmount}
              className="flex-1"
            >
              {loading ? "Sending..." : "Send"}
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      <GlassModal open={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 capitalize">
            {paymentType === "deposit" ? "Buy" : "Withdraw"} {selectedToken?.symbol}
          </h2>
          {selectedToken && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
                    <Image
                      src={selectedToken.logo || "/placeholder.svg"}
                      alt={selectedToken.symbol}
                      width={40}
                      height={40}
                      className="object-cover"
                      unoptimized={selectedToken.logo?.startsWith("http")}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedToken.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedToken.symbol}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Payment Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_PROVIDERS.map((provider) => (
                    <GlassButton
                      key={provider.id}
                      variant={selectedProvider === provider.id ? "primary" : "transparent"}
                      size="sm"
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      {provider.name}
                    </GlassButton>
                  ))}
                </div>
              </div>

              <GlassInput
                label={paymentType === "deposit" ? "Amount (USD)" : `Amount (${selectedToken.symbol})`}
                type="number"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />

              {paymentType === "withdraw" && (
                <GlassInput
                  label="Destination (Email/Account)"
                  placeholder="your@email.com"
                  value={withdrawDestination}
                  onChange={(e) => setWithdrawDestination(e.target.value)}
                />
              )}

              {paymentAmount && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {paymentType === "deposit" ? "You will receive" : "You will get"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {paymentType === "deposit"
                        ? `~${(Number.parseFloat(paymentAmount) * 0.97).toFixed(2)} ${selectedToken.symbol}`
                        : `~$${(Number.parseFloat(paymentAmount) * selectedToken.price * 0.98).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Provider Fee</span>
                    <span className="text-muted-foreground">~{paymentType === "deposit" ? "3%" : "2%"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <GlassButton variant="transparent" onClick={() => setShowPaymentModal(false)} className="flex-1">
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={paymentType === "deposit" ? handleDeposit : handleWithdraw}
              disabled={loading || !paymentAmount || (paymentType === "withdraw" && !withdrawDestination)}
              className="flex-1"
            >
              {loading ? "Processing..." : `Confirm ${paymentType === "deposit" ? "Purchase" : "Withdrawal"}`}
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </>)
}
