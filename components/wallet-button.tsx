"use client"

import { useState } from "react"
import { Wallet, ChevronDown, LogOut, Copy, Check, LogIn } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import WalletConnectModal from "./wallet-connect-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function WalletButton() {
  const { isConnected, address, chain, disconnect } = useWallet()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getChainBadge = () => {
    const badges = {
      solana: { label: "Solana", color: "bg-purple-500/20 text-purple-400" },
      ethereum: { label: "Ethereum", color: "bg-blue-500/20 text-blue-400" },
      bnb: { label: "BNB", color: "bg-yellow-500/20 text-yellow-400" },
      gorrillazz: { label: "Gorrillazz", color: "bg-primary/20 text-primary" },
    }
    return chain ? badges[chain] : null
  }

  if (!isConnected) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsLoginModalOpen(true)} variant="ghost" size="sm" className="text-foreground">
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
          <Button onClick={() => setIsModalOpen(true)} variant="ghost" size="sm" className="text-foreground">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </div>
        <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <WalletConnectModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </>
    )
  }

  const chainBadge = getChainBadge()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="glass text-foreground">
          <div className="flex items-center gap-2">
            {chainBadge && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${chainBadge.color}`}>{chainBadge.label}</span>
            )}
            <span className="font-mono">{formatAddress(address!)}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-strong border-white/20 w-56">
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Address
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={() => setIsLoginModalOpen(true)} className="cursor-pointer">
          <LogIn className="w-4 h-4 mr-2" />
          Login to Wallet
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={disconnect} className="cursor-pointer text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
      <WalletConnectModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </DropdownMenu>
  )
}
