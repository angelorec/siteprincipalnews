"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="https://i.imgur.com/NYfPhn0.jpg" alt="Natália Katowicz Cover" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-background/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative w-40 h-40 mx-auto mb-6">
              <Image
                src="https://i.imgur.com/hTDWL8R.png"
                alt="Natália Katowicz"
                fill
                className="object-cover rounded-full border-4 border-primary/50 shadow-2xl glass"
              />
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-lg" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-balance"
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Natália Katowicz
            </span>
            <span className="text-3xl md:text-4xl block mt-4 text-muted-foreground">🔞</span>
          </motion.h1>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <div className="glass max-w-4xl mx-auto p-8 rounded-3xl">
              <p className="text-lg md:text-xl text-foreground leading-relaxed text-pretty">
                Sem querer me gabar, mas o melhor conteúdo +18 que você vai ver, é o meu, tá? 🤭 Já fui top criadoras no
                site laranjinha 🟠 e na azulzinha 🔵, e hoje tenho minha própria plataforma, para melhorar a
                experiência, e atender vocês da melhor maneira possível 💜💜💜
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-4"
          >
            <button
              onClick={() => {
                document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="group relative bg-gradient-to-r from-primary to-secondary text-primary-foreground px-10 py-5 rounded-2xl font-semibold text-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/25"
            >
              <span className="relative z-10">Ver Planos de Assinatura</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
            </button>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Online agora</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Acesso Imediato</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
