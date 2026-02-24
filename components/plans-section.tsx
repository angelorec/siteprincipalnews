"use client"

import { motion } from "framer-motion"
import { PlanCard } from "./plan-card"
import { Badge } from "@/components/ui/badge"
import plans from "@/lib/plans.json"

export function PlansSection() {
  return (
    <section id="plans" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
              ✨ Conteúdo Exclusivo
            </Badge>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-balance">
            Escolha Seu{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Plano
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Acesse conteúdo exclusivo e tenha uma experiência única comigo. Cada plano foi pensado para oferecer o
            melhor valor e satisfação.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>💳 PIX Instantâneo</span>
            <span>•</span>
            <span>🔒 Pagamento Seguro</span>
            <span>•</span>
            <span>⚡ Acesso Imediato</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <PlanCard plan={plan} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="glass max-w-2xl mx-auto p-8 rounded-3xl">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xl">
                  ⭐
                </span>
              ))}
            </div>
            <p className="text-lg italic text-muted-foreground mb-4">
              "Melhor investimento que já fiz! Conteúdo incrível e atendimento personalizado. Vale cada centavo!"
            </p>
            <p className="text-sm font-semibold text-primary">- Membro VIP verificado</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
