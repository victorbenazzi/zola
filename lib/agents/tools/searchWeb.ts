// lib/agents/tools/search.ts
import Exa from "exa-js"

const exa = new Exa(process.env.EXA_API_KEY!)

export async function searchWeb(query: string) {
  try {
    const result = await exa.searchAndContents(query, {
      numResults: 3,
      livecrawl: "always",
    })

    const links = result.results.map((r) => ({
      title: r.title || "Untitled",
      url: r.url,
      snippet: r.text?.slice(0, 200) || "",
    }))

    console.log("links", links)

    return links
  } catch (error) {
    console.error("Error in searchWeb:", error)
    return "Failed to search the web."
  }
}
