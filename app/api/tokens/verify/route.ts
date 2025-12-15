import { NextResponse } from "next/server"
import { tokenRegistry, REGISTRATION_FEE, EXEMPT_TOKENS } from "@/lib/token-registry"

// POST /api/tokens/verify - Verify token logo and metadata
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { chainId, address, logoUrl, website, description, symbol, feePaymentTx } = body

    const isExempt = EXEMPT_TOKENS.includes(symbol)

    let hasPaidFee = isExempt
    if (!isExempt && feePaymentTx) {
      // In production, verify the transaction on-chain
      hasPaidFee = await verifyFeePayment(feePaymentTx, REGISTRATION_FEE)
    }

    // Validate logo URL
    const logoValid = await validateLogoUrl(logoUrl)
    if (!logoValid) {
      return NextResponse.json({ error: "Invalid logo URL" }, { status: 400 })
    }

    // Check verification criteria
    const criteria = {
      hasValidLogo: logoValid,
      hasWebsite: !!website,
      hasDescription: !!description && description.length > 50,
      hasMinimumLiquidity: true, // Check on-chain
      hasAuditReport: false, // Manual verification
      communityVotes: 0,
      ageInDays: 0,
      hasPaidRegistrationFee: hasPaidFee,
    }

    const verified = await tokenRegistry.verifyToken(chainId, address, criteria)

    return NextResponse.json({
      success: true,
      verified,
      criteria,
      registrationFee: isExempt ? 0 : REGISTRATION_FEE,
      message: verified
        ? "Token verified successfully"
        : isExempt
          ? "Token does not meet verification criteria"
          : "Please pay registration fee of 200 GORR",
    })
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

async function validateLogoUrl(url: string): Promise<boolean> {
  try {
    // Check if URL is valid
    new URL(url)

    // In production, fetch the image and validate dimensions, format, etc.
    // For now, just check if it's a valid URL
    return true
  } catch {
    return false
  }
}

async function verifyFeePayment(txHash: string, expectedAmount: number): Promise<boolean> {
  // In production, verify the transaction on the GORR blockchain
  // Check that the transaction:
  // 1. Is confirmed
  // 2. Sent the correct amount (200 GORR)
  // 3. Sent to the correct treasury address

  // For now, return true for testing
  return true
}
