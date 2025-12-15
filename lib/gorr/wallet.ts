// lib/gorr/wallet.ts

import type { Signer } from "ethers"
import { toUtf8Bytes, parseUnits } from "ethers"
import type { HexString } from "./types"

export interface SendTxOptions {
  gasLimit?: bigint
  gasPriceWei?: bigint
}

/**
 * Stuur native GORR (zoals ETH op Ethereum).
 */
export async function sendNativeGORR(
  signer: Signer,
  to: string,
  amount: string, // in GORR (bijv "1.0")
): Promise<HexString> {
  const amountWei = parseUnits(amount, 18) // 18 decimals

  const tx = await signer.sendTransaction({
    to,
    value: amountWei,
  })

  const receipt = await tx.wait()
  return receipt?.hash as HexString
}

/**
 * Stuur een payment TX met intentID, zodat jouw block producer
 * het herkent aan de data: "GORR_PAY:<id>"
 */
export async function sendPaymentTxWithIntent(
  signer: Signer,
  merchant: string,
  amount: string, // in GORR
  intentId: number,
): Promise<HexString> {
  const amountWei = parseUnits(amount, 18)

  const dataBytes = toUtf8Bytes(`GORR_PAY:${intentId}`)
  const tx = await signer.sendTransaction({
    to: merchant,
    value: amountWei,
    data: dataBytes,
  })

  const receipt = await tx.wait()
  return receipt?.hash as HexString
}
