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

        // Check local storage first
        const localTransaction = PaymentStorage.get(transactionId)
        if (localTransaction && (localTransaction.status === "PAID" || localTransaction.status === "EXPIRED")) {
            return NextResponse.json({ status: localTransaction.status })
        }

        // Poll LiraPay API
        const response = await lirapay.getTransaction(transactionId)

        // Map LiraPay status to our internal status
        // PENDING, AUTHORIZED, FAILED, CHARGEBACK, IN_DISPUTE
        let status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" = "PENDING"

        if (response.status === "AUTHORIZED") {
            status = "PAID"
            // Ensure credentials are moved if we detect payment here
            if (localTransaction?.customer?.email) {
                await moveUserToApproved(localTransaction.customer.email)
            }
        } else if (response.status === "FAILED") {
            status = "CANCELLED"
        }

        // Update local storage if status changed
        if (localTransaction && localTransaction.status !== status) {
            PaymentStorage.update(transactionId, { status })
        }

        return NextResponse.json({ status })
    } catch (error) {
        console.error("[LiraPay] Error checking status:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
