"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Save } from "lucide-react"

interface ApiKeys {
  [provider: string]: string
}

const PROVIDERS = [
  { id: "openai", name: "OpenAI", placeholder: "sk-..." },
  { id: "mistral", name: "Mistral AI", placeholder: "..." },
  { id: "anthropic", name: "Anthropic", placeholder: "sk-ant-..." },
  { id: "google", name: "Google AI", placeholder: "..." },
  { id: "xai", name: "xAI (Grok)", placeholder: "xai-..." },
]

export function DeveloperTools() {
  const [keys, setKeys] = useState<ApiKeys>({})
  const [editingKeys, setEditingKeys] = useState<ApiKeys>({})
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      const response = await fetch("/api/user-keys")
      if (response.ok) {
        const data = await response.json()
        setKeys(data.keys || {})
        setEditingKeys(data.keys || {})
      }
    } catch (error) {
      console.error("Error fetching keys:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyChange = (provider: string, value: string) => {
    setEditingKeys(prev => ({ ...prev, [provider]: value }))
    const hasActualChanges = Object.entries({ ...editingKeys, [provider]: value }).some(
      ([p, key]) => key && key.trim() && key !== keys[p] && key !== "••••••••••••••••"
    )
    setHasChanges(hasActualChanges)
  }

  const toggleVisibility = (provider: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(provider)) {
        newSet.delete(provider)
      } else {
        newSet.add(provider)
      }
      return newSet
    })
  }

  const saveKeys = async () => {
    setSaving(true)
    try {
      const csrfResponse = await fetch("/api/csrf")
      const { token } = await csrfResponse.json()

      for (const [provider, apiKey] of Object.entries(editingKeys)) {
        if (apiKey && apiKey.trim() && apiKey !== keys[provider] && apiKey !== "••••••••••••••••") {
          const response = await fetch("/api/user-keys", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider,
              apiKey: apiKey.trim(),
              csrfToken: token,
            }),
          })

          if (!response.ok) {
            throw new Error(`Failed to save ${provider} key`)
          }
        }
      }

      setKeys(editingKeys)
      setHasChanges(false)
    } catch (error) {
      console.error("Error saving keys:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Manage your personal API keys for AI providers. These keys will be used instead of shared keys when available.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {PROVIDERS.map((provider) => (
          <div key={provider.id} className="space-y-2">
            <Label htmlFor={provider.id}>{provider.name}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id={provider.id}
                  type={visibleKeys.has(provider.id) ? "text" : "password"}
                  placeholder={keys[provider.id] ? "••••••••••••••••" : provider.placeholder}
                  value={editingKeys[provider.id] || ""}
                  onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleVisibility(provider.id)}
                >
                  {visibleKeys.has(provider.id) ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {hasChanges && (
          <div className="pt-4">
            <Button onClick={saveKeys} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save API Keys"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
