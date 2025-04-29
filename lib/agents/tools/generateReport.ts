// lib/agents/tools/generate-report.ts
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

// Local helper inside
function generateCitationData(
  findings: { citations: { title: string; url: string }[] }[]
) {
  const citations: string[] = []

  findings.forEach((finding, index) => {
    finding.citations.forEach((citation) => {
      const citationId = `src-${citations.length}`
      citations.push(`[${citationId}]: ${citation.url} "${citation.title}"`)
    })
  })

  const citationReferenceBlock = citations.join("\n")
  return { citationReferenceBlock }
}

export async function generateReport(input: {
  findings: {
    query: string
    summary: string
    citations: { title: string; url: string; snippet: string }[]
  }[]
  title: string
}): Promise<{ result: string }> {
  try {
    const content = input.findings
      .map((f) => f.summary)
      .join("\n\n")
      .slice(0, 8000)
    const { citationReferenceBlock } = generateCitationData(input.findings)

    const { object } = await generateObject({
      model: openai("gpt-4.1-mini"),
      prompt: `Write a markdown report titled "${input.title}" using the research notes and citations below.

Inject source links directly into the relevant sentences using this format: [source](link.com)

For example:
- AI training tools are increasingly popular [source](link.com)
- Dog health tracking is now possible in real-time [source](link.com)

<citations>
${citationReferenceBlock}
</citations>

<research>
${content}
</research>

Only return markdown content. Do not include extra text or commentary.`,
      system: `
You are a senior technical writer with deep domain knowledge.

Write a report in markdown. Follow this format:
- Use # for title
- Use ## and ### for sections
- Only capitalize the first word of each sentence
- Clear and direct
- Use bullet points and code blocks where helpful
- Do not add intro or outro — only the markdown report.
- Link sources inside the relevant sentences.
- Do NOT list all sources at the end — they should appear where the information is used
      `,
      schema: z.object({ markdown: z.string() }),
    })

    return { result: object.markdown.trim() }
  } catch (error) {
    console.error("Error in generateReport:", error)
    throw new Error("generateReport failed")
  }
}
