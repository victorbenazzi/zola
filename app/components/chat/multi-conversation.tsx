"use client"

import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import { Loader } from "@/components/prompt-kit/loader"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { Message as MessageType } from "@ai-sdk/react"
import { Message } from "./message"

type GroupedMessage = {
  user: MessageType
  responses: {
    model: string
    message: MessageType
  }[]
  status?: "streaming" | "ready" | "submitted" | "error"
  onDelete: (model: string, id: string) => void
  onEdit: (model: string, id: string, newText: string) => void
  onReload: (model: string) => void
}

export function MultiModelConversation() {
  const mockGroups: GroupedMessage[] = [
    {
      user: {
        id: crypto.randomUUID(),
        role: "user",
        content: "What is AI?",
        parts: [{ type: "text", text: "What is AI?" }],
      },
      responses: [
        {
          model: "GPT-4",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "AI stands for Artificial Intelligence. It refers to machines that can perform tasks that typically require human intelligence.",
            parts: [
              {
                type: "text",
                text: "AI stands for Artificial Intelligence. It refers to machines that can perform tasks that typically require human intelligence.",
              },
            ],
          },
        },
        {
          model: "GPT-4",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "AI stands for Artificial Intelligence. It refers to machines that can perform tasks that typically require human intelligence.",
            parts: [
              {
                type: "text",
                text: "AI stands for Artificial Intelligence. It refers to machines that can perform tasks that typically require human intelligence.",
              },
            ],
          },
        },
        {
          model: "Claude",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Artificial Intelligence is the science of building systems that can reason, learn, and solve problems like a human.",
            parts: [
              {
                type: "text",
                text: "Artificial Intelligence is the science of building systems that can reason, learn, and solve problems like a human.",
              },
            ],
          },
        },
      ],
      status: "ready",
      onDelete: () => {},
      onEdit: () => {},
      onReload: () => {},
    },
    {
      user: {
        id: crypto.randomUUID(),
        role: "user",
        content: "Explain photosynthesis.",
        parts: [{ type: "text", text: "Explain photosynthesis." }],
      },
      responses: [
        {
          model: "GPT-4",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Photosynthesis is a process used by plants to convert light energy into chemical energy.",
            parts: [
              {
                type: "text",
                text: "Photosynthesis is a process used by plants to convert light energy into chemical energy.",
              },
            ],
          },
        },
        {
          model: "Claude",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "It is the process by which green plants use sunlight to make food from carbon dioxide and water.",
            parts: [
              {
                type: "text",
                text: "It is the process by which green plants use sunlight to make food from carbon dioxide and water.",
              },
            ],
          },
        },
      ],
      status: "ready",
      onDelete: () => {},
      onEdit: () => {},
      onReload: () => {},
    },
  ]

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-y-auto">
      <ChatContainerRoot className="relative w-full">
        <ChatContainerContent
          className="flex w-full flex-col items-center pt-20 pb-4"
          style={{
            scrollbarGutter: "stable both-edges",
            scrollbarWidth: "none",
          }}
        >
          {mockGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-10 w-full max-w-3xl space-y-3">
              <Message
                id={group.user.id}
                variant="user"
                parts={group.user.parts}
                attachments={group.user.experimental_attachments}
                onDelete={() => {}}
                onEdit={() => {}}
                onReload={() => {}}
                status="ready"
              >
                {group.user.content}
              </Message>

              <div className="flex space-x-4 overflow-x-auto">
                {group.responses.map((res) => (
                  <div
                    key={res.model}
                    className="bg-muted max-w-[420px] min-w-[360px] rounded border p-3"
                  >
                    <div className="text-muted-foreground mb-2 text-xs font-medium">
                      {res.model}
                    </div>

                    <Message
                      id={res.message.id}
                      variant="assistant"
                      parts={res.message.parts}
                      attachments={res.message.experimental_attachments}
                      onDelete={() => group.onDelete(res.model, res.message.id)}
                      onEdit={(id, newText) =>
                        group.onEdit(res.model, id, newText)
                      }
                      onReload={() => group.onReload(res.model)}
                      status={group.status || "ready"}
                      isLast={false}
                      hasScrollAnchor={false}
                    >
                      {res.message.content}
                    </Message>
                  </div>
                ))}
              </div>

              {group.status === "submitted" && (
                <div className="group min-h-scroll-anchor flex w-full flex-col items-start gap-2 px-6 pb-2">
                  <Loader />
                </div>
              )}
            </div>
          ))}
          <div className="absolute bottom-0 flex w-full max-w-3xl flex-1 items-end justify-end gap-4 px-6 pb-2">
            <ScrollButton className="absolute top-[-50px] right-[30px]" />
          </div>
        </ChatContainerContent>
      </ChatContainerRoot>
    </div>
  )
}
