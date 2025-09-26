import * as React from "react";
import { cn } from "@/lib/utils";

// Main Card structure - bold neon gradients, glowing borders, hero-like vibe
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative flex flex-col gap-7 rounded-3xl overflow-hidden",
        "bg-gradient-to-br from-cyan-500/20 via-emerald-400/15 to-blue-500/20 dark:from-cyan-900/40 dark:to-blue-900/30",
        "border border-cyan-400/40 dark:border-emerald-500/40",
        "shadow-[0_0_25px_rgba(34,211,238,0.4)] dark:shadow-[0_0_30px_rgba(16,185,129,0.4)]",
        "py-10 backdrop-blur-2xl",
        "before:absolute before:inset-0 before:rounded-3xl before:pointer-events-none",
        "before:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.25),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.25),transparent_60%)]",
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
        "font-extrabold text-3xl sm:text-4xl tracking-tight",
        "bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent",
        "drop-shadow-lg",
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
        "text-base sm:text-lg font-medium",
        "text-cyan-900/80 dark:text-cyan-100/90",
        "max-w-xl mx-auto leading-relaxed",
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
      className={cn("px-8 pt-2 pb-6 z-10 text-center", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex justify-center items-center px-8 border-t border-cyan-200/30 dark:border-emerald-800/50 pt-6 mt-2 relative z-10",
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
