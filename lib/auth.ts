"use client"

import { useEffect, useState, useCallback } from "react"

interface Session {
  transactionId: string
  planId: string
  paidAt: string
  expiresAt: string
}

interface AuthState {
  authenticated: boolean
  session: Session | null
  loading: boolean
}

export function useAuth(): AuthState & {
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  extendSession: () => Promise<void>
} {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    session: null,
    loading: true,
  })

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      })
      const data = await response.json()

      if (response.ok && data.authenticated) {
        setAuthState({
          authenticated: true,
          session: data.session,
          loading: false,
        })
      } else {
        setAuthState({
          authenticated: false,
          session: null,
          loading: false,
        })
      }
    } catch (error) {
      console.error("Session check error:", error)
      setAuthState({
        authenticated: false,
        session: null,
        loading: false,
      })
    }
  }, [])

  const refreshSession = useCallback(async () => {
    await checkSession()
  }, [checkSession])

  const extendSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/extend", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        await refreshSession()
      }
    } catch (error) {
      console.error("Session extension error:", error)
    }
  }, [refreshSession])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      })
      setAuthState({
        authenticated: false,
        session: null,
        loading: false,
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }, [])

  useEffect(() => {
    checkSession()

    // Set up periodic session refresh (every 5 minutes)
    const interval = setInterval(refreshSession, 5 * 60 * 1000)

    // Set up session extension reminder (when 7 days left)
    const checkExpiration = () => {
      if (authState.session) {
        const expiresAt = new Date(authState.session.expiresAt)
        const now = new Date()
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysLeft <= 7 && daysLeft > 0) {
          // Could show a notification here about session expiring soon
          console.log(`Session expires in ${daysLeft} days`)
        }
      }
    }

    const expirationCheck = setInterval(checkExpiration, 24 * 60 * 60 * 1000) // Check daily

    return () => {
      clearInterval(interval)
      clearInterval(expirationCheck)
    }
  }, [checkSession, refreshSession, authState.session])

  return { ...authState, logout, refreshSession, extendSession }
}

// Hook for session management utilities
export function useSessionManager() {
  const { session, refreshSession } = useAuth()

  const getTimeUntilExpiry = useCallback(() => {
    if (!session) return null

    const expiresAt = new Date(session.expiresAt)
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes, total: diff }
  }, [session])

  const isSessionExpiringSoon = useCallback(() => {
    const timeLeft = getTimeUntilExpiry()
    return timeLeft ? timeLeft.days <= 7 : false
  }, [getTimeUntilExpiry])

  const formatTimeUntilExpiry = useCallback(() => {
    const timeLeft = getTimeUntilExpiry()
    if (!timeLeft) return "Expirado"

    if (timeLeft.days > 0) {
      return `${timeLeft.days} dia${timeLeft.days > 1 ? "s" : ""}`
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours} hora${timeLeft.hours > 1 ? "s" : ""}`
    } else {
      return `${timeLeft.minutes} minuto${timeLeft.minutes > 1 ? "s" : ""}`
    }
  }, [getTimeUntilExpiry])

  return {
    session,
    refreshSession,
    getTimeUntilExpiry,
    isSessionExpiringSoon,
    formatTimeUntilExpiry,
  }
}
