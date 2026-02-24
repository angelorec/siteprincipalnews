"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Sparkles, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import Confetti from "react-confetti"

export default function SuccessPage() {
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const router = useRouter()

  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
    }

    updateWindowDimensions()
    window.addEventListener("resize", updateWindowDimensions)

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000)

    return () => {
      window.removeEventListener("resize", updateWindowDimensions)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          colors={["#A855F7", "#D946EF", "#F59E0B", "#10B981"]}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <Card className="glass-strong text-center">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-8 h-8 text-secondary" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pagamento Confirmado!
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-muted-foreground mb-8 leading-relaxed"
            >
              Parabéns! Seu pagamento foi processado com sucesso. Agora você tem acesso completo ao conteúdo exclusivo
              da Natália Katowicz.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="space-y-4"
            >
              <Button
                onClick={() => router.push("/membros")}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg py-6"
              >
                <Crown className="w-5 h-5 mr-2" />
                Acessar Área de Membros
              </Button>

              <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8 p-4 bg-primary/5 rounded-lg"
            >
              <p className="text-sm text-muted-foreground">
                💜 Obrigada pela confiança! Prepare-se para uma experiência única e exclusiva.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
