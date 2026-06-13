import { useState, useMemo } from "react";
import {
  Download,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Target,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useAppStore } from "@/store/useAppStore";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import {
  getIssueTypeLabel,
  getIssueTypeColor,
  getTaskStatusLabel,
  getTaskStatusColor,
  exportIssuesToCSV,
} from "@/utils";
import { cn } from "@/lib/utils";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];

const trendData = [
  { month: "1月", 达标率: 72, 问题数: 45 },
  { month: "2月", 达标率: 76, 问题数: 38 },
  { month: "3月", 达标率: 74, 问题数: 42 },
  { month: "4月", 达标率: 81, 问题数: 31 },
  { month: "5月", 达标率: 85, 问题数: 24 },
  { month: "6月", 达标率: 89, 问题数: 18 },
];

export default function Analytics() {
  const { tasks, issues, fields } = useAppStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const totalFields = fields.length;
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === "resolved").length;
  const complianceRate =
    totalFields > 0
      ? Math.round(((totalFields - totalIssues) / totalFields) * 100)
      : 0;
  const avgTaskCompletion =
    tasks.length > 0
      ? Math.round(
          (tasks.filter((t) => t.status === "completed").length /
            tasks.length) *
            100
        )
      : 0;

  const issueTypeData = useMemo(() => {
    const typeMap: Record<string, number> = {};
    issues.forEach((i) => {
      const label = getIssueTypeLabel(i.issueType);
      typeMap[label] = (typeMap[label] || 0) + 1;
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  }, [issues]);

  const complianceByTask = useMemo(() => {
    return tasks
      .filter((t) => t.fieldCount > 0)
      .slice(0, 6)
      .map((t) => {
        const tIssues = issues.filter((i) => i.taskId === t.id);
        const resolved = tIssues.filter(
          (i) => i.status === "resolved" || i.status === "false_positive"
        ).length;
        const rate =
          t.fieldCount > 0
            ? Math.round(
                ((t.fieldCount - tIssues.length + resolved) / t.fieldCount) *
                  100
              )
            : 100;
        return {
          name: t.name.length > 8 ? t.name.slice(0, 8) + "..." : t.name,
          达标率: Math.min(rate, 100),
        };
      });
  }, [tasks, issues]);

  const severityData = useMemo(() => {
    const sevMap: Record<string, number> = { 严重: 0, 中等: 0, 轻微: 0 };
    const labelMap: Record<string, string> = {
      high: "严重",
      medium: "中等",
      low: "轻微",
    };
    issues.forEach((i) => {
      sevMap[labelMap[i.severity]]++;
    });
    return Object.entries(sevMap).map(([name, value]) => ({ name, value }));
  }, [issues]);

  const selectedTaskIssues = selectedTaskId
    ? issues.filter((i) => i.taskId === selectedTaskId)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="整体达标率"
          value={`${complianceRate}%`}
          icon={<Target size={22} />}
          color="success"
          trend={5}
          subtitle="较上月提升"
        />
        <StatCard
          title="累计检查字段"
          value={totalFields}
          icon={<FileText size={22} />}
          color="primary"
          subtitle="所有任务字段总数"
        />
        <StatCard
          title="问题解决率"
          value={
            totalIssues > 0
              ? `${Math.round((resolvedIssues / totalIssues) * 100)}%`
              : "-"
          }
          icon={<CheckCircle2 size={22} />}
          color="primary"
          trend={8}
          subtitle="较上月提升"
        />
        <StatCard
          title="任务完成率"
          value={`${avgTaskCompletion}%`}
          icon={<TrendingUp size={22} />}
          color="warning"
          subtitle="已完成任务占比"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-600" />
              <h3 className="font-semibold text-slate-800">达标率趋势</h3>
            </div>
            <Badge variant="primary">近 6 个月</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#94a3b8"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Legend fontSize={12} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="达标率"
                stroke="#1e3a5f"
                strokeWidth={2.5}
                dot={{ fill: "#1e3a5f", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="问题数"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ fill: "#ef4444", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon size={18} className="text-primary-600" />
              <h3 className="font-semibold text-slate-800">违规类型分布</h3>
            </div>
            <Badge variant="slate">共 {issues.length} 个问题</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={issueTypeData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {issueTypeData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                fontSize={12}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-600" />
              <h3 className="font-semibold text-slate-800">
                严重程度分布
              </h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={severityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#94a3b8"
                fontSize={12}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                <Cell fill="#ef4444" />
                <Cell fill="#f59e0b" />
                <Cell fill="#94a3b8" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-primary-600" />
              <h3 className="font-semibold text-slate-800">
                各项目达标率对比
              </h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={complianceByTask}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="达标率"
                fill="#1e3a5f"
                radius={[6, 6, 0, 0]}
                barSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary-600" />
            <h3 className="font-semibold text-slate-800">
              项目检查明细
            </h3>
          </div>
          <button
            onClick={() => exportIssuesToCSV(issues)}
            className="btn-secondary text-sm"
          >
            <Download size={14} />
            导出全部明细
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">任务名称</th>
                <th className="table-th">关联项目</th>
                <th className="table-th">状态</th>
                <th className="table-th">字段数</th>
                <th className="table-th">已匹配</th>
                <th className="table-th">问题数</th>
                <th className="table-th">达标率</th>
                <th className="table-th text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const tIssues = issues.filter((i) => i.taskId === t.id);
                const resolved = tIssues.filter(
                  (i) => i.status === "resolved" || i.status === "false_positive"
                ).length;
                const rate =
                  t.fieldCount > 0
                    ? Math.min(
                        Math.round(
                          ((t.fieldCount - tIssues.length + resolved) /
                            t.fieldCount) *
                            100
                        ),
                        100
                      )
                    : 100;
                return (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="table-td font-medium text-slate-800">
                      {t.name}
                    </td>
                    <td className="table-td text-slate-600">
                      {t.projectName}
                    </td>
                    <td className="table-td">
                      <Badge className={getTaskStatusColor(t.status)}>
                        {getTaskStatusLabel(t.status)}
                      </Badge>
                    </td>
                    <td className="table-td font-mono text-sm">
                      {t.fieldCount}
                    </td>
                    <td className="table-td font-mono text-sm text-success-600">
                      {t.matchedCount}
                    </td>
                    <td className="table-td font-mono text-sm">
                      <span
                        className={cn(
                          tIssues.length > 0
                            ? "text-danger-600"
                            : "text-slate-400"
                        )}
                      >
                        {tIssues.length}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              rate >= 80
                                ? "bg-success-500"
                                : rate >= 60
                                ? "bg-warning-500"
                                : "bg-danger-500"
                            )}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            rate >= 80
                              ? "text-success-600"
                              : rate >= 60
                              ? "text-warning-600"
                              : "text-danger-600"
                          )}
                        >
                          {rate}%
                        </span>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => {
                            setSelectedTaskId(t.id);
                            setShowDetail(true);
                          }}
                          className="btn-ghost text-xs px-2 py-1 text-primary-600 hover:bg-primary-50"
                        >
                          <AlertTriangle size={14} />
                          查看问题
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title="项目问题明细"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowDetail(false)}>
              关闭
            </button>
            <button
              className="btn-primary"
              onClick={() => exportIssuesToCSV(selectedTaskIssues)}
            >
              <Download size={14} />
              导出当前明细
            </button>
          </>
        }
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {selectedTaskIssues.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              该项目暂无问题记录
            </div>
          ) : (
            selectedTaskIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm font-medium text-slate-800">
                    {issue.fieldName}
                  </span>
                  <Badge className={getIssueTypeColor(issue.issueType)}>
                    {getIssueTypeLabel(issue.issueType)}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600">
                  {issue.suggestion}
                </div>
                {issue.assignee && (
                  <div className="text-xs text-slate-500 mt-1.5">
                    负责人：{issue.assignee} · 截止：{issue.deadline}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
