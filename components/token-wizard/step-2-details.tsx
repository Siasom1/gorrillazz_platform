"use client"

import { motion } from "framer-motion"
import { useTokenCreator } from "@/lib/token-creator-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Step2Details() {
  const { formData, updateFormData, nextStep, prevStep } = useTokenCreator()

  const isValid = formData.name && formData.symbol && formData.totalSupply && Number(formData.totalSupply) > 0

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Token Details</h2>
        <p className="text-muted-foreground">Define your token's basic information</p>
      </div>

      <div className="glass rounded-2xl p-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            Token Name
          </Label>
          <Input
            id="name"
            placeholder="e.g., Gorrillazz Token"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="glass border-white/20 text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="symbol" className="text-foreground">
            Token Symbol
          </Label>
          <Input
            id="symbol"
            placeholder="e.g., GORR"
            value={formData.symbol}
            onChange={(e) => updateFormData({ symbol: e.target.value.toUpperCase() })}
            className="glass border-white/20 text-foreground"
            maxLength={10}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="decimals" className="text-foreground">
              Decimals
            </Label>
            <Input
              id="decimals"
              type="number"
              value={formData.decimals}
              onChange={(e) => updateFormData({ decimals: Number(e.target.value) })}
              className="glass border-white/20 text-foreground"
              min={0}
              max={18}
            />
            <p className="text-xs text-muted-foreground">Standard is 18 decimals</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supply" className="text-foreground">
              Total Supply
            </Label>
            <Input
              id="supply"
              type="number"
              placeholder="1000000"
              value={formData.totalSupply}
              onChange={(e) => updateFormData({ totalSupply: e.target.value })}
              className="glass border-white/20 text-foreground"
              min={1}
            />
          </div>
        </div>

        <div className="glass-strong rounded-xl p-4 space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Preview</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              Name: <span className="text-foreground">{formData.name || "Not set"}</span>
            </p>
            <p>
              Symbol: <span className="text-foreground">{formData.symbol || "Not set"}</span>
            </p>
            <p>
              Supply:{" "}
              <span className="text-foreground">
                {formData.totalSupply ? Number(formData.totalSupply).toLocaleString() : "Not set"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button onClick={prevStep} variant="outline" size="lg" className="glass border-white/20 bg-transparent">
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid} size="lg" className="bg-primary hover:bg-primary/90">
          Continue
        </Button>
      </div>
    </motion.div>
  )
}
