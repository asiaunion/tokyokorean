export type WorkflowStage =
  | "IDEA"
  | "RESEARCH_READY"
  | "DRAFT_V1"
  | "REVISION"
  | "KO_FINAL"
  | "TRANSLATED"
  | "READY_TO_PUBLISH"
  | "PUBLISHED";

export type ApprovalGate =
  | "research"
  | "draft_v1"
  | "ko_final"
  | "translations"
  | "publish";

export type StageOutput = Record<string, unknown>;

export interface WorkflowApproval {
  gate: ApprovalGate;
  token: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface BlogWorkflowState {
  workflowId: string;
  keyword: string;
  stage: WorkflowStage;
  locale: "ko";
  createdAt: string;
  updatedAt: string;
  approvals: Partial<Record<ApprovalGate, WorkflowApproval>>;
  outputs: Partial<Record<WorkflowStage, StageOutput>>;
  notes?: {
    rawMemo: string;
    parsed: Record<string, unknown>;
  };
  publish?: {
    slug: string;
    dryRunDiff: string;
    targetPaths: string[];
    appliedAt?: string;
  };
}

export interface TransitionInput {
  gate: ApprovalGate;
  token: string;
  approver?: string;
}

export interface WorkflowStorage {
  save(state: BlogWorkflowState): Promise<void>;
  load(workflowId: string): Promise<BlogWorkflowState>;
  exists(workflowId: string): Promise<boolean>;
}
