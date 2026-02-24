"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Crown, Sparkles } from "lucide-react"
import { useState } from "react"
import { PlanDialog } from "./plan-dialog"

interface Plan {
  id: string
  title: string
  price: number
  period: string
  description: string
  features: string[]
  popular?: boolean
}

interface PlanCardProps {
  plan: Plan
}

export function PlanCard({ plan }: PlanCardProps) {
  const [showDialog, setShowDialog] = useState(false)

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.03, y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-full"
      >
        <Card
          className={`glass-strong relative overflow-hidden h-full flex flex-col ${
            plan.popular
              ? "ring-2 ring-primary/50 shadow-2xl shadow-primary/25 scale-105"
              : "hover:shadow-xl hover:shadow-primary/10"
          }`}
        >
          {plan.popular && (
            <>
              <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-secondary text-primary-foreground px-6 py-2 text-sm font-bold rounded-bl-2xl shadow-lg">
                <Crown className="w-4 h-4 inline mr-1" />
                Mais Popular
              </div>
              <div className="absolute top-4 left-4">
                <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
              </div>
            </>
          )}

          <CardHeader className="text-center pb-6 flex-shrink-0">
            <CardTitle className="text-2xl font-bold mb-2">{plan.title}</CardTitle>
            <CardDescription className="text-muted-foreground text-base">{plan.description}</CardDescription>

            <div className="mt-6 p-4 glass rounded-2xl">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {(plan.price / 100).toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">,{(plan.price % 100).toString().padStart(2, "0")}</span>
              </div>
              <span className="text-muted-foreground text-sm">por {plan.period}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 flex-grow">
            {plan.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm leading-relaxed">{feature}</span>
              </motion.div>
            ))}
          </CardContent>

          <CardFooter className="pt-6 flex-shrink-0">
            <Button
              onClick={() => setShowDialog(true)}
              className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl"
                  : "hover:bg-primary/10 hover:border-primary/50"
              }`}
              variant={plan.popular ? "default" : "outline"}
            >
              {plan.popular ? "🚀 Começar Agora" : "Escolher Plano"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <PlanDialog plan={plan} open={showDialog} onOpenChange={setShowDialog} />
    </>
  )
}
