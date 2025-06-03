import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { encryptAndStore } from "@/lib/encryption"
import { validateCsrfToken } from "@/lib/csrf"

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userKeys, error } = await supabase
      .from("user_keys")
      .select("provider, created_at, updated_at")
      .eq("user_id", user.id)

    if (error) {
      console.error("Error fetching user keys:", error)
      return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 })
    }

    const maskedKeys = userKeys?.reduce((acc, key) => {
      acc[key.provider] = "••••••••••••••••"
      return acc
    }, {} as Record<string, string>) || {}

    return NextResponse.json({ keys: maskedKeys })
  } catch (error) {
    console.error("Error in GET /api/user-keys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { provider, apiKey, csrfToken } = body

    if (!validateCsrfToken(csrfToken)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
    }

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Provider and API key are required" }, { status: 400 })
    }

    const validProviders = ["openai", "mistral", "anthropic", "google", "xai"]
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    }

    const encryptedKey = encryptAndStore(apiKey)

    const { error } = await supabase
      .from("user_keys")
      .upsert({
        user_id: user.id,
        provider,
        encrypted_key: encryptedKey,
        iv: "",
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error("Error saving user key:", error)
      return NextResponse.json({ error: "Failed to save key" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/user-keys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
