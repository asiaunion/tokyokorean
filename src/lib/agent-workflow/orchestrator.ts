import { parseAuthorNotes } from "@/lib/author-notes/parser";
import {
  buildClaimMap,
  buildDraftBundle,
  buildDraftCandidates,
  composeMarkdown,
  buildTranslationsFromKoFinal,
  splitFrontmatter,
  synthesizeDraftCandidates,
} from "@/lib/content-engine/generator";
import { tryGenerateKoDraftWithLlm } from "@/lib/content-engine/llmKoWriter";
import {
  BlogWorkflowStateMachine,
  FileWorkflowStorage,
} from "@/lib/agent-workflow/stateMachine";
import type { BlogWorkflowState, TransitionInput } from "@/lib/agent-workflow/types";
import {
  InMemoryResearchProvider,
  type ResearchProvider,
} from "@/lib/research-adapter/provider";
import { buildResearchPack } from "@/lib/research-adapter/normalizer";
import {
  applyPublishPlan,
  ensureUniqueSlug,
  preparePublishPlan,
  slugify,
} from "@/lib/publish/repoPublisher";
import { runBlogValidation } from "@/lib/validation/validationGates";

export class BlogAgentOrchestrator {
  private readonly machine: BlogWorkflowStateMachine;
  private readonly candidateCount: number;
  private readonly koWriterProvider: string;
  constructor(
    private readonly researchProvider: ResearchProvider = new InMemoryResearchProvider()
  ) {
    this.machine = new BlogWorkflowStateMachine(new FileWorkflowStorage());
    const parsed = Number(process.env.BLOG_CANDIDATE_COUNT ?? "2");
    this.candidateCount = Number.isFinite(parsed) ? Math.max(1, Math.min(3, parsed)) : 2;
    this.koWriterProvider = String(process.env.BLOG_KO_WRITER_PROVIDER ?? "template");
  }

  async start(keyword: string) {
    const state = await this.machine.create(keyword);
    const raw = await this.researchProvider.collect(keyword);
    const researchPack = buildResearchPack(keyword, raw, 12);
    const claimMap = buildClaimMap(researchPack);
    await this.machine.recordOutput(state.workflowId, "RESEARCH_READY", {
      researchPack,
      claimMap,
    });
    await this.machine.forceStage(state.workflowId, "RESEARCH_READY");
    return this.machine.get(state.workflowId);
  }

  async approve(workflowId: string, approval: TransitionInput) {
    return this.machine.approveAndAdvance(workflowId, approval);
  }

  async addMemo(workflowId: string, rawMemo: string) {
    const parsed = parseAuthorNotes(rawMemo);
    return this.machine.setNotes(workflowId, rawMemo, parsed as unknown as Record<string, unknown>);
  }

  async generateDraftV1(workflowId: string) {
    const state = await this.machine.get(workflowId);
    const researchPack = state.outputs.RESEARCH_READY?.researchPack;
    if (!researchPack) throw new Error("missing research pack");
    const notes = parseAuthorNotes(state.notes?.rawMemo ?? "");
    const draftCandidates = buildDraftCandidates(
      researchPack as Parameters<typeof buildDraftBundle>[0],
      notes,
      this.candidateCount
    );
    const synthesizedDraft = synthesizeDraftCandidates(
      draftCandidates,
      String((researchPack as Parameters<typeof buildDraftBundle>[0]).keyword ?? "")
    );
    const drafts = buildDraftBundle(
      researchPack as Parameters<typeof buildDraftBundle>[0],
      notes
    );
    let koMarkdown = drafts.koV1;
    let llmMeta: Record<string, unknown> = {
      used: false,
      providerMode: this.koWriterProvider,
    };
    try {
      const llm = await tryGenerateKoDraftWithLlm(
        researchPack as Parameters<typeof buildDraftBundle>[0],
        notes
      );
      if (llm?.body) {
        const { frontmatter } = splitFrontmatter(drafts.koV1);
        koMarkdown = composeMarkdown(frontmatter, llm.body);
        llmMeta = {
          used: true,
          providerMode: this.koWriterProvider,
          provider: llm.provider,
          model: llm.model,
        };
      } else {
        llmMeta = {
          used: false,
          providerMode: this.koWriterProvider,
          fallbackReason: "provider disabled or template mode",
        };
      }
    } catch (error) {
      llmMeta = {
        used: false,
        providerMode: this.koWriterProvider,
        fallbackReason: error instanceof Error ? error.message : "unknown llm error",
      };
    }
    await this.machine.recordOutput(workflowId, "DRAFT_V1", {
      koMarkdown,
      draftCandidates,
      synthesizedDraft,
      llmMeta,
    });
    await this.machine.forceStage(workflowId, "DRAFT_V1");
    return this.machine.get(workflowId);
  }

