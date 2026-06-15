import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * EditorToolbar — Milkdown Crepe용 커스텀 React 툴바
 *
 * ■ 올바른 Milkdown 커맨드 실행 패턴:
 *   crepe.editor.action((ctx) => {
 *     const commands = ctx.get(commandsCtx);       // commandsCtx = @milkdown/kit/core 슬라이스 키
 *     commands.call(toggleStrongCommand.key);       // $command 래퍼의 .key 프로퍼티 사용
 *   });
 *
 * ■ 활성 마크 감지:
 *   crepe.editor.action((ctx) => {
 *     const view = ctx.get(editorViewCtx);         // ProseMirror EditorView 인스턴스
 *     view.state.selection → marks
 *   });
 */

interface ToolbarProps {
  crepeRef: React.MutableRefObject<any>;
}

type ButtonStyle = "normal" | "bold" | "italic" | "strike" | "mono";

type ToolButton = {
  type: "button";
  id: string;
  label: string;
  title: string;
  runnerKey: string;
  markName?: string;
  style?: ButtonStyle;
};
type ToolSeparator = { type: "separator" };
type ToolItem = ToolButton | ToolSeparator;

const TOOLS: ToolItem[] = [
  { type: "button", id: "bold",        label: "B",    title: "굵게 (Cmd+B)",   runnerKey: "bold",        markName: "strong",         style: "bold" },
  { type: "button", id: "italic",      label: "I",    title: "기울임 (Cmd+I)", runnerKey: "italic",      markName: "emphasis",       style: "italic" },
  { type: "button", id: "strike",      label: "S",    title: "취소선",          runnerKey: "strike",      markName: "strike_through", style: "strike" },
  { type: "button", id: "code-inline", label: "</>",  title: "인라인 코드",     runnerKey: "codeInline",  markName: "inlineCode",     style: "mono" },
  { type: "separator" },
  { type: "button", id: "h1",          label: "H1",   title: "제목 1",          runnerKey: "h1" },
  { type: "button", id: "h2",          label: "H2",   title: "제목 2",          runnerKey: "h2" },
  { type: "button", id: "h3",          label: "H3",   title: "제목 3",          runnerKey: "h3" },
  { type: "separator" },
  { type: "button", id: "bullet",      label: "• ≡",  title: "글머리 기호",     runnerKey: "bullet" },
  { type: "button", id: "ordered",     label: "1. ≡", title: "번호 목록",       runnerKey: "ordered" },
  { type: "button", id: "blockquote",  label: "❝",    title: "인용구",          runnerKey: "blockquote" },
  { type: "separator" },
  { type: "button", id: "code-block",  label: "{ }",  title: "코드 블록",       runnerKey: "codeBlock",  style: "mono" },
  { type: "button", id: "hr",          label: "─",    title: "구분선",          runnerKey: "hr" },
];

// ─────────────────────────────────────────────
// 모듈 캐시 (컴포넌트 외부 싱글톤 — 중복 로드 방지)
// ─────────────────────────────────────────────
type MilkdownMods = {
  commandsCtx: any;
  editorViewCtx: any;
  toggleStrongCommand: any;
  toggleEmphasisCommand: any;
  toggleInlineCodeCommand: any;
  toggleStrikethroughCommand: any | null;
  wrapInBulletListCommand: any;
  wrapInOrderedListCommand: any;
  wrapInBlockquoteCommand: any;
  createCodeBlockCommand: any;
  insertHrCommand: any;
  wrapInHeadingCommand: any;
};

let _modsCache: MilkdownMods | null = null;
let _modsPromise: Promise<MilkdownMods> | null = null;

