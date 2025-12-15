"use client"

import { AnimatePresence } from "framer-motion"
import { GL } from "@/components/gl"
import Navigation from "@/components/navigation"
import BackButton from "@/components/back-button"
import { TokenCreatorProvider, useTokenCreator } from "@/lib/token-creator-context"
import StepIndicator from "@/components/token-wizard/step-indicator"
import Step1Network from "@/components/token-wizard/step-1-network"
import Step2Details from "@/components/token-wizard/step-2-details"
import Step3Logo from "@/components/token-wizard/step-3-logo"
import Step4Liquidity from "@/components/token-wizard/step-4-liquidity"
import Step5Review from "@/components/token-wizard/step-5-review"

function TokenWizardContent() {
  const { currentStep } = useTokenCreator()

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="glass rounded-3xl p-8 md:p-12">
        <StepIndicator />
        <AnimatePresence mode="wait">
          {currentStep === 1 && <Step1Network key="step-1" />}
          {currentStep === 2 && <Step2Details key="step-2" />}
          {currentStep === 3 && <Step3Logo key="step-3" />}
          {currentStep === 4 && <Step4Liquidity key="step-4" />}
          {currentStep === 5 && <Step5Review key="step-5" />}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function CreateTokenPage() {
  return (
    <>
      <GL hovering={false} />
      <Navigation />
      <BackButton href="/" />
      <div className="relative z-10">
        <TokenCreatorProvider>
          <TokenWizardContent />
        </TokenCreatorProvider>
      </div>
    </>
  )
}
