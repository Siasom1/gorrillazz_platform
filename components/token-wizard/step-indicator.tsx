"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useTokenCreator } from "@/lib/token-creator-context"

const steps = [
  { number: 1, label: "Network" },
  { number: 2, label: "Details" },
  { number: 3, label: "Logo" },
  { number: 4, label: "Liquidity" },
  { number: 5, label: "Review" },
]

export default function StepIndicator() {
  const { currentStep } = useTokenCreator()

  return (
    <div className="flex items-center justify-between mb-12">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className="relative">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep === step.number ? 1.1 : 1,
                  backgroundColor:
                    currentStep > step.number
                      ? "oklch(0.65 0.25 270)"
                      : currentStep === step.number
                        ? "oklch(0.65 0.25 270)"
                        : "oklch(0.18 0.03 270)",
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/20"
              >
                {currentStep > step.number ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-lg font-semibold text-white">{step.number}</span>
                )}
              </motion.div>
            </div>
            <span
              className={`mt-2 text-xs font-medium ${
                currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 bg-secondary mx-2 mb-6">
              <motion.div
                initial={false}
                animate={{
                  width: currentStep > step.number ? "100%" : "0%",
                }}
                transition={{ duration: 0.3 }}
                className="h-full bg-primary"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
