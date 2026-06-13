import { useState, useMemo } from "react";
import {
  Clock,
  Play,
  Eye,
  CheckCircle2,
  User,
  Calendar,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  FileText,
  Send,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import {
  getRectificationStatusLabel,
  getRectificationStatusColor,
  getIssueTypeLabel,
  getIssueTypeColor,
  getSeverityLabel,
  getSeverityColor,
} from "@/utils";
import { cn } from "@/lib/utils";
import type { RectificationStatus, RectificationTask } from "@/types";

const columns: { status: RectificationStatus; label: string; icon: typeof Clock; color: string }[] = [
  { status: "pending", label: "待整改", icon: Clock, color: "slate" },
  { status: "in_progress", label: "整改中", icon: Play, color: "warning" },
  { status: "submitted", label: "待审核", icon: Eye, color: "primary" },
  { status: "approved", label: "已通过", icon: CheckCircle2, color: "success" },
];

export default function Rectification() {
  const { rectificationTasks, tasks, reviewRectification, submitRectification } =
    useAppStore();

  const [selectedTask, setSelectedTask] = useState<RectificationTask | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [submitContent, setSubmitContent] = useState("");
  const [reviewForm, setReviewForm] = useState({ approved: true, comment: "" });

  const groupedTasks = useMemo(() => {
    const result: Record<RectificationStatus, RectificationTask[]> = {
      pending: [],
      in_progress: [],
      submitted: [],
      approved: [],
      rejected: [],
    };
    rectificationTasks.forEach((t) => {
      if (t.status === "rejected") {
        result.in_progress.push(t);
      } else {
        result[t.status].push(t);
      }
    });
    return result;
  }, [rectificationTasks]);

  const totalTasks = rectificationTasks.length;
  const pendingCount = groupedTasks.pending.length;
  const inProgressCount = groupedTasks.in_progress.length;
  const submittedCount = groupedTasks.submitted.length;
  const approvedCount = groupedTasks.approved.length;

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case "high":
        return <AlertOctagon size={12} />;
      case "medium":
        return <AlertTriangle size={12} />;
      default:
        return <AlertCircle size={12} />;
    }
  };

  const handleSubmit = () => {
    if (!selectedTask || !submitContent.trim()) return;
    submitRectification(selectedTask.id, submitContent);
    setShowSubmit(false);
    setSubmitContent("");
    setSelectedTask(null);
  };

  const handleReview = () => {
    if (!selectedTask) return;
    reviewRectification(
      selectedTask.id,
      reviewForm.approved,
      reviewForm.comment
    );
    setShowReview(false);
    setReviewForm({ approved: true, comment: "" });
    setSelectedTask(null);
  };

  const getTaskById = (id: string) => tasks.find((t) => t.id === id);

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-5 gap-4">
        <StatCard
          title="整改任务总数"
          value={totalTasks}
          icon={<FileText size={22} />}
          color="primary"
        />
        <StatCard
          title="待整改"
          value={pendingCount}
          icon={<Clock size={22} />}
          color="slate"
        />
        <StatCard
          title="整改中"
          value={inProgressCount}
          icon={<Play size={22} />}
          color="warning"
        />
        <StatCard
          title="待审核"
          value={submittedCount}
          icon={<Eye size={22} />}
          color="primary"
        />
        <StatCard
          title="已通过"
          value={approvedCount}
          icon={<CheckCircle2 size={22} />}
          color="success"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <col.icon size={16} className="text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {col.label}
                </span>
                <Badge variant="slate">
                  {groupedTasks[col.status].length}
                </Badge>
              </div>
            </div>
            <div className="flex-1 min-h-[500px] bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-3">
              {groupedTasks[col.status].map((task) => {
                const parentTask = getTaskById(task.taskId);
                const issue = task.issueDetail;
                if (!issue) return null;
                const overdue =
                  col.status !== "approved" && isOverdue(task.deadline);

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-card-hover hover:border-primary-200 transition-all cursor-pointer group"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-sm font-medium text-slate-800 truncate">
                        {issue.fieldName}
                      </span>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {getSeverityIcon(issue.severity)}
                        {getSeverityLabel(issue.severity)}
                      </Badge>
                    </div>

                    <div className="mb-2">
                      <Badge className={getIssueTypeColor(issue.issueType)}>
                        {getIssueTypeLabel(issue.issueType)}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {issue.suggestion}
                    </p>

                    <div className="border-t border-slate-100 pt-2 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <User size={12} />
                        <span>{task.assignee}</span>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-xs",
                          overdue ? "text-danger-600" : "text-slate-500"
                        )}
                      >
                        <Calendar size={12} />
                        <span>
                          {task.deadline}
                          {overdue && " (已逾期)"}
                        </span>
                      </div>
                      {parentTask && (
                        <div className="text-xs text-slate-400 truncate">
                          任务：{parentTask.name}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <Badge className={getRectificationStatusColor(task.status)}>
                        {getRectificationStatusLabel(task.status)}
                      </Badge>
                      <ChevronRight
                        size={14}
                        className="text-slate-300 group-hover:text-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                );
              })}
              {groupedTasks[col.status].length === 0 && (
                <div className="text-center text-slate-400 text-xs py-8">
                  暂无任务
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && selectedTask.issueDetail && (
        <Modal
          open={!!selectedTask && !showSubmit && !showReview}
          onClose={() => setSelectedTask(null)}
          title="整改任务详情"
          size="lg"
          footer={
            <>
              {selectedTask.status === "pending" && (
                <button
                  className="btn-warning"
                  onClick={() => {
                    setShowSubmit(true);
                    setSubmitContent("");
                  }}
                >
                  <Play size={14} />
                  开始整改
                </button>
              )}
              {(selectedTask.status === "in_progress" ||
                selectedTask.status === "rejected") && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowSubmit(true);
                    setSubmitContent(
                      selectedTask.rectificationContent || ""
                    );
                  }}
                >
                  <Send size={14} />
                  提交整改
                </button>
              )}
              {selectedTask.status === "submitted" && (
                <button
                  className="btn-primary"
                  onClick={() => setShowReview(true)}
                >
                  <Eye size={14} />
                  审核整改
                </button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-lg font-semibold text-slate-900">
                {selectedTask.issueDetail.fieldName}
              </span>
              <Badge
                className={getIssueTypeColor(selectedTask.issueDetail.issueType)}
              >
                {getIssueTypeLabel(selectedTask.issueDetail.issueType)}
              </Badge>
              <Badge className={getSeverityColor(selectedTask.issueDetail.severity)}>
                {getSeverityLabel(selectedTask.issueDetail.severity)}
              </Badge>
              <Badge className={getRectificationStatusColor(selectedTask.status)}>
                {getRectificationStatusLabel(selectedTask.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-medium text-slate-500 mb-1">
                  当前值
                </div>
                <div className="font-mono text-sm text-slate-700">
                  {selectedTask.issueDetail.currentValue}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-medium text-slate-500 mb-1">
                  标准要求
                </div>
                <div className="font-mono text-sm text-slate-700">
                  {selectedTask.issueDetail.standardRequirement}
                </div>
              </div>
            </div>

            <div className="p-4 bg-success-50 rounded-lg border border-success-100">
              <div className="text-xs font-medium text-success-700 mb-1">
                整改建议
              </div>
              <div className="text-sm text-slate-700">
                {selectedTask.issueDetail.suggestion}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="text-sm text-slate-600">
                  整改负责人：
                  <span className="font-medium text-slate-800">
                    {selectedTask.assignee}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-sm text-slate-600">
                  截止日期：
                  <span className="font-medium text-slate-800">
                    {selectedTask.deadline}
                  </span>
                </span>
              </div>
            </div>

            {selectedTask.rectificationContent && (
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                <div className="flex items-center gap-2 text-xs font-medium text-primary-700 mb-2">
                  <FileText size={14} />
                  整改内容
                  {selectedTask.submittedAt && (
                    <span className="text-primary-400 font-normal ml-2">
                      提交于 {selectedTask.submittedAt}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedTask.rectificationContent}
                </div>
              </div>
            )}

            {selectedTask.reviewComment && (
              <div
                className={cn(
                  "p-4 rounded-lg border",
                  selectedTask.status === "approved"
                    ? "bg-success-50 border-success-100"
                    : "bg-danger-50 border-danger-100"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs font-medium mb-2",
                    selectedTask.status === "approved"
                      ? "text-success-700"
                      : "text-danger-700"
                  )}
                >
                  {selectedTask.status === "approved" ? (
                    <ThumbsUp size={14} />
                  ) : (
                    <ThumbsDown size={14} />
                  )}
                  审核意见
                  {selectedTask.reviewedAt && (
                    <span className="font-normal ml-2 opacity-70">
                      审核于 {selectedTask.reviewedAt}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-700">
                  {selectedTask.reviewComment}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      <Modal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        title="提交整改内容"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowSubmit(false)}>
              取消
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!submitContent.trim()}
            >
              确认提交
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-slate-600">
            请详细描述整改措施和修改内容：
          </div>
          <textarea
            value={submitContent}
            onChange={(e) => setSubmitContent(e.target.value)}
            rows={6}
            placeholder="例如：已将 cust_status 字段取值从中文'正常'修改为标准枚举值 ACTIVE，已同步更新所有存量数据..."
            className="input resize-none"
          />
        </div>
      </Modal>

      <Modal
        open={showReview}
        onClose={() => setShowReview(false)}
        title="审核整改结果"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowReview(false)}>
              取消
            </button>
            <button
              className={
                reviewForm.approved ? "btn-success" : "btn-danger"
              }
              onClick={handleReview}
            >
              {reviewForm.approved ? (
                <>
                  <ThumbsUp size={14} />
                  审核通过
                </>
              ) : (
                <>
                  <ThumbsDown size={14} />
                  驳回整改
                </>
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
            <div className="text-xs font-medium text-primary-700 mb-1">
              整改提交内容
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">
              {selectedTask?.rectificationContent || "（无提交内容）"}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setReviewForm({ ...reviewForm, approved: true })}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-left",
                reviewForm.approved
                  ? "border-success-500 bg-success-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <ThumbsUp
                  size={16}
                  className={
                    reviewForm.approved ? "text-success-600" : "text-slate-400"
                  }
                />
                审核通过
              </div>
              <div className="text-xs text-slate-500 mt-1">
                整改内容符合要求
              </div>
            </button>
            <button
              onClick={() => setReviewForm({ ...reviewForm, approved: false })}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-left",
                !reviewForm.approved
                  ? "border-danger-500 bg-danger-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <ThumbsDown
                  size={16}
                  className={
                    !reviewForm.approved ? "text-danger-600" : "text-slate-400"
                  }
                />
                驳回整改
              </div>
              <div className="text-xs text-slate-500 mt-1">
                需要重新整改
              </div>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              审核意见
            </label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              rows={3}
              placeholder="请填写审核意见..."
              className="input resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
