import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  ApprovalGate,
  BlogWorkflowState,
  TransitionInput,
  WorkflowStorage,
} from "@/lib/agent-workflow/types";

const DATA_DIR = path.resolve(process.cwd(), ".blog-agent-workflows");

function now() {
  return new Date().toISOString();
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function gateForStage(stage: BlogWorkflowState["stage"]): ApprovalGate | null {
  if (stage === "RESEARCH_READY") return "research";
  if (stage === "DRAFT_V1") return "draft_v1";
  if (stage === "KO_FINAL") return "ko_final";
  if (stage === "TRANSLATED") return "translations";
  if (stage === "READY_TO_PUBLISH") return "publish";
  return null;
}

function nextStage(stage: BlogWorkflowState["stage"]): BlogWorkflowState["stage"] {
  if (stage === "IDEA") return "RESEARCH_READY";
  if (stage === "RESEARCH_READY") return "DRAFT_V1";
  if (stage === "DRAFT_V1") return "REVISION";
  if (stage === "REVISION") return "KO_FINAL";
  if (stage === "KO_FINAL") return "TRANSLATED";
  if (stage === "TRANSLATED") return "READY_TO_PUBLISH";
  if (stage === "READY_TO_PUBLISH") return "READY_TO_PUBLISH";
  return "PUBLISHED";
}

export class FileWorkflowStorage implements WorkflowStorage {
  private filePath(workflowId: string) {
    return path.join(DATA_DIR, `${workflowId}.json`);
  }

  async save(state: BlogWorkflowState) {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(this.filePath(state.workflowId), JSON.stringify(state, null, 2), "utf8");
  }

  async load(workflowId: string) {
    const raw = await readFile(this.filePath(workflowId), "utf8");
    return JSON.parse(raw) as BlogWorkflowState;
  }

  async exists(workflowId: string) {
    try {
      await readFile(this.filePath(workflowId), "utf8");
      return true;
    } catch {
      return false;
    }
  }
}

export class BlogWorkflowStateMachine {
  constructor(private readonly storage: WorkflowStorage = new FileWorkflowStorage()) {}

  async create(keyword: string) {
    assert(keyword.trim().length > 1, "keyword is required");
    const state: BlogWorkflowState = {
      workflowId: randomUUID(),
      keyword: keyword.trim(),
      stage: "IDEA",
      locale: "ko",
      createdAt: now(),
      updatedAt: now(),
      approvals: {},
      outputs: {},
    };
    await this.storage.save(state);
    return state;
  }

  async get(workflowId: string) {
    return this.storage.load(workflowId);
  }

  async recordOutput(
    workflowId: string,
    stage: BlogWorkflowState["stage"],
    payload: Record<string, unknown>
  ) {
    const state = await this.storage.load(workflowId);
    state.outputs[stage] = payload;
    state.updatedAt = now();
    await this.storage.save(state);
    return state;
  }

  async setNotes(workflowId: string, rawMemo: string, parsed: Record<string, unknown>) {
    const state = await this.storage.load(workflowId);
    state.notes = { rawMemo, parsed };
    state.updatedAt = now();
    await this.storage.save(state);
    return state;
  }

  async approveAndAdvance(workflowId: string, input: TransitionInput) {
    const state = await this.storage.load(workflowId);
    const expectedGate = gateForStage(state.stage);
    assert(expectedGate !== null, `stage ${state.stage} does not require approval`);
    assert(expectedGate === input.gate, `expected gate ${expectedGate}, received ${input.gate}`);
    assert(input.token.trim().length >= 8, "approval token must be 8+ characters");

    state.approvals[input.gate] = {
      gate: input.gate,
      token: input.token,
      approvedBy: input.approver,
      approvedAt: now(),
    };
    if (input.gate !== "publish") {
      state.stage = nextStage(state.stage);
    }
    state.updatedAt = now();
    await this.storage.save(state);
    return state;
  }

  async forceStage(workflowId: string, stage: BlogWorkflowState["stage"]) {
    const state = await this.storage.load(workflowId);
    state.stage = stage;
    state.updatedAt = now();
    await this.storage.save(state);
    return state;
  }
}
