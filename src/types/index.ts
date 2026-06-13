export type TaskStatus =
  | "draft"
  | "matching"
  | "inspecting"
  | "rectifying"
  | "completed";

export type MatchStatus = "pending" | "confirmed" | "rejected";

export type IssueType = "naming" | "value_range" | "data_type" | "format";

export type IssueSeverity = "high" | "medium" | "low";

export type IssueStatus = "open" | "false_positive" | "rectifying" | "resolved";

export type RectificationStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected";

export interface InspectionTask {
  id: string;
  name: string;
  projectName: string;
  status: TaskStatus;
  fieldCount: number;
  matchedCount: number;
  issueCount: number;
  standardScope: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FieldItem {
  id: string;
  taskId: string;
  fieldName: string;
  fieldDescription: string;
  dataType: string;
  sampleValue?: string;
  tableName: string;
}

export interface StandardCategory {
  id: string;
  name: string;
  parentId?: string;
  children?: StandardCategory[];
}

export interface StandardField {
  id: string;
  standardCode: string;
  fieldName: string;
  fieldDescription: string;
  dataType: string;
  valueRange?: string[];
  namingRule: string;
  categoryId: string;
}

export interface MatchCandidate {
  standardFieldId: string;
  score: number;
}

export interface MatchResult {
  id: string;
  fieldId: string;
  standardFieldId?: string;
  matchScore: number;
  status: MatchStatus;
  candidates?: MatchCandidate[];
}

export interface InspectionIssue {
  id: string;
  taskId: string;
  fieldId: string;
  fieldName: string;
  issueType: IssueType;
  severity: IssueSeverity;
  currentValue: string;
  standardRequirement: string;
  suggestion: string;
  status: IssueStatus;
  assignee?: string;
  deadline?: string;
}

export interface RectificationTask {
  id: string;
  issueId: string;
  taskId: string;
  assignee: string;
  deadline: string;
  status: RectificationStatus;
  rectificationContent?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewComment?: string;
  issueDetail?: InspectionIssue;
}
