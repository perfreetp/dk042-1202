import { create } from "zustand";
import type {
  InspectionTask,
  FieldItem,
  StandardField,
  StandardCategory,
  MatchResult,
  InspectionIssue,
  RectificationTask,
} from "@/types";
import {
  mockTasks,
  mockFields,
  mockStandardFields,
  mockCategories,
  mockMatchResults,
  mockIssues,
  mockRectificationTasks,
  assignees as mockAssignees,
} from "@/mock";
import { generateId } from "@/utils";

interface AppState {
  tasks: InspectionTask[];
  fields: FieldItem[];
  standardFields: StandardField[];
  standardCategories: StandardCategory[];
  matchResults: MatchResult[];
  issues: InspectionIssue[];
  rectificationTasks: RectificationTask[];
  assignees: string[];
  selectedTaskId: string | null;

  setSelectedTaskId: (id: string | null) => void;

  createTask: (
    task: Omit<InspectionTask, "id" | "createdAt" | "updatedAt" | "fieldCount" | "matchedCount" | "issueCount">,
    fields: Omit<FieldItem, "id" | "taskId">[]
  ) => void;

  confirmMatch: (matchId: string, standardFieldId: string) => void;
  rejectMatch: (matchId: string) => void;

  markFalsePositive: (issueIds: string[]) => void;
  assignRectification: (
    issueIds: string[],
    assignee: string,
    deadline: string
  ) => void;

  submitRectification: (rectId: string, content: string) => void;
  reviewRectification: (
    rectId: string,
    approved: boolean,
    comment: string
  ) => void;

  startInspection: (taskId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: mockTasks,
  fields: mockFields,
  standardFields: mockStandardFields,
  standardCategories: mockCategories,
  matchResults: mockMatchResults,
  issues: mockIssues,
  rectificationTasks: mockRectificationTasks,
  assignees: mockAssignees,
  selectedTaskId: null,

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  createTask: (taskData, fieldData) => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const newTaskId = "task-" + generateId();
    const newTask: InspectionTask = {
      ...taskData,
      id: newTaskId,
      fieldCount: fieldData.length,
      matchedCount: 0,
      issueCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const newFields: FieldItem[] = fieldData.map((f) => ({
      ...f,
      id: "f-" + generateId(),
      taskId: newTaskId,
    }));
    const newMatches: MatchResult[] = newFields.map((f) => ({
      id: "m-" + generateId(),
      fieldId: f.id,
      matchScore: 0.5 + Math.random() * 0.4,
      status: "pending",
      candidates: get().standardFields.slice(0, 3).map((sf) => ({
        standardFieldId: sf.id,
        score: 0.4 + Math.random() * 0.5,
      })),
    }));
    set((state) => ({
      tasks: [newTask, ...state.tasks],
      fields: [...state.fields, ...newFields],
      matchResults: [...state.matchResults, ...newMatches],
      selectedTaskId: newTaskId,
    }));
  },

  confirmMatch: (matchId, standardFieldId) => {
    set((state) => {
      const match = state.matchResults.find((m) => m.id === matchId);
      if (!match) return state;
      const updatedMatches = state.matchResults.map((m) =>
        m.id === matchId
          ? { ...m, standardFieldId, status: "confirmed" as const }
          : m
      );
      const confirmedCount = updatedMatches.filter(
        (m) => m.status === "confirmed" && m.fieldId
      ).length;
      const task = state.fields.find((f) => f.id === match.fieldId)?.taskId;
      const updatedTasks = state.tasks.map((t) =>
        t.id === task ? { ...t, matchedCount: confirmedCount, updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19) } : t
      );
      return { matchResults: updatedMatches, tasks: updatedTasks };
    });
  },

  rejectMatch: (matchId) => {
    set((state) => ({
      matchResults: state.matchResults.map((m) =>
        m.id === matchId ? { ...m, status: "rejected" as const } : m
      ),
    }));
  },

  markFalsePositive: (issueIds) => {
    set((state) => ({
      issues: state.issues.map((i) =>
        issueIds.includes(i.id)
          ? { ...i, status: "false_positive" as const }
          : i
      ),
    }));
  },

  assignRectification: (issueIds, assignee, deadline) => {
    set((state) => {
      const newRects: RectificationTask[] = issueIds
        .map((issueId) => {
          const issue = state.issues.find((i) => i.id === issueId);
          if (!issue) return null;
          return {
            id: "rect-" + generateId(),
            issueId,
            taskId: issue.taskId,
            assignee,
            deadline,
            status: "pending" as const,
            issueDetail: issue,
          };
        })
        .filter(Boolean) as RectificationTask[];
      const updatedIssues = state.issues.map((i) =>
        issueIds.includes(i.id)
          ? { ...i, status: "rectifying" as const, assignee, deadline }
          : i
      );
      return {
        rectificationTasks: [...state.rectificationTasks, ...newRects],
        issues: updatedIssues,
      };
    });
  },

  submitRectification: (rectId, content) => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    set((state) => ({
      rectificationTasks: state.rectificationTasks.map((r) =>
        r.id === rectId
          ? {
              ...r,
              status: "submitted" as const,
              rectificationContent: content,
              submittedAt: now,
            }
          : r
      ),
    }));
  },

  reviewRectification: (rectId, approved, comment) => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    set((state) => {
      const rect = state.rectificationTasks.find((r) => r.id === rectId);
      if (!rect) return state;
      const updatedRects = state.rectificationTasks.map((r) =>
        r.id === rectId
          ? {
              ...r,
              status: (approved ? "approved" : "rejected") as RectificationTask["status"],
              reviewedAt: now,
              reviewComment: comment,
            }
          : r
      );
      const updatedIssues = state.issues.map((i) =>
        i.id === rect.issueId && approved
          ? { ...i, status: "resolved" as const }
          : i.id === rect.issueId && !approved
          ? { ...i, status: "rectifying" as const }
          : i
      );
      return { rectificationTasks: updatedRects, issues: updatedIssues };
    });
  },

  startInspection: (taskId) => {
    set((state) => {
      const taskFields = state.fields.filter((f) => f.taskId === taskId);
      const newIssues: InspectionIssue[] = taskFields
        .filter((_, idx) => idx % 2 === 0)
        .map((f, idx) => {
          const types: InspectionIssue["issueType"][] = [
            "naming",
            "value_range",
            "data_type",
            "naming",
          ];
          const severities: InspectionIssue["severity"][] = [
            "high",
            "medium",
            "low",
            "medium",
          ];
          return {
            id: "iss-" + generateId(),
            taskId,
            fieldId: f.id,
            fieldName: f.fieldName,
            issueType: types[idx % types.length],
            severity: severities[idx % severities.length],
            currentValue: `${f.fieldName}，当前定义需要检查`,
            standardRequirement: "请参考数据标准规范",
            suggestion: "建议按照标准规范进行修改",
            status: "open" as const,
          };
        });
      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "inspecting" as const,
                issueCount: newIssues.length,
                updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
              }
            : t
        ),
        issues: [...state.issues, ...newIssues],
      };
    });
  },
}));
