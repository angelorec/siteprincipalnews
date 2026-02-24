import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { SessionStorage } from "@/lib/session-storage"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "natalia-membership-secret-key-2024")

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("membership-session")

    if (!sessionToken) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    // Verify current JWT token
    const { payload } = await jwtVerify(sessionToken.value, JWT_SECRET)

    // Extend session by 30 days
    const newExpirationTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

    // Create new JWT with extended expiration
    const newSessionToken = await new SignJWT({
      transactionId: payload.transactionId,
      planId: payload.planId,
      paidAt: payload.paidAt,
      sessionId: payload.sessionId,
      exp: newExpirationTime,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(newExpirationTime)
      .sign(JWT_SECRET)

    // Update session in storage if it exists
    const sessionId = payload.sessionId as string
    if (sessionId) {
      SessionStorage.extendSession(sessionId, 30)
    }

    // Set new cookie
    cookieStore.set("membership-session", newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return NextResponse.json({
      success: true,
      expiresAt: new Date(newExpirationTime * 1000).toISOString(),
    })
  } catch (error) {
    console.error("Session extension error:", error)
    return NextResponse.json({ error: "Failed to extend session" }, { status: 500 })
  }
}
