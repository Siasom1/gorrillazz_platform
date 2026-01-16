import { useWallet } from "./lib/wallet-context"
import { useState } from "react"
import BigNumber from "bignumber.js"

const TREASURY_FEE_BPS = 250
const BPS_DENOMINATOR = 10000

export function usePaymentFlow() {
  const { gorrBalance, usdcBalance, sendGORR, sendUSDC, refreshBalance } = useWallet()
  const [loading, setLoading] = useState(false)

  const pay = async (recipient: string, amount: string, token: "GORR" | "USDCc") => {
    setLoading(true)
    try {
      const amtBN = new BigNumber(amount)
      const fee = amtBN.multipliedBy(TREASURY_FEE_BPS).dividedBy(BPS_DENOMINATOR)
      const net = amtBN.minus(fee)

      let hash: string
      if (token === "GORR") {
        hash = await sendGORR(recipient, amtBN.toFixed())
      } else {
        hash = await sendUSDC(recipient, amtBN.toFixed())
      }

      // In een echte app: fee naar treasury
      console.log(`Paid ${net.toString()} ${token}, fee ${fee.toString()} to treasury`)
      await refreshBalance()
      return { txHash: hash, net: net.toString(), fee: fee.toString() }
    } finally {
      setLoading(false)
    }
  }

  return { pay, loading }
}
