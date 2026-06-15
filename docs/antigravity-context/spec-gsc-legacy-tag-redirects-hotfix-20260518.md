# Spec: GSC 레거시 태그 리다이렉트 핫픽스 (코딩 전용)

> **대상:** 안티그래비티 Gemini  
> **작성:** Cursor (2026-05-18)  
> **전제:** `4521c24` (`fix(seo): 308 redirect GSC legacy tag slugs and tags/archive`) **이후** 버그만 수정  
> **범위:** `vercel.json`만. **추가·삭제 규칙 합계 +12개 이하** (총 61개 블록 재작성 금지)

---

## 1. 한 줄 요약

`4521c24`에서 **5곳 `:page(%5Cd+)` 오타**와 **소문자 URL 인코딩·UTF-8 미매칭** 때문에  
`/tags/니혼바시/2/` 등이 **404**로 남는다. **표에 적은 수정만** 적용한다.

---

## 2. 수정 3종 (이것만)

### A. `%5Cd+` → `(\\d+)` 교체 (필수, 5규칙 **수정만**)

아래 `source`에서 `:page(%5Cd+)` / `:page(%5Cd+)/` 를 **삭제 후** 올바른 패턴으로 **교체** (destination 유지).

| 현재 source (일부) | 교체 후 |
|-------------------|---------|
| `/tags/%EB%8B%88%ED%98%BC%EB%B0%94%EC%8B%9C/:page(%5Cd+)/` | `.../:page(\\d+)/` |
| `/tags/%EB%8B%88%ED%98%BC%EB%B0%94%EC%8B%9C/:page(%5Cd+)` | `.../:page(\\d+)` |
| `/ja/tags/%EB%8B%88%ED%98%BC%EB%B0%94%EC%8B%9C/:page(%5Cd+)/` | 동일 |
| `/ja/tags/%EB%8B%88%ED%98%BC%EB%B0%94%EC%8B%9C/:page(%5Cd+)` | 동일 |
| `/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/:page(%5Cd+)/` | `.../:page(\\d+)/` 및 **B절** `.../:page(\\d+)` 1개 **추가** |

**금지:** `%5Cd`, `%5cd`, `\\d` 단독, 새 와일드카드 규칙.

### B. `日本橋` 페이지네이션 쌍 보완 (필수, 2규칙 **추가**)

기존 `/tags/日本橋/:page(\\d+)` **바로 아래**에 추가:

```json
{"source":"/tags/日本橋/:page(\\d+)/","destination":"/tags/nihonbashi/","permanent":true},
{"source":"/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/:page(\\d+)","destination":"/tags/nihonbashi/","permanent":true}
```

### C. 소문자 인코딩 + UTF-8 리터럴 (필수, 8규칙 **추가**)

일반 페이지네이션이 `/2/` 제거 시 **소문자** `%eb%8b%88...` 로 보내 404가 난다.  
**레거시 블록 맨 끝**(페이지네이션 6규칙 **바로 위**)에만 추가:

```json
{"source":"/tags/%eb%8b%88ed%98%bc%eb%b0%94ec%8b%9c/","destination":"/tags/nihonbashi/","permanent":true},
{"source":"/tags/%eb%8b%88ed%98%bc%eb%b0%94ec%8b%9c","destination":"/tags/nihonbashi/","permanent":true},
{"source":"/tags/%eb%8b%88ed%98%bc%eb%b0%94ec%8b%9c/:page(\\d+)/","destination":"/tags/nihonbashi/","permanent":true},
{"source":"/tags/%eb%8b%88ed%98%bc%eb%b0%94ec%8b%9c/:page(\\d+)","destination":"/tags/nihonbashi/","permanent":true},
{"source":"/tags/니혼바시/","destination":"/tags/nihonbashi/","permanent":true},
{"source":"/tags/니혼바시","destination":"/tags/nihonbashi/","permanent":true},
{"source":"/tags/니혼바시/:page(\\d+)/","destination":"/tags/nihonbashi/","permanent":true},
{"source":"/tags/니혼바시/:page(\\d+)","destination":"/tags/nihonbashi/","permanent":true}
```

**C절은 위 8개만.** 다른 slug에 소문자·UTF-8 규칙 **확대 추가 금지**.

---

## 3. OUT OF SCOPE (절대 금지)

- `4521c24`의 61규칙 **재작성·삭제·순서 변경**(A·B·C 외)
- WP 8규칙·페이지네이션 6규칙·cross-locale 674+ 규칙 수정
- archive·旅行·贈与税 등 **이미 동작하는** 규칙 변경
- `astro.config`, noindex, `/ko/posts/` 리다이렉트, 새 md, GSC·애드센스 작업
- 규칙 **10개 초과** 추가 (본 스펙: 수정 5 + 추가 10 = **순증가 5**)

---

## 4. 검증 (배포 후 필수)

```bash
# 반드시 통과 (UTF-8 — GSC 샘플)
curl -sI -L "https://gsfark.com/tags/니혼바시/2/" | tail -1 | grep "200"
curl -sI -L "https://gsfark.com/tags/日本橋/2/" | tail -1 | grep "200"

# 인코딩 (회귀)
curl -sI -L "https://gsfark.com/tags/%EB%8B%88%ED%98%BC%EB%B0%94%EC%8B%9C/2/" | tail -1 | grep "200"

# 직접 canonical (1홉)
curl -sI "https://gsfark.com/tags/니혼바시/2/" | grep -i location
# 기대: location에 nihonbashi (니혼바시 slug 없음)
```

`vercel.json`에 `%5Cd` 문자열이 **0건**이어야 함:

```bash
grep -c '%5Cd' vercel.json   # 기대: 0
```

---

## 5. Definition of Done

- [ ] A: `%5Cd+` 5건 → `(\\d+)` 로 **교체** 완료
- [ ] B: 日本橋 pagination **2규칙 추가**
- [ ] C: 소문자·UTF-8 **8규칙만 추가** (총 +10 / 수정 5)
- [ ] `grep '%5Cd' vercel.json` → 0
- [ ] §4 curl 3건 성공
- [ ] 커밋 1개: `fix(seo): hotfix GSC legacy tag redirect encoding and page regex`

---

## 6. 안티그래비티 프롬프트 (복사용)

```
GSF-Blog: docs/antigravity-context/spec-gsc-legacy-tag-redirects-hotfix-20260518.md 만 읽고 코딩하라.

- vercel.json만 수정. A(%5Cd→\d 5건 교체) + B(2규칙 추가) + C(8규칙 추가)만. 순증가 10규칙 이하.
- 4521c24의 61규칙·archive·WP·페이지네이션 6규칙·cross-locale 블록 재작성·삭제 금지.
- C절 8규칙 외 소문자/UTF-8 slug 추가, astro/noindex/GSC/새 md 금지.
- 배포 후: tags/니혼바시/2/ 와 tags/日本橋/2/ 가 최종 200인지 curl 확인. grep '%5Cd' vercel.json 결과 0.
- 커밋: fix(seo): hotfix GSC legacy tag redirect encoding and page regex
- 위 스펙 밖 작업은 실패.
```
