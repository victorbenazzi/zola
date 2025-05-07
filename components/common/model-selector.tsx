"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MODELS_FREE, MODELS_OPTIONS, MODELS_PRO } from "@/lib/config"
import { cn } from "@/lib/utils"
import { CaretDown, Check, Image } from "@phosphor-icons/react"

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

  const renderModelItem = (model: any) => {
    const hasFileUpload = model.features?.find(
      (feature: any) => feature.id === "file-upload"
    )?.enabled
    const hasToolUse = model.features?.find(
      (feature: any) => feature.id === "tool-use"
    )?.enabled

    return (
      <DropdownMenuSub key={model.id}>
        <DropdownMenuSubTrigger
          className={cn(
            "flex w-full items-center justify-between px-3 py-2",
            selectedModelId === model.id && "bg-accent"
          )}
          onClick={() => {
            setSelectedModelId(model.id)
          }}
        >
          <div className="flex items-center gap-3">
            {model?.icon && <model.icon className="size-5" />}
            <div className="flex flex-col gap-0">
              <span className="text-sm">{model.name}</span>
              <span className="text-muted-foreground line-clamp-2 text-xs">
                {model.description}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasFileUpload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help rounded-full bg-blue-100 p-1 text-blue-600 dark:bg-blue-900">
                    <Image className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>This model can process and understand images.</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent className="w-[400px] p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {model?.icon && <model.icon className="size-6" />}
                <h3 className="text-lg font-medium">{model.name}</h3>
              </div>

              <p className="text-muted-foreground text-sm">
                {model.description}
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Provider</span>
                  <span>{model.provider}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Supports</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Web Search</span>
                      {hasToolUse ? <Check className="size-5" /> : null}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vision</span>
                      {hasFileUpload ? <Check className="size-5" /> : null}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tools</span>
                      {hasToolUse ? <Check className="size-5" /> : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    )
  }

  return (
    <DropdownMenu>
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
        className="flex max-h-[400px] w-[400px] flex-col space-y-0.5 overflow-y-auto"
        align="start"
        sideOffset={4}
      >
        <div className="text-muted-foreground px-2 py-1.5 text-sm font-medium">
          Free Models
        </div>
        {MODELS_FREE.map(renderModelItem)}

        <DropdownMenuSeparator />

        <div className="text-muted-foreground flex items-center justify-between px-2 py-1.5 text-sm font-medium">
          <span>Pro Models</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            5 free per day
          </span>
        </div>
        {MODELS_PRO.map(renderModelItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
