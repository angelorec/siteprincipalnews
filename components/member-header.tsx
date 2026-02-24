"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, Crown } from "lucide-react"
import { motion } from "framer-motion"

interface MemberHeaderProps {
  onLogout: () => void
  session: any
}

export function MemberHeader({ onLogout, session }: MemberHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-strong border-b border-border/50 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-primary/50">
                <AvatarImage src="/professional-portrait-of-beautiful-woman-with-dark.png" alt="Natália Katowicz" />
                <AvatarFallback>NK</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-bold text-lg">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Natália Katowicz
                  </span>
                </h1>
                <p className="text-xs text-muted-foreground">Área de Membros</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Plano:</span>
              <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {session?.planId || "Premium"}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-strong">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
