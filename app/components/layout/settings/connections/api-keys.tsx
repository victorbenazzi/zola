"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Save, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiKeysProps {
  userId: string
  isAuthenticated: boolean
}

const PROVIDERS = [
  { id: "openai", name: "OpenAI", placeholder: "sk-..." },
  { id: "anthropic", name: "Anthropic", placeholder: "sk-ant-..." },
  { id: "mistral", name: "Mistral", placeholder: "..." },
  { id: "google", name: "Google AI", placeholder: "..." },
  { id: "xai", name: "xAI", placeholder: "xai-..." }
]

export function ApiKeys({ userId, isAuthenticated }: ApiKeysProps) {
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [savedProviders, setSavedProviders] = useState<string[]>([])
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchSavedProviders = async () => {
      try {
        const response = await fetch(`/api/user-keys?userId=${userId}&isAuthenticated=${isAuthenticated}`)
        if (response.ok) {
          const data = await response.json()
          setSavedProviders(data.providers || [])
        }
      } catch (err) {
        console.error("Error fetching saved providers:", err)
      }
    }
    
    fetchSavedProviders()
  }, [userId, isAuthenticated])

  const handleSaveKey = async (provider: string) => {
    const apiKey = keys[provider]
    if (!apiKey?.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive"
      })
      return
    }

    setSaving(prev => ({ ...prev, [provider]: true }))

    try {
      const response = await fetch("/api/user-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          provider,
          apiKey,
          isAuthenticated
        })
      })

      if (response.ok) {
        setSavedProviders(prev => [...prev.filter(p => p !== provider), provider])
        setKeys(prev => ({ ...prev, [provider]: "" }))
        setShowKeys(prev => ({ ...prev, [provider]: false }))
        toast({
          title: "Success",
          description: `${PROVIDERS.find(p => p.id === provider)?.name} API key saved`
        })
      } else {
        throw new Error("Failed to save key")
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive"
      })
    } finally {
      setSaving(prev => ({ ...prev, [provider]: false }))
    }
  }

  const handleDeleteKey = async (provider: string) => {
    setSaving(prev => ({ ...prev, [provider]: true }))

    try {
      const response = await fetch(`/api/user-keys?userId=${userId}&provider=${provider}&isAuthenticated=${isAuthenticated}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setSavedProviders(prev => prev.filter(p => p !== provider))
        setKeys(prev => ({ ...prev, [provider]: "" }))
        toast({
          title: "Success",
          description: `${PROVIDERS.find(p => p.id === provider)?.name} API key deleted`
        })
      } else {
        throw new Error("Failed to delete key")
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      })
    } finally {
      setSaving(prev => ({ ...prev, [provider]: false }))
    }
  }

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal API Keys</CardTitle>
        <CardDescription>
          Add your own API keys to use with AI providers. Your keys take priority over environment variables.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {PROVIDERS.map((provider) => {
          const hasKey = savedProviders.includes(provider.id)
          const currentKey = keys[provider.id] || ""
          const isVisible = showKeys[provider.id]
          const isSaving = saving[provider.id]

          return (
            <div key={provider.id} className="space-y-2">
              <Label htmlFor={provider.id}>{provider.name}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id={provider.id}
                    type={isVisible ? "text" : "password"}
                    placeholder={hasKey ? "••••••••••••••••" : provider.placeholder}
                    value={currentKey}
                    onChange={(e) => setKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleShowKey(provider.id)}
                  >
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {currentKey.trim() && (
                  <Button
                    onClick={() => handleSaveKey(provider.id)}
                    disabled={isSaving}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                )}
                {hasKey && !currentKey.trim() && (
                  <Button
                    onClick={() => handleDeleteKey(provider.id)}
                    disabled={isSaving}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
              {hasKey && !currentKey.trim() && (
                <p className="text-sm text-muted-foreground">
                  ✓ API key saved and active
                </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
