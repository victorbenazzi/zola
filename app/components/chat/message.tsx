import { Message as MessageContainer } from "@/components/prompt-kit/message"
import { cn } from "@/lib/utils"
import { Message as MessageType } from "@ai-sdk/react"
import React, { useState } from "react"
import { MessageAssistant } from "./message-assistant"
import { MessageUser } from "./message-user"
import { SourcesList } from "./sources-list"

type MessageProps = {
  variant: MessageType["role"] | "tool"
  children: string
  id: string
  attachments?: MessageType["experimental_attachments"]
  isLast?: boolean
  onDelete: (id: string) => void
  onEdit: (id: string, newText: string) => void
  onReload: () => void
  hasScrollAnchor?: boolean
  parts?: MessageType["parts"]
}

export function Message({
  variant,
  children,
  id,
  attachments,
  isLast,
  onDelete,
  onEdit,
  onReload,
  hasScrollAnchor,
  parts,
}: MessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 500)
  }

  console.log("parts", parts)

  if (variant === "tool") {
    const toolResult = parts?.find(
      // @todo: don't know why ai sdk doesn't have tool-result type
      (part) => (part as any).type === "tool-result"
    )
    console.log("toolResult", toolResult)

    const sources = (toolResult as any).result

    console.log("sources", sources)

    return (
      <MessageContainer
        className={cn(
          "group flex w-full max-w-3xl px-6 pb-2",
          hasScrollAnchor && "min-h-scroll-anchor"
        )}
      >
        <SourcesList sources={sources} className="w-full" />
      </MessageContainer>
    )
  }

  if (variant === "user") {
    return (
      <MessageUser
        children={children}
        copied={copied}
        copyToClipboard={copyToClipboard}
        onReload={onReload}
        onEdit={onEdit}
        onDelete={onDelete}
        id={id}
        hasScrollAnchor={hasScrollAnchor}
        attachments={attachments}
      />
    )
  }

  if (variant === "assistant") {
    return (
      <MessageAssistant
        children={children}
        copied={copied}
        copyToClipboard={copyToClipboard}
        onReload={onReload}
        isLast={isLast}
        hasScrollAnchor={hasScrollAnchor}
        parts={parts}
      />
    )
  }

  return null
}
