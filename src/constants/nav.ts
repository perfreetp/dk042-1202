import {
  ClipboardCheck,
  GitBranchPlus,
  AlertTriangle,
  Wrench,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "检查任务", path: "/tasks", icon: ClipboardCheck },
  { label: "字段匹配", path: "/tasks/task-001/matching", icon: GitBranchPlus },
  { label: "问题清单", path: "/tasks/task-001/issues", icon: AlertTriangle },
  { label: "整改跟踪", path: "/rectification", icon: Wrench },
  { label: "统计分析", path: "/analytics", icon: BarChart3 },
];
