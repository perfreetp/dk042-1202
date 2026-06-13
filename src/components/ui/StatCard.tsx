import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  color?: "primary" | "success" | "warning" | "danger" | "slate";
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = "primary",
  subtitle,
}: StatCardProps) {
  const colorMap = {
    primary: "bg-primary-50 text-primary-600",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
    danger: "bg-danger-50 text-danger-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p
              className={cn(
                "mt-2 text-xs font-medium",
                trend >= 0 ? "text-success-600" : "text-danger-600"
              )}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% 较上期
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center",
            colorMap[color]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