function loadMilkdownMods(): Promise<MilkdownMods> {
  if (_modsCache) return Promise.resolve(_modsCache);
  if (_modsPromise) return _modsPromise;

  _modsPromise = Promise.all([
    import("@milkdown/kit/core"),
    import("@milkdown/kit/preset/commonmark"),
    import("@milkdown/kit/preset/gfm").catch(() => ({}) as any),
  ]).then(([core, cm, gfm]) => {
    _modsCache = {
      commandsCtx:                core.commandsCtx,
      editorViewCtx:              core.editorViewCtx,
      toggleStrongCommand:        cm.toggleStrongCommand,
      toggleEmphasisCommand:      cm.toggleEmphasisCommand,
      toggleInlineCodeCommand:    cm.toggleInlineCodeCommand,
      toggleStrikethroughCommand: (gfm as any).toggleStrikethroughCommand ?? null,
      wrapInBulletListCommand:    cm.wrapInBulletListCommand,
      wrapInOrderedListCommand:   cm.wrapInOrderedListCommand,
      wrapInBlockquoteCommand:    cm.wrapInBlockquoteCommand,
      createCodeBlockCommand:     cm.createCodeBlockCommand,
      insertHrCommand:            cm.insertHrCommand,
      wrapInHeadingCommand:       cm.wrapInHeadingCommand,
    };
    return _modsCache;
  });

  return _modsPromise;
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function EditorToolbar({ crepeRef }: ToolbarProps) {
  const [activeMarks, setActiveMarks] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const modsRef = useRef<MilkdownMods | null>(null);

  // 1) 모듈 사전 로드
  useEffect(() => {
    loadMilkdownMods().then((mods) => {
      modsRef.current = mods;
      setReady(true);
    }).catch(() => {
      /* silent fail */
    });
  }, []);

  // 2) 200ms 폴링 — ProseMirror selection 기반 활성 마크 감지
  useEffect(() => {
    const interval = setInterval(() => {
      const crepe = crepeRef.current;
      const mods = modsRef.current;
      if (!crepe?.editor || !mods) return;

      try {
        crepe.editor.action((ctx: any) => {
          try {
            // editorViewCtx 슬라이스로 ProseMirror EditorView 접근
            const view = ctx.get(mods.editorViewCtx);
            if (!view?.state) return;

            const { state } = view;
            const { from, to, empty } = state.selection;
            const marks = new Set<string>();

            if (!empty) {
              state.doc.nodesBetween(from, to, (node: any) => {
                node.marks?.forEach((m: any) => marks.add(m.type.name));
              });
            } else {
              // 커서 위치: storedMarks 우선, 없으면 주변 마크
              const stored = state.storedMarks;
              if (stored?.length) {
                stored.forEach((m: any) => marks.add(m.type.name));
              } else {
                const $pos = state.doc.resolve(from);
                $pos.marks?.().forEach?.((m: any) => marks.add(m.type.name));
              }
            }

            setActiveMarks((prev) => {
              // 실제로 변경됐을 때만 setState (불필요한 리렌더 방지)
              const same =
                prev.size === marks.size &&
                [...marks].every((m) => prev.has(m));
              return same ? prev : marks;
            });
          } catch { /* ignore */ }
        });
      } catch { /* ignore */ }
    }, 200);

    return () => clearInterval(interval);
  }, [crepeRef]);

  // 3) 커맨드 실행 — ctx.get(commandsCtx) + commands.call(cmd.key, payload?)
  const runCommand = useCallback((runnerKey: string) => {
    const crepe = crepeRef.current;
    const mods = modsRef.current;
    if (!crepe?.editor || !mods) return;

    try {
      crepe.editor.action((ctx: any) => {
        try {
          const commands = ctx.get(mods.commandsCtx);
          if (!commands) return;

          switch (runnerKey) {
            case "bold":
              commands.call(mods.toggleStrongCommand.key);
              break;
            case "italic":
              commands.call(mods.toggleEmphasisCommand.key);
              break;
            case "strike":
              if (mods.toggleStrikethroughCommand) {
                commands.call(mods.toggleStrikethroughCommand.key);
              }
              break;
            case "codeInline":
              commands.call(mods.toggleInlineCodeCommand.key);
              break;
            case "h1":
              commands.call(mods.wrapInHeadingCommand.key, 1);
              break;
            case "h2":
              commands.call(mods.wrapInHeadingCommand.key, 2);
              break;
            case "h3":
              commands.call(mods.wrapInHeadingCommand.key, 3);
              break;
            case "bullet":
              commands.call(mods.wrapInBulletListCommand.key);
              break;
            case "ordered":
              commands.call(mods.wrapInOrderedListCommand.key);
              break;
            case "blockquote":
              commands.call(mods.wrapInBlockquoteCommand.key);
              break;
            case "codeBlock":
              commands.call(mods.createCodeBlockCommand.key);
              break;
            case "hr":
              commands.call(mods.insertHrCommand.key);
              break;
          }
        } catch { /* ignore */ }
      });
    } catch { /* ignore */ }
  }, [crepeRef]);

  // ─────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────
  return (
    <div
      className="flex items-center gap-0.5 px-2 py-1 bg-muted/60 border border-border rounded-xl mb-1.5 flex-wrap"
      role="toolbar"
      aria-label="텍스트 서식"
      // 마우스다운 시 에디터 포커스를 빼앗기지 않음 (핵심!)
      onMouseDown={(e) => e.preventDefault()}
    >
      {TOOLS.map((tool, idx) => {
        if (tool.type === "separator") {
          return (
            <div
              key={`sep-${idx}`}
              className="w-px h-4 bg-border/70 mx-1 shrink-0"
              aria-hidden
            />
          );
        }

        const isActive = tool.markName ? activeMarks.has(tool.markName) : false;

        return (
          <button
            key={tool.id}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            aria-pressed={isActive}
            disabled={!ready}
            onMouseDown={(e) => {
              e.preventDefault();
              runCommand(tool.runnerKey);
            }}
            className={[
              "px-2 py-0.5 min-w-[28px] text-center rounded-md text-[11px] transition-all duration-100 select-none",
              ready ? "cursor-pointer" : "cursor-not-allowed opacity-40",
              isActive
                ? "bg-accent/90 text-background font-bold"
                : "text-foreground/60 hover:bg-card-bg hover:text-foreground",
              tool.style === "bold"   ? "font-black"          : "",
              tool.style === "italic" ? "italic"              : "",
              tool.style === "strike" ? "line-through"        : "",
              tool.style === "mono"   ? "font-mono text-[10px]" : "",
            ].filter(Boolean).join(" ")}
          >
            {tool.label}
          </button>
        );
      })}
    </div>
  );
}
