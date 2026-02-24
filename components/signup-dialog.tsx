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
        router.push(`/checkout/${data.transactionId}`)
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white border border-purple-500/30 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Finalizar Assinatura
              </h2>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {selectedPlan && (
              <motion.div
                className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-4 mb-6 border border-purple-500/30 backdrop-blur-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                    {selectedPlan.discount && (
                      <span className="text-sm text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-full">
                        {selectedPlan.discount}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {selectedPlan.price}
                    </div>
                    {selectedPlan.originalPrice && (
                      <div className="text-sm text-gray-400 line-through">{selectedPlan.originalPrice}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <Label htmlFor="dialog-name" className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Nome Completo
                </Label>
                <Input
                  id="dialog-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl h-12"
                  placeholder="Digite seu nome completo"
                  required
                />
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <Label htmlFor="dialog-email" className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  E-mail
                </Label>
                <Input
                  id="dialog-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl h-12"
                  placeholder="seu@email.com"
                  required
                />
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3"
                >
                  {error}
                </motion.p>
              )}

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-2xl mt-2 h-14 text-lg shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando PIX...
                    </motion.div>
                  ) : (
                    <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Gerar PIX
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.p
              className="text-xs text-gray-400 text-center mt-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Ao continuar, voce concorda com nossos{" "}
              <span className="text-purple-400 hover:text-purple-300 cursor-pointer">termos de uso</span> e{" "}
              <span className="text-purple-400 hover:text-purple-300 cursor-pointer">politica de privacidade</span>.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
