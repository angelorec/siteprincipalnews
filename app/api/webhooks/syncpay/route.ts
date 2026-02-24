import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { SignJWT } from "jose"
import { PaymentStorage } from "@/lib/payment-storage"
import { SessionStorage } from "@/lib/session-storage"

const webhookSchema = z.object({
  event: z.string(),
  data: z.object({
    reference_id: z.string(),
    status: z.enum(["pending", "completed", "expired", "cancelled"]),
    amount: z.number(),
    transaction_date: z.string().optional(),
    currency: z.string().optional(),
    description: z.string().optional(),
  }),
})

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "natalia-membership-secret-key-2024")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] SyncPay webhook received:", JSON.stringify(body, null, 2))

    const validatedData = webhookSchema.parse(body)
    const transactionId = validatedData.data.reference_id

    if (!transactionId) {
      console.error("[v0] No transaction ID found in webhook payload")
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    const existingTransaction = PaymentStorage.get(transactionId)
    if (!existingTransaction) {
      console.error(`[v0] Transaction not found in storage: ${transactionId}`)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    if (validatedData.data.status === "completed") {
      console.log(`[v0] Payment confirmed for transaction: ${transactionId}`)

      const paidAt = validatedData.data.transaction_date || new Date().toISOString()

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

      // Create JWT session token
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

      console.log(`[v0] Session created for transaction: ${transactionId}, sessionId: ${sessionId}`)
    }

    // Handle other status updates
    if (validatedData.data.status === "expired" || validatedData.data.status === "cancelled") {
      console.log(`[v0] Payment ${validatedData.data.status} for transaction: ${transactionId}`)
      PaymentStorage.update(transactionId, {
        status: validatedData.data.status.toUpperCase() as "EXPIRED" | "CANCELLED",
      })

      const session = SessionStorage.getByTransaction(transactionId)
      if (session) {
        SessionStorage.deactivateSession(session.sessionId)
      }
    }

    return NextResponse.json({ received: true, transactionId }, { status: 200 })
  } catch (error) {
    console.error("[v0] SyncPay webhook processing error:", error)

    if (error instanceof z.ZodError) {
      console.error("[v0] Invalid webhook payload:", error.errors)
      return NextResponse.json({ error: "Invalid payload", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Processing error", received: true }, { status: 200 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get("challenge")

  if (challenge) {
    return NextResponse.json({ challenge })
  }

  return NextResponse.json({ status: "SyncPay webhook endpoint active" })
}
