"use client"

import { motion } from "framer-motion"
import { useTokenCreator } from "@/lib/token-creator-context"
import { useWallet } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import { Check, Coins, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Step5Review() {
  const { formData, prevStep, resetForm } = useTokenCreator()
  const { address, isConnected } = useWallet()
  const router = useRouter()
  const [isDeploying, setIsDeploying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deployedTokens, setDeployedTokens] = useState<any[]>([])

  const calculateFee = () => {
    const baseFee = 100
    const networkFee = formData.networks.length * 50
    const liquidityFee = formData.liquidityOption !== "none" ? 25 : 0
    return baseFee + networkFee + liquidityFee
  }

  const totalFee = calculateFee()

  const handleDeploy = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first")
      return
    }

    setIsDeploying(true)
    setError(null)

    try {
      // Deploy token on each selected network
      const deploymentPromises = formData.networks.map(async (network) => {
        const response = await fetch("/api/tokens/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tokenData: {
              name: formData.name,
              symbol: formData.symbol,
              totalSupply: formData.totalSupply,
              decimals: formData.decimals,
              description: formData.description,
              logoUrl: formData.logoUrl,
              network: network,
              mintable: formData.mintable,
              burnable: formData.burnable,
              pausable: formData.pausable,
              liquidityOption: formData.liquidityOption,
              liquidityAmount: formData.liquidityAmount,
              lockPeriod: formData.lockPeriod,
            },
            walletAddress: address,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Deployment failed")
        }

        return await response.json()
      })

      const results = await Promise.all(deploymentPromises)
      setDeployedTokens(results)
      setIsComplete(true)
    } catch (err) {
      console.error("[v0] Deployment error:", err)
      setError(err instanceof Error ? err.message : "Failed to deploy token")
    } finally {
      setIsDeploying(false)
    }
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Token Deployed Successfully!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your token has been deployed across {formData.networks.length} network(s). You can now view it in your
          dashboard.
        </p>

        <div className="glass rounded-xl p-6 space-y-3 max-w-md mx-auto">
          {deployedTokens.map((result, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground capitalize">{result.token.network}</span>
              <span className="text-foreground font-mono text-xs">{result.token.contractAddress}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center pt-6">
          <Button onClick={resetForm} variant="outline" size="lg" className="glass border-white/20 bg-transparent">
            Create Another
          </Button>
          <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => router.push("/dashboard")}>
            View Dashboard
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Review & Deploy</h2>
        <p className="text-muted-foreground">Confirm your token details before deployment</p>
      </div>

      {error && (
        <div className="glass-strong rounded-xl p-4 flex items-center gap-3 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {!isConnected && (
        <div className="glass-strong rounded-xl p-4 flex items-center gap-3 border border-yellow-500/20">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <p className="text-yellow-500 text-sm">Please connect your wallet to deploy tokens</p>
        </div>
      )}

      <div className="glass rounded-2xl p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <span className="text-muted-foreground">Networks</span>
            <div className="flex gap-2">
              {formData.networks.map((network) => (
                <span key={network} className="px-3 py-1 rounded-full glass-strong text-xs text-foreground">
                  {network}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <span className="text-muted-foreground">Token Name</span>
            <span className="text-foreground font-semibold">{formData.name}</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <span className="text-muted-foreground">Symbol</span>
            <span className="text-foreground font-semibold">{formData.symbol}</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <span className="text-muted-foreground">Total Supply</span>
            <span className="text-foreground font-semibold">{Number(formData.totalSupply).toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <span className="text-muted-foreground">Decimals</span>
            <span className="text-foreground font-semibold">{formData.decimals}</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <span className="text-muted-foreground">Logo</span>
            <span className="text-foreground font-semibold">{formData.logoUrl ? "Uploaded" : "None"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Liquidity</span>
            <span className="text-foreground font-semibold capitalize">{formData.liquidityOption}</span>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Payment in GORR</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Fee</span>
              <span className="text-foreground">100 GORR</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network Fees ({formData.networks.length}x)</span>
              <span className="text-foreground">{formData.networks.length * 50} GORR</span>
            </div>
            {formData.liquidityOption !== "none" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Liquidity Setup</span>
                <span className="text-foreground">25 GORR</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-4 border-t border-white/10">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{totalFee} GORR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          onClick={prevStep}
          variant="outline"
          size="lg"
          className="glass border-white/20 bg-transparent"
          disabled={isDeploying}
        >
          Back
        </Button>
        <Button
          onClick={handleDeploy}
          size="lg"
          className="bg-primary hover:bg-primary/90"
          disabled={isDeploying || !isConnected}
        >
          {isDeploying ? "Deploying..." : `Deploy Token (${totalFee} GORR)`}
        </Button>
      </div>
    </motion.div>
  )
}
