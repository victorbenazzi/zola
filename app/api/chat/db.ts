import { Attachment } from "@ai-sdk/ui-utils"
import { SupabaseClient } from "@supabase/supabase-js"

// not exported by ai-sdk, but used in the route
type ResponseMessage = {
  role: "user" | "assistant" | "system" | "data" | "tool" | "tool-call"
  content: string | null | any[] // Can be string, null, or array of parts
  experimental_attachments?: Attachment[]
}

export async function saveMessageToDb(
  supabase: SupabaseClient,
  chatId: string,
  msg: ResponseMessage
) {
  let content = ""
  let parts = msg.content ?? null

  if (Array.isArray(parts)) {
    // Only extract plain text if there is a "text" part
    const textParts = parts.filter((p) => p.type === "text")
    if (textParts.length > 0) {
      content = textParts.map((p) => p.text).join(" ")
    }
  } else if (typeof parts === "string") {
    content = parts
  }

  console.log("msg", msg)

  const finalRole =
    msg.role === "tool" || msg.role === "tool-call" ? "assistant" : msg.role

  console.log("finalRole", finalRole)

  const { error, data } = await supabase.from("messages").insert({
    chat_id: chatId,
    role: finalRole,
    content: content || null,
    parts: parts || null,
  })

  if (error) {
    console.error(`Error saving ${msg.role} message:`, error)
    throw new Error(`Failed to save message: ${error.message}`)
  } else {
    console.log(`${msg.role} message saved successfully.`)
  }
}
