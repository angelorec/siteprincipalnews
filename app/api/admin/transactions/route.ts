import { type NextRequest, NextResponse } from "next/server"
import { PaymentStorage } from "@/lib/payment-storage"

// Admin endpoint to view all transactions (for development/debugging)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const planId = searchParams.get("planId")

    let transactions = PaymentStorage.getAll()

    // Filter by status if provided
    if (status) {
      transactions = PaymentStorage.getByStatus(status as any)
    }

    // Filter by plan if provided
    if (planId) {
      transactions = transactions.filter((t) => t.planId === planId)
    }

    // Sort by creation date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Clean up expired transactions
    const cleanedCount = PaymentStorage.cleanupExpired()

    return NextResponse.json({
      transactions,
      total: transactions.length,
      cleanedExpired: cleanedCount,
      summary: {
        pending: PaymentStorage.getByStatus("PENDING").length,
        paid: PaymentStorage.getByStatus("PAID").length,
        expired: PaymentStorage.getByStatus("EXPIRED").length,
        cancelled: PaymentStorage.getByStatus("CANCELLED").length,
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Clean up expired transactions
export async function POST(request: NextRequest) {
  try {
    const cleanedCount = PaymentStorage.cleanupExpired()
    return NextResponse.json({ cleanedExpired: cleanedCount })
  } catch (error) {
    console.error("Error cleaning up transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
