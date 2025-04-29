// lib/agents/tools/summarize-sources.ts
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

export async function summarizeSources(input: {
  searchResults: {
    query: string
    sources: { title: string; url: string; snippet: string }[]
  }[]
}): Promise<{
  result: {
    query: string
    summary: string
    citations: { title: string; url: string; snippet: string }[]
  }[]
}> {
  try {
    const summaries = await Promise.all(
      input.searchResults.map(async ({ query, sources }) => {
        const bulletedSources = sources
          .map((s, i) => `${i + 1}. "${s.title}": ${s.snippet}`)
          .join("\n")

        const { object } = await generateObject({
          model: openai("gpt-4.1-mini"),
          prompt: `Summarize the key insights about "${query}" as **exactly 2-6 bullets**.
• Each bullet **must start with "-" "** (hyphen + space) – no other bullet symbols.
• One concise sentence per bullet; no intro, no conclusion, no extra paragraphs.
• Base the bullets only on the information below, do not include links.
• Focus on specific ideas, patterns, or tactics, not general claims.
• Do not sound AI-generated, sound like a human writing a report.

${bulletedSources}`,
          system: `You are a senior research writer.

Your job is to extract only the most useful and practical insights from a given source.

Write in a clear, direct tone. Avoid filler. No introductions or conclusions.

Always return 3–6 markdown bullet points starting with "- ".

Be specific. If nothing useful is in the snippet, say: "- No relevant insight found."
          `,
          schema: z.object({ summary: z.string() }),
        })

        return {
          query,
          summary: object.summary.trim(),
          citations: sources,
        }
      })
    )

    return { result: summaries }
  } catch (error) {
    console.error("Error in summarizeSources:", error)
    throw new Error("summarizeSources failed")
  }
}
