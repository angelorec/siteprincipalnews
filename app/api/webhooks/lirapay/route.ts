import { type NextRequest, NextResponse } from "next/server"
import { PaymentStorage } from "@/lib/payment-storage"
import { SessionStorage } from "@/lib/session-storage"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log("[LiraPay Webhook] Received:", JSON.stringify(body, null, 2))

        const { id, status, external_id } = body

        if (!id) {
            return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 })
        }

        // Handle payment confirmation
        if (status === "AUTHORIZED") {
            const transactionId = id
            const localTransaction = PaymentStorage.get(transactionId)

            if (localTransaction) {
                PaymentStorage.update(transactionId, {
                    status: "PAID",
                    paidAt: new Date().toISOString(),
                })

                // Activate membership session
                const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                SessionStorage.create({
                    sessionId,
                    transactionId,
                    planId: localTransaction.planId,
                    createdAt: new Date().toISOString(),
                    lastAccessAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    isActive: true,
                })

                console.log(`[LiraPay Webhook] Activated membership for transaction ${transactionId}`)

                // Store in approved_users table in Supabase
                try {
                    const { createClient } = await import('@/lib/supabase/server')
                    const supabase = await createClient()

                    // 1. Get pending credentials
                    const { data: pending } = await supabase
                        .from('pending_credentials')
                        .select('email, password')
                        .eq('email', localTransaction.customer.email)
                        .single()

                    if (pending) {
                        console.log(`[LiraPay Webhook] Moving credentials for ${pending.email} to approved_users`)

                        // 2. Insert into approved_users
                        await supabase.from('approved_users').insert({
                            email: pending.email,
                            password: pending.password
                        })

                        // 3. Cleanup pending
                        await supabase.from('pending_credentials').delete().eq('email', pending.email)

                        console.log(`[LiraPay Webhook] User ${pending.email} successfully moved to approved_users`)
                    }
                } catch (dbError) {
                    console.error("[LiraPay Webhook] Error saving to approved_users:", dbError)
                }
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("[LiraPay Webhook] Error processing:", error)
        return NextResponse.json({ error: "Processing error" }, { status: 500 })
    }
}
