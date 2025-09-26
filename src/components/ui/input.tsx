import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // General style
        "placeholder:text-cyan-700 file:text-cyan-900 selection:bg-cyan-500 selection:text-white text-blue-900 dark:text-cyan-200",
        "border border-cyan-300 bg-blue-50 dark:bg-[#0e2c2d] rounded-md px-3 py-2 h-9 w-full min-w-0 text-base shadow-xs transition-[color,box-shadow,border] outline-none",
        // Focus/active/invalid
        "focus-visible:border-emerald-500 focus-visible:ring-emerald-400/40 focus-visible:ring-[2px]",
        "aria-invalid:border-red-400 aria-invalid:ring-red-500/20 dark:aria-invalid:border-red-700 dark:aria-invalid:ring-red-600/40",
        // Disabled, file input
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input };
