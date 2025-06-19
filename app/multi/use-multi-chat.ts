import { toast } from "@/components/ui/toast"
import { useChat } from "@ai-sdk/react"
import { useMemo } from "react"

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

export function useMultiChat(models: ModelConfig[]): ModelChat[] {
  // Create chat instances for each model
  const chatInstances = models.map((model) => {
    const chat = useChat({
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

    return {
      model,
      chat,
    }
  })

  // Memoize the result to prevent unnecessary re-renders
  return useMemo(() => {
    return chatInstances.map(({ model, chat }) => ({
      model,
      messages: chat.messages,
      isLoading: chat.isLoading,
      append: chat.append,
      stop: chat.stop,
    }))
  }, [...chatInstances.flatMap(({ chat }) => [chat.messages, chat.isLoading])])
}
