"use client"

import { useSessionManager } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Shield, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

export function SessionStatus() {
  const { session, isSessionExpiringSoon, formatTimeUntilExpiry, refreshSession } = useSessionManager()

  if (!session) return null

  const isExpiringSoon = isSessionExpiringSoon()

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={`glass ${isExpiringSoon ? "border-yellow-500/50" : ""}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {isExpiringSoon ? (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            ) : (
              <Shield className="w-4 h-4 text-green-500" />
            )}
            Status da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tempo restante:</span>
            <Badge variant={isExpiringSoon ? "destructive" : "secondary"} className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeUntilExpiry()}
            </Badge>
          </div>

          {isExpiringSoon && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                Sua assinatura expira em breve. Renove para continuar com acesso total.
              </p>
              <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary">
                Renovar Assinatura
              </Button>
            </div>
          )}

          <Button onClick={refreshSession} variant="ghost" size="sm" className="w-full text-xs">
            Atualizar Status
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
