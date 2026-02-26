import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { lirapay } from "@/lib/lirapay"
import QRCode from "qrcode"

const createTransactionSchema = z.object({
    planId: z.string(),
    customerData: z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        document: z.string(),
    }),
})

const PLAN_PRICING = {
    monthly: { amount: 19.9, title: "Mensal", description: "Assinatura Mensal - Natália Katowicz" },
    quarterly: { amount: 39.9, title: "Trimestral", description: "Assinatura Trimestral - Natália Katowicz (33% OFF)" },
    semester: { amount: 59.9, title: "Semestral", description: "Assinatura Semestral - Natália Katowicz (50% OFF)" },
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = createTransactionSchema.parse(body)

        console.log("[LiraPay] Received request:", JSON.stringify({ planId: validatedData.planId, email: validatedData.customerData.email }))

        const planDetails = PLAN_PRICING[validatedData.planId as keyof typeof PLAN_PRICING]
        if (!planDetails) {
            console.error("[LiraPay] Invalid plan ID:", validatedData.planId)
            return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
        }

        const external_id = `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Get client IP
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1"
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nataliakatowicz.vercel.app'
        const webhookUrl = appUrl.includes('localhost')
            ? 'https://nataliakatowicz.vercel.app/api/webhooks/lirapay'
            : `${appUrl}/api/webhooks/lirapay`

        const payload = {
            external_id,
            total_amount: planDetails.amount,
            payment_method: "PIX" as const,
            webhook_url: webhookUrl,
            items: [
                {
                    id: validatedData.planId,
                    title: planDetails.title,
                    description: planDetails.description,
                    price: planDetails.amount,
                    quantity: 1,
                    is_physical: false,
                },
            ],
            ip,
            customer: {
                name: validatedData.customerData.name,
                email: validatedData.customerData.email,
                phone: validatedData.customerData.phone.replace(/\D/g, ""),
                document_type: "CPF" as const,
                document: validatedData.customerData.document.replace(/\D/g, ""),
            },
        }

        console.log("[LiraPay] Sending payload to API:", JSON.stringify(payload, null, 2))

        try {
            const response = await lirapay.createTransaction(payload)
            console.log("[LiraPay] API Response success:", !!response.id)

            // Generate QR Code base64
            let qrcodeBase64 = ""
            if (response.pix?.payload) {
                qrcodeBase64 = await QRCode.toDataURL(response.pix.payload, {
                    width: 400,
                    margin: 1,
                    color: {
                        dark: "#000000",
                        light: "#FFFFFF",
                    },
                })
            }

            return NextResponse.json({
                success: true,
                transactionId: response.id,
                pixPayload: response.pix?.payload,
                qrcodeBase64: qrcodeBase64,
                status: response.status,
            })
        } catch (apiError) {
            console.error("[LiraPay] API Creation Error:", apiError)
            return NextResponse.json(
                {
                    error: "LiraPay API Error",
                    details: apiError instanceof Error ? apiError.message : "Request failed"
                },
                { status: 502 }
            )
        }
    } catch (error) {
        console.error("[LiraPay] Critical Error:", error)
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}
