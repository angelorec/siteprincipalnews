import { NextResponse } from "next/server"

const SYNCPAY_CLIENT_ID = "801623f0-2bb5-4bbc-835b-907e58082363"
const SYNCPAY_CLIENT_SECRET = "801623f0-2bb5-4bbc-835b-907e58082363" // Using same as client_id as per your secret key
const SYNCPAY_BASE_URL = "https://api.syncpay.com.br"

// Cache for auth token
let cachedToken: { token: string; expiresAt: number } | null = null

export async function POST() {
  try {
    const isDevelopment =
      process.env.NODE_ENV === "development" ||
      process.env.VERCEL_ENV === "preview" ||
      !process.env.VERCEL_URL?.includes("vercel.app")

    if (isDevelopment) {
      console.log("[v0] Development mode: returning mock SyncPay token")
      return NextResponse.json({
        access_token: "mock_token_for_development",
        token_type: "Bearer",
        expires_in: 3600,
      })
    }

    // Check if we have a valid cached token
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return NextResponse.json({ access_token: cachedToken.token })
    }

    console.log("[v0] Requesting new SyncPay auth token")

    const authResponse = await fetch(`${SYNCPAY_BASE_URL}/partner/v1/auth-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: SYNCPAY_CLIENT_ID,
        client_secret: SYNCPAY_CLIENT_SECRET,
      }),
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error("[v0] SyncPay auth failed:", authResponse.status, errorText)
      return NextResponse.json(
        {
          error: "Failed to authenticate with SyncPay",
          details: errorText,
          status: authResponse.status,
        },
        { status: 500 },
      )
    }

    let authData
    try {
      const responseText = await authResponse.text()
      console.log("[v0] SyncPay auth response:", responseText)
      authData = JSON.parse(responseText)
    } catch (parseError) {
      console.error("[v0] Failed to parse SyncPay auth response as JSON:", parseError)
      return NextResponse.json(
        {
          error: "Invalid response format from SyncPay",
        },
        { status: 500 },
      )
    }

    console.log("[v0] SyncPay auth successful")

    // Cache the token (expires in 1 hour, cache for 55 minutes to be safe)
    cachedToken = {
      token: authData.access_token,
      expiresAt: Date.now() + 55 * 60 * 1000, // 55 minutes
    }

    return NextResponse.json(authData)
  } catch (error) {
    console.error("[v0] Error getting SyncPay auth token:", error)
    return NextResponse.json({ error: "Failed to authenticate with SyncPay" }, { status: 500 })
  }
}
