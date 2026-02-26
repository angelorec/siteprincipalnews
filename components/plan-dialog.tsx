"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Crown, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Plan {
  id: string
  title: string
  price: number
  period: string
  description: string
  features: string[]
  popular?: boolean
}

interface PlanDialogProps {
  plan: Plan
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlanDialog({ plan, open, onOpenChange }: PlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const handleGeneratePix = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/lirapay/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
          description: `Assinatura ${plan.title} - Natália Katowicz`,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao gerar PIX")
      }

      const data = await response.json()

      // Store in local storage to prevent fallback to mock data
      const { PaymentStorage } = await import("@/lib/payment-storage")
      PaymentStorage.create({
        transactionId: data.transactionId,
        planId: plan.id,
        amount: plan.price,
        status: "PENDING",
        pixCopiaECola: data.pixPayload || "",
        qrcodeBase64: data.qrcodeBase64 || "",
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      })

      router.push(`/checkout/${data.transactionId}`)
    } catch (error) {
      console.error("Erro ao gerar PIX:", error)
      // TODO: Add toast notification
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>

          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {formatPrice(plan.price)}
              </div>
              <div className="text-muted-foreground">por {plan.period}</div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Incluído no plano:</h4>
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleGeneratePix}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando PIX...
                </>
              ) : (
                "Gerar PIX"
              )}
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  )
}
