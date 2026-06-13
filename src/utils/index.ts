import type { InspectionIssue, IssueType } from "@/types";

export function getIssueTypeLabel(type: IssueType): string {
  const map: Record<IssueType, string> = {
    naming: "命名不规范",
    value_range: "取值越界",
    data_type: "数据类型不符",
    format: "格式错误",
  };
  return map[type];
}

export function getIssueTypeColor(type: IssueType): string {
  const map: Record<IssueType, string> = {
    naming: "bg-primary-100 text-primary-700",
    value_range: "bg-warning-100 text-warning-700",
    data_type: "bg-danger-100 text-danger-700",
    format: "bg-purple-100 text-purple-700",
  };
  return map[type];
}

export function getSeverityLabel(severity: string): string {
  const map: Record<string, string> = {
    high: "严重",
    medium: "中等",
    low: "轻微",
  };
  return map[severity] || severity;
}

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    high: "bg-danger-100 text-danger-700",
    medium: "bg-warning-100 text-warning-700",
    low: "bg-slate-100 text-slate-700",
  };
  return map[severity] || "bg-slate-100 text-slate-700";
}

export function getIssueStatusLabel(status: string): string {
  const map: Record<string, string> = {
    open: "待处理",
    false_positive: "已标记误报",
    rectifying: "整改中",
    resolved: "已解决",
  };
  return map[status] || status;
}

export function getIssueStatusColor(status: string): string {
  const map: Record<string, string> = {
    open: "bg-danger-100 text-danger-700",
    false_positive: "bg-slate-100 text-slate-600",
    rectifying: "bg-warning-100 text-warning-700",
    resolved: "bg-success-100 text-success-700",
  };
  return map[status] || "bg-slate-100 text-slate-600";
}

export function getRectificationStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "待整改",
    in_progress: "整改中",
    submitted: "待审核",
    approved: "已通过",
    rejected: "已驳回",
  };
  return map[status] || status;
}

export function getRectificationStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-slate-100 text-slate-700",
    in_progress: "bg-warning-100 text-warning-700",
    submitted: "bg-primary-100 text-primary-700",
    approved: "bg-success-100 text-success-700",
    rejected: "bg-danger-100 text-danger-700",
  };
  return map[status] || "bg-slate-100 text-slate-600";
}

export function getTaskStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "草稿",
    matching: "匹配中",
    inspecting: "检查中",
    rectifying: "整改中",
    completed: "已完成",
  };
  return map[status] || status;
}

export function getTaskStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600",
    matching: "bg-primary-100 text-primary-700",
    inspecting: "bg-purple-100 text-purple-700",
    rectifying: "bg-warning-100 text-warning-700",
    completed: "bg-success-100 text-success-700",
  };
  return map[status] || "bg-slate-100 text-slate-600";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function exportIssuesToCSV(issues: InspectionIssue[]): void {
  const headers = [
    "问题ID",
    "字段名",
    "问题类型",
    "严重程度",
    "当前值",
    "标准要求",
    "整改建议",
    "状态",
    "负责人",
    "截止日期",
  ];
  const rows = issues.map((issue) => [
    issue.id,
    issue.fieldName,
    getIssueTypeLabel(issue.issueType),
    getSeverityLabel(issue.severity),
    issue.currentValue,
    issue.standardRequirement,
    issue.suggestion,
    getIssueStatusLabel(issue.status),
    issue.assignee || "",
    issue.deadline || "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `检查问题明细_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}
