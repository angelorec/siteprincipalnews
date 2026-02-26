// Storage for transactions (using localStorage for client-side persistence)
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

const STORAGE_KEY = "natkat_payments"

const getStoredTransactions = (): Map<string, PaymentTransaction> => {
  if (typeof window === "undefined") return new Map()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return new Map()
    const parsed = JSON.parse(stored)
    // Handle both Map-like objects and plain objects
    return new Map(Object.entries(parsed))
  } catch (error) {
    console.error("[PaymentStorage] Error reading from localStorage:", error)
    return new Map()
  }
}

const saveTransactions = (transactions: Map<string, PaymentTransaction>) => {
  if (typeof window === "undefined") return
  const obj = Object.fromEntries(transactions)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
}

export const PaymentStorage = {
  create: (transaction: PaymentTransaction) => {
    const transactions = getStoredTransactions()
    transactions.set(transaction.transactionId, transaction)
    saveTransactions(transactions)
    return transaction
  },

  get: (transactionId: string): PaymentTransaction | null => {
    const transactions = getStoredTransactions()
    return transactions.get(transactionId) || null
  },

  update: (transactionId: string, updates: Partial<PaymentTransaction>): PaymentTransaction | null => {
    const transactions = getStoredTransactions()
    const existing = transactions.get(transactionId)
    if (!existing) return null

    const updated = { ...existing, ...updates }
    transactions.set(transactionId, updated)
    saveTransactions(transactions)
    return updated
  },

  getAll: (): PaymentTransaction[] => {
    const transactions = getStoredTransactions()
    return Array.from(transactions.values())
  },

  delete: (transactionId: string): boolean => {
    const transactions = getStoredTransactions()
    const deleted = transactions.delete(transactionId)
    if (deleted) saveTransactions(transactions)
    return deleted
  },

  getByStatus: (status: PaymentTransaction["status"]): PaymentTransaction[] => {
    const transactions = getStoredTransactions()
    return Array.from(transactions.values()).filter((t) => t.status === status)
  },

  getByPlan: (planId: string): PaymentTransaction[] => {
    const transactions = getStoredTransactions()
    return Array.from(transactions.values()).filter((t) => t.planId === planId)
  },

  cleanupExpired: (): number => {
    const transactions = getStoredTransactions()
    const now = new Date()
    let cleaned = 0

    for (const [id, transaction] of transactions.entries()) {
      if (transaction.status === "PENDING" && new Date(transaction.expiresAt) < now) {
        transactions.set(id, { ...transaction, status: "EXPIRED" })
        cleaned++
      }
    }

    if (cleaned > 0) saveTransactions(transactions)
    return cleaned
  },
}
