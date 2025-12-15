export interface TokenMetadata {
  chainId: number
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: string
  tags: string[]
  verified: boolean
  registrationFee?: number
  registrationPaidAt?: string
  extensions?: {
    website?: string
    description?: string
    twitter?: string
    coingeckoId?: string
    coinmarketcapId?: string
    bridgeInfo?: Record<string, { tokenAddress: string }>
  }
}

export interface TokenList {
  name: string
  version: { major: number; minor: number; patch: number }
  timestamp: string
  logoURI: string
  keywords: string[]
  tokens: TokenMetadata[]
}

// Token verification criteria (similar to CoinGecko)
export interface VerificationCriteria {
  hasValidLogo: boolean
  hasWebsite: boolean
  hasDescription: boolean
  hasMinimumLiquidity: boolean
  hasAuditReport: boolean
  communityVotes: number
  ageInDays: number
  hasPaidRegistrationFee: boolean
}

export const REGISTRATION_FEE = 200 // 200 GORR
export const EXEMPT_TOKENS = ["GORR", "USDCc"] // No fee for these tokens

export class TokenRegistry {
  private tokens: Map<string, TokenMetadata> = new Map()
  private verifiedTokens: Set<string> = new Set()

  constructor() {
    this.initializeDefaultTokens()
  }

  private initializeDefaultTokens() {
    // Add GORR token
    this.addToken({
      chainId: 1,
      address: "gorr_native",
      name: "Gorrillazz",
      symbol: "GORR",
      decimals: 18,
      logoURI: "/gorr-logo.png",
      tags: ["stablecoin", "verified", "native"],
      verified: true,
      extensions: {
        website: "https://gorrillazz.com",
        description: "Native stablecoin of the Gorrillazz platform with 1:1 USD peg",
        coingeckoId: "gorrillazz",
        coinmarketcapId: "gorrillazz",
        bridgeInfo: {
          ethereum: { tokenAddress: "0x..." },
          bnb: { tokenAddress: "0x..." },
          solana: { tokenAddress: "..." },
        },
      },
    })

    // Add USDCc token
    this.addToken({
      chainId: 1,
      address: "gorr_usdcc",
      name: "USD Coin Custom",
      symbol: "USDCc",
      decimals: 6,
      logoURI: "/usdcc-logo.png",
      tags: ["stablecoin", "verified"],
      verified: true,
      extensions: {
        website: "https://gorrillazz.com",
        description: "Custom USD Coin on Gorrillazz network with 1:1 USD peg",
        coingeckoId: "usd-coin-custom",
        coinmarketcapId: "usdcc",
        bridgeInfo: {
          ethereum: { tokenAddress: "0x..." },
          bnb: { tokenAddress: "0x..." },
          solana: { tokenAddress: "..." },
        },
      },
    })
  }

  // Add token to registry
  addToken(token: TokenMetadata): boolean {
    const key = `${token.chainId}-${token.address}`
    this.tokens.set(key, token)
    if (token.verified) {
      this.verifiedTokens.add(key)
    }
    return true
  }

  // Get token by address
  getToken(chainId: number, address: string): TokenMetadata | undefined {
    return this.tokens.get(`${chainId}-${address}`)
  }

  // Verify token (similar to CoinGecko verification process)
  async verifyToken(chainId: number, address: string, criteria: VerificationCriteria): Promise<boolean> {
    const key = `${chainId}-${address}`
    const token = this.tokens.get(key)

    if (!token) return false

    // Check if token is exempt from fees
    const isExempt = EXEMPT_TOKENS.includes(token.symbol)

    // If not exempt, require fee payment
    if (!isExempt && !criteria.hasPaidRegistrationFee) {
      return false
    }

    // Check verification criteria
    const score = this.calculateVerificationScore(criteria)

    // Require minimum score of 70/100 for verification
    if (score >= 70) {
      token.verified = true
      this.verifiedTokens.add(key)
      return true
    }

    return false
  }

  private calculateVerificationScore(criteria: VerificationCriteria): number {
    let score = 0

    if (criteria.hasValidLogo) score += 15
    if (criteria.hasWebsite) score += 15
    if (criteria.hasDescription) score += 10
    if (criteria.hasMinimumLiquidity) score += 20
    if (criteria.hasAuditReport) score += 20
    if (criteria.communityVotes > 100) score += 10
    if (criteria.ageInDays > 30) score += 10

    return score
  }

  // Get all verified tokens
  getVerifiedTokens(): TokenMetadata[] {
    return Array.from(this.verifiedTokens)
      .map((key) => this.tokens.get(key))
      .filter((token): token is TokenMetadata => token !== undefined)
  }

  // Export token list (compatible with Uniswap token lists)
  exportTokenList(): TokenList {
    return {
      name: "Gorrillazz Token List",
      version: { major: 1, minor: 0, patch: 0 },
      timestamp: new Date().toISOString(),
      logoURI: "https://gorrillazz.com/gorr-logo.png",
      keywords: ["gorrillazz", "tokens", "verified", "stablecoin"],
      tokens: Array.from(this.tokens.values()),
    }
  }

  // Import token list from external source
  async importTokenList(url: string): Promise<boolean> {
    try {
      const response = await fetch(url)
      const tokenList: TokenList = await response.json()

      tokenList.tokens.forEach((token) => {
        this.addToken(token)
      })

      return true
    } catch (error) {
      console.error("Failed to import token list:", error)
      return false
    }
  }

  getPendingVerifications(): TokenMetadata[] {
    return Array.from(this.tokens.values()).filter((token) => !token.verified)
  }

  approveToken(chainId: number, address: string): boolean {
    const key = `${chainId}-${address}`
    const token = this.tokens.get(key)

    if (!token) return false

    token.verified = true
    this.verifiedTokens.add(key)
    return true
  }

  rejectToken(chainId: number, address: string): boolean {
    const key = `${chainId}-${address}`
    return this.tokens.delete(key)
  }
}

// Singleton instance
export const tokenRegistry = new TokenRegistry()
