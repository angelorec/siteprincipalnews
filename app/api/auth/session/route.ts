import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { SessionStorage } from "@/lib/session-storage"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "natalia-membership-secret-key-2024")

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("membership-session")

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Verify JWT token
    const { payload } = await jwtVerify(sessionToken.value, JWT_SECRET)

    // Get additional session info from storage
    const sessionId = payload.sessionId as string
    let sessionData = null

    if (sessionId) {
      sessionData = SessionStorage.get(sessionId)
    }

    const response = {
      authenticated: true,
      session: {
        transactionId: payload.transactionId,
        planId: payload.planId,
        paidAt: payload.paidAt,
        expiresAt: new Date((payload.exp as number) * 1000).toISOString(),
        sessionId: payload.sessionId,
        lastAccess: sessionData?.lastAccessAt,
        deviceInfo: sessionData?.deviceInfo,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Session verification error:", error)

    // Clear invalid session cookie
    const response = NextResponse.json({ authenticated: false }, { status: 401 })
    response.cookies.delete("membership-session")

    return response
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("membership-session")

    if (sessionToken) {
      try {
        const { payload } = await jwtVerify(sessionToken.value, JWT_SECRET)
        const sessionId = payload.sessionId as string

        if (sessionId) {
          SessionStorage.deactivateSession(sessionId)
        }
      } catch (error) {
        // Token invalid, but still clear cookie
        console.error("Error deactivating session:", error)
      }
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("membership-session")

    return response
  } catch (error) {
    console.error("Session deletion error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
