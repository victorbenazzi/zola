"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { getOrCreateGuestUserId } from "@/lib/api"
import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
import { useUser } from "@/lib/user-store/provider"
import { useChat } from "@ai-sdk/react"
import { ArrowUp, Spinner, Stop } from "@phosphor-icons/react"
import { FormEvent, useEffect, useMemo, useState } from "react"

// Popular models for multi-chat
const DEFAULT_MODELS = [
  { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", provider: "OpenAI" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek" },
  { id: "mistral-large-latest", name: "Mistral Large", provider: "Mistral" },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
  },
]

interface ChatPerModelProps {
  model: { id: string; name: string; provider: string }
  prompt: string
  submitEvent: FormEvent | null
  onClearSubmitEvent: () => void
  isEnabled: boolean
}

function ChatPerModel({
  model,
  prompt,
  submitEvent,
  onClearSubmitEvent,
  isEnabled,
}: ChatPerModelProps) {
  const { user } = useUser()
  const isAuthenticated = useMemo(() => !!user?.id, [user?.id])

  const { messages, append, isLoading, stop } = useChat({
    api: "/api/chat",
    onError: (error) => {
      console.error(`Error with ${model.name}:`, error)
      toast({
        title: `Error with ${model.name}`,
        description: error.message,
        status: "error",
      })
    },
  })

  useEffect(() => {
    if (submitEvent && isEnabled && prompt.trim()) {
      const sendMessage = async () => {
        try {
          const uid = await getOrCreateGuestUserId(user)
          if (!uid) return

          const options = {
            body: {
              chatId: `multi-${model.id}-${Date.now()}`,
              userId: uid,
              model: model.id,
              isAuthenticated,
              systemPrompt: SYSTEM_PROMPT_DEFAULT,
              enableSearch: false,
            },
          }

          append(
            {
              role: "user",
              content: prompt,
            },
            options
          )
        } catch (error) {
          console.error(`Failed to send message to ${model.name}:`, error)
          toast({
            title: `Error with ${model.name}`,
            description: "Failed to send message",
            status: "error",
          })
        }
      }

      sendMessage()
      onClearSubmitEvent()
    }
  }, [
    submitEvent,
    isEnabled,
    prompt,
    append,
    onClearSubmitEvent,
    model.id,
    model.name,
    user,
    isAuthenticated,
  ])

  if (!isEnabled) {
    return (
      <Card className="p-4 opacity-50">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{model.name}</h3>
            <Badge variant="outline" className="text-xs">
              {model.provider}
            </Badge>
          </div>
          <Badge variant="secondary" className="text-xs">
            Disabled
          </Badge>
        </div>
        <div className="text-muted-foreground text-sm">
          Enable this model to see its response
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{model.name}</h3>
          <Badge variant="outline" className="text-xs">
            {model.provider}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <Button
              size="sm"
              variant="outline"
              onClick={stop}
              className="h-7 px-2"
            >
              <Stop className="mr-1 size-3" />
              Stop
            </Button>
          )}
          <Badge
            variant={isLoading ? "default" : "secondary"}
            className="text-xs"
          >
            {isLoading ? "Thinking..." : "Ready"}
          </Badge>
        </div>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto">
        {messages.length === 0 && !isLoading && (
          <div className="text-muted-foreground text-sm italic">
            Send a message to see {model.name}'s response
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className="space-y-1">
            <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {message.role}
            </div>
            <div className="text-sm leading-relaxed">{message.content}</div>
          </div>
        ))}

        {isLoading && messages.length > 0 && (
          <div className="space-y-2">
            <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              assistant
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function MultiChatPage() {
  const [prompt, setPrompt] = useState("")
  const [submitEvent, setSubmitEvent] = useState<FormEvent | null>(null)
  const [enabledModels, setEnabledModels] = useState<Set<string>>(
    new Set(DEFAULT_MODELS.slice(0, 2).map((m) => m.id)) // Enable first 2 models by default
  )
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    if (enabledModels.size === 0) {
      toast({
        title: "No models selected",
        description: "Please select at least one model to chat with.",
        status: "error",
      })
      return
    }

    setIsSubmitting(true)

    // Ensure we have a user ID for the request
    try {
      await getOrCreateGuestUserId(user)
      setSubmitEvent(e)

      // Clear submit event after a short delay to allow components to process
      setTimeout(() => {
        setSubmitEvent(null)
        setIsSubmitting(false)
      }, 100)
    } catch (error) {
      console.error("Failed to get user ID:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        status: "error",
      })
      setIsSubmitting(false)
    }
  }

  const handleModelToggle = (modelId: string) => {
    setEnabledModels((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(modelId)) {
        newSet.delete(modelId)
      } else {
        newSet.add(modelId)
      }
      return newSet
    })
  }

  const clearSubmitEvent = () => {
    setSubmitEvent(null)
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Multi-Model Chat</h1>
        <p className="text-muted-foreground">
          Chat with multiple AI models at once and compare their responses
        </p>
      </div>

      {/* Model Selection */}
      <Card className="p-4">
        <h2 className="mb-3 font-semibold">Select Models</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DEFAULT_MODELS.map((model) => (
            <div key={model.id} className="flex items-center space-x-2">
              <Checkbox
                id={model.id}
                checked={enabledModels.has(model.id)}
                onCheckedChange={() => handleModelToggle(model.id)}
              />
              <label
                htmlFor={model.id}
                className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <div>{model.name}</div>
                <div className="text-muted-foreground text-xs">
                  {model.provider}
                </div>
              </label>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground mt-3 text-xs">
          {enabledModels.size} model{enabledModels.size !== 1 ? "s" : ""}{" "}
          selected
        </div>
      </Card>

      {/* Input Form */}
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask something to all selected models..."
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-xs">
              {prompt.length}/10000 characters
            </div>
            <Button
              type="submit"
              disabled={
                !prompt.trim() || enabledModels.size === 0 || isSubmitting
              }
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <ArrowUp className="size-4" />
                  Send to {enabledModels.size} model
                  {enabledModels.size !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Model Responses */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {DEFAULT_MODELS.map((model) => (
          <ChatPerModel
            key={model.id}
            model={model}
            prompt={prompt}
            submitEvent={submitEvent}
            onClearSubmitEvent={clearSubmitEvent}
            isEnabled={enabledModels.has(model.id)}
          />
        ))}
      </div>
    </div>
  )
}
