"use client"

import { Switch } from "@/components/ui/switch"
import { useModel } from "@/lib/model-store/provider"
import { PROVIDERS } from "@/lib/providers"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useState } from "react"

export function ModelVisibilitySettings() {
  const { models } = useModel()
  const { toggleModelVisibility, isModelHidden } = useUserPreferences()
  const [searchQuery, setSearchQuery] = useState("")
  const [optimisticStates, setOptimisticStates] = useState<
    Record<string, boolean>
  >({})

  console.log("models", models)

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group models by provider (not just icon)
  const modelsByProvider = filteredModels.reduce(
    (acc, model) => {
      const provider = PROVIDERS.find((p) => p.id === model.icon)
      const providerKey = provider
        ? `${provider.id}-${provider.name}`
        : `unknown-${model.icon || "Unknown"}`

      if (!acc[providerKey]) {
        acc[providerKey] = {
          provider: provider || {
            id: model.icon || "unknown",
            name: model.icon || "Unknown",
            icon: null,
          },
          models: [],
        }
      }
      acc[providerKey].models.push(model)
      return acc
    },
    {} as Record<
      string,
      {
        provider: { id: string; name: string; icon: any }
        models: typeof models
      }
    >
  )

  console.log("modelsByProvider", modelsByProvider)

  const handleToggle = (modelId: string) => {
    // Optimistic update
    const currentState =
      optimisticStates[modelId] !== undefined
        ? optimisticStates[modelId]
        : !isModelHidden(modelId)

    setOptimisticStates((prev) => ({
      ...prev,
      [modelId]: !currentState,
    }))

    // Actual update
    toggleModelVisibility(modelId)
  }

  const getModelVisibility = (modelId: string) => {
    return optimisticStates[modelId] !== undefined
      ? optimisticStates[modelId]
      : !isModelHidden(modelId)
  }

  return (
    <div>
      <h3 className="mb-2 text-lg font-medium">Model</h3>
      <p className="text-muted-foreground mb-4 text-sm">
        Choose which models appear in your model selector.
      </p>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Models grouped by provider */}
      <div className="space-y-6 pb-6">
        {Object.entries(modelsByProvider).map(
          ([providerKey, { provider, models: providerModels }]) => {
            return (
              <div key={providerKey} className="space-y-3">
                <div className="flex items-center gap-2">
                  {provider.icon && <provider.icon className="size-5" />}
                  <h4 className="font-medium">{provider.name}</h4>
                  <span className="text-muted-foreground text-sm">
                    ({providerModels.length} models)
                  </span>
                </div>

                <div className="space-y-2 pl-7">
                  {providerModels.map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm">{model.name}</span>
                        {model.description && (
                          <span className="text-muted-foreground text-xs">
                            {model.description}
                          </span>
                        )}
                      </div>
                      <Switch
                        checked={getModelVisibility(model.id)}
                        onCheckedChange={() => handleToggle(model.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        )}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-muted-foreground py-8 text-center text-sm">
          No models found matching your search.
        </div>
      )}
    </div>
  )
}
