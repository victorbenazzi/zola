"use client"

import { useUser } from "@/app/providers/user-provider"
import { ModelSelector } from "@/components/common/model-selector/base"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { useChats } from "@/lib/chat-store/chats/provider"
import { useMessages } from "@/lib/chat-store/messages/provider"
import { clearAllIndexedDBStores } from "@/lib/chat-store/persist"
import { MODEL_DEFAULT } from "@/lib/config"
import { cn } from "@/lib/utils"
import {
  GearSix,
  PaintBrush,
  PlugsConnected,
  SignOut,
  User,
  X,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
import { LayoutSection } from "./layout-section"
import { SystemPromptSection } from "./system-prompt-section"

type SettingsContentProps = {
  onClose: () => void
  isDrawer?: boolean
}

type TabType = "general" | "appearance" | "connections"

export function SettingsContent({
  onClose,
  isDrawer = false,
}: SettingsContentProps) {
  const { user, updateUser, signOut } = useUser()
  const { resetChats } = useChats()
  const { resetMessages } = useMessages()
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(theme || "system")
  const [selectedModelId, setSelectedModelId] = useState<string>(
    user?.preferred_model || MODEL_DEFAULT
  )
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const router = useRouter()

  useEffect(() => {
    if (user?.preferred_model) {
      setSelectedModelId(user.preferred_model)
    }
  }, [user?.preferred_model])

  const handleModelSelection = async (value: string) => {
    setSelectedModelId(value)
    await updateUser({ preferred_model: value })
  }

  const handleSignOut = async () => {
    try {
      await resetMessages()
      await resetChats()
      await signOut()
      await clearAllIndexedDBStores()
      router.push("/")
    } catch (e) {
      console.error("Sign out failed:", e)
      toast({ title: "Failed to sign out", status: "error" })
    }
  }

  const themes = [
    { id: "system", name: "System", colors: ["#ffffff", "#1a1a1a"] },
    { id: "light", name: "Light", colors: ["#ffffff"] },
    { id: "dark", name: "Dark", colors: ["#1a1a1a"] },
  ]

  if (!user) return null

  return (
    <div
      className={cn(
        "max-h-[70vh] overflow-y-auto",
        isDrawer ? "p-0 pb-16" : "py-0"
      )}
    >
      {isDrawer && (
        <div className="border-border mb-2 flex items-center justify-between border-b px-4 pb-2">
          <h2 className="text-lg font-medium">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabType)}
        className={cn("w-full", isDrawer ? "" : "flex min-h-[400px]")}
      >
        {isDrawer ? (
          // Mobile version - tabs on top
          <div className="px-6 py-4">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <GearSix className="size-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2"
              >
                <PaintBrush className="size-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger
                value="connections"
                className="flex items-center gap-2"
              >
                <PlugsConnected className="size-4" />
                <span>Connections</span>
              </TabsTrigger>
            </TabsList>

            {/* Mobile tabs content */}
            <TabsContent value="general" className="space-y-0">
              {/* User Info */}
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-muted flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
                    {user?.profile_image ? (
                      <Avatar>
                        <AvatarImage
                          src={user.profile_image}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {user?.display_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="text-muted-foreground size-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">
                      {user?.display_name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Selection */}
              <div className="border-border border-t">
                <div className="py-4">
                  <h3 className="mb-3 text-sm font-medium">Preferred model</h3>
                  <div className="relative">
                    <ModelSelector
                      selectedModelId={selectedModelId}
                      setSelectedModelId={handleModelSelection}
                      className="w-full"
                    />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    This model will be used by default for new conversations.
                  </p>
                </div>
              </div>

              {/* System Prompt */}
              <SystemPromptSection />

              {/* Sign Out */}
              <div className="border-border border-t">
                <div className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Account</h3>
                      <p className="text-muted-foreground text-xs">
                        Log out on this device
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleSignOut}
                    >
                      <SignOut className="size-4" />
                      <span>Sign out</span>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-0">
              {/* Theme Selection */}
              <div className="mb-4">
                <h3 className="mb-3 text-sm font-medium">Theme</h3>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(theme.id)
                        setTheme(theme.id)
                      }}
                      className={`rounded-lg border p-3 ${
                        selectedTheme === theme.id
                          ? "border-primary ring-primary/30 ring-2"
                          : "border-border"
                      }`}
                    >
                      <div className="mb-2 flex space-x-1">
                        {theme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="border-border h-4 w-4 rounded-full border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-left text-sm font-medium">
                        {theme.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout */}
              <div className="border-border border-t">
                <div className="py-4">
                  <LayoutSection />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="connections"
              className="border-border border-t py-4"
            >
              <div className="py-8 text-center">
                <PlugsConnected className="text-muted-foreground mx-auto mb-2 size-12" />
                <h3 className="mb-1 text-sm font-medium">
                  No connections available
                </h3>
                <p className="text-muted-foreground text-sm">
                  Third-party service connections will appear here.
                </p>
              </div>
            </TabsContent>
          </div>
        ) : (
          // Desktop version - tabs on left
          <>
            <TabsList className="bg-secondary border-border flex w-48 flex-col items-start rounded-none border-r p-0">
              <div className="border-border flex w-full items-center border-b p-4">
                <h2 className="text-lg font-medium">Settings</h2>
              </div>

              <div className="flex w-full flex-col gap-1 p-2">
                <TabsTrigger
                  value="general"
                  className="w-full justify-start rounded-md px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <GearSix className="size-4" />
                    <span>General</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="appearance"
                  className="w-full justify-start rounded-md px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <PaintBrush className="size-4" />
                    <span>Appearance</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="connections"
                  className="w-full justify-start rounded-md px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <PlugsConnected className="size-4" />
                    <span>Connections</span>
                  </div>
                </TabsTrigger>
              </div>
            </TabsList>

            {/* Desktop tabs content */}
            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="general" className="mt-0 space-y-6">
                {/* User Info */}
                <div>
                  <h3 className="mb-4 text-lg font-medium">Account</h3>
                  <div className="flex items-center space-x-4">
                    <div className="bg-muted flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
                      {user?.profile_image ? (
                        <Avatar>
                          <AvatarImage
                            src={user.profile_image}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {user?.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <User className="text-muted-foreground size-8" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        {user?.display_name}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Model Selection */}
                <div>
                  <h3 className="mb-3 text-sm font-medium">Preferred model</h3>
                  <div className="relative">
                    <ModelSelector
                      selectedModelId={selectedModelId}
                      setSelectedModelId={handleModelSelection}
                      className="w-full"
                    />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    This model will be used by default for new conversations.
                  </p>
                </div>

                {/* System Prompt */}
                <div>
                  <SystemPromptSection />
                </div>

                {/* Sign Out */}
                <div className="border-border border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Sign out</h3>
                      <p className="text-muted-foreground text-xs">
                        Log out on this device
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleSignOut}
                    >
                      <SignOut className="size-4" />
                      <span>Sign out</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 space-y-6">
                <h3 className="mb-4 text-lg font-medium">Appearance</h3>

                {/* Theme Selection */}
                <div>
                  <h4 className="mb-3 text-sm font-medium">Theme</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(theme.id)
                          setTheme(theme.id)
                        }}
                        className={`rounded-lg border p-3 ${
                          selectedTheme === theme.id
                            ? "border-primary ring-primary/30 ring-2"
                            : "border-border"
                        }`}
                      >
                        <div className="mb-2 flex space-x-1">
                          {theme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="border-border h-4 w-4 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-left text-sm font-medium">
                          {theme.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout */}
                <div>
                  <h4 className="mb-3 text-sm font-medium">Layout</h4>
                  <LayoutSection />
                </div>
              </TabsContent>

              <TabsContent value="connections" className="mt-0">
                <h3 className="mb-4 text-lg font-medium">Connections</h3>
                <div className="py-8 text-center">
                  <PlugsConnected className="text-muted-foreground mx-auto mb-2 size-12" />
                  <h4 className="mb-1 text-sm font-medium">
                    No connections available
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Third-party service connections will appear here.
                  </p>
                </div>
              </TabsContent>
            </div>
          </>
        )}
      </Tabs>
    </div>
  )
}
