import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Play,
  Eye,
  ArrowRight,
  Upload,
  FileText,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderTree,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  getTaskStatusLabel,
  getTaskStatusColor,
} from "@/utils";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";
import type { FieldItem, StandardCategory } from "@/types";
import { cn } from "@/lib/utils";

export default function Tasks() {
  const { tasks, standardCategories, createTask, startInspection } =
    useAppStore();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    projectName: "",
  });
  const [uploadedFields, setUploadedFields] = useState<
    Omit<FieldItem, "id" | "taskId">[]
  >([]);
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [expandedCats, setExpandedCats] = useState<string[]>(["cat-root"]);

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchText.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalTasks = tasks.length;
  const inProgress = tasks.filter(
    (t) => t.status === "matching" || t.status === "inspecting" || t.status === "rectifying"
  ).length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const totalIssues = tasks.reduce((s, t) => s + t.issueCount, 0);

  const handleSimulateUpload = () => {
    const sampleFields: Omit<FieldItem, "id" | "taskId">[] = [
      { fieldName: "user_id", fieldDescription: "用户ID", dataType: "varchar(32)", tableName: "t_user", sampleValue: "U001" },
      { fieldName: "user_name", fieldDescription: "用户名", dataType: "varchar(50)", tableName: "t_user", sampleValue: "张三" },
      { fieldName: "user_phone", fieldDescription: "手机号", dataType: "varchar(11)", tableName: "t_user", sampleValue: "13800138000" },
      { fieldName: "UserEmail", fieldDescription: "邮箱", dataType: "varchar(100)", tableName: "t_user", sampleValue: "a@b.com" },
      { fieldName: "u_type", fieldDescription: "用户类型", dataType: "int", tableName: "t_user", sampleValue: "1" },
      { fieldName: "createTime", fieldDescription: "创建时间", dataType: "datetime", tableName: "t_user", sampleValue: "2026-01-01" },
      { fieldName: "u_status", fieldDescription: "用户状态", dataType: "varchar(10)", tableName: "t_user", sampleValue: "有效" },
      { fieldName: "remark", fieldDescription: "备注", dataType: "varchar(500)", tableName: "t_user", sampleValue: "" },
    ];
    setUploadedFields(sampleFields);
  };

  const toggleCat = (id: string) => {
    setExpandedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleStandard = (id: string) => {
    setSelectedStandards((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const renderCategory = (cat: StandardCategory, level = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedCats.includes(cat.id);
    const isSelected = selectedStandards.includes(cat.id);
    return (
      <div key={cat.id}>
        <div
          className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-50 cursor-pointer"
          style={{ paddingLeft: 8 + level * 20 }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleCat(cat.id)}
              className="p-0.5 text-slate-400 hover:text-slate-600"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleStandard(cat.id)}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          {hasChildren ? (
            <FolderTree size={14} className="text-primary-500" />
          ) : (
            <FileText size={14} className="text-slate-400" />
          )}
          <span className="text-sm text-slate-700">{cat.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>{cat.children!.map((c) => renderCategory(c, level + 1))}</div>
        )}
      </div>
    );
  };

  const handleCreateTask = () => {
    createTask(
      {
        name: formData.name || "新建检查任务",
        projectName: formData.projectName || "未命名项目",
        status: "matching",
        standardScope: selectedStandards,
      },
      uploadedFields
    );
    setShowCreate(false);
    setStep(1);
    setFormData({ name: "", projectName: "" });
    setUploadedFields([]);
    setSelectedStandards([]);
  };

  const steps = [
    { num: 1, label: "基本信息" },
    { num: 2, label: "上传字段" },
    { num: 3, label: "选择标准" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="检查任务总数"
          value={totalTasks}
          icon={<FileText size={22} />}
          color="primary"
          subtitle="全部检查任务"
        />
        <StatCard
          title="进行中任务"
          value={inProgress}
          icon={<Clock size={22} />}
          color="warning"
          subtitle="匹配/检查/整改阶段"
        />
        <StatCard
          title="已完成任务"
          value={completed}
          icon={<CheckCircle2 size={22} />}
          color="success"
          subtitle="验收通过的任务"
        />
        <StatCard
          title="待整改问题"
          value={totalIssues}
          icon={<AlertTriangle size={22} />}
          color="danger"
          subtitle="所有任务累计问题数"
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
                placeholder="搜索任务名称/项目..."
                className="w-64 pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1">
              <Filter size={14} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="matching">匹配中</option>
                <option value="inspecting">检查中</option>
                <option value="rectifying">整改中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            新建检查任务
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
                <th className="table-th">创建时间</th>
                <th className="table-th">更新时间</th>
                <th className="table-th text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="table-td">
                    <div className="font-medium text-slate-900">
                      {task.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {task.id}
                    </div>
                  </td>
                  <td className="table-td">{task.projectName}</td>
                  <td className="table-td">
                    <Badge className={getTaskStatusColor(task.status)}>
                      {getTaskStatusLabel(task.status)}
                    </Badge>
                  </td>
                  <td className="table-td font-mono text-sm">{task.fieldCount}</td>
                  <td className="table-td font-mono text-sm">
                    {task.fieldCount > 0
                      ? `${task.matchedCount} (${Math.round((task.matchedCount / task.fieldCount) * 100)}%)`
                      : "-"}
                  </td>
                  <td className="table-td">
                    <span
                      className={cn(
                        "font-mono text-sm",
                        task.issueCount > 0 ? "text-danger-600" : "text-slate-400"
                      )}
                    >
                      {task.issueCount}
                    </span>
                  </td>
                  <td className="table-td text-slate-500 text-sm">
                    {task.createdAt}
                  </td>
                  <td className="table-td text-slate-500 text-sm">
                    {task.updatedAt}
                  </td>
                  <td className="table-td">
                    <div className="flex items-center justify-end gap-1">
                      {task.status === "matching" && task.matchedCount > 0 && (
                        <button
                          onClick={() => startInspection(task.id)}
                          className="btn-ghost text-xs px-2 py-1 text-success-600 hover:bg-success-50"
                          title="开始检查"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      <Link
                        to={`/tasks/${task.id}/matching`}
                        className="btn-ghost text-xs px-2 py-1 text-primary-600 hover:bg-primary-50"
                        title="字段匹配"
                      >
                        <CheckSquare size={14} />
                      </Link>
                      <Link
                        to={`/tasks/${task.id}/issues`}
                        className="btn-ghost text-xs px-2 py-1 text-warning-600 hover:bg-warning-50"
                        title="问题清单"
                      >
                        <AlertTriangle size={14} />
                      </Link>
                      <Link
                        to={`/tasks/${task.id}/issues`}
                        className="btn-ghost text-xs px-2 py-1"
                        title="查看详情"
                      >
                        <Eye size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="table-td text-center py-12 text-slate-400"
                  >
                    暂无匹配的检查任务
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setStep(1);
        }}
        title="新建检查任务"
        size="lg"
        footer={
          <>
            {step > 1 && (
              <button
                className="btn-secondary"
                onClick={() => setStep(step - 1)}
              >
                上一步
              </button>
            )}
            {step < 3 ? (
              <button
                className="btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!formData.name || !formData.projectName)}
              >
                下一步
                <ArrowRight size={14} />
              </button>
            ) : (
              <button className="btn-primary" onClick={handleCreateTask}>
                创建任务
              </button>
            )}
          </>
        }
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                    step >= s.num
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  )}
                >
                  {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm font-medium",
                    step >= s.num ? "text-slate-800" : "text-slate-400"
                  )}
                >
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 mx-3 h-0.5 rounded",
                      step > s.num ? "bg-primary-500" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                任务名称 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例如：客户信息域Q3标准检查"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                关联项目 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                placeholder="例如：CRM客户管理系统升级"
                className="input"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer"
              onClick={handleSimulateUpload}
            >
              <Upload size={40} className="mx-auto text-slate-400 mb-3" />
              <div className="text-sm font-medium text-slate-700">
                点击上传或拖拽文件到此处
              </div>
              <div className="text-xs text-slate-500 mt-1">
                支持 CSV、Excel 格式（.csv, .xlsx）
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateUpload();
                }}
                className="btn-secondary mt-4 text-xs"
              >
                <Upload size={14} />
                模拟上传示例数据
              </button>
            </div>

            {uploadedFields.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 flex items-center justify-between">
                  <span>
                    已上传 <span className="text-primary-600">{uploadedFields.length}</span> 个字段
                  </span>
                  <button
                    onClick={() => setUploadedFields([])}
                    className="text-xs text-slate-500 hover:text-danger-600"
                  >
                    清空
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                          字段名
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                          描述
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                          类型
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                          表名
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedFields.map((f, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-mono text-slate-800">
                            {f.fieldName}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {f.fieldDescription}
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-500 text-xs">
                            {f.dataType}
                          </td>
                          <td className="px-3 py-2 text-slate-500 text-xs">
                            {f.tableName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              请选择本次检查适用的数据标准范围（可多选）：
            </div>
            <div className="border border-slate-200 rounded-lg p-3 max-h-80 overflow-y-auto bg-slate-50/50">
              {standardCategories.map((cat) => renderCategory(cat))}
            </div>
            <div className="text-xs text-slate-500">
              已选择 <span className="text-primary-600 font-medium">{selectedStandards.length}</span> 个标准分类
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
