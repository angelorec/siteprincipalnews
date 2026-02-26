import { type NextRequest, NextResponse } from "next/server"
import { lirapay } from "@/lib/lirapay"
import { PaymentStorage } from "@/lib/payment-storage"
import { moveUserToApproved } from "@/lib/supabase/auth-utils"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const transactionId = params.id

        if (!transactionId) {
            return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
        }

        // Poll LiraPay API
        const response = await lirapay.getTransaction(transactionId)

        // Map LiraPay status to our internal status
        // PENDING, AUTHORIZED, FAILED, CHARGEBACK, IN_DISPUTE
        let status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" = "PENDING"

        if (response.status === "AUTHORIZED") {
            status = "PAID"
        } else if (response.status === "FAILED") {
            status = "CANCELLED"
        }

        const localTransaction = PaymentStorage.get(transactionId)

        // Ensure credentials are moved if we detect payment here
        if (status === "PAID" && localTransaction?.customer?.email) {
            await moveUserToApproved(localTransaction.customer.email)
        }

        // Update local storage if status changed
        if (localTransaction && localTransaction.status !== status) {
            PaymentStorage.update(transactionId, { status })
        }

        return NextResponse.json({
            status,
            amount: response.total_value,
            pixPayload: response.pix?.payload,
            transactionId: response.id
        })
    } catch (error) {
        console.error("[LiraPay] Error checking status:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
