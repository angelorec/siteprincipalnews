"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2, User, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Plan {
  id: string
  name: string
  price: string
  originalPrice?: string | null
  discount?: string | null
}

interface SignupDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan: Plan | null
  user: SupabaseUser | null
}

export function SignupDialog({ isOpen, onClose, selectedPlan, user }: SignupDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Auto-fill from Supabase user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email || "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/lirapay/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          customerData: {
            name: formData.name,
            email: formData.email,
            phone: "51992810774",
            document: "16453637081",
          },
        }),
      })

      const data = await response.json()

      if (data.success && data.transactionId) {
        // Pass payment data via URL params so checkout page can display it
        const params = new URLSearchParams({
          amount: selectedPlan.price.replace(/[^\d,]/g, '').replace(',', '.'),
          pix: data.pixPayload || "",
        })
        router.push(`/checkout/${data.transactionId}?${params.toString()}`)
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || "Erro ao criar pagamento. Tente novamente.")
        setError(errorMsg)
      }
    } catch {
      setError("Erro de conexao. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="w-full max-w-md bg-black rounded-sm p-8 text-white border-2 border-white/90 shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-y-auto max-h-[90vh] relative"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-playfair font-black uppercase tracking-tighter italic">
                Finalizar <span className="text-primary tracking-normal">Acesso</span>
              </h2>
              <motion.button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                whileHover={{ rotate: 90 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {selectedPlan && (
              <motion.div
                className="bg-white/5 border border-white/10 p-5 mb-8 relative overflow-hidden group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute top-0 right-0 bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                  VIP Selection
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-playfair text-xl font-bold italic">{selectedPlan.name}</h3>
                    {selectedPlan.discount && (
                      <span className="text-[10px] text-primary font-bold uppercase tracking-widest">
                        {selectedPlan.discount}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-black text-2xl">
                      {selectedPlan.price}
                    </div>
                    {selectedPlan.originalPrice && (
                      <div className="text-[10px] text-gray-500 line-through tracking-tighter uppercase">{selectedPlan.originalPrice}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dialog-name" className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <User className="w-3 h-3 text-primary" />
                  Nome Completo
                </Label>
                <Input
                  id="dialog-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-primary focus:ring-0 rounded-none h-14 font-medium"
                  placeholder="DIGITE SEU NOME"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dialog-email" className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-primary" />
                  E-mail
                </Label>
                <Input
                  id="dialog-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-primary focus:ring-0 rounded-none h-14 font-medium"
                  placeholder="SEU@EMAIL.COM"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-500 font-mono uppercase tracking-tight bg-red-500/5 border border-red-500/20 p-4"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-primary hover:text-white font-black py-4 rounded-none h-16 text-lg uppercase tracking-[0.1em] disabled:opacity-50 transition-all duration-500"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="animate-pulse">PROCESSANDO...</span>
                  </div>
                ) : (
                  "GERAR ACESSO PIX"
                )}
              </Button>
            </form>

            <p className="text-[10px] font-mono text-gray-500 text-center mt-8 uppercase tracking-widest leading-loose">
              Ao continuar, você concorda com nossos <br />
              <span className="text-white hover:text-primary cursor-pointer transition-colors">Termos de uso</span> & <span className="text-white hover:text-primary cursor-pointer transition-colors">Privacidade</span>.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
