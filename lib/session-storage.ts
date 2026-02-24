// Session storage for managing active user sessions
export interface UserSession {
  sessionId: string
  transactionId: string
  planId: string
  userId?: string
  email?: string
  name?: string
  createdAt: string
  lastAccessAt: string
  expiresAt: string
  isActive: boolean
  deviceInfo?: {
    userAgent?: string
    ip?: string
    location?: string
  }
}

// Global storage for sessions (use database in production)
const sessions = new Map<string, UserSession>()

export const SessionStorage = {
  create: (session: UserSession) => {
    sessions.set(session.sessionId, session)
    return session
  },

  get: (sessionId: string): UserSession | null => {
    const session = sessions.get(sessionId)
    if (!session) return null

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      sessions.delete(sessionId)
      return null
    }

    // Update last access time
    session.lastAccessAt = new Date().toISOString()
    sessions.set(sessionId, session)

    return session
  },

  update: (sessionId: string, updates: Partial<UserSession>): UserSession | null => {
    const existing = sessions.get(sessionId)
    if (!existing) return null

    const updated = { ...existing, ...updates, lastAccessAt: new Date().toISOString() }
    sessions.set(sessionId, updated)
    return updated
  },

  delete: (sessionId: string): boolean => {
    return sessions.delete(sessionId)
  },

  getByTransaction: (transactionId: string): UserSession | null => {
    for (const session of sessions.values()) {
      if (session.transactionId === transactionId && session.isActive) {
        return session
      }
    }
    return null
  },

  getActiveSessions: (): UserSession[] => {
    const now = new Date()
    return Array.from(sessions.values()).filter((session) => session.isActive && new Date(session.expiresAt) > now)
  },

  cleanupExpired: (): number => {
    const now = new Date()
    let cleaned = 0

    for (const [sessionId, session] of sessions.entries()) {
      if (new Date(session.expiresAt) < now) {
        sessions.delete(sessionId)
        cleaned++
      }
    }

    return cleaned
  },

  extendSession: (sessionId: string, additionalDays = 30): UserSession | null => {
    const session = sessions.get(sessionId)
    if (!session) return null

    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + additionalDays)

    return SessionStorage.update(sessionId, {
      expiresAt: newExpiresAt.toISOString(),
    })
  },

  deactivateSession: (sessionId: string): boolean => {
    const session = sessions.get(sessionId)
    if (!session) return false

    session.isActive = false
    sessions.set(sessionId, session)
    return true
  },

  getSessionStats: () => {
    const allSessions = Array.from(sessions.values())
    const activeSessions = allSessions.filter((s) => s.isActive && new Date(s.expiresAt) > new Date())

    return {
      total: allSessions.length,
      active: activeSessions.length,
      expired: allSessions.filter((s) => new Date(s.expiresAt) < new Date()).length,
      byPlan: activeSessions.reduce(
        (acc, session) => {
          acc[session.planId] = (acc[session.planId] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }
  },
}
