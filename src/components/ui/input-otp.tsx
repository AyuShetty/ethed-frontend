"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & { index: number }) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        // Glassy, pastel gradients, rounded, calm border/shadow, soft focus/active
        "relative flex h-12 w-12 items-center justify-center rounded-xl",
        "bg-gradient-to-br from-blue-100/40 via-emerald-100/30 to-cyan-100/30 dark:from-[#153947]/30 dark:via-[#162e29]/40 dark:to-[#193734]/30",
        "border border-cyan-300/30 dark:border-cyan-900/35",
        "text-xl font-mono text-blue-900/85 dark:text-cyan-100/90",
        "shadow-[0_2px_16px_rgba(20,184,166,0.05)]",
        "transition-all outline-none",
        "data-[active=true]:border-emerald-400/70 data-[active=true]:ring-2 data-[active=true]:ring-cyan-400/50 data-[active=true]:z-10",
        "focus-within:shadow-lg focus-within:ring-2 focus-within:ring-cyan-300/40",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-cyan-400/90 w-px h-7" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      role="separator"
      className="flex items-center justify-center text-cyan-300/80 px-2"
      {...props}
    >
      <MinusIcon className="h-4 w-4" />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
