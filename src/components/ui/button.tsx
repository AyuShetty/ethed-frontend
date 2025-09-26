import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 backdrop-blur-sm relative overflow-hidden shadow-lg",
  {
    variants: {
      variant: {
        ethed: [
          "bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-900",
          "hover:from-cyan-400 hover:to-blue-500 hover:text-white",
          // hover animated overlay
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-300/50 before:via-cyan-400/40 before:to-blue-400/50 before:opacity-0 before:transition-opacity before:duration-300 before:rounded-full before:pointer-events-none",
          "hover:before:opacity-100",
          // subtle glow layer
          "after:absolute after:inset-0 after:rounded-full after:blur-xl after:bg-cyan-400/20 after:opacity-0 hover:after:opacity-60 after:transition-all after:duration-500",
        ].join(" "),
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-cyan-400/70 bg-black/30 text-cyan-100 hover:bg-emerald-400/10 hover:text-white shadow-xs backdrop-blur-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 text-base",
        sm: "h-8 px-4 text-sm",
        lg: "h-12 px-8 text-lg",
        xl: "h-14 px-10 text-xl", // 🔥 hero size
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "ethed",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
