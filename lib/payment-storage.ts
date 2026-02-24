// In-memory storage for development (use database in production)
export interface PaymentTransaction {
  transactionId: string
  planId: string
  amount: number
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED"
  qrcodeImageUrl?: string
  qrcodeBase64?: string
  pixCopiaECola: string
  expiresAt: string
  createdAt: string
  paidAt?: string
  customer?: {
    name?: string
    email?: string
  }
}

// Global storage for transactions
const transactions = new Map<string, PaymentTransaction>()

export const PaymentStorage = {
  create: (transaction: PaymentTransaction) => {
    transactions.set(transaction.transactionId, transaction)
    return transaction
  },

  get: (transactionId: string): PaymentTransaction | null => {
    return transactions.get(transactionId) || null
  },

  update: (transactionId: string, updates: Partial<PaymentTransaction>): PaymentTransaction | null => {
    const existing = transactions.get(transactionId)
    if (!existing) return null

    const updated = { ...existing, ...updates }
    transactions.set(transactionId, updated)
    return updated
  },

  getAll: (): PaymentTransaction[] => {
    return Array.from(transactions.values())
  },

  delete: (transactionId: string): boolean => {
    return transactions.delete(transactionId)
  },

  // Get transactions by status
  getByStatus: (status: PaymentTransaction["status"]): PaymentTransaction[] => {
    return Array.from(transactions.values()).filter((t) => t.status === status)
  },

  // Get transactions by plan
  getByPlan: (planId: string): PaymentTransaction[] => {
    return Array.from(transactions.values()).filter((t) => t.planId === planId)
  },

  // Clean up expired transactions
  cleanupExpired: (): number => {
    const now = new Date()
    let cleaned = 0

    for (const [id, transaction] of transactions.entries()) {
      if (transaction.status === "PENDING" && new Date(transaction.expiresAt) < now) {
        transactions.set(id, { ...transaction, status: "EXPIRED" })
        cleaned++
      }
    }

    return cleaned
  },
}
