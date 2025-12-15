"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Wallet, ExternalLink } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connect, isConnecting } = useWallet()
  const [error, setError] = useState<string | null>(null)

  const wallets = [
    {
      id: "gorrillazz" as const,
      name: "Gorrillazz Wallet",
      description: "Native Gorrillazz network (Recommended)",
      icon: "🦍",
      color: "from-primary to-accent",
    },
    {
      id: "trustwallet" as const,
      name: "Trust Wallet",
      description: "Multi-chain mobile wallet",
      icon: "🛡️",
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "binance" as const,
      name: "Binance Wallet",
      description: "Connect to Binance ecosystem",
      icon: "🟡",
      color: "from-yellow-500 to-yellow-700",
    },
    {
      id: "metamask" as const,
      name: "MetaMask",
      description: "Connect to Ethereum & BNB",
      icon: "🦊",
      color: "from-orange-500 to-orange-700",
    },
  ]

  const handleConnect = async (walletId: (typeof wallets)[0]["id"]) => {
    setError(null)
    try {
      await connect(walletId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl p-8 max-w-md w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Connect Wallet</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-destructive/20 border border-destructive/30">
                <p className="text-sm text-destructive-foreground">{error}</p>
              </div>
            )}

            {/* Wallet Options */}
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isConnecting}
                  className="w-full p-4 rounded-2xl glass hover:bg-white/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-2xl`}
                    >
                      {wallet.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {wallet.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{wallet.description}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-muted-foreground text-center">
                By connecting a wallet, you agree to Gorrillazz Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
