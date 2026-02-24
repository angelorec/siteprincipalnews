import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { SignJWT } from "jose"
import { PaymentStorage } from "@/lib/payment-storage"
import { SessionStorage } from "@/lib/session-storage"

// Webhook payload schema based on common PIX webhook patterns
const webhookSchema = z.object({
  event: z.string(),
  transaction_id: z.string().optional(),
  external_id: z.string().optional(),
  status: z.enum(["pending", "paid", "expired", "cancelled"]),
  amount: z.number().optional(),
  paid_at: z.string().optional(),
  payer: z
    .object({
      name: z.string().optional(),
      document: z.string().optional(),
    })
    .optional(),
  // TriboPay specific fields (may vary)
  txid: z.string().optional(),
  endToEndId: z.string().optional(),
})

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "natalia-membership-secret-key-2024")

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity (implement based on TriboPay docs)
    const signature = request.headers.get("x-signature")
    const timestamp = request.headers.get("x-timestamp")

    // TODO: Implement signature verification based on TriboPay documentation
    // For now, we'll accept all webhooks in development

    const body = await request.json()
    console.log("Webhook received:", JSON.stringify(body, null, 2))

    const validatedData = webhookSchema.parse(body)

    // Get transaction ID from various possible fields
    const transactionId = validatedData.external_id || validatedData.transaction_id || validatedData.txid

    if (!transactionId) {
      console.error("No transaction ID found in webhook payload")
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    const existingTransaction = PaymentStorage.get(transactionId)
    if (!existingTransaction) {
      console.error(`Transaction not found in storage: ${transactionId}`)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Handle payment confirmation
    if (validatedData.status === "paid") {
      console.log(`Payment confirmed for transaction: ${transactionId}`)

      const paidAt = validatedData.paid_at || new Date().toISOString()

      // Update payment storage
      PaymentStorage.update(transactionId, {
        status: "PAID",
        paidAt,
      })

      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const expirationTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 days

      // Create session in storage
      SessionStorage.create({
        sessionId,
        transactionId,
        planId: existingTransaction.planId,
        createdAt: new Date().toISOString(),
        lastAccessAt: new Date().toISOString(),
        expiresAt: new Date(expirationTime * 1000).toISOString(),
        isActive: true,
        deviceInfo: {
          userAgent: request.headers.get("user-agent") || undefined,
          ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        },
      })

      // Create JWT session token with session ID
      const sessionToken = await new SignJWT({
        transactionId,
        planId: existingTransaction.planId,
        paidAt,
        sessionId,
        exp: expirationTime,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(JWT_SECRET)

      // Set secure session cookie
      const cookieStore = await cookies()
      cookieStore.set("membership-session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })

      console.log(`Session created for transaction: ${transactionId}, sessionId: ${sessionId}`)
    }

    // Handle other status updates
    if (validatedData.status === "expired" || validatedData.status === "cancelled") {
      console.log(`Payment ${validatedData.status} for transaction: ${transactionId}`)
      PaymentStorage.update(transactionId, {
        status: validatedData.status.toUpperCase() as "EXPIRED" | "CANCELLED",
      })

      const session = SessionStorage.getByTransaction(transactionId)
      if (session) {
        SessionStorage.deactivateSession(session.sessionId)
      }
    }

    // Respond quickly to webhook (TriboPay expects fast response)
    return NextResponse.json({ received: true, transactionId }, { status: 200 })
  } catch (error) {
    console.error("Webhook processing error:", error)

    if (error instanceof z.ZodError) {
      console.error("Invalid webhook payload:", error.errors)
      return NextResponse.json({ error: "Invalid payload", details: error.errors }, { status: 400 })
    }

    // Always return 200 to prevent webhook retries for non-critical errors
    return NextResponse.json({ error: "Processing error", received: true }, { status: 200 })
  }
}

// Handle webhook verification (GET request)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get("challenge")

  // Some webhook providers use GET for verification
  if (challenge) {
    return NextResponse.json({ challenge })
  }

  return NextResponse.json({ status: "Webhook endpoint active" })
}
