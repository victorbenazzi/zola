import { env } from "./openproviders/env"

export async function getUserApiKey(userId: string, provider: string): Promise<string | null> {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const { decryptFromStorage } = await import("./encryption")
    
    const supabase = await createClient()
    if (!supabase) return null
    
    const { data, error } = await supabase
      .from("user_keys")
      .select("encrypted_key")
      .eq("user_id", userId)
      .eq("provider", provider)
      .single()

    if (error || !data) {
      return null
    }

    return decryptFromStorage(data.encrypted_key)
  } catch (error) {
    console.error("Error retrieving user API key:", error)
    return null
  }
}

export async function getApiKeyForProvider(userId: string | undefined, provider: string): Promise<string> {
  if (userId) {
    const userKey = await getUserApiKey(userId, provider)
    if (userKey) {
      return userKey
    }
  }

  const envKey = `${provider.toUpperCase()}_API_KEY` as keyof typeof env
  return env[envKey] || ""
}
