"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Model } from "@/lib/config"
import { MODELS_FREE, MODELS_OPTIONS, MODELS_PRO } from "@/lib/config"
import { cn } from "@/lib/utils"
import { CaretDown, Star } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { SubMenu } from "./sub-menu"

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
      updateDropdownRect()
    }
  }, [hoveredModel])

  const renderModelItem = (model: Model) => {
    const isPro = MODELS_PRO.some((proModel) => proModel.id === model.id)

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
        {isPro && (
          <div className="border-input bg-accent text-muted-foreground flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium">
            <Star className="size-2" />
            <span>Pro</span>
          </div>
        )}
      </DropdownMenuItem>
    )
  }

  // Get the hovered model data
  const hoveredModelData = MODELS_OPTIONS.find(
    (model) => model.id === hoveredModel
  )

  const models = [...MODELS_FREE, ...MODELS_PRO] as Model[]

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
          className="flex max-h-[320px] w-[300px] flex-col space-y-0.5 overflow-y-auto"
          align="start"
          sideOffset={4}
          forceMount
        >
          {models.map((model) => renderModelItem(model))}
        </DropdownMenuContent>
      </DropdownMenu>

      {portalElement &&
        hoveredModel &&
        hoveredModelData &&
        dropdownRect &&
        createPortal(
          <SubMenu
            hoveredModelData={hoveredModelData}
            dropdownRect={dropdownRect}
          />,
          portalElement
        )}
    </div>
  )
}
