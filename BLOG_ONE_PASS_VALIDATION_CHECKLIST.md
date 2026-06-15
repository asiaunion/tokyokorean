# Blog One-Pass Validation Checklist

## Run Info
- date:
- operator:
- profile: balanced-5
- provider: anthropic | openai | gemini | template
- model:
- keyword:

## Preflight
- [ ] `BLOG_KO_WRITER_PROVIDER` 설정 완료
- [ ] `BLOG_KO_WRITER_MODEL` 설정 완료
- [ ] API key 설정 완료 (`ANTHROPIC_API_KEY`/`OPENAI_API_KEY`/`GEMINI_API_KEY`)
- [ ] blog-agent / telegram bot 재시작 완료

## Execution Steps
- [ ] 텔레그램: `블로그 시작 <키워드>`
- [ ] Docs 초안 확인 및 필요한 최소 편집
- [ ] 텔레그램: `블로그 동기화`
- [ ] 텔레그램: `블로그 발행`

## Pass Criteria
- [ ] `llmMeta.used=true` 또는 fallback이어도 점수/게이트 통과
- [ ] Joseph score >= threshold (기본 80)
- [ ] hard gates 100% 통과
- [ ] 이미지/에셋 [`BLOG_IMAGE_RULES_1PAGE.md`](BLOG_IMAGE_RULES_1PAGE.md) 규격(Option A 2장 구조, 중복 절대 금지, 약한 블러링으로 실루엣 보존) 통과
- [ ] 발행 완료(slug/targetPaths 확인)

## Failure Triage
- [ ] `llmMeta.fallbackReason` 확인
- [ ] score 미통과 항목 기반 본문 보강 후 재동기화
- [ ] 월 예산 상한 여부 확인
- [ ] 필요 시 template 모드 임시 전환

## Result Snapshot
- llmMeta.used:
- llmMeta.provider:
- llmMeta.model:
- llmMeta.fallbackReason:
- joseph_score:
- hard_gate_passed:
- posts_published:
- actual_cost_usd:
- avg_attempts_per_post:
- publish_slug:
- publish_targets:

## Notes / Next Action
- observation:
- action_item_1:
- action_item_2:
