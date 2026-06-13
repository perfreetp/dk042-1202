import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "purple"
    | "slate";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-primary-100 text-primary-700",
    primary: "bg-primary-100 text-primary-700",
    success: "bg-success-100 text-success-700",
    warning: "bg-warning-100 text-warning-700",
    danger: "bg-danger-100 text-danger-700",
    purple: "bg-purple-100 text-purple-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
