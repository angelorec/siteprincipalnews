"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Lock, Heart, ImageIcon, Video, Users } from "lucide-react"
import { SignupDialog } from "@/components/signup-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export function MobileProfileSection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showFullBio, setShowFullBio] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handlePlanClick = (planId: string) => {
    if (!user) {
      // Not logged in - redirect to sign-up
      router.push("/auth/sign-up")
      return
    }
    // Logged in - open payment dialog
    setSelectedPlan(planId)
  }

  const plans = [
    {
      id: "monthly",
      name: "1 mes",
      price: "R$ 19,90",
      originalPrice: null,
      discount: null,
      popular: false,
    },
    {
      id: "quarterly",
      name: "3 meses",
      price: "R$ 39,90",
      originalPrice: "R$ 59,70",
      discount: "33% OFF",
      popular: true,
    },
    {
      id: "semester",
      name: "6 meses",
      price: "R$ 59,90",
      originalPrice: "R$ 119,40",
      discount: "50% OFF",
      popular: false,
    },
  ]

  const fullBio =
    "Sem querer me gabar, mas o melhor conteudo +18 que voce vai ver, e o meu, ta? Ja fui top criadoras no site laranjinha e na azulzinha, e hoje tenho minha propria plataforma. Aqui voce encontra conteudo exclusivo, fotos sensuais, videos picantes e muito mais! Venha fazer parte da minha comunidade VIP e tenha acesso a tudo que eu tenho de melhor para oferecer. Nao vai se arrepender!"
  const shortBio =
    "Sem querer me gabar, mas o melhor conteudo +18 que voce vai ver, e o meu, ta? Ja fui top criadoras no site laranjinha e na azulzinha, e hoje tenho minha propria plataforma."

  return (
    <div className="max-w-md mx-auto bg-black text-white min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-black animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent" />

      <div className="relative z-10">
        {/* Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="relative h-48 overflow-hidden">
            <Image src="https://i.imgur.com/c3GOCr8.jpg" alt="Cover" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.5,
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 10}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Profile Section */}
          <div className="relative px-4 -mt-16">
            <div className="flex items-end gap-4 mb-4">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-lg shadow-purple-500/25">
                  <Image
                    src="https://i.imgur.com/JFb3R8k.jpg"
                    alt="Natalia Katowicz"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <span className="text-xs">{'✓'}</span>
                </motion.div>
              </motion.div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-2">
                <motion.div
                  className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">108</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Video className="w-4 h-4 text-pink-400" />
                  <span className="font-medium">113</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">5</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-medium">28.2K</span>
                </motion.div>
              </div>
            </div>

            {/* Name and Handle */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  NATALIA KATOWICZ
                </h1>
                <motion.div
                  className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <span className="text-xs text-white">{'✓'}</span>
                </motion.div>
              </div>
              <p className="text-gray-400 text-sm">@nataliakatowicz</p>
            </motion.div>

            <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <motion.p className="text-sm text-gray-300 leading-relaxed break-words" layout>
                {showFullBio ? fullBio : shortBio}
              </motion.p>
              <motion.button
                className="text-purple-400 text-sm mt-2 hover:text-purple-300 transition-colors font-medium"
                onClick={() => setShowFullBio(!showFullBio)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showFullBio ? "Ver menos" : "Ver mais"}
              </motion.button>
            </motion.div>

            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Assinaturas
              </h3>
              <div className="space-y-3">
                {plans.map((plan, index) => (
                  <motion.button
                    key={plan.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlanClick(plan.id)}
                    className="w-full bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-white text-lg">{plan.name}</span>
                          {plan.popular && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs px-2 py-0.5 mt-1 font-bold">
                              POPULAR
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xl text-white">{plan.price}</div>
                        {plan.originalPrice && (
                          <div className="text-sm text-gray-400 line-through">{plan.originalPrice}</div>
                        )}
                      </div>
                    </div>

                    {plan.discount && (
                      <motion.div
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 3,
                        }}
                      >
                        {plan.discount}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-gray-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex justify-between">
                <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
                  <div className="flex items-center justify-center gap-1 text-purple-400 mb-2">
                    <ImageIcon className="w-5 h-5" />
                    <span className="font-bold text-lg">160</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Postagens</span>
                </motion.div>
                <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
                  <div className="flex items-center justify-center gap-1 text-pink-400 mb-2">
                    <Video className="w-5 h-5" />
                    <span className="font-bold text-lg">221</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Midias</span>
                </motion.div>
                <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
                  <div className="flex items-center justify-center gap-1 text-blue-400 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-bold text-lg">2.8K</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Fas</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="px-4 pb-8">
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            {/* Profile Header for Locked Section */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/50">
                <Image
                  src="https://i.imgur.com/JFb3R8k.jpg"
                  alt="Natalia Katowicz"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">NATALIA KATOWICZ</span>
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">{'✓'}</span>
                  </div>
                </div>
                <span className="text-gray-400 text-xs">@nataliakatowicz</span>
              </div>
            </div>

            {/* Locked Content */}
            <motion.div
              className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="aspect-square relative">
                <div className="absolute inset-0">
                  <Image
                    src="https://i.imgur.com/II3RtV9.jpg"
                    alt="Locked content"
                    fill
                    className="object-cover blur-[20px] scale-110"
                  />
                  <div className="absolute inset-0 bg-black/60" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="bg-black/70 rounded-full p-8 backdrop-blur-md border border-purple-500/30"
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 20px rgba(168, 85, 247, 0.3)",
                        "0 0 40px rgba(168, 85, 247, 0.5)",
                        "0 0 20px rgba(168, 85, 247, 0.3)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <Lock className="w-16 h-16 text-purple-400" />
                  </motion.div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white text-sm">
                  <motion.div
                    className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span className="font-medium">108</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Video className="w-4 h-4 text-pink-400" />
                    <span className="font-medium">113</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="font-medium">28.2K</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Signup Dialog - auto-fills from Supabase user */}
      <SignupDialog
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        selectedPlan={selectedPlan ? plans.find((p) => p.id === selectedPlan) ?? null : null}
        user={user}
      />
    </div>
  )
}
