import * as React from "react";
import { cn } from "@/lib/utils";

// Card with soft glassy muted gradients, no neon
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative flex flex-col gap-7 rounded-3xl overflow-hidden",
        "bg-gradient-to-br from-blue-950/70 via-slate-900/60 to-emerald-950/80",
        "border border-cyan-300/20 dark:border-emerald-500/30",
        "shadow-[0_2px_18px_2px_rgba(18,185,214,0.07)]",
        "py-10 backdrop-blur-2xl",
        "before:absolute before:inset-0 before:rounded-3xl before:pointer-events-none",
        "before:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_70%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_70%)]",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "px-8 pb-6 grid gap-3 relative z-10 text-center",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-extrabold text-2xl sm:text-3xl tracking-tight",
        "bg-gradient-to-r from-cyan-400/70 via-emerald-300/70 to-blue-400/60 bg-clip-text text-transparent",
        "drop-shadow",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-base sm:text-lg font-medium leading-relaxed",
        "text-cyan-200/65 dark:text-cyan-100/80",
        "max-w-xl mx-auto",
        className
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "mt-6 flex justify-center relative z-10",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-8 pt-2 pb-6 z-10 text-center",
        className
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex justify-center items-center px-8 border-t border-cyan-200/15 dark:border-emerald-800/25 pt-6 mt-2 relative z-10",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
