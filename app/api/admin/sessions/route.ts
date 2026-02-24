import { type NextRequest, NextResponse } from "next/server"
import { SessionStorage } from "@/lib/session-storage"

// Admin endpoint to view all sessions (for development/debugging)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    const sessions = activeOnly ? SessionStorage.getActiveSessions() : Array.from(SessionStorage.getActiveSessions())

    // Sort by last access (most recent first)
    sessions.sort((a, b) => new Date(b.lastAccessAt).getTime() - new Date(a.lastAccessAt).getTime())

    // Clean up expired sessions
    const cleanedCount = SessionStorage.cleanupExpired()

    const stats = SessionStorage.getSessionStats()

    return NextResponse.json({
      sessions,
      stats,
      cleanedExpired: cleanedCount,
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Clean up expired sessions
export async function POST(request: NextRequest) {
  try {
    const cleanedCount = SessionStorage.cleanupExpired()
    return NextResponse.json({ cleanedExpired: cleanedCount })
  } catch (error) {
    console.error("Error cleaning up sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Deactivate a specific session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const success = SessionStorage.deactivateSession(sessionId)

    if (!success) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deactivating session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
