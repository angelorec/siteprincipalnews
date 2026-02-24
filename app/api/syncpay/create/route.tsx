import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PaymentStorage } from "@/lib/payment-storage"

const createPixSchema = z.object({
  planId: z.string(),
  customerData: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    cpf: z.string(),
  }),
})

const SYNCPAY_BASE_URL = "https://api.syncpay.com.br"
const SYNCPAY_CLIENT_ID = "801623f0-2bb5-4bbc-835b-907e58082363"
const SYNCPAY_CLIENT_SECRET = "801623f0-2bb5-4bbc-835b-907e58082363"

const PLAN_PRICING = {
  monthly: { amount: 19.9, description: "Assinatura Mensal - Natália Katowicz" },
  quarterly: { amount: 39.9, description: "Assinatura Trimestral - Natália Katowicz (33% OFF)" },
  semester: { amount: 59.9, description: "Assinatura Semestral - Natália Katowicz (50% OFF)" },
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getSyncPayToken(): Promise<string> {
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
    const errorText = await authResponse.text()
    console.error("[v0] SyncPay auth failed:", authResponse.status, errorText)
    throw new Error(`SyncPay auth failed: ${authResponse.status}`)
  }

  const authData = await authResponse.json()
  cachedToken = {
    token: authData.access_token,
    expiresAt: Date.now() + 55 * 60 * 1000,
  }
  return authData.access_token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received request body:", JSON.stringify(body, null, 2))

    const validatedData = createPixSchema.parse(body)

    const planDetails = PLAN_PRICING[validatedData.planId as keyof typeof PLAN_PRICING]
    if (!planDetails) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    console.log("[v0] Creating SyncPay transaction with data:", {
      amount: planDetails.amount,
      customer: validatedData.customerData,
      planId: validatedData.planId,
    })

    const isDevelopment =
      process.env.NODE_ENV === "development" ||
      process.env.VERCEL_ENV === "preview" ||
      !process.env.VERCEL_URL?.includes("vercel.app")

    if (isDevelopment) {
      console.log("[v0] Development mode: creating mock PIX transaction")

      const mockTransactionId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const mockPixCode = `00020126580014BR.GOV.BCB.PIX0136${mockTransactionId}5204000053039865802BR5925NATALIA KATOWICZ MOCK6009SAO PAULO62070503***6304ABCD`

      const responseData = {
        success: true,
        transactionId: mockTransactionId,
        qrcodeImageUrl: `/api/syncpay/qrcode?code=${encodeURIComponent(mockPixCode)}`,
        qrcodeBase64: `data:image/svg+xml;base64,${btoa(`<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#000"/><text x="150" y="150" fill="#fff" textAnchor="middle" dy=".3em">QR Code PIX</text></svg>`)}`,
        pixCopiaECola: mockPixCode,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        status: "PENDING" as const,
      }

      const transaction = PaymentStorage.create({
        transactionId: mockTransactionId,
        planId: validatedData.planId,
        amount: Math.round(planDetails.amount * 100),
        status: "PENDING",
        qrcodeImageUrl: responseData.qrcodeImageUrl,
        qrcodeBase64: responseData.qrcodeBase64,
        pixCopiaECola: mockPixCode,
        expiresAt: responseData.expiresAt,
        createdAt: new Date().toISOString(),
        customer: validatedData.customerData,
      })

      console.log("[v0] Mock transaction created:", transaction.transactionId)
      return NextResponse.json(responseData)
    }

    let authToken
    try {
      authToken = await getSyncPayToken()
    } catch (authError) {
      console.error("[v0] Failed to get auth token:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }

    const syncpayPayload = {
      amount: planDetails.amount,
      description: planDetails.description,
      client: {
        name: validatedData.customerData.name,
        cpf: validatedData.customerData.cpf.replace(/\D/g, ""), // Remove non-digits
        email: validatedData.customerData.email,
        phone: validatedData.customerData.phone.replace(/\D/g, ""), // Remove non-digits
      },
    }

    console.log("[v0] SyncPay payload:", JSON.stringify(syncpayPayload, null, 2))

    let syncpayResponse
    try {
      syncpayResponse = await fetch(`${SYNCPAY_BASE_URL}/api/partner/v1/cash-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(syncpayPayload),
      })
    } catch (fetchError) {
      console.error("[v0] Network error calling SyncPay API:", fetchError)
      return NextResponse.json({ error: "Network error connecting to payment provider" }, { status: 500 })
    }

    console.log("[v0] SyncPay response status:", syncpayResponse.status)

    if (!syncpayResponse.ok) {
      const errorData = await syncpayResponse.text()
      console.error("[v0] SyncPay API Error:", syncpayResponse.status, errorData)
      return NextResponse.json(
        {
          error: "Failed to create PIX payment",
          details: `SyncPay API returned ${syncpayResponse.status}`,
        },
        { status: 500 },
      )
    }

    const syncpayData = await syncpayResponse.json()
    console.log("[v0] SyncPay successful response:", JSON.stringify(syncpayData, null, 2))

    if (!syncpayData.identifier || !syncpayData.pix_code) {
      console.error("[v0] Invalid SyncPay response - missing required fields:", syncpayData)
      return NextResponse.json({ error: "Invalid payment provider response" }, { status: 500 })
    }

    const responseData = {
      success: true,
      transactionId: syncpayData.identifier,
      qrcodeImageUrl: `/api/syncpay/qrcode?code=${encodeURIComponent(syncpayData.pix_code)}`,
      qrcodeBase64: `data:image/svg+xml;base64,${btoa(`<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#000"/><text x="150" y="150" fill="#fff" textAnchor="middle" dy=".3em">QR Code PIX</text></svg>`)}`,
      pixCopiaECola: syncpayData.pix_code,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // 24 hours
      status: "PENDING" as const,
    }

    const transaction = PaymentStorage.create({
      transactionId: syncpayData.identifier,
      planId: validatedData.planId,
      amount: Math.round(planDetails.amount * 100), // Convert to cents for storage consistency
      status: "PENDING",
      qrcodeImageUrl: responseData.qrcodeImageUrl,
      qrcodeBase64: responseData.qrcodeBase64,
      pixCopiaECola: syncpayData.pix_code,
      expiresAt: responseData.expiresAt,
      createdAt: new Date().toISOString(),
      customer: validatedData.customerData,
    })

    console.log("[v0] Transaction created and stored:", transaction.transactionId)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Error creating PIX transaction:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
