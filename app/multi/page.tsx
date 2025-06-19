"use client"

import { MultiModelConversation } from "@/app/components/chat/multi-conversation"
import { MultiModelSelector } from "@/components/common/multi-model-selector/base"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { getOrCreateGuestUserId } from "@/lib/api"
import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
import { useUser } from "@/lib/user-store/provider"
import { ArrowUp, Spinner } from "@phosphor-icons/react"
import { FormEvent, useCallback, useEffect, useState } from "react"
import { useMultiChat } from "./use-multi-chat"

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

export default function MultiChatPage() {
  const [prompt, setPrompt] = useState("")
  const [enabledModels, setEnabledModels] = useState<Set<string>>(
    new Set(DEFAULT_MODELS.slice(0, 2).map((m) => m.id)) // Enable first 2 models by default
  )
  const [messageGroups, setMessageGroups] = useState<any[]>([])
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the custom hook to manage all chat instances
  const modelChats = useMultiChat(DEFAULT_MODELS)

  const updateMessageGroups = useCallback(() => {
    // Group messages by user message content (simple grouping strategy)
    const groups: { [key: string]: any } = {}

    modelChats.forEach((chat) => {
      if (!enabledModels.has(chat.model.id)) return

      for (let i = 0; i < chat.messages.length; i += 2) {
        const userMsg = chat.messages[i]
        const assistantMsg = chat.messages[i + 1]

        if (userMsg?.role === "user") {
          const groupKey = userMsg.content

          if (!groups[groupKey]) {
            groups[groupKey] = {
              userMessage: userMsg,
              responses: [],
              onDelete: () => {},
              onEdit: () => {},
              onReload: () => {},
            }
          }

          if (assistantMsg?.role === "assistant") {
            groups[groupKey].responses.push({
              model: chat.model.name,
              message: assistantMsg,
              isLoading: false,
            })
          } else if (chat.isLoading && userMsg.content === prompt) {
            // Currently loading for this prompt
            groups[groupKey].responses.push({
              model: chat.model.name,
              message: null,
              isLoading: true,
            })
          }
        }
      }
    })

    setMessageGroups(Object.values(groups))
  }, [modelChats, enabledModels, prompt])

  useEffect(() => {
    updateMessageGroups()
  }, [updateMessageGroups])

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

    try {
      const uid = await getOrCreateGuestUserId(user)
      if (!uid) return

      // Send message to all enabled models
      const enabledChats = modelChats.filter((chat) =>
        enabledModels.has(chat.model.id)
      )

      await Promise.all(
        enabledChats.map(async (chat) => {
          const options = {
            body: {
              chatId: `multi-${chat.model.id}-${Date.now()}`,
              userId: uid,
              model: chat.model.id,
              isAuthenticated: !!user?.id,
              systemPrompt: SYSTEM_PROMPT_DEFAULT,
              enableSearch: false,
            },
          }

          chat.append(
            {
              id: crypto.randomUUID(),
              role: "user",
              content: prompt,
            },
            options
          )
        })
      )

      setPrompt("") // Clear input after sending
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        status: "error",
      })
    } finally {
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

  const anyLoading = modelChats.some(
    (chat) => chat.isLoading && enabledModels.has(chat.model.id)
  )

  return (
    <div className="flex h-screen flex-col">
      {/* Main conversation area */}
      <div className="flex-1 overflow-hidden">
        <MultiModelConversation messageGroups={messageGroups} />
      </div>

      {/* Fixed bottom input area */}
      <div className="bg-background border-t p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Model Selection */}
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold">Select Models</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DEFAULT_MODELS.map((model) => (
                <div key={model.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={model.id}
                    checked={enabledModels.has(model.id)}
                    onCheckedChange={() => handleModelToggle(model.id)}
                  />
                  <label
                    htmlFor={model.id}
                    className="cursor-pointer text-xs leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <div>{model.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {model.provider}
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground mt-2 text-xs">
              {enabledModels.size} model{enabledModels.size !== 1 ? "s" : ""}{" "}
              selected
            </div>
          </Card>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask something to all selected models..."
                className="min-h-[80px] resize-none pr-12"
                disabled={isSubmitting || anyLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <MultiModelSelector
                selectedModelIds={Array.from(enabledModels)}
                setSelectedModelIds={setEnabledModels}
              />
              <Button
                type="submit"
                size="sm"
                disabled={
                  !prompt.trim() ||
                  enabledModels.size === 0 ||
                  isSubmitting ||
                  anyLoading
                }
                className="absolute right-2 bottom-2 h-8 w-8 p-0"
              >
                {isSubmitting || anyLoading ? (
                  <Spinner className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </div>
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <div>{prompt.length}/10000 characters</div>
              <div>Press Enter to send, Shift+Enter for new line</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
