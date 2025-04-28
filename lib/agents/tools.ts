// lib/agents/tools.ts
import { tool } from "ai"
import { z } from "zod"

export const tools = {
  search: tool({
    description: "Search the web.",
    parameters: z.object({
      query: z.string(),
    }),
    async execute({ query }) {
      //   return await searchWeb(query)
    },
  }),
  calculator: tool({
    description: "Solve math problems.",
    parameters: z.object({
      expression: z.string(),
    }),
    async execute({ expression }) {
      //   return eval(expression)
    },
  }),
  summarize: tool({
    description: "Summarize a text.",
    parameters: z.object({
      text: z.string(),
    }),
    async execute({ text }) {
      //   return summarizeText(text)
    },
  }),
}
