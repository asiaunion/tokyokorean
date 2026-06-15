# Spec: Blog Architecture V2 (Two-Track System)

## Overview
기존 다국어 기능이 탑재된 GSF-Blog를 최고 속도의 **개인 브랜딩 특화 레이아웃**으로 디자인 고도화(Track 1)하고, 본진과 완전히 독립된 **[제2 블로그: 일본 부동산/금융 시황 무인화 팩토리]**를 별도로 신축(Track 2)하는 거대 이원화 프로젝트입니다.

## Goals
- **Track 1 (GSF Main)**: 기존 안전한 마크다운(Markdown) 기반의 CMS를 유지하여 압도적인 빈 화면 로딩 속도(Astro V5 순정) 확보. 활자(텍스트) 중심의 신뢰할 수 있는 개인 브랜딩 특화 UI 리뉴얼.
- **Track 2 (News Factory)**: 승주님의 개입률 0% 달성. 매일 정해진 스케줄에 맞춰 에이전트(Tim)가 스스로 일본/글로벌 시황을 긁어오고 요약 및 번역하여 자동 배포(`git push`)하는 오토파일럿 시스템 구축.

## Scope
- **In**: (1) 기존 블로그의 Tailwind CSS 구조를 뜯어고쳐 미니멀리즘 폰트 중심 UI 3종 시안 설계. (2) 제2 블로그용 별도 폴더(Repo) 생성 및 Github Actions(또는 백그라운드 스케줄러) 기반의 AI 뉴스 큐레이션 파이썬 스크립트 구축.
- **Out**: 속도를 현저히 늦추는 외부 CMS(노션 API 등)의 실시간 연동 (속도를 위해 확정 배제).

## Inputs and Outputs
- **Input (공장용)**: 지정된 일본 부동산 웹사이트, 금융 뉴스 RSS, 환율 데이터 크롤링.
- **Output (공장용)**: 매일 지정된 시간마다 Vercel 서버에 자동 배포(Live)되는 정제된 다국어 정보 마크다운 파일들.

## Requirements
- 제1 블로그는 페이지 로딩 속도를 조금이라도 늦추는 무거운 자바스크립트(JS) 애니메이션을 배제하고 타이포그래피(활자)와 여백(Margin)에만 집중해야 합니다.
- **모바일 완벽 호환 보장**: 모든 드롭다운 및 인터랙티브 UI 컴포넌트(예: 언어 스위처)는 자바스크립트에 의존하지 않는 순수 CSS(0-JS) 기반으로 작동하되, iOS Safari의 터치 이벤트(Hover Trap 문제)에서도 정상 작동하도록 `focus-within`, `tabindex="0"`, 또는 `checkbox hack` 기법을 반드시 적용해야 합니다.
- 제2 블로그(팩토리)는 에이전트(Tim)에게 스스로 판단하고 스크래핑할 수 있는 백그라운드 구동 권한과 에러 발생 시 자가 수복(Retry)할 수 있는 예외 처리 코드 구성이 필수적입니다.

## UX / Operator Flow
1. **메인 블로그**: 승주님은 여전히 아이디어 초안만 주십니다. 나머지는 저(Tim)가 기존처럼 번역 포맷팅을 거칩니다. 변경점은 오직 '훨씬 빠르고 아름다운 화면'을 본다는 것입니다.
2. **공장 블로그**: 승주님의 플로우는 없습니다(Zero Touch). 매일 출근하시면서 완성된 뉴스 링크만 확인하시면 됩니다.

## Tradeoffs and Decisions
- **속도 vs 편의성**: 노션(Notion)에서 글을 쓰면 편하다는 장점을 과감히 포기하고, 마크다운 직접 변환 체제를 고수함으로써 로딩 속도 0.1초와 구글 SEO 검색 노출 스코어를 100점 만점으로 끌어올리는 극단적 최적화를 선택했습니다.
- **다국어 라우팅 (Unified Single Slug vs Localized Slugs)**: Astro V5 마이그레이션 중 발생한 404 라우팅 중복 버그를 해결하면서, 파일명을 현지 언어('사과')로 번역해 얻는 미세한 SEO 가산점 대신 **'모든 언어 팩에서 동일한 단일 영문 파일명(Unified English Slug)'**을 강제하는 방식을 시스템 스펙으로 영구 채택했습니다. 이는 대량의 다국어 기사를 토해내는 GSF-Factory 봇의 아키텍처 단순화 및 유지보수를 극대화하기 위한 전략적 선택입니다.

## Failure Modes
- 크롤링 타겟 사이트 디자인 변경 시 파싱 에러 발생 -> 에이전트의 Error Log(`memory_core`) 기록 및 텔레그램 연동 실패 알림.

## Future Backlog / Automation Ideas
- **API 백업 파이프라인 (API Fallback Pipeline)**: OpenAI API 요금 소진 혹은 만료 시, 다운타임 없이 스크래핑을 이어나가도록 `news_bot.py` 전용 예외처리/로컬 AI 우회 로직 구현.
- **RSS Target Expansion**: 부동산/경제 매체 외에 노션(Notion) 파싱, X(Twitter) 스크래핑 등을 통한 다국어 크롤링/번역 파이프라인 확장.
- **모바일 0-JS Hover Linter 파이프라인**: UI 컴포넌트(Astro) 내에서 Tailwind CSS로 `group-hover`를 사용했음에도 `group-focus-within` 혹은 `tabindex`가 누락된 경우, 모바일 기기(Safari 터치 트랩)에서의 작동 불가를 사전에 방지하기 위해 정적 분석 단계(Build-time)에서 경고를 뱉는 커스텀 CI/CD 린터 스캐너 도입.
- **Privacy Scanner Hook (PII Linter)**: 깃허브 푸시(Git Push) 또는 Vercel 빌드 시 구동되는 정적 분석기 도구. 블로그 마크다운 포스트나 소스 코드 내에 특정 개인정보 패턴(예: 지번 이하 상세 호수 `#301호`, 휴대전화 번호, 이메일 외의 연락처)이 감지되면 자동 배포를 차단하고 E-E-A-T vs Privacy 트레이드오프 경고를 발생시킵니다.

