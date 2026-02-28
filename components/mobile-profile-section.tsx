"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Lock, Heart, ImageIcon, Video, Users } from "lucide-react"
import { SignupDialog } from "@/components/signup-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import dynamic from "next/dynamic"

const RestrictedContentPreview = dynamic(
  () => import("@/components/restricted-content-preview").then((mod) => mod.RestrictedContentPreview),
  {
    loading: () => <div className="aspect-square w-full bg-white/5 animate-pulse" />,
    ssr: false,
  }
)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = (y = 20) => ({
  hidden: { y, opacity: 0 },
  visible: { y: 0, opacity: 1 }
})

const logoVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", damping: 15 } }
}

export function MobileProfileSection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showFullBio, setShowFullBio] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const restrictedImages = [
    "https://imgur.com/MuF99Hp.jpg",
    "https://imgur.com/SDvGbdU.jpg",
    "https://imgur.com/Ts4JRg2.jpg",
    "https://imgur.com/77XFQg4.jpg"
  ]

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
      name: "Vitalício",
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,0,255,0.1)_0%,_black_100%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <motion.div
        className="relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <div className="relative">
          {/* Cover Image with Glass Overlay */}
          <motion.div
            className="relative h-64 overflow-hidden"
            variants={itemVariants(-10)}
          >
            <Image
              src="/cover-v2.png"
              alt="Cover"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </motion.div>

          {/* Profile Identity - Asymmetric Overlap */}
          <div className="relative px-6 -mt-16 flex flex-col items-start">
            <motion.div
              className="relative mb-6"
              variants={logoVariants}
            >
              <div className="w-28 h-28 rounded-sm overflow-hidden border-2 border-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Image
                  src="https://i.imgur.com/hTDWL8R.png"
                  alt="Natalia Katowicz"
                  width={112}
                  height={112}
                  sizes="112px"
                  className="object-cover w-full h-full"
                  priority
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
              variants={itemVariants(-10)}
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
              variants={itemVariants(10)}
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
                    variants={itemVariants(index % 2 === 0 ? -15 : 15)}
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
            <RestrictedContentPreview images={restrictedImages} />
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
