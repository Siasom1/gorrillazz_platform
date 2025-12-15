export interface PriceData {
  token: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  timestamp: number
}

class PriceFeed {
  private prices: Map<string, PriceData> = new Map()
  private listeners: Set<(prices: Map<string, PriceData>) => void> = new Set()

  constructor() {
    // Initialize with GORR price
    this.prices.set("GORR", {
      token: "GORR",
      price: 1.0,
      change24h: 0,
      volume24h: 1000000,
      marketCap: 10000000,
      timestamp: Date.now(),
    })

    // Start price updates
    this.startPriceUpdates()
  }

  getPrice(token: string): PriceData | undefined {
    return this.prices.get(token)
  }

  getAllPrices(): Map<string, PriceData> {
    return new Map(this.prices)
  }

  subscribe(callback: (prices: Map<string, PriceData>) => void) {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.getAllPrices()))
  }

  private startPriceUpdates() {
    // Update prices every 30 seconds
    setInterval(() => {
      this.updatePrices()
    }, 30000)
  }

  private async updatePrices() {
    // Mock price updates - replace with actual price feed API
    console.log("[v0] Updating prices...")

    // GORR is a stablecoin, always $1
    this.prices.set("GORR", {
      token: "GORR",
      price: 1.0,
      change24h: 0,
      volume24h: Math.random() * 2000000 + 1000000,
      marketCap: 10000000,
      timestamp: Date.now(),
    })

    this.notifyListeners()
  }

  async fetchTokenPrice(tokenAddress: string, network: string): Promise<PriceData | null> {
    try {
      console.log("[v0] Fetching token price:", tokenAddress, network)

      // Mock price fetch
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockPrice: PriceData = {
        token: tokenAddress,
        price: Math.random() * 10,
        change24h: (Math.random() - 0.5) * 20,
        volume24h: Math.random() * 100000,
        marketCap: Math.random() * 1000000,
        timestamp: Date.now(),
      }

      this.prices.set(tokenAddress, mockPrice)
      this.notifyListeners()

      return mockPrice
    } catch (error) {
      return null
    }
  }
}

export const priceFeed = new PriceFeed()
