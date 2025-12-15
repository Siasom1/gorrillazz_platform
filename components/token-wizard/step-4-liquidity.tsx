"use client"

import { motion } from "framer-motion"
import { useTokenCreator } from "@/lib/token-creator-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function Step4Liquidity() {
  const { formData, updateFormData, nextStep, prevStep } = useTokenCreator()

  const dexOptions = [
    { value: "uniswap", label: "Uniswap", chains: ["ethereum"] },
    { value: "pancakeswap", label: "PancakeSwap", chains: ["bnb"] },
    { value: "raydium", label: "Raydium", chains: ["solana"] },
    { value: "gorrswap", label: "GorrSwap", chains: ["gorrillazz"] },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Liquidity Setup</h2>
        <p className="text-muted-foreground">Choose how to add liquidity to your token</p>
      </div>

      <div className="glass rounded-2xl p-8 space-y-6">
        <RadioGroup
          value={formData.liquidityOption}
          onValueChange={(value) => updateFormData({ liquidityOption: value as any })}
        >
          <div className="space-y-4">
            <label className="flex items-start gap-4 p-4 rounded-xl glass-strong cursor-pointer hover:bg-white/10 transition-colors">
              <RadioGroupItem value="own" id="own" className="mt-1" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-foreground mb-1">Create Own Pool</h4>
                <p className="text-sm text-muted-foreground">
                  Create a new liquidity pool on Gorrillazz DEX with your custom parameters
                </p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-xl glass-strong cursor-pointer hover:bg-white/10 transition-colors">
              <RadioGroupItem value="dex" id="dex" className="mt-1" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-foreground mb-1">Add to Existing DEX</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically add liquidity to popular DEX platforms like Uniswap or PancakeSwap
                </p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-xl glass-strong cursor-pointer hover:bg-white/10 transition-colors">
              <RadioGroupItem value="none" id="none" className="mt-1" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-foreground mb-1">Skip for Now</h4>
                <p className="text-sm text-muted-foreground">Add liquidity manually later through your dashboard</p>
              </div>
            </label>
          </div>
        </RadioGroup>

        {formData.liquidityOption === "dex" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="dex" className="text-foreground">
                Select DEX Platform
              </Label>
              <select
                id="dex"
                value={formData.dexPlatform || ""}
                onChange={(e) => updateFormData({ dexPlatform: e.target.value })}
                className="w-full px-4 py-3 rounded-xl glass border border-white/20 text-foreground bg-transparent"
              >
                <option value="" disabled>
                  Choose a platform
                </option>
                {dexOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">
                Initial Liquidity Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={formData.liquidityAmount}
                onChange={(e) => updateFormData({ liquidityAmount: e.target.value })}
                className="glass border-white/20 text-foreground"
              />
            </div>
          </motion.div>
        )}

        {formData.liquidityOption === "own" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">
                Initial Liquidity Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={formData.liquidityAmount}
                onChange={(e) => updateFormData({ liquidityAmount: e.target.value })}
                className="glass border-white/20 text-foreground"
              />
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button onClick={prevStep} variant="outline" size="lg" className="glass border-white/20 bg-transparent">
          Back
        </Button>
        <Button onClick={nextStep} size="lg" className="bg-primary hover:bg-primary/90">
          Continue
        </Button>
      </div>
    </motion.div>
  )
}
