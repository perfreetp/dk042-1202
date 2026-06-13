import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Ban,
  Send,
  Download,
  CheckSquare,
  Square,
  X,
  Lightbulb,
  Target,
  User,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  getIssueTypeLabel,
  getIssueTypeColor,
  getSeverityLabel,
  getSeverityColor,
  getIssueStatusLabel,
  getIssueStatusColor,
  exportIssuesToCSV,
} from "@/utils";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { IssueType, IssueStatus, IssueSeverity, InspectionIssue } from "@/types";

const typeFilters: { key: IssueType | "all"; label: string }[] = [
  { key: "all", label: "全部问题" },
  { key: "naming", label: "命名不规范" },
  { key: "value_range", label: "取值越界" },
  { key: "data_type", label: "数据类型不符" },
  { key: "format", label: "格式错误" },
];

const statusFilters: { key: IssueStatus | "all"; label: string }[] = [
  { key: "all", label: "全部状态" },
  { key: "open", label: "待处理" },
  { key: "rectifying", label: "整改中" },
  { key: "false_positive", label: "已标误报" },
  { key: "resolved", label: "已解决" },
];

export default function Issues() {
  const { id: taskId } = useParams<{ id: string }>();
  const {
    issues,
    tasks,
    assignees,
    markFalsePositive,
    assignRectification,
  } = useAppStore();

  const [activeType, setActiveType] = useState<IssueType | "all">("all");
  const [activeStatus, setActiveStatus] = useState<IssueStatus | "all">("all");
  const [activeSeverity, setActiveSeverity] = useState<IssueSeverity | "all">(
    "all"
  );
  const [searchText, setSearchText] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<InspectionIssue | null>(
    null
  );
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({
    assignee: "",
    deadline: "",
  });

  const currentTask = tasks.find((t) => t.id === taskId);
  const taskIssues = taskId
    ? issues.filter((i) => i.taskId === taskId)
    : issues;

  const filteredIssues = useMemo(() => {
    return taskIssues.filter((issue) => {
      const matchType = activeType === "all" || issue.issueType === activeType;
      const matchStatus =
        activeStatus === "all" || issue.status === activeStatus;
      const matchSeverity =
        activeSeverity === "all" || issue.severity === activeSeverity;
      const matchSearch =
        !searchText ||
        issue.fieldName.toLowerCase().includes(searchText.toLowerCase()) ||
        issue.suggestion.toLowerCase().includes(searchText.toLowerCase());
      return matchType && matchStatus && matchSeverity && matchSearch;
    });
  }, [taskIssues, activeType, activeStatus, activeSeverity, searchText]);

  const countByType = (type: IssueType) =>
    taskIssues.filter((i) => i.issueType === type).length;
  const countBySeverity = (sev: IssueSeverity) =>
    taskIssues.filter((i) => i.severity === sev).length;

  const highCount = countBySeverity("high");
  const mediumCount = countBySeverity("medium");
  const openCount = taskIssues.filter((i) => i.status === "open").length;
  const fpCount = taskIssues.filter((i) => i.status === "false_positive").length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredIssues.length && filteredIssues.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIssues.map((i) => i.id));
    }
  };

  const handleMarkFalsePositive = () => {
    if (selectedIds.length === 0) return;
    markFalsePositive(selectedIds);
    setSelectedIds([]);
  };

  const handleAssign = () => {
    if (selectedIds.length === 0 || !assignForm.assignee || !assignForm.deadline)
      return;
    assignRectification(selectedIds, assignForm.assignee, assignForm.deadline);
    setShowAssign(false);
    setSelectedIds([]);
    setAssignForm({ assignee: "", deadline: "" });
  };

  const handleExport = () => {
    exportIssuesToCSV(filteredIssues);
  };

  const getSeverityIcon = (sev: IssueSeverity) => {
    switch (sev) {
      case "high":
        return <AlertOctagon size={14} />;
      case "medium":
        return <AlertTriangle size={14} />;
      case "low":
        return <AlertCircle size={14} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {currentTask && (
        <div className="card p-4 flex items-center justify-between bg-gradient-to-r from-warning-50 to-white">
          <div>
            <div className="text-xs text-slate-500 mb-1">当前检查任务</div>
            <div className="text-lg font-semibold text-slate-900">
              {currentTask.name}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">
              {currentTask.projectName}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        <StatCard
          title="问题总数"
          value={taskIssues.length}
          icon={<AlertTriangle size={22} />}
          color="danger"
        />
        <StatCard
          title="严重问题"
          value={highCount}
          icon={<AlertOctagon size={22} />}
          color="danger"
          subtitle="需优先处理"
        />
        <StatCard
          title="中等问题"
          value={mediumCount}
          icon={<AlertTriangle size={22} />}
          color="warning"
        />
        <StatCard
          title="待处理"
          value={openCount}
          icon={<AlertCircle size={22} />}
          color="primary"
        />
        <StatCard
          title="已标记误报"
          value={fpCount}
          icon={<Ban size={22} />}
          color="success"
        />
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-1 border-b border-slate-200 -mx-4 -mb-4 px-4 overflow-x-auto">
            {typeFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveType(f.key)}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
                  activeType === f.key
                    ? "border-primary-600 text-primary-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {f.label}
                {f.key !== "all" && (
                  <span
                    className={cn(
                      "ml-1.5 px-1.5 py-0.5 rounded text-xs",
                      activeType === f.key
                        ? "bg-primary-100 text-primary-700"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {countByType(f.key as IssueType)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索字段名/整改建议..."
                className="w-64 pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={activeSeverity}
              onChange={(e) =>
                setActiveSeverity(e.target.value as IssueSeverity | "all")
              }
              className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部严重程度</option>
              <option value="high">严重</option>
              <option value="medium">中等</option>
              <option value="low">轻微</option>
            </select>
            <select
              value={activeStatus}
              onChange={(e) =>
                setActiveStatus(e.target.value as IssueStatus | "all")
              }
              className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {statusFilters.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                <span className="text-sm text-slate-500">
                  已选 <span className="text-primary-600 font-semibold">{selectedIds.length}</span> 项
                </span>
                <button
                  onClick={handleMarkFalsePositive}
                  className="btn-secondary text-sm"
                >
                  <Ban size={14} />
                  标记误报
                </button>
                <button
                  onClick={() => setShowAssign(true)}
                  className="btn-primary text-sm"
                >
                  <Send size={14} />
                  派发整改
                </button>
              </>
            )}
            <button onClick={handleExport} className="btn-secondary text-sm">
              <Download size={14} />
              导出明细
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {selectedIds.length === filteredIssues.length &&
                    filteredIssues.length > 0 ? (
                      <CheckSquare size={16} className="text-primary-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="table-th">字段名</th>
                <th className="table-th">问题类型</th>
                <th className="table-th">严重程度</th>
                <th className="table-th">当前值</th>
                <th className="table-th">标准要求</th>
                <th className="table-th">状态</th>
                <th className="table-th">负责人</th>
                <th className="table-th">截止日期</th>
                <th className="table-th w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => (
                <tr
                  key={issue.id}
                  className={cn(
                    "hover:bg-slate-50 transition-colors cursor-pointer",
                    selectedIssue?.id === issue.id && "bg-primary-50/40"
                  )}
                  onClick={() =>
                    setSelectedIssue(
                      selectedIssue?.id === issue.id ? null : issue
                    )
                  }
                >
                  <td className="table-td" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleSelect(issue.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {selectedIds.includes(issue.id) ? (
                        <CheckSquare size={16} className="text-primary-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>
                  <td className="table-td">
                    <span className="font-mono text-sm font-medium text-slate-800">
                      {issue.fieldName}
                    </span>
                  </td>
                  <td className="table-td">
                    <Badge className={getIssueTypeColor(issue.issueType)}>
                      {getIssueTypeLabel(issue.issueType)}
                    </Badge>
                  </td>
                  <td className="table-td">
                    <Badge className={getSeverityColor(issue.severity)}>
                      {getSeverityIcon(issue.severity)}
                      {getSeverityLabel(issue.severity)}
                    </Badge>
                  </td>
                  <td className="table-td">
                    <span className="text-xs text-slate-600 max-w-[180px] inline-block truncate">
                      {issue.currentValue}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className="text-xs text-slate-600 max-w-[180px] inline-block truncate">
                      {issue.standardRequirement}
                    </span>
                  </td>
                  <td className="table-td">
                    <Badge className={getIssueStatusColor(issue.status)}>
                      {getIssueStatusLabel(issue.status)}
                    </Badge>
                  </td>
                  <td className="table-td">
                    {issue.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-medium">
                          {issue.assignee[0]}
                        </div>
                        <span className="text-xs text-slate-600">
                          {issue.assignee}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="table-td">
                    <span className="text-xs text-slate-500">
                      {issue.deadline || "-"}
                    </span>
                  </td>
                  <td className="table-td">
                    <ChevronRight
                      size={16}
                      className={cn(
                        "text-slate-400 transition-transform",
                        selectedIssue?.id === issue.id && "rotate-90"
                      )}
                    />
                  </td>
                </tr>
              ))}
              {filteredIssues.length > 0 &&
                selectedIssue &&
                filteredIssues.some((i) => i.id === selectedIssue.id) && (
                  <tr>
                    <td colSpan={10} className="bg-slate-50/70 px-8 py-5">
                      <IssueDetail issue={selectedIssue} />
                    </td>
                  </tr>
                )}
              {filteredIssues.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="table-td text-center py-16 text-slate-400"
                  >
                    暂无匹配的问题记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showAssign}
        onClose={() => setShowAssign(false)}
        title="派发整改任务"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowAssign(false)}>
              取消
            </button>
            <button
              className="btn-primary"
              onClick={handleAssign}
              disabled={!assignForm.assignee || !assignForm.deadline}
            >
              确认派发
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
            <div className="text-sm text-slate-700">
              将为 <span className="font-semibold text-primary-700">{selectedIds.length}</span> 个问题派发整改任务
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              整改负责人
            </label>
            <select
              value={assignForm.assignee}
              onChange={(e) =>
                setAssignForm({ ...assignForm, assignee: e.target.value })
              }
              className="input"
            >
              <option value="">请选择负责人</option>
              {assignees.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              整改截止日期
            </label>
            <input
              type="date"
              value={assignForm.deadline}
              onChange={(e) =>
                setAssignForm({ ...assignForm, deadline: e.target.value })
              }
              className="input"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function IssueDetail({ issue }: { issue: InspectionIssue }) {
  return (
    <div className="animate-slide-up space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-lg font-semibold text-slate-900">
          {issue.fieldName}
        </span>
        <Badge className={getIssueTypeColor(issue.issueType)}>
          {getIssueTypeLabel(issue.issueType)}
        </Badge>
        <Badge className={getSeverityColor(issue.severity)}>
          {getSeverityLabel(issue.severity)}
        </Badge>
        <Badge className={getIssueStatusColor(issue.status)}>
          {getIssueStatusLabel(issue.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-medium text-danger-600 mb-2">
            <X size={14} />
            当前值
          </div>
          <div className="font-mono text-sm text-slate-700">
            {issue.currentValue}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-medium text-primary-600 mb-2">
            <Target size={14} />
            标准要求
          </div>
          <div className="font-mono text-sm text-slate-700">
            {issue.standardRequirement}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-success-50 to-white rounded-lg border border-success-100">
        <div className="flex items-center gap-2 text-sm font-medium text-success-700 mb-2">
          <Lightbulb size={16} />
          整改建议
        </div>
        <div className="text-sm text-slate-700">{issue.suggestion}</div>
      </div>

      {(issue.assignee || issue.deadline) && (
        <div className="flex items-center gap-6 text-sm">
          {issue.assignee && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <User size={14} className="text-slate-400" />
              负责人：{issue.assignee}
            </div>
          )}
          {issue.deadline && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar size={14} className="text-slate-400" />
              截止：{issue.deadline}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
