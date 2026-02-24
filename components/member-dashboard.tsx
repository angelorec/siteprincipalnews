"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, Heart, MessageCircle, Video, ImageIcon, Star, Play, Lock } from "lucide-react"
import { useState } from "react"
import { ContentGallery } from "./content-gallery"
import { MemberHeader } from "./member-header"
import { SessionStatus } from "./session-status"

export function MemberDashboard() {
  const { session, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"gallery" | "videos" | "messages" | "profile">("gallery")

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const getPlanBadge = (planId: string) => {
    const plans = {
      basic: { name: "Básico", color: "bg-blue-500" },
      premium: { name: "Premium", color: "bg-gradient-to-r from-primary to-secondary" },
      vip: { name: "VIP", color: "bg-gradient-to-r from-yellow-400 to-orange-500" },
    }
    return plans[planId as keyof typeof plans] || plans.premium
  }

  const planInfo = getPlanBadge(session?.planId || "premium")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <MemberHeader onLogout={handleLogout} session={session} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <Card className="glass-strong">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-primary/50">
                        <AvatarImage
                          src="/professional-portrait-of-beautiful-woman-with-dark.png"
                          alt="Natália Katowicz"
                        />
                        <AvatarFallback>NK</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2">
                        <Crown className="w-8 h-8 text-secondary" />
                      </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                      <h1 className="text-3xl font-bold mb-2">
                        Bem-vindo de volta!{" "}
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          💜
                        </span>
                      </h1>
                      <p className="text-muted-foreground mb-4">
                        Você é membro desde {session?.paidAt ? formatDate(session.paidAt) : "hoje"}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className={`${planInfo.color} text-white px-4 py-1`}>
                          <Crown className="w-4 h-4 mr-1" />
                          Plano {planInfo.name}
                        </Badge>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                          Ativo
                        </Badge>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-primary/10 rounded-2xl p-4 mb-4">
                        <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Obrigada pelo carinho!</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex flex-wrap gap-2 p-2 glass rounded-2xl">
                {[
                  { id: "gallery", label: "Galeria", icon: ImageIcon },
                  { id: "videos", label: "Vídeos", icon: Video },
                  { id: "messages", label: "Mensagens", icon: MessageCircle },
                  { id: "profile", label: "Perfil", icon: Star },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className={`flex-1 min-w-[120px] ${
                      activeTab === tab.id ? "bg-gradient-to-r from-primary to-secondary" : ""
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Content Area */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === "gallery" && <ContentGallery />}
              {activeTab === "videos" && <VideoSection />}
              {activeTab === "messages" && <MessagesSection />}
              {activeTab === "profile" && <ProfileSection session={session} />}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Session Status Component */}
              <SessionStatus />

              {/* Quick Stats */}
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Estatísticas Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conteúdos vistos:</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Favoritos:</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mensagens:</span>
                    <span className="font-semibold">8</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function VideoSection() {
  const videos = [
    {
      id: 1,
      title: "Conteúdo Exclusivo #1",
      duration: "15:30",
      thumbnail: "/video-thumbnail-exclusive-content.png",
      premium: true,
    },
    {
      id: 2,
      title: "Behind the Scenes",
      duration: "08:45",
      thumbnail: "/behind-the-scenes-thumbnail.png",
      premium: false,
    },
    {
      id: 3,
      title: "Live Especial",
      duration: "45:20",
      thumbnail: "/live-special-video-thumbnail.png",
      premium: true,
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="glass hover:shadow-xl transition-all duration-300 group cursor-pointer">
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={video.thumbnail || "/placeholder.svg"}
                alt={video.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Play className="w-12 h-12 text-white" />
              </div>
              <div className="absolute top-2 right-2">
                {video.premium && (
                  <Badge className="bg-gradient-to-r from-primary to-secondary">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{video.title}</h3>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                <Play className="w-4 h-4 mr-2" />
                Assistir
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function MessagesSection() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Mensagens Diretas
          </CardTitle>
          <CardDescription>Converse diretamente comigo de forma exclusiva</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/professional-portrait-of-beautiful-woman-with-dark.png" alt="Natália" />
                <AvatarFallback>NK</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">Natália Katowicz</p>
                <p className="text-xs text-muted-foreground">Há 2 horas</p>
              </div>
            </div>
            <p className="text-sm">
              Oi amor! Obrigada por ser membro. Estou preparando conteúdo especial só para vocês! 💜
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
            />
            <Button className="bg-gradient-to-r from-primary to-secondary">Enviar</Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Lock className="w-4 h-4 inline mr-1" />
            Mensagens criptografadas e privadas
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileSection({ session }: { session: any }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Plano Atual</label>
              <p className="font-semibold">{session?.planId || "Premium"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Membro desde</label>
              <p className="font-semibold">
                {session?.paidAt ? new Date(session.paidAt).toLocaleDateString("pt-BR") : "Hoje"}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600 font-semibold">Ativo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-strong">
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">127</p>
              <p className="text-sm text-muted-foreground">Fotos visualizadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">23</p>
              <p className="text-sm text-muted-foreground">Vídeos assistidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">8</p>
              <p className="text-sm text-muted-foreground">Mensagens trocadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
