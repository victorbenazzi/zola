"use client"

import { Switch } from "@/components/ui/switch"
import { useModel } from "@/lib/model-store/provider"
import { PROVIDERS } from "@/lib/providers"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function ModelVisibilitySettings() {
  const { models } = useModel()
  const { toggleModelVisibility, isModelHidden } = useUserPreferences()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group models by provider
  const modelsByProvider = filteredModels.reduce(
    (acc, model) => {
      const providerId = model.icon || "unknown"
      if (!acc[providerId]) {
        acc[providerId] = []
      }
      acc[providerId].push(model)
      return acc
    },
    {} as Record<string, typeof models>
  )

  return (
    <div>
      <h3 className="mb-2 text-lg font-medium">Model Visibility</h3>
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
      <div className="space-y-6">
        {Object.entries(modelsByProvider).map(
          ([providerId, providerModels]) => {
            const provider = PROVIDERS.find((p) => p.id === providerId)

            return (
              <div key={providerId} className="space-y-3">
                <div className="flex items-center gap-2">
                  {provider?.icon && <provider.icon className="size-5" />}
                  <h4 className="font-medium">
                    {provider?.name || providerId}
                  </h4>
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
                        checked={!isModelHidden(model.id)}
                        onCheckedChange={() => toggleModelVisibility(model.id)}
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
