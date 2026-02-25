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
    <div className="max-w-md mx-auto bg-black text-white min-h-screen relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-magenta-500/10 via-black to-black" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <motion.div
        className="relative z-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
          }
        }}
      >
        {/* Header Section */}
        <div className="relative">
          {/* Cover Image with Glass Overlay */}
          <motion.div
            className="relative h-64 overflow-hidden"
            variants={{
              hidden: { y: -20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
          >
            <Image src="https://i.imgur.com/c3GOCr8.jpg" alt="Cover" fill className="object-cover scale-105" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </motion.div>

          {/* Profile Identity - Asymmetric Overlap */}
          <div className="relative px-6 -mt-16 flex flex-col items-start">
            <motion.div
              className="relative mb-6"
              variants={{
                hidden: { scale: 0.8, opacity: 0 },
                visible: { scale: 1, opacity: 1, transition: { type: "spring", damping: 12 } }
              }}
            >
              <div className="w-28 h-28 rounded-sm overflow-hidden border-2 border-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Image
                  src="https://i.imgur.com/JFb3R8k.jpg"
                  alt="Natalia Katowicz"
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>
              <motion.div
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-black"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-sm font-bold">✓</span>
              </motion.div>
            </motion.div>

            {/* Typography focused Name */}
            <motion.div
              className="mb-6 w-full"
              variants={{
                hidden: { x: -20, opacity: 0 },
                visible: { x: 0, opacity: 1 }
              }}
            >
              <h1 className="text-4xl font-playfair font-black tracking-tighter mb-1 uppercase">
                Natalia <span className="text-primary tracking-normal italic">Katowicz</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-mono text-xs tracking-widest uppercase">@nataliakatowicz</span>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent" />
              </div>
            </motion.div>

            {/* Quick Stats Grid - Custom Layout */}
            <motion.div
              className="grid grid-cols-4 gap-4 w-full mb-8 bg-white/5 backdrop-blur-sm p-4 border-y border-white/10"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 }
              }}
            >
              {[
                { label: "Posts", val: "108", icon: ImageIcon, color: "text-primary" },
                { label: "Vids", val: "113", icon: Video, color: "text-secondary" },
                { label: "Stars", val: "5", icon: Users, color: "text-blue-400" },
                { label: "Likes", val: "28k", icon: Heart, color: "text-red-500" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <stat.icon className={`w-4 h-4 ${stat.color} opacity-80`} />
                  <span className="font-bold text-sm leading-none">{stat.val}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Bio Section - Floating Typography */}
            <motion.div
              className="mb-8"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 }
              }}
            >
              <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-primary pl-4 py-1">
                {showFullBio ? fullBio : shortBio}
              </p>
              <button
                className="text-white text-xs mt-3 uppercase tracking-widest font-bold flex items-center gap-2 group"
                onClick={() => setShowFullBio(!showFullBio)}
              >
                {showFullBio ? "Menos" : "Mais"}
                <div className="w-8 h-px bg-white group-hover:w-12 transition-all" />
              </button>
            </motion.div>

            {/* Membership Header */}
            <motion.div
              className="w-full mb-6"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-gray-500 mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-800" />
                Select Your Access
                <div className="h-px flex-1 bg-gray-800" />
              </h3>

              <div className="space-y-4">
                {plans.map((plan, index) => (
                  <motion.button
                    key={plan.id}
                    variants={{
                      hidden: { x: index % 2 === 0 ? -20 : 20, opacity: 0 },
                      visible: { x: 0, opacity: 1 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlanClick(plan.id)}
                    className="w-full relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/5 border border-white/10 group-hover:border-primary/50 transition-colors" />
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-tighter">
                        Most Wanted
                      </div>
                    )}

                    <div className="relative p-5 flex items-center justify-between">
                      <div className="flex flex-col items-start">
                        <span className="font-playfair text-xl font-bold italic">{plan.name}</span>
                        {plan.discount && (
                          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{plan.discount}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black">{plan.price}</span>
                        {plan.originalPrice && (
                          <span className="text-[10px] text-gray-600 line-through tracking-tighter">{plan.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Exclusive Preview Locked Section */}
            <motion.div
              className="w-full pb-12"
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
              }}
            >
              <div className="relative aspect-square w-full filter saturate-[0.2] hover:saturate-100 transition-all duration-700">
                <Image
                  src="https://i.imgur.com/II3RtV9.jpg"
                  alt="Exclusive Preview"
                  fill
                  className="object-cover blur-[2px]"
                />
                <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-px bg-primary" />
                    <Lock className="w-8 h-8 text-white" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400">Restricted Area</span>
                      <span className="text-xl font-playfair font-black italic">Unlock Full Content</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Signup Dialog */}
      <SignupDialog
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        selectedPlan={selectedPlan ? plans.find((p) => p.id === selectedPlan) ?? null : null}
        user={user}
      />
    </div>
  )
}
