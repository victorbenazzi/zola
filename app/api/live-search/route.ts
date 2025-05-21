// app/api/live-search/route.ts

import { validateUserIdentity } from "@/lib/server/api"

export async function POST(request: Request) {
  try {
    const { userId, isAuthenticated, messages, searchOptions } =
      await request.json()

    if (!userId || !messages) {
      return new Response(
        JSON.stringify({ error: "Missing userId or messages" }),
        {
          status: 400,
        }
      )
    }

    await validateUserIdentity(userId, isAuthenticated)

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-latest",
        messages,
        search_parameters: {
          mode: "on",
          return_citations: true,
          ...(searchOptions || {}),
        },
      }),
    })

    const json = await response.json()
    return new Response(JSON.stringify(json), { status: response.status })
  } catch (error) {
    console.error("Live Search error:", error)
    return new Response(JSON.stringify({ error: "Live Search failed" }), {
      status: 500,
    })
  }
}
