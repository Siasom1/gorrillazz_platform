"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import {
  getGorrBalancesParsed,
  connectPaymentWebSocket,
  sendNativeGORR,
} from "@/lib/gorr"
import type { PaymentUpdatedEvent } from "@/lib/gorr"

export type WalletType = "trustwallet" | "binance" | "metamask" | "gorrillazz" | null
export type ChainType = "solana" | "ethereum" | "bnb" | "gorrillazz"

interface WalletContextType {
  walletType: WalletType
  address: string | null
  chain: ChainType | null
  isConnected: boolean
  isConnecting: boolean

  balance: number                     // UI portfolio balance
  gorrBalance: bigint                 // On-chain native GORR balance
  usdcBalance: bigint                 // On-chain USDCc balance

  connect: (type: WalletType) => Promise<void>
  disconnect: () => void
  switchChain: (chain: ChainType) => Promise<void>

  refreshBalance: () => Promise<void>

  // NEW: native transaction
  sendGORR: (recipient: string, amount: string) => Promise<string>

  // NEW: last payment update event
  lastPaymentUpdate: PaymentUpdatedEvent | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletType, setWalletType] = useState<WalletType>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [chain, setChain] = useState<ChainType | null>("gorrillazz")

  const [isConnecting, setIsConnecting] = useState(false)
  const isConnected = !!address && !!walletType

  const [balance, setBalance] = useState(0)

  // ⚡ NEW — REAL CHAIN BALANCES
  const [gorrBalance, setGorrBalance] = useState<bigint>(0n)
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n)

  // ⚡ NEW — WebSocket payments
  const [lastPaymentUpdate, setLastPaymentUpdate] = useState<PaymentUpdatedEvent | null>(null)

  // Restore session
  useEffect(() => {
    const w = localStorage.getItem("gorrillazz_wallet")
    const a = localStorage.getItem("gorrillazz_address")
    const c = localStorage.getItem("gorrillazz_chain")

    if (w && a && c) {
      setWalletType(w as WalletType)
      setAddress(a)
      setChain(c as ChainType)
    }
  }, [])

  // 🔥 Auto WebSocket connect
  useEffect(() => {
    if (!isConnected) return

    const ws = connectPaymentWebSocket({
      onPaymentUpdated: (evt) => {
        console.log("[WS] Payment updated:", evt)
        setLastPaymentUpdate(evt)
        refreshBalance() // auto-refresh wallet upon payment settlement
      },
    })

    return () => ws.close()
  }, [isConnected])

  // ------------------------------------------------------------------------------
  // CONNECTORS
  // ------------------------------------------------------------------------------

  const connect = async (type: WalletType) => {
    setIsConnecting(true)
    try {
      if (type === "gorrillazz") {
        await connectGorrillazz()
      } else if (type === "trustwallet") {
        await connectTrustWallet()
      } else if (type === "binance") {
        await connectBinanceWallet()
      } else if (type === "metamask") {
        await connectMetaMask()
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const connectGorrillazz = async () => {
    const wallet = ethers.Wallet.createRandom()
    const encrypted = await wallet.encrypt("placeholder-pass")

    setWalletType("gorrillazz")
    setChain("gorrillazz")
    setAddress(wallet.address)

    localStorage.setItem("gorrillazz_wallet", "gorrillazz")
    localStorage.setItem("gorrillazz_address", wallet.address)
    localStorage.setItem("gorrillazz_chain", "gorrillazz")
    localStorage.setItem("gorrillazz_encrypted_key", encrypted)
  }

  const connectTrustWallet = async () => {
    const { ethereum } = window as any
    const accounts = await ethereum.request({ method: "eth_requestAccounts" })

    setWalletType("trustwallet")
    setAddress(accounts[0])
    setChain("gorrillazz")
  }

  const connectMetaMask = async () => {
    const { ethereum } = window as any
    const accounts = await ethereum.request({ method: "eth_requestAccounts" })
    const chainId = await ethereum.request({ method: "eth_chainId" })

    const chainMap: Record<string, ChainType> = {
      "0x1": "ethereum",
      "0x38": "bnb",
      "0x270f": "gorrillazz",
    }

    setWalletType("metamask")
    setAddress(accounts[0])
    setChain(chainMap[chainId] || "gorrillazz")
  }

  const connectBinanceWallet = async () => {
    const { BinanceChain } = window as any
    const accounts = await BinanceChain.request({ method: "eth_requestAccounts" })

    setWalletType("binance")
    setAddress(accounts[0])
    setChain("bnb")
  }

  // ------------------------------------------------------------------------------
  // BALANCES
  // ------------------------------------------------------------------------------

  const refreshBalance = async () => {
    if (!address || chain !== "gorrillazz") return

    try {
      const parsed = await getGorrBalancesParsed(address)

      setGorrBalance(parsed.GORR)
      setUsdcBalance(parsed.USDCc)

      // UI placeholder: convert balances → fake USD value
      const value =
        Number(parsed.GORR) / 1e18 +
        Number(parsed.USDCc) / 1e18

      setBalance(value)
    } catch (err) {
      console.error("[GORR] Failed to refresh balances", err)
    }
  }

  useEffect(() => {
    if (isConnected) refreshBalance()
  }, [isConnected, address, chain])

  // ------------------------------------------------------------------------------
  // SEND GORR
  // ------------------------------------------------------------------------------

  const sendGORR = async (recipient: string, amount: string): Promise<string> => {
    if (!walletType || !address) throw new Error("Wallet not connected")

    // Retrieve and decrypt local wallet
    const encrypted = localStorage.getItem("gorrillazz_encrypted_key")
    if (!encrypted) throw new Error("No local wallet found")

    const wallet = await ethers.Wallet.fromEncryptedJson(encrypted, "placeholder-pass")

    return sendNativeGORR(wallet, recipient, amount)
  }

  // ------------------------------------------------------------------------------
  // DISCONNECT
  // ------------------------------------------------------------------------------

  const disconnect = () => {
    setAddress(null)
    setWalletType(null)
    setChain("gorrillazz")
    setGorrBalance(0n)
    setUsdcBalance(0n)
    localStorage.clear()
  }

  const switchChain = async () => {}

  return (
    <WalletContext.Provider
      value={{
        walletType,
        address,
        chain,
        isConnected,
        isConnecting,

        balance,         // UI-friendly
        gorrBalance,     // bigint
        usdcBalance,     // bigint

        connect,
        disconnect,
        switchChain,
        refreshBalance,

        sendGORR,

        lastPaymentUpdate,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}
