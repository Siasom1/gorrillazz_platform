"use client"

import { motion } from "framer-motion"
import { useTokenCreator } from "@/lib/token-creator-context"
import type { ChainType } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const networks = [
  {
    id: "gorrillazz" as ChainType,
    name: "Gorrillazz",
    description: "Native network tokens (Primary)",
    icon: "🦍",
    color: "from-primary to-accent",
  },
  {
    id: "ethereum" as ChainType,
    name: "Ethereum",
    description: "ERC-20 standard tokens",
    icon: "Ξ",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "bnb" as ChainType,
    name: "BNB Chain",
    description: "BEP-20 compatible tokens",
    icon: "B",
    color: "from-yellow-500 to-yellow-700",
  },
  {
    id: "solana" as ChainType,
    name: "Solana",
    description: "Fast, low-cost SPL tokens",
    icon: "◎",
    color: "from-purple-500 to-purple-700",
  },
]

export default function Step1Network() {
  const { formData, updateFormData, nextStep } = useTokenCreator()

  const toggleNetwork = (networkId: ChainType) => {
    const networks = formData.networks.includes(networkId)
      ? formData.networks.filter((n) => n !== networkId)
      : [...formData.networks, networkId]
    updateFormData({ networks })
  }

  const isSelected = (networkId: ChainType) => formData.networks.includes(networkId)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Choose Networks</h2>
        <p className="text-muted-foreground">Select one or more blockchains to deploy your token</p>
        <p className="text-sm text-primary mt-2">💡 Recommended: Start with Gorrillazz network</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {networks.map((network) => (
          <button
            key={network.id}
            onClick={() => toggleNetwork(network.id)}
            className={`p-6 rounded-2xl glass hover:bg-white/10 transition-all text-left relative group ${
              isSelected(network.id) ? "ring-2 ring-primary" : ""
            }`}
          >
            {isSelected(network.id) && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${network.color} flex items-center justify-center text-3xl mb-4`}
            >
              {network.icon}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-1">{network.name}</h3>
            <p className="text-sm text-muted-foreground">{network.description}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={nextStep}
          disabled={formData.networks.length === 0}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  )
}