## Drip-Feed Automation Architecture (SSG Rebuild Strategy)
- **Problem**: Astro의 정적 사이트 생성(SSG) 특성상 `pubDatetime`이 미래인 문서는 빌드 단계(`postFilter.ts`)에서 제외되나, 지정된 날짜가 되었을 때 스스로 리빌드하는 기능이 내장되어 있지 않아 '진정한 의미의 예약 배포'가 불가능함.
- **Solution A & B (Discarded)**: 초반엔 Vercel Webhook을 이용해 매일 자정 강제 리빌드하는 워크플로우를 신설하려 했으나, 이는 Vercel 설정(Secret 셋업)을 강제하고 불필요한 파이프라인을 늘리는 과잉 설계(Over-engineering)로 판명되어 폐기함.
- **Solution C (Zero-Config Piggyback, 최적의 방안)**: 본진(Track 1)의 예약 발행 문제는 사실 **제2 블로그(Track 2: GSF-Factory)**의 존재로 자연스럽게 해결됨. 무인 뉴스 팩토리가 매일 아침 글로벌 뉴스를 스크래핑하여 `GSF-Blog` 원격 저장소에 `git push`하는 순간, Vercel은 자동 감지하여 전체 사이트를 리빌드함. 즉, **별도의 예약 발행용 Cron이나 Webhook 없이도, 팩토리 봇의 일일 Push가 본진의 예약 문서(Drip-feed)들의 시간제한 락(Lock)을 매일 자동으로 풀어버리는 완벽한 톱니바퀴 동기화(Piggyback Synergy)**가 완성됨.

## Monetization Strategy (AdSense)
- **도메인 아키텍처 전략**: 새로운 유료 도메인을 무한정 구매하지 않고, 기존에 보유 중인 최상위 루트 도메인(`gsfark.com`)을 메인 GSF-Blog(수동 작성 블로그)에 연결하여 구글 애드센스 본심사를 한 번 통과합니다. 그 후 대량의 번역글이 쏟아지는 GSF-Factory(뉴스 봇)는 `factory.gsfark.com` 혹은 `news.gsfark.com` 등의 하위 서브도메인으로 연결하여 **애드센스 승인을 번거로운 추가 심사 없이 프리패스로 자동 상속(Inherit)**시키는 최적화 다계정 전략을 영구 도입합니다. *단, 초기 심사 덩치를 불리기 위해 심사 기간 동안만 루트 도메인을 Factory에 위임하는 트릭(전략 B)을 사용합니다.*
- **필수 심사용 페이지 규정**: 심사 로봇의 기계적 탈락을 방지하고 투명한 운영을 증명하기 위해, 모든 페이지에 **About (소개), Contact (문의안내), Privacy Policy (개인정보처리방침)** 3종 페이지를 글로벌 Footer(하단)에 항구적으로 노출해야 합니다.
- **인간-AI 하이브리드 가치 입증 (Helpful Content 방어)**: 구글의 '가치 없는 인벤토리(Low-value content)' 거절을 원천 방어하기 위해 두 가지 트릭을 팩토리에 적용합니다. (1) 팩토리 본진 폴더 안에 승주님이 수동 작성한 고품질 포스팅(니혼바시, REITs 등) 4~5개를 '앵커(기준점)'로 심어 인간 전문가의 블로그임을 증명합니다. (2) 자동 파이썬 봇(`news_bot.py`)의 프롬프트에 'GSF 전문가 논평(Expert Insight)'을 추가 지시하여, 단순 번역이 아닌 분석 리포트 수준으로 콘텐츠 가치를 상향시킵니다.

## SEO & Site Revitalization Strategy
- **좀비 도메인 페널티 극복 (Dormancy Revival)**: 사이트 개설 직후 장기간 방치되어 생긴 구글 봇의 크롤링 예산 감소 문제를 해결하기 위해, 메인 블로그의 과거 최우수 마크다운 글들에 **'마이크로 업데이트(2026년 최신 동향 등)'** 단락을 추가하고 수동으로 `modDatetime`을 갱신합니다. 이를 통해 검색 엔진을 다시 호출하고(Re-indexing) 블로그의 활동성(Freshness) 점수를 즉시 복구합니다.

## Infrastructure & Deployment Handover
- **사전 DNS 검증 프로토콜 (DNS Pre-flight Check)**: 서버를 이전하거나 프레임워크(예: WordPress -> Vercel)를 대규모로 마이그레이션 한 직후, 사용자가 브라우저 캐시 이슈로 오인하는 것을 방지하기 위해 에이전트는 **의무적으로 터미널 명령(`curl -I` 또는 `dig +short`)을 통해 글로벌 DNS 전파 상태를 직접 점검**해야 합니다. A-Record 혹은 Nameserver가 완벽하게 새 인프라 IP(예: `76.76.21.21`)로 꽂혔는지 확인하기 전까지 배포 프로세스는 '진행 중'으로 간주합니다.
