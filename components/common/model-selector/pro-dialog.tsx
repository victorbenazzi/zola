"use client"

import { useUser } from "@/app/providers/user-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { APP_NAME } from "@/lib/config"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

type ProModelDialogProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  currentModel: string
}

export function ProModelDialog({
  isOpen,
  setIsOpen,
  currentModel,
}: ProModelDialogProps) {
  const [submitted, setSubmitted] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    setSubmitted(false)
  }, [currentModel])

  const handleSubmitInterest = async () => {
    if (!user?.id) {
      return
    }

    const supabase = await createClient()

    const { error } = await supabase.from("feedback").insert({
      message: `I want access to ${currentModel}`,
      user_id: user?.id,
    })

    if (error) {
      throw new Error(error.message)
    }

    setSubmitted(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="[&>button:last-child]:bg-background gap-0 overflow-hidden rounded-3xl p-0 shadow-xs sm:max-w-md [&>button:last-child]:rounded-full [&>button:last-child]:p-1">
        <div className="flex max-h-[70vh] flex-col">
          <DialogHeader className="p-0">
            <div className="relative">
              <img
                src="/banner_ocean.jpg"
                alt={`calm paint generate by ${APP_NAME}`}
                className="h-32 w-full object-cover"
              />
            </div>
          </DialogHeader>

          <DialogTitle className="px-6 pt-4 text-center text-lg leading-tight font-medium">
            This model is Pro-only on Zola
          </DialogTitle>

          <div className="flex-grow overflow-y-auto">
            <div className="px-6 py-4">
              <p className="text-muted-foreground text-sm">
                Zola is free and open-source. Some models require self-hosted
                access.
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                If you want to use this model, you can fork Zola and add your
                own key. Or let us know you want access.
              </p>

              <div className="mt-5 flex justify-center gap-3">
                {submitted ? (
                  <Badge className="bg-green-600 text-white">
                    Thanks! We'll keep you updated
                  </Badge>
                ) : (
                  <>
                    <Button
                      onClick={handleSubmitInterest}
                      className="flex-1"
                      variant="default"
                    >
                      I want this model
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <a
                        href="https://github.com/ibelick/zola"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View setup
                      </a>
                    </Button>
                  </>
                )}
              </div>

              <p className="text-muted-foreground mt-5 text-center text-xs">
                Teams:{" "}
                <a
                  className="text-blue-600 hover:underline"
                  href="mailto:julien.thibeaut@gmail.com"
                >
                  Contact us
                </a>{" "}
                to sponsor Pro access
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
