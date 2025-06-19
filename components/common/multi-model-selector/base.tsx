"use client"

import { PopoverContentAuth } from "@/app/components/chat-input/popover-content-auth"
import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import { useKeyShortcut } from "@/app/hooks/use-key-shortcut"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FREE_MODELS_IDS } from "@/lib/config"
import { useModel } from "@/lib/model-store/provider"
import { ModelConfig } from "@/lib/models/types"
import { PROVIDERS } from "@/lib/providers"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { cn } from "@/lib/utils"
import {
  CaretDownIcon,
  MagnifyingGlassIcon,
  StarIcon,
  XIcon,
} from "@phosphor-icons/react"
import { useRef, useState } from "react"
import { ProModelDialog } from "../model-selector/pro-dialog"
import { SubMenu } from "../model-selector/sub-menu"

type MultiModelSelectorProps = {
  selectedModelIds: string[]
  setSelectedModelIds: (modelIds: string[]) => void
  className?: string
  isUserAuthenticated?: boolean
  maxModels?: number
}

export function MultiModelSelector({
  selectedModelIds,
  setSelectedModelIds,
  className,
  isUserAuthenticated = true,
  maxModels = 5,
}: MultiModelSelectorProps) {
  const { models, isLoading: isLoadingModels } = useModel()
  const { isModelHidden } = useUserPreferences()

  const selectedModels = models.filter((model) =>
    selectedModelIds.includes(model.id)
  )
  const isMobile = useBreakpoint(768)

  const [hoveredModel, setHoveredModel] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isProDialogOpen, setIsProDialogOpen] = useState(false)
  const [selectedProModel, setSelectedProModel] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Ref for input to maintain focus
  const searchInputRef = useRef<HTMLInputElement>(null)

  useKeyShortcut(
    (e) => (e.key === "m" || e.key === "M") && e.metaKey && e.shiftKey,
    () => {
      isMobile
        ? setIsDrawerOpen((prev) => !prev)
        : setIsDropdownOpen((prev) => !prev)
    }
  )

  const handleModelToggle = (modelId: string, isLocked: boolean) => {
    if (isLocked) {
      setSelectedProModel(modelId)
      setIsProDialogOpen(true)
      return
    }

    const isSelected = selectedModelIds.includes(modelId)

    if (isSelected) {
      // Remove model from selection
      setSelectedModelIds(selectedModelIds.filter((id) => id !== modelId))
    } else {
      // Add model to selection if under limit
      if (selectedModelIds.length < maxModels) {
        setSelectedModelIds([...selectedModelIds, modelId])
      }
    }
  }

  const removeModel = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedModelIds(selectedModelIds.filter((id) => id !== modelId))
  }

  const renderModelItem = (model: ModelConfig) => {
    const isLocked = !model.accessible
    const isSelected = selectedModelIds.includes(model.id)
    const isAtLimit = selectedModelIds.length >= maxModels
    const provider = PROVIDERS.find((provider) => provider.id === model.icon)

    return (
      <div
        key={model.id}
        className={cn(
          "hover:bg-accent/50 flex w-full cursor-pointer items-center justify-between px-3 py-2",
          isSelected && "bg-accent"
        )}
        onClick={() => handleModelToggle(model.id, isLocked)}
      >
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            disabled={isLocked || (!isSelected && isAtLimit)}
            onClick={(e) => e.stopPropagation()}
            onChange={() => handleModelToggle(model.id, isLocked)}
          />
          {provider?.icon && <provider.icon className="size-5" />}
          <div className="flex flex-col gap-0">
            <span className="text-sm">{model.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLocked && (
            <div className="border-input bg-accent text-muted-foreground flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium">
              <StarIcon className="size-2" />
              <span>Locked</span>
            </div>
          )}
          {!isSelected && isAtLimit && !isLocked && (
            <div className="border-input bg-muted text-muted-foreground flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium">
              <span>Limit</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Get the hovered model data
  const hoveredModelData = models.find((model) => model.id === hoveredModel)

  const filteredModels = models
    .filter((model) => !isModelHidden(model.id))
    .filter((model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aIsFree = FREE_MODELS_IDS.includes(a.id)
      const bIsFree = FREE_MODELS_IDS.includes(b.id)
      return aIsFree === bIsFree ? 0 : aIsFree ? -1 : 1
    })

  if (isLoadingModels) {
    return null
  }

  const trigger = (
    <Button
      variant="outline"
      className={cn(
        "dark:bg-secondary min-w-[200px] justify-between",
        className
      )}
      disabled={isLoadingModels}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {selectedModels.length === 0 ? (
          <span className="text-muted-foreground">Select models</span>
        ) : selectedModels.length === 1 ? (
          <>
            <span className="truncate">{selectedModels[0].name}</span>
          </>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <div className="flex flex-shrink-0 -space-x-1">
              {selectedModels.slice(0, 3).map((model, index) => {
                const provider = PROVIDERS.find((p) => p.id === model.icon)
                return provider?.icon ? (
                  <div
                    key={model.id}
                    className="bg-background border-border flex size-5 items-center justify-center rounded-full border"
                    style={{ zIndex: 3 - index }}
                  >
                    <provider.icon className="size-3" />
                  </div>
                ) : null
              })}
            </div>
            <span className="text-sm font-medium">
              {selectedModels.length} model
              {selectedModels.length > 1 ? "s" : ""} selected
            </span>
          </div>
        )}
      </div>
      <CaretDownIcon className="ml-2 size-4 flex-shrink-0 opacity-50" />
    </Button>
  )

  // Handle input change without losing focus
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setSearchQuery(e.target.value)
  }

  // If user is not authenticated, show the auth popover
  if (!isUserAuthenticated) {
    return (
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className={cn(
                  "border-border dark:bg-secondary text-accent-foreground h-9 w-auto border bg-transparent",
                  className
                )}
                type="button"
              >
                <span>Select models</span>
                <CaretDownIcon className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Select models</TooltipContent>
        </Tooltip>
        <PopoverContentAuth />
      </Popover>
    )
  }

  // Show selected models as removable chips above the trigger
  const selectedModelsDisplay = selectedModels.length > 0 && (
    <div className="mb-2 flex flex-wrap gap-1">
      {selectedModels.map((model) => {
        const provider = PROVIDERS.find((p) => p.id === model.icon)
        return (
          <div
            key={model.id}
            className="bg-accent text-accent-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs"
          >
            {provider?.icon && <provider.icon className="size-3" />}
            <span className="max-w-[100px] truncate">{model.name}</span>
            <button
              onClick={(e) => removeModel(model.id, e)}
              className="hover:bg-accent-foreground/20 rounded-full p-0.5"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        )
      })}
    </div>
  )

  if (isMobile) {
    return (
      <div>
        {selectedModelsDisplay}
        <ProModelDialog
          isOpen={isProDialogOpen}
          setIsOpen={setIsProDialogOpen}
          currentModel={selectedProModel || ""}
        />
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                Select Models ({selectedModelIds.length}/{maxModels})
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <div className="relative">
                <MagnifyingGlassIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search models..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="flex h-full flex-col space-y-0 overflow-y-auto px-4 pb-6">
              {isLoadingModels ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <p className="text-muted-foreground mb-2 text-sm">
                    Loading models...
                  </p>
                </div>
              ) : filteredModels.length > 0 ? (
                filteredModels.map((model) => renderModelItem(model))
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <p className="text-muted-foreground mb-2 text-sm">
                    No results found.
                  </p>
                  <a
                    href="https://github.com/ibelick/zola/issues/new?title=Model%20Request%3A%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground text-sm underline"
                  >
                    Request a new model
                  </a>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }

  return (
    <div>
      {selectedModelsDisplay}
      <ProModelDialog
        isOpen={isProDialogOpen}
        setIsOpen={setIsProDialogOpen}
        currentModel={selectedProModel || ""}
      />
      <Tooltip>
        <DropdownMenu
          open={isDropdownOpen}
          onOpenChange={(open) => {
            setIsDropdownOpen(open)
            if (!open) {
              setHoveredModel(null)
              setSearchQuery("")
            } else {
              if (selectedModelIds.length > 0)
                setHoveredModel(selectedModelIds[0])
            }
          }}
        >
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            Select models ⌘⇧M ({selectedModelIds.length}/{maxModels})
          </TooltipContent>
          <DropdownMenuContent
            className="flex h-[320px] w-[300px] flex-col space-y-0.5 overflow-visible p-0"
            align="start"
            sideOffset={4}
            forceMount
            side="top"
          >
            <div className="bg-background sticky top-0 z-10 rounded-t-md border-b px-0 pt-0 pb-0">
              <div className="relative">
                <MagnifyingGlassIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search models..."
                  className="dark:bg-popover rounded-b-none border border-none pl-8 shadow-none focus-visible:ring-0"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="flex h-full flex-col space-y-0 overflow-y-auto px-1 pt-0 pb-0">
              {isLoadingModels ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <p className="text-muted-foreground mb-2 text-sm">
                    Loading models...
                  </p>
                </div>
              ) : filteredModels.length > 0 ? (
                filteredModels.map((model) => {
                  const isLocked = !model.accessible
                  const isSelected = selectedModelIds.includes(model.id)
                  const isAtLimit = selectedModelIds.length >= maxModels
                  const provider = PROVIDERS.find(
                    (provider) => provider.id === model.icon
                  )

                  return (
                    <DropdownMenuItem
                      key={model.id}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2",
                        isSelected && "bg-accent"
                      )}
                      onSelect={(e) => {
                        e.preventDefault()
                        handleModelToggle(model.id, isLocked)
                      }}
                      onFocus={() => {
                        if (isDropdownOpen) {
                          setHoveredModel(model.id)
                        }
                      }}
                      onMouseEnter={() => {
                        if (isDropdownOpen) {
                          setHoveredModel(model.id)
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          disabled={isLocked || (!isSelected && isAtLimit)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {provider?.icon && <provider.icon className="size-5" />}
                        <div className="flex flex-col gap-0">
                          <span className="text-sm">{model.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLocked && (
                          <div className="border-input bg-accent text-muted-foreground flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium">
                            <span>Locked</span>
                          </div>
                        )}
                        {!isSelected && isAtLimit && !isLocked && (
                          <div className="border-input bg-muted text-muted-foreground flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium">
                            <span>Limit</span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  )
                })
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <p className="text-muted-foreground mb-1 text-sm">
                    No results found.
                  </p>
                  <a
                    href="https://github.com/ibelick/zola/issues/new?title=Model%20Request%3A%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground text-sm underline"
                  >
                    Request a new model
                  </a>
                </div>
              )}
            </div>

            {/* Submenu positioned absolutely */}
            {hoveredModelData && (
              <div className="absolute top-0 left-[calc(100%+8px)]">
                <SubMenu hoveredModelData={hoveredModelData} />
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </div>
  )
}
