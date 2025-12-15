"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { GL } from "@/components/gl"
import Navigation from "@/components/navigation"
import GorrBadge from "@/components/gorr-badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, Globe, Coins, Wallet } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: Globe,
      title: "Multi-Chain",
      description: "Deploy on Gorrillazz, Solana Ethereum, and BNB network",
    },
    {
      icon: Zap,
      title: "Instant Liquidity",
      description: "Automatic DEX integration and liquidity pool creation",
    },
    {
      icon: Shield,
      title: "Secure & Verified",
      description: "Smart contract audits and anti-rug protection built-in",
    },
    {
      icon: Coins,
      title: "GORR Powered",
      description: "Pay fees with our native stablecoin for best rates",
    },
  ]

  const handleCreateToken = () => {
    router.push("/create")
  }

  const handleCreateWallet = () => {
    router.push("/wallet")
  }

  return (
    <>
      <GL hovering={false} />
      <Navigation />

      {/* Hero Section */}
      <main className="relative min-h-screen flex items-center justify-center px-6 z-10">
        <div className="max-w-5xl mx-auto text-center pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight"
          >
            Create tokens across
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              any blockchain
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Deploy tokens on our custom Gorrillazz network, Ethereum, BNB, and Solana. Add liquidity instantly. Pay with
            our custom GORR COIN. All in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button
              size="lg"
              onClick={handleCreateToken}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-2xl group transition-all duration-300"
            >
              Start Now
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              size="lg"
              onClick={handleCreateWallet}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg rounded-2xl group transition-all duration-300"
            >
              <Wallet className="mr-2 group-hover:scale-110 transition-transform duration-300" />
              Create Wallet
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <GorrBadge />
    </>
  )
}
