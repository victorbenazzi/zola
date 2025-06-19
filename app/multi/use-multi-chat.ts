import { toast } from "@/components/ui/toast"
import { useChat } from "@ai-sdk/react"
import { useEffect, useMemo, useState } from "react"

interface ModelConfig {
  id: string
  name: string
  provider: string
}

interface ModelChat {
  model: ModelConfig
  messages: any[]
  isLoading: boolean
  append: (message: any, options?: any) => void
  stop: () => void
}

// Maximum number of models we support
const MAX_MODELS = 10

export function useMultiChat(models: ModelConfig[]): ModelChat[] {
  // Create a fixed number of useChat hooks to avoid conditional hook calls
  const chatHooks = Array.from({ length: MAX_MODELS }, (_, index) =>
    useChat({
      api: "/api/chat",
      onError: (error) => {
        const model = models[index]
        if (model) {
          console.error(`Error with ${model.name}:`, error)
          toast({
            title: `Error with ${model.name}`,
            description: error.message,
            status: "error",
          })
        }
      },
    })
  )

  // Map the active models to their corresponding chat hooks
  const activeChatInstances = useMemo(() => {
    return models.slice(0, MAX_MODELS).map((model, index) => ({
      model,
      messages: chatHooks[index].messages,
      isLoading: chatHooks[index].isLoading,
      append: chatHooks[index].append,
      stop: chatHooks[index].stop,
    }))
  }, [models, ...chatHooks.flatMap((chat) => [chat.messages, chat.isLoading])])

  return activeChatInstances
}
