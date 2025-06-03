import { anthropic, createAnthropic } from "@ai-sdk/anthropic"
import { google, createGoogleGenerativeAI } from "@ai-sdk/google"
import { mistral, createMistral } from "@ai-sdk/mistral"
import { openai, createOpenAI } from "@ai-sdk/openai"
import type { LanguageModelV1 } from "@ai-sdk/provider"
import { xai, createXai } from "@ai-sdk/xai"
import { getProviderForModel } from "./provider-map"
import { getApiKeyForProvider } from "@/lib/user-keys"
import type {
  AnthropicModel,
  GeminiModel,
  MistralModel,
  OllamaModel,
  OpenAIModel,
  SupportedModel,
  XaiModel,
} from "./types"

type OpenAIChatSettings = Parameters<typeof openai>[1]
type MistralProviderSettings = Parameters<typeof mistral>[1]
type GoogleGenerativeAIProviderSettings = Parameters<typeof google>[1]
type AnthropicProviderSettings = Parameters<typeof anthropic>[1]
type XaiProviderSettings = Parameters<typeof xai>[1]
type OllamaProviderSettings = OpenAIChatSettings // Ollama uses OpenAI-compatible API

type ModelSettings<T extends SupportedModel> = T extends OpenAIModel
  ? OpenAIChatSettings
  : T extends MistralModel
    ? MistralProviderSettings
    : T extends GeminiModel
      ? GoogleGenerativeAIProviderSettings
      : T extends AnthropicModel
        ? AnthropicProviderSettings
        : T extends XaiModel
          ? XaiProviderSettings
          : T extends OllamaModel
            ? OllamaProviderSettings
            : never

export type OpenProvidersOptions<T extends SupportedModel> = ModelSettings<T>

// Get Ollama base URL from environment or use default
const getOllamaBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use localhost
    return "http://localhost:11434/v1"
  }
  
  // Server-side: check environment variables
  return process.env.OLLAMA_BASE_URL?.replace(/\/+$/, '') + "/v1" || "http://localhost:11434/v1"
}

// Create Ollama provider instance with configurable baseURL
const createOllamaProvider = () => {
  return createOpenAI({
    baseURL: getOllamaBaseURL(),
    apiKey: "ollama", // Ollama doesn't require a real API key
    name: "ollama",
  })
}

export async function openproviders<T extends SupportedModel>(
  modelId: T,
  settings?: OpenProvidersOptions<T>,
  userId?: string
): Promise<LanguageModelV1> {
  const provider = getProviderForModel(modelId)

  const apiKey = await getApiKeyForProvider(userId, provider)

  if (provider === "openai") {
    if (apiKey && userId) {
      const customProvider = createOpenAI({ apiKey })
      return customProvider(modelId as OpenAIModel, settings as OpenAIChatSettings)
    }
    return openai(modelId as OpenAIModel, settings as OpenAIChatSettings)
  }

  if (provider === "mistral") {
    if (apiKey && userId) {
      const customProvider = createMistral({ apiKey })
      return customProvider(modelId as MistralModel, settings as MistralProviderSettings)
    }
    return mistral(modelId as MistralModel, settings as MistralProviderSettings)
  }

  if (provider === "google") {
    if (apiKey && userId) {
      const customProvider = createGoogleGenerativeAI({ apiKey })
      return customProvider(modelId as GeminiModel, settings as GoogleGenerativeAIProviderSettings)
    }
    return google(
      modelId as GeminiModel,
      settings as GoogleGenerativeAIProviderSettings
    )
  }

  if (provider === "anthropic") {
    if (apiKey && userId) {
      const customProvider = createAnthropic({ apiKey })
      return customProvider(modelId as AnthropicModel, settings as AnthropicProviderSettings)
    }
    return anthropic(
      modelId as AnthropicModel,
      settings as AnthropicProviderSettings
    )
  }

  if (provider === "xai") {
    if (apiKey && userId) {
      const customProvider = createXai({ apiKey })
      return customProvider(modelId as XaiModel, settings as XaiProviderSettings)
    }
    return xai(modelId as XaiModel, settings as XaiProviderSettings)
  }

  if (provider === "ollama") {
    const ollamaProvider = createOllamaProvider()
    return ollamaProvider(modelId as OllamaModel, settings as OllamaProviderSettings)
  }

  throw new Error(`Unsupported model: ${modelId}`)
}

export function openprovidersSync<T extends SupportedModel>(
  modelId: T,
  settings?: OpenProvidersOptions<T>
): LanguageModelV1 {
  const provider = getProviderForModel(modelId)

  if (provider === "openai") {
    return openai(modelId as OpenAIModel, settings as OpenAIChatSettings)
  }

  if (provider === "mistral") {
    return mistral(modelId as MistralModel, settings as MistralProviderSettings)
  }

  if (provider === "google") {
    return google(
      modelId as GeminiModel,
      settings as GoogleGenerativeAIProviderSettings
    )
  }

  if (provider === "anthropic") {
    return anthropic(
      modelId as AnthropicModel,
      settings as AnthropicProviderSettings
    )
  }

  if (provider === "xai") {
    return xai(modelId as XaiModel, settings as XaiProviderSettings)
  }

  if (provider === "ollama") {
    const ollamaProvider = createOllamaProvider()
    return ollamaProvider(modelId as OllamaModel, settings as OllamaProviderSettings)
  }

  throw new Error(`Unsupported model: ${modelId}`)
}
