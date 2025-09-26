"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "linear-gradient(90deg, #ecfeff 0%, #e0f2fe 100%)",
          "--normal-text": "#173153",
          "--normal-border": "#2dd4bf",
          "--success-bg": "linear-gradient(90deg, #d1fae5 0%, #a7f3d0 100%)",
          "--success-text": "#016e3a",
          "--success-border": "#10b981",
          "--error-bg": "linear-gradient(90deg, #ffe4e6 0%, #fecdd3 100%)",
          "--error-text": "#970d35",
          "--error-border": "#fb7185",
          // fallback, use --popover etc if you have those CSS vars defined globally
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
