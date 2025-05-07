"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MODELS_FREE, MODELS_OPTIONS, MODELS_PRO } from "@/lib/config"
import { cn } from "@/lib/utils"
import { CaretDown, Check, Image } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

type ModelSelectorProps = {
  selectedModelId: string
  setSelectedModelId: (modelId: string) => void
  className?: string
}

// @todo: add drawer on mobile
export function ModelSelector({
  selectedModelId,
  setSelectedModelId,
  className,
}: ModelSelectorProps) {
  const currentModel = MODELS_OPTIONS.find(
    (model) => model.id === selectedModelId
  )

  const [hoveredModel, setHoveredModel] = useState<string | null>(null)
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null)
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

  // Setup portal element on mount
  useEffect(() => {
    setPortalElement(document.body)
  }, [])

  // Find dropdown content and track its position
  useEffect(() => {
    const updateDropdownRect = () => {
      const dropdownEl = document.querySelector(
        "[data-radix-popper-content-wrapper]"
      )
      if (dropdownEl) {
        setDropdownRect(dropdownEl.getBoundingClientRect())
      }
    }

    if (hoveredModel) {
      // Give it a moment to render
      setTimeout(updateDropdownRect, 10)
    }
  }, [hoveredModel])

  const renderModelItem = (model: any) => {
    return (
      <DropdownMenuItem
        key={model.id}
        className={cn(
          "flex w-full items-center justify-between px-3 py-2",
          selectedModelId === model.id && "bg-accent"
        )}
        onSelect={() => {
          setSelectedModelId(model.id)
        }}
        onFocus={() => {
          setHoveredModel(model.id)
        }}
      >
        <div className="flex items-center gap-3">
          {model?.icon && <model.icon className="size-5" />}
          <div className="flex flex-col gap-0">
            <span className="text-sm">{model.name}</span>
          </div>
        </div>
      </DropdownMenuItem>
    )
  }

  // Get the hovered model data
  const hoveredModelData = MODELS_OPTIONS.find(
    (model) => model.id === hoveredModel
  )

  const models = [...MODELS_FREE, ...MODELS_PRO]

  return (
    <div>
      <DropdownMenu onOpenChange={(open) => !open && setHoveredModel(null)}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn("dark:bg-secondary justify-between", className)}
          >
            <div className="flex items-center gap-2">
              {currentModel?.icon && <currentModel.icon className="size-5" />}
              <span>{currentModel?.name}</span>
            </div>
            <CaretDown className="size-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="flex max-h-[400px] w-[300px] flex-col space-y-0.5 overflow-y-auto"
          align="start"
          sideOffset={4}
          forceMount
        >
          {models.map(renderModelItem)}
        </DropdownMenuContent>
      </DropdownMenu>

      {portalElement &&
        hoveredModel &&
        hoveredModelData &&
        dropdownRect &&
        createPortal(
          <div
            className="bg-popover fixed z-[51] w-[280px] rounded-md border p-3 shadow-md"
            style={{
              top: `${dropdownRect.top}px`,
              left: `${dropdownRect.right + 12}px`,
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {hoveredModelData?.icon && (
                  <hoveredModelData.icon className="size-5" />
                )}
                <h3 className="font-medium">{hoveredModelData.name}</h3>
              </div>

              <p className="text-muted-foreground text-sm">
                {hoveredModelData.description}
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Provider</span>
                  <span>{hoveredModelData.provider}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Supports</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Web Search</span>
                      {hoveredModelData.features?.find(
                        (f: any) => f.id === "tool-use"
                      )?.enabled ? (
                        <Check className="size-5" />
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vision</span>
                      {hoveredModelData.features?.find(
                        (f: any) => f.id === "file-upload"
                      )?.enabled ? (
                        <Check className="size-5" />
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tools</span>
                      {hoveredModelData.features?.find(
                        (f: any) => f.id === "tool-use"
                      )?.enabled ? (
                        <Check className="size-5" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          portalElement
        )}
    </div>
  )
}
