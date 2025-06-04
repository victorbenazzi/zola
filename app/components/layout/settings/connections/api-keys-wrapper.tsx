"use client"

import { useUser } from "@/lib/user-store/provider"
import { ApiKeys } from "./api-keys"

export function ApiKeysWrapper() {
  const { user } = useUser()

  if (!user) return null

  return <ApiKeys userId={user.id} isAuthenticated={true} />
}
