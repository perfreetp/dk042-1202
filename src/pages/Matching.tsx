import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckSquare,
  Search,
  Check,
  X,
  ArrowRight,
  GitBranchPlus,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { MatchStatus } from "@/types";

export default function Matching() {
  const { id: taskId } = useParams<{ id: string }>();
  const {
    fields,
    standardFields,
    matchResults,
    tasks,
    confirmMatch,
    rejectMatch,
  } = useAppStore();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "all">("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const currentTask = tasks.find((t) => t.id === taskId);
  const taskFields = fields.filter((f) => f.taskId === taskId);
  const taskMatches = matchResults.filter((m) =>
    taskFields.some((f) => f.id === m.fieldId)
  );

  const confirmedCount = taskMatches.filter((m) => m.status === "confirmed")
    .length;
  const pendingCount = taskMatches.filter((m) => m.status === "pending")
    .length;
  const rejectedCount = taskMatches.filter((m) => m.status === "rejected")
    .length;
  const matchRate =
    taskMatches.length > 0
      ? Math.round(
          (confirmedCount /
            (confirmedCount + pendingCount + rejectedCount || 1)) *
            100
        )
      : 0;

  const filteredMatches = useMemo(() => {
    return taskMatches.filter((m) => {
      const field = taskFields.find((f) => f.id === m.fieldId);
      if (!field) return false;
      const matchSearch =
        field.fieldName.toLowerCase().includes(searchText.toLowerCase()) ||
        (m.standardFieldId &&
          standardFields
            .find((sf) => sf.id === m.standardFieldId)
            ?.fieldName.toLowerCase()
            .includes(searchText.toLowerCase()));
      const matchStatus = statusFilter === "all" || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [taskMatches, taskFields, standardFields, searchText, statusFilter]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return "text-success-600 bg-success-50";
    if (score >= 0.6) return "text-warning-600 bg-warning-50";
    return "text-danger-600 bg-danger-50";
  };

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="success">
            <CheckCircle2 size={12} /> 已确认
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning">
            <Clock size={12} /> 待确认
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="danger">
            <XCircle size={12} /> 已拒绝
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {currentTask && (
        <div className="card p-4 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white">
          <div>
            <div className="text-xs text-slate-500 mb-1">当前检查任务</div>
            <div className="text-lg font-semibold text-slate-900">
              {currentTask.name}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">
              关联项目：{currentTask.projectName}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/tasks/${taskId}/issues`} className="btn-primary">
              进入问题检查
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="字段总数"
          value={taskFields.length || taskMatches.length}
          icon={<CheckSquare size={22} />}
          color="primary"
          subtitle="待匹配字段数量"
        />
        <StatCard
          title="已确认匹配"
          value={confirmedCount}
          icon={<CheckCircle2 size={22} />}
          color="success"
          subtitle={`匹配率 ${matchRate}%`}
        />
        <StatCard
          title="待人工确认"
          value={pendingCount}
          icon={<Clock size={22} />}
          color="warning"
          subtitle="疑似匹配需审核"
        />
        <StatCard
          title="已拒绝匹配"
          value={rejectedCount}
          icon={<XCircle size={22} />}
          color="danger"
          subtitle="匹配不正确的项"
        />
      </div>

      <div className="card">
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
                placeholder="搜索字段名或标准字段..."
                className="w-64 pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <Filter size={14} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as MatchStatus | "all")
                }
                className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部状态</option>
                <option value="pending">待确认</option>
                <option value="confirmed">已确认</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            共 <span className="text-primary-600 font-semibold">{filteredMatches.length}</span> 条匹配记录
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredMatches.map((match) => {
            const field = taskFields.find((f) => f.id === match.fieldId);
            const matchedStd = standardFields.find(
              (sf) => sf.id === match.standardFieldId
            );
            const isExpanded = expandedRow === match.id;

            if (!field) return null;

            return (
              <div key={match.id}>
                <div
                  className={cn(
                    "p-4 hover:bg-slate-50 transition-colors cursor-pointer",
                    isExpanded && "bg-slate-50/70"
                  )}
                  onClick={() =>
                    setExpandedRow(isExpanded ? null : match.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium text-slate-900">
                          {field.fieldName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {field.tableName}
                        </span>
                        {getStatusBadge(match.status)}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {field.fieldDescription} ·{" "}
                        <span className="font-mono text-xs">{field.dataType}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300">
                      <GitBranchPlus size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {matchedStd ? (
                        <>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-medium text-primary-700">
                              {matchedStd.fieldName}
                            </span>
                            <span className="text-xs text-primary-400 font-mono">
                              {matchedStd.standardCode}
                            </span>
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {matchedStd.fieldDescription} ·{" "}
                            <span className="font-mono text-xs">
                              {matchedStd.dataType}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-slate-400 italic">
                          未匹配到标准字段
                        </div>
                      )}
                    </div>

                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-semibold min-w-[70px] text-center",
                        getMatchScoreColor(match.matchScore)
                      )}
                    >
                      {Math.round(match.matchScore * 100)}%
                    </div>

                    <div className="flex items-center gap-1">
                      {match.status === "pending" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (match.standardFieldId) {
                                confirmMatch(match.id, match.standardFieldId);
                              }
                            }}
                            className="p-2 rounded-lg text-success-600 hover:bg-success-50 transition-colors"
                            title="确认匹配"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rejectMatch(match.id);
                            }}
                            className="p-2 rounded-lg text-danger-600 hover:bg-danger-50 transition-colors"
                            title="拒绝匹配"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && match.candidates && match.candidates.length > 0 && (
                  <div className="bg-slate-50/50 px-4 pb-4 pl-16">
                    <div className="text-xs font-medium text-slate-500 mb-2">
                      疑似匹配的标准字段（点击选择）：
                    </div>
                    <div className="space-y-2">
                      {match.candidates.map((c, idx) => {
                        const std = standardFields.find(
                          (s) => s.id === c.standardFieldId
                        );
                        if (!std) return null;
                        const isSelected =
                          match.standardFieldId === c.standardFieldId;
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                              isSelected
                                ? "border-primary-300 bg-primary-50"
                                : "border-slate-200 bg-white hover:border-primary-200 hover:bg-primary-50/30"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmMatch(match.id, c.standardFieldId);
                            }}
                          >
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                isSelected
                                  ? "border-primary-600 bg-primary-600"
                                  : "border-slate-300"
                              )}
                            >
                              {isSelected && (
                                <Check size={12} className="text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium text-slate-800">
                                  {std.fieldName}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  {std.standardCode}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {std.fieldDescription}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                                <span className="font-mono">{std.dataType}</span>
                                {std.valueRange && (
                                  <span>
                                    取值范围：{std.valueRange.join(", ")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div
                              className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-semibold",
                                getMatchScoreColor(c.score)
                              )}
                            >
                              {Math.round(c.score * 100)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredMatches.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">
              暂无匹配记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
