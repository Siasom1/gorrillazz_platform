"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { ethers } from "ethers"
import { WalletBalances } from "./types"
import { rpc } from "./wallet-provider"
import {
  getGorrBalancesParsed,
  connectPaymentWebSocket,
  sendNativeGORR,
  sendUSDCc,
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

  balances: WalletBalances
  gorrBalance: bigint
  usdcBalance: bigint

  connect: (type: WalletType) => Promise<void>
  disconnect: () => void
  switchChain: (chain: ChainType) => Promise<void>
  refreshBalance: () => Promise<void>

  sendGORR: (recipient: string, amount: string) => Promise<string>
  sendUSDC: (recipient: string, amount: string) => Promise<string>

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

  const [gorrBalance, setGorrBalance] = useState<bigint>(0n)
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n)

  const [lastPaymentUpdate, setLastPaymentUpdate] =
    useState<PaymentUpdatedEvent | null>(null)

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

  useEffect(() => {
    if (!isConnected) return

    const ws = connectPaymentWebSocket({
      onPaymentUpdated: (evt) => {
        console.log("[WS] Payment updated:", evt)
        setLastPaymentUpdate(evt)
        refreshBalance()
      },
    })

    return () => ws.close()
  }, [isConnected])

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

  const refreshBalance = async () => {
    if (!address || chain !== "gorrillazz") return

    try {
      const parsed = await getGorrBalancesParsed(address)
      setGorrBalance(parsed.GORR)
      setUsdcBalance(parsed.USDCc)

      const uiValue =
        Number(parsed.GORR) / 1e18 + Number(parsed.USDCc) / 1e18
      setBalance(uiValue)
    } catch (err) {
      console.error("[GORR] Failed to refresh balances", err)
    }
  }

  useEffect(() => {
    if (isConnected) refreshBalance()
  }, [isConnected, address, chain])

  const sendGORR = async (recipient: string, amount: string): Promise<string> => {
    if (!walletType || !address) throw new Error("Wallet not connected")

    const encrypted = localStorage.getItem("gorrillazz_encrypted_key")
    if (!encrypted) throw new Error("No local wallet found")

    const wallet = await ethers.Wallet.fromEncryptedJson(
      encrypted,
      "placeholder-pass"
    )

    return await sendNativeGORR(wallet, recipient, amount)
  }

  const sendUSDC = async (recipient: string, amount: string): Promise<string> => {
    if (!walletType || !address) throw new Error("Wallet not connected")

    const encrypted = localStorage.getItem("gorrillazz_encrypted_key")
    if (!encrypted) throw new Error("No local wallet found")

    const wallet = await ethers.Wallet.fromEncryptedJson(
      encrypted,
      "placeholder-pass"
    )

    return await sendUSDCc(wallet, recipient, amount)
  }

  const disconnect = () => {
    setAddress(null)
    setWalletType(null)
    setChain("gorrillazz")
    setGorrBalance(0n)
    setUsdcBalance(0n)
    localStorage.clear()
  }

  const switchChain = async (_chain?: ChainType) => {
    console.warn("Switch not implemented yet")
  }

  return (
    <WalletContext.Provider
      value={{
        walletType,
        address,
        chain,
        isConnected,
        isConnecting,
        balances: { gorr: gorrBalance, usdc: usdcBalance },
        gorrBalance,
        usdcBalance,
        connect,
        disconnect,
        switchChain,
        refreshBalance,
        sendGORR,
        sendUSDC,
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
