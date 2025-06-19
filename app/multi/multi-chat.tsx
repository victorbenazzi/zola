"use client"

import { MultiModelConversation } from "@/app/components/chat/multi-conversation"
import { toast } from "@/components/ui/toast"
import { getOrCreateGuestUserId } from "@/lib/api"
import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
import { useModel } from "@/lib/model-store/provider"
import { useUser } from "@/lib/user-store/provider"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { mockMessageGroups } from "./mock-data"
import { MultiChatInput } from "./multi-chat-input"
import { useMultiChat } from "./use-multi-chat"

export function MultiChat() {
  const [prompt, setPrompt] = useState("")
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([])
  const [messageGroups, setMessageGroups] = useState<any[]>([])
  const [files, setFiles] = useState<File[]>([])
  const { user } = useUser()
  const { models, isLoading: isLoadingModels } = useModel()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // mock data for UI development
  const [mockMessages, setMockMessages] = useState(mockMessageGroups)

  // Filter models to get real available models and transform them for useMultiChat
  const availableModels = useMemo(() => {
    return models.map((model) => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
    }))
  }, [models])

  // Use the custom hook to manage all chat instances
  const modelChats = useMultiChat(availableModels)

  // Memoize system prompt
  const systemPrompt = useMemo(
    () => user?.system_prompt || SYSTEM_PROMPT_DEFAULT,
    [user?.system_prompt]
  )

  const isAuthenticated = useMemo(() => !!user?.id, [user?.id])

  const updateMessageGroups = useCallback(() => {
    // Group messages by user message content (simple grouping strategy)
    const groups: { [key: string]: any } = {}

    modelChats.forEach((chat) => {
      if (!selectedModelIds.includes(chat.model.id)) return

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
              provider: chat.model.provider,
            })
          } else if (chat.isLoading && userMsg.content === prompt) {
            // Currently loading for this prompt
            groups[groupKey].responses.push({
              model: chat.model.name,
              message: null,
              isLoading: true,
              provider: chat.model.provider,
            })
          }
        }
      }
    })

    setMessageGroups(Object.values(groups))
  }, [modelChats, selectedModelIds, prompt])

  useEffect(() => {
    updateMessageGroups()
  }, [updateMessageGroups])

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    if (selectedModelIds.length === 0) {
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

      // Send message to all selected models
      const enabledChats = modelChats.filter((chat) =>
        selectedModelIds.includes(chat.model.id)
      )

      await Promise.all(
        enabledChats.map(async (chat) => {
          const options = {
            body: {
              chatId: `multi-${chat.model.id}-${Date.now()}`,
              userId: uid,
              model: chat.model.id,
              isAuthenticated: !!user?.id,
              systemPrompt: systemPrompt,
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
      setFiles([]) // Clear files after sending
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

  const handleFileUpload = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleFileRemove = useCallback((fileToRemove: File) => {
    setFiles((prev) => prev.filter((file) => file !== fileToRemove))
  }, [])

  const handleStop = useCallback(() => {
    // Stop all currently loading chats
    modelChats.forEach((chat) => {
      if (chat.isLoading) {
        chat.stop()
      }
    })
  }, [modelChats])

  const anyLoading = useMemo(
    () =>
      modelChats.some(
        (chat) => chat.isLoading && selectedModelIds.includes(chat.model.id)
      ),
    [modelChats, selectedModelIds]
  )

  // Memoize the conversation props
  const conversationProps = useMemo(
    () => ({
      messageGroups: mockMessages as any, // Use mock data for testing
    }),
    [mockMessages]
  )

  // Memoize the input props
  const inputProps = useMemo(
    () => ({
      value: prompt,
      onValueChange: setPrompt,
      onSend: handleSubmit,
      isSubmitting,
      files,
      onFileUpload: handleFileUpload,
      onFileRemove: handleFileRemove,
      selectedModelIds,
      onSelectedModelIdsChange: setSelectedModelIds,
      isUserAuthenticated: isAuthenticated,
      stop: handleStop,
      status: anyLoading ? ("streaming" as const) : ("ready" as const),
      anyLoading,
    }),
    [
      prompt,
      handleSubmit,
      isSubmitting,
      files,
      handleFileUpload,
      handleFileRemove,
      selectedModelIds,
      isAuthenticated,
      handleStop,
      anyLoading,
    ]
  )

  const showOnboarding = mockMessages.length === 0

  // Show loading state while models are being fetched
  if (isLoadingModels) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading models...</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "@container/main relative flex h-full flex-col items-center",
        showOnboarding ? "justify-end md:justify-center" : "justify-end"
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {showOnboarding ? (
          <motion.div
            key="onboarding"
            className="absolute bottom-[60%] mx-auto max-w-[50rem] md:relative md:bottom-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout="position"
            layoutId="onboarding"
            transition={{
              layout: {
                duration: 0,
              },
            }}
          >
            <h1 className="mb-6 text-3xl font-medium tracking-tight">
              Compare responses from multiple models
            </h1>
          </motion.div>
        ) : (
          <motion.div
            key="conversation"
            className="w-full flex-1 overflow-hidden"
            layout="position"
            layoutId="conversation"
            transition={{
              layout: {
                duration: mockMessages.length === 1 ? 0.3 : 0,
              },
            }}
          >
            <MultiModelConversation {...conversationProps} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* @todo: need to add title here below */}
      <motion.div
        className={cn(
          "z-50 mx-auto w-full max-w-3xl",
          showOnboarding ? "relative" : "absolute right-0 bottom-0 left-0"
        )}
        layout="position"
        layoutId="multi-chat-input-container"
        transition={{
          layout: {
            duration: mockMessages.length === 1 ? 0.3 : 0,
          },
        }}
      >
        <MultiChatInput {...inputProps} />
      </motion.div>
    </div>
  )
}
