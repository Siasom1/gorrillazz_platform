"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useTokenCreator } from "@/lib/token-creator-context"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { useState } from "react"

export default function Step3Logo() {
  const { formData, updateFormData, nextStep, prevStep } = useTokenCreator()
  const [preview, setPreview] = useState<string | null>(formData.logoUrl)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        updateFormData({ logoFile: file, logoUrl: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const clearLogo = () => {
    setPreview(null)
    updateFormData({ logoFile: null, logoUrl: null })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Upload Logo</h2>
        <p className="text-muted-foreground">Add a logo for your token (optional)</p>
      </div>

      <div className="glass rounded-2xl p-8">
        {preview ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <img
                src={preview || "/placeholder.svg"}
                alt="Token logo"
                className="w-40 h-40 rounded-2xl object-cover"
              />
              <button
                onClick={clearLogo}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">Logo uploaded successfully</p>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center py-12 cursor-pointer group">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">Click to upload</p>
            <p className="text-sm text-muted-foreground">PNG, JPG, or SVG (max 5MB)</p>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}

        <div className="mt-6 p-4 glass-strong rounded-xl">
          <p className="text-xs text-muted-foreground">
            Your logo will be stored on IPFS for permanent, decentralized hosting. This ensures your token's branding
            remains accessible across all platforms.
          </p>
        </div>
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
