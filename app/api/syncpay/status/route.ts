import { type NextRequest, NextResponse } from "next/server"
import { PaymentStorage } from "@/lib/payment-storage"

const SYNCPAY_BASE_URL = "https://api.syncpay.com.br"
const SYNCPAY_CLIENT_ID = "801623f0-2bb5-4bbc-835b-907e58082363"
const SYNCPAY_CLIENT_SECRET = "801623f0-2bb5-4bbc-835b-907e58082363"

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAuthTokenDirect(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const authResponse = await fetch(`${SYNCPAY_BASE_URL}/partner/v1/auth-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SYNCPAY_CLIENT_ID,
      client_secret: SYNCPAY_CLIENT_SECRET,
    }),
  })

  if (!authResponse.ok) {
    throw new Error(`Auth failed: ${authResponse.status}`)
  }

  const authData = await authResponse.json()
  cachedToken = {
    token: authData.access_token,
    expiresAt: Date.now() + 55 * 60 * 1000,
  }
  return authData.access_token
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("transactionId")

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    const localTransaction = PaymentStorage.get(transactionId)
    if (!localTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // If already paid or expired locally, return cached status
    if (localTransaction.status === "PAID" || localTransaction.status === "EXPIRED") {
      return NextResponse.json({
        status: localTransaction.status,
        paidAt: localTransaction.paidAt,
      })
    }

    // Check if transaction has expired by time
    if (new Date(localTransaction.expiresAt) < new Date()) {
      PaymentStorage.update(transactionId, { status: "EXPIRED" })
      return NextResponse.json({ status: "EXPIRED" })
    }

    // For mock/dev transactions, just return local status (no external API call)
    if (transactionId.startsWith("mock_")) {
      return NextResponse.json({
        status: localTransaction.status,
        paidAt: localTransaction.paidAt,
      })
    }

    // For real SyncPay transactions, check status via API
    try {
      const authToken = await getAuthTokenDirect()
      const statusUrl = `${SYNCPAY_BASE_URL}/api/partner/v1/transaction/${transactionId}`

      const syncpayResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!syncpayResponse.ok) {
        // Fallback to local status if SyncPay is unreachable
        return NextResponse.json({
          status: localTransaction.status,
          paidAt: localTransaction.paidAt,
        })
      }

      const syncpayData = await syncpayResponse.json()
      const transactionData = syncpayData.data || syncpayData

      const status =
        transactionData.status === "completed"
          ? "PAID"
          : transactionData.status === "expired"
            ? "EXPIRED"
            : transactionData.status === "cancelled"
              ? "CANCELLED"
              : "PENDING"

      const paidAt = transactionData.transaction_date

      if (status !== localTransaction.status) {
        PaymentStorage.update(transactionId, { status, paidAt })
      }

      return NextResponse.json({ status, paidAt })
    } catch {
      // If SyncPay API fails, return local status
      return NextResponse.json({
        status: localTransaction.status,
        paidAt: localTransaction.paidAt,
      })
    }
  } catch (error) {
    console.error("[v0] Error checking transaction status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
