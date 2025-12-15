export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  status: "pending" | "confirmed" | "failed"
  timestamp: number
  network: string
}

class TransactionMonitor {
  private transactions: Map<string, Transaction> = new Map()
  private listeners: Map<string, Set<(tx: Transaction) => void>> = new Map()

  addTransaction(tx: Transaction) {
    this.transactions.set(tx.hash, tx)
    this.notifyListeners(tx.hash, tx)
  }

  updateTransaction(hash: string, updates: Partial<Transaction>) {
    const tx = this.transactions.get(hash)
    if (tx) {
      const updated = { ...tx, ...updates }
      this.transactions.set(hash, updated)
      this.notifyListeners(hash, updated)
    }
  }

  getTransaction(hash: string): Transaction | undefined {
    return this.transactions.get(hash)
  }

  subscribe(hash: string, callback: (tx: Transaction) => void) {
    if (!this.listeners.has(hash)) {
      this.listeners.set(hash, new Set())
    }
    this.listeners.get(hash)!.add(callback)

    return () => {
      const listeners = this.listeners.get(hash)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(hash)
        }
      }
    }
  }

  private notifyListeners(hash: string, tx: Transaction) {
    const listeners = this.listeners.get(hash)
    if (listeners) {
      listeners.forEach((callback) => callback(tx))
    }
  }

  async monitorTransaction(hash: string, network: string): Promise<Transaction> {
    console.log("[v0] Monitoring transaction:", hash, network)

    // Simulate transaction monitoring
    return new Promise((resolve) => {
      setTimeout(() => {
        const tx: Transaction = {
          hash,
          from: "0x...",
          to: "0x...",
          value: "0",
          status: "confirmed",
          timestamp: Date.now(),
          network,
        }
        this.updateTransaction(hash, tx)
        resolve(tx)
      }, 3000)
    })
  }
}

export const transactionMonitor = new TransactionMonitor()
