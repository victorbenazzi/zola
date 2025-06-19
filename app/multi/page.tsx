import { LayoutApp } from "@/app/components/layout/layout-app"
import { MultiChat } from "@/app/multi/multi-chat"
import { MessagesProvider } from "@/lib/chat-store/messages/provider"

export const dynamic = "force-dynamic"

export default function MultiChatPage() {
  return (
    <MessagesProvider>
      <LayoutApp>
        <MultiChat />
      </LayoutApp>
    </MessagesProvider>
  )
}