  async generateKoFinal(workflowId: string, extraSearchNotes = "") {
    const state = await this.machine.get(workflowId);
    const researchPack = state.outputs.RESEARCH_READY?.researchPack;
    if (!researchPack) throw new Error("missing research pack");
    const notes = parseAuthorNotes(`${state.notes?.rawMemo ?? ""}\n${extraSearchNotes}`);
    const draftCandidates = buildDraftCandidates(
      researchPack as Parameters<typeof buildDraftBundle>[0],
      notes,
      this.candidateCount
    );
    const synthesizedDraft = synthesizeDraftCandidates(
      draftCandidates,
      String((researchPack as Parameters<typeof buildDraftBundle>[0]).keyword ?? "")
    );
    const drafts = buildDraftBundle(
      researchPack as Parameters<typeof buildDraftBundle>[0],
      notes
    );
    let koMarkdown = drafts.koV2;
    let llmMeta: Record<string, unknown> = {
      used: false,
      providerMode: this.koWriterProvider,
    };
    try {
      const llm = await tryGenerateKoDraftWithLlm(
        researchPack as Parameters<typeof buildDraftBundle>[0],
        notes,
        extraSearchNotes
      );
      if (llm?.body) {
        const { frontmatter } = splitFrontmatter(drafts.koV2);
        koMarkdown = composeMarkdown(frontmatter, llm.body);
        llmMeta = {
          used: true,
          providerMode: this.koWriterProvider,
          provider: llm.provider,
          model: llm.model,
        };
      } else {
        llmMeta = {
          used: false,
          providerMode: this.koWriterProvider,
          fallbackReason: "provider disabled or template mode",
        };
      }
    } catch (error) {
      llmMeta = {
        used: false,
        providerMode: this.koWriterProvider,
        fallbackReason: error instanceof Error ? error.message : "unknown llm error",
      };
    }
    await this.machine.recordOutput(workflowId, "KO_FINAL", {
      koMarkdown,
      draftCandidates,
      synthesizedDraft,
      llmMeta,
    });
    await this.machine.forceStage(workflowId, "KO_FINAL");
    return this.machine.get(workflowId);
  }

  async generateTranslations(workflowId: string) {
    const state = await this.machine.get(workflowId);
    const koFinalFromSync = state.outputs.KO_FINAL?.koMarkdown;
    let enMarkdown = "";
    let jaMarkdown = "";
    let koFinalMarkdown = "";
    if (typeof koFinalFromSync === "string" && koFinalFromSync.trim()) {
      const translated = buildTranslationsFromKoFinal(koFinalFromSync);
      enMarkdown = translated.en;
      jaMarkdown = translated.ja;
      koFinalMarkdown = koFinalFromSync;
    } else {
      const researchPack = state.outputs.RESEARCH_READY?.researchPack;
      if (!researchPack) throw new Error("missing research pack");
      const notes = parseAuthorNotes(state.notes?.rawMemo ?? "");
      const drafts = buildDraftBundle(
        researchPack as Parameters<typeof buildDraftBundle>[0],
        notes
      );
      enMarkdown = drafts.en;
      jaMarkdown = drafts.ja;
      koFinalMarkdown = drafts.koV2;
    }
    await this.machine.recordOutput(workflowId, "TRANSLATED", {
      enMarkdown,
      jaMarkdown,
      koFinalMarkdown,
    });
    await this.machine.forceStage(workflowId, "TRANSLATED");
    return this.machine.get(workflowId);
  }

  async syncKoMarkdown(workflowId: string, koMarkdown: string) {
    if (!koMarkdown.trim()) throw new Error("ko markdown is empty");
    await this.machine.recordOutput(workflowId, "KO_FINAL", { koMarkdown });
    await this.machine.forceStage(workflowId, "KO_FINAL");
    return this.machine.get(workflowId);
  }

  async syncTranslations(workflowId: string, enMarkdown: string, jaMarkdown: string) {
    const state = await this.machine.get(workflowId);
    const koFinalMarkdown = String(state.outputs.KO_FINAL?.koMarkdown ?? "");
    if (!koFinalMarkdown) throw new Error("missing ko final markdown");
    await this.machine.recordOutput(workflowId, "TRANSLATED", {
      koFinalMarkdown,
      enMarkdown,
      jaMarkdown,
    });
    await this.machine.forceStage(workflowId, "TRANSLATED");
    return this.machine.get(workflowId);
  }

  async preparePublish(workflowId: string) {
    const state = await this.machine.get(workflowId);
    const translated = state.outputs.TRANSLATED;
    if (!translated) throw new Error("missing translated output");
    const slugBase = slugify(state.keyword);
    const slug = await ensureUniqueSlug(slugBase);
    const plan = await preparePublishPlan({
      slug,
      ko: String(translated.koFinalMarkdown ?? ""),
      en: String(translated.enMarkdown ?? ""),
      ja: String(translated.jaMarkdown ?? ""),
    });
    await this.machine.recordOutput(workflowId, "READY_TO_PUBLISH", {
      slug: plan.slug,
      dryRunDiff: plan.dryRunDiff,
      targets: plan.targets,
    });
    await this.machine.forceStage(workflowId, "READY_TO_PUBLISH");
    return this.machine.get(workflowId);
  }

  async applyPublish(workflowId: string): Promise<BlogWorkflowState> {
    const state = await this.machine.get(workflowId);
    const translated = state.outputs.TRANSLATED;
    const ready = state.outputs.READY_TO_PUBLISH;
    if (!translated || !ready) throw new Error("missing publish plan");
    const slug = String(ready.slug ?? "");
    const targets = ready.targets as Record<string, string> | undefined;
    if (!slug || !targets) throw new Error("invalid publish plan");
    const candidates = [
      String(translated.koFinalMarkdown ?? ""),
      String(translated.enMarkdown ?? ""),
      String(translated.jaMarkdown ?? ""),
    ];
    const validation = await runBlogValidation(process.cwd(), candidates);
    if (!validation.ok) {
      await this.machine.recordOutput(workflowId, "READY_TO_PUBLISH", {
        validation,
        blocked: true,
      });
      throw new Error(`validation failed: ${JSON.stringify(validation.checks)}`);
    }
    await applyPublishPlan({
      slug,
      ko: candidates[0],
      en: candidates[1],
      ja: candidates[2],
    });
    await this.machine.recordOutput(workflowId, "PUBLISHED", {
      slug,
      targetPaths: Object.values(targets),
      appliedAt: new Date().toISOString(),
      validation,
    });
    await this.machine.forceStage(workflowId, "PUBLISHED");
    return this.machine.get(workflowId);
  }

  async get(workflowId: string) {
    return this.machine.get(workflowId);
  }
}
