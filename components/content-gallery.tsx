"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Download, Crown, Eye, Calendar } from "lucide-react"
import Image from "next/image"

interface ContentItem {
  id: number
  title: string
  type: "photo" | "video"
  thumbnail: string
  premium: boolean
  likes: number
  views: number
  date: string
  description?: string
}

export function ContentGallery() {
  const [filter, setFilter] = useState<"all" | "photos" | "videos">("all")
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set())

  const content: ContentItem[] = [
    {
      id: 1,
      title: "Ensaio Exclusivo #1",
      type: "photo",
      thumbnail: "/exclusive-photoshoot-glamour.png",
      premium: true,
      likes: 234,
      views: 1205,
      date: "2024-01-15",
      description: "Ensaio fotográfico exclusivo em estúdio",
    },
    {
      id: 2,
      title: "Behind the Scenes",
      type: "video",
      thumbnail: "/behind-the-scenes-thumbnail.png",
      premium: false,
      likes: 156,
      views: 892,
      date: "2024-01-14",
      description: "Bastidores do último ensaio",
    },
    {
      id: 3,
      title: "Sessão Especial",
      type: "photo",
      thumbnail: "/special-photo-session-artistic.png",
      premium: true,
      likes: 312,
      views: 1456,
      date: "2024-01-13",
      description: "Sessão fotográfica com tema especial",
    },
    {
      id: 4,
      title: "Conteúdo Premium",
      type: "video",
      thumbnail: "/premium-video-content-thumbnail.png",
      premium: true,
      likes: 445,
      views: 2103,
      date: "2024-01-12",
      description: "Vídeo exclusivo para membros premium",
    },
    {
      id: 5,
      title: "Ensaio Artístico",
      type: "photo",
      thumbnail: "/artistic-photoshoot-creative.png",
      premium: false,
      likes: 189,
      views: 756,
      date: "2024-01-11",
      description: "Ensaio com conceito artístico",
    },
    {
      id: 6,
      title: "Live Especial",
      type: "video",
      thumbnail: "/special-live-stream-thumbnail.png",
      premium: true,
      likes: 567,
      views: 3204,
      date: "2024-01-10",
      description: "Gravação da live especial para membros",
    },
  ]

  const filteredContent = content.filter((item) => {
    if (filter === "all") return true
    if (filter === "photos") return item.type === "photo"
    if (filter === "videos") return item.type === "video"
    return true
  })

  const toggleLike = (id: number) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    })
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 p-2 glass rounded-2xl w-fit">
        {[
          { id: "all", label: "Todos" },
          { id: "photos", label: "Fotos" },
          { id: "videos", label: "Vídeos" },
        ].map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            variant={filter === tab.id ? "default" : "ghost"}
            size="sm"
            className={filter === tab.id ? "bg-gradient-to-r from-primary to-secondary" : ""}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="glass hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="relative">
                <Image
                  src={item.thumbnail || "/placeholder.svg"}
                  alt={item.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {item.premium && (
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-black/50 text-white border-0">
                    {item.type === "photo" ? "Foto" : "Vídeo"}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="absolute bottom-2 left-2 flex items-center gap-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {item.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.date)}
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => toggleLike(item.id)}
                    variant="ghost"
                    size="sm"
                    className={`${likedItems.has(item.id) ? "text-red-500" : "text-muted-foreground"}`}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${likedItems.has(item.id) ? "fill-current" : ""}`} />
                    {item.likes + (likedItems.has(item.id) ? 1 : 0)}
                  </Button>

                  <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                    <Download className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum conteúdo encontrado para este filtro.</p>
        </div>
      )}
    </div>
  )
}
