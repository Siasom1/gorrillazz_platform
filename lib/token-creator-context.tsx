"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { ChainType } from "./wallet-context"

export interface TokenFormData {
  // Step 1: Network Selection
  networks: ChainType[]

  // Step 2: Token Details
  name: string
  symbol: string
  decimals: number
  totalSupply: string

  // Step 3: Logo Upload
  logoUrl: string | null
  logoFile: File | null

  // Step 4: Liquidity Options
  liquidityOption: "own" | "dex" | "none"
  liquidityAmount: string
  dexPlatform?: string

  // Step 5: Payment
  gorrFee: number
}

interface TokenCreatorContextType {
  currentStep: number
  formData: TokenFormData
  setCurrentStep: (step: number) => void
  updateFormData: (data: Partial<TokenFormData>) => void
  nextStep: () => void
  prevStep: () => void
  resetForm: () => void
}

const TokenCreatorContext = createContext<TokenCreatorContextType | undefined>(undefined)

const initialFormData: TokenFormData = {
  networks: [],
  name: "",
  symbol: "",
  decimals: 18,
  totalSupply: "",
  logoUrl: null,
  logoFile: null,
  liquidityOption: "none",
  liquidityAmount: "",
  gorrFee: 0,
}

export function TokenCreatorProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<TokenFormData>(initialFormData)

  const updateFormData = (data: Partial<TokenFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setCurrentStep(1)
  }

  return (
    <TokenCreatorContext.Provider
      value={{
        currentStep,
        formData,
        setCurrentStep,
        updateFormData,
        nextStep,
        prevStep,
        resetForm,
      }}
    >
      {children}
    </TokenCreatorContext.Provider>
  )
}

export function useTokenCreator() {
  const context = useContext(TokenCreatorContext)
  if (!context) {
    throw new Error("useTokenCreator must be used within TokenCreatorProvider")
  }
  return context
}
