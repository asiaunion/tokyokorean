/**
 * Admin 보안 헬퍼 (Rate Limit, CSRF, Origin 검증)
 *
 * @see §11-B API 보안
 * @see §11-C Rate Limiting
 */

import type { APIContext } from "astro";

// ─────────────────────────────────────────────
// Rate Limiting (In-memory, Vercel Edge 단일 인스턴스 기준)
// ─────────────────────────────────────────────

type RateLimitEntry = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateLimitEntry>();

export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

/** 엔드포인트별 Rate Limit 설정 (§11-C 기준) */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: { windowMs: 60_000, maxRequests: 10 },
  posts: { windowMs: 60_000, maxRequests: 60 },
  publish: { windowMs: 60_000, maxRequests: 5 },
  expand: { windowMs: 60_000, maxRequests: 10 },
  upload: { windowMs: 60_000, maxRequests: 20 },
};

/**
 * Rate Limit 확인.
 * @returns true = 제한 초과 (429 반환 필요), false = 정상
 */
export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return false; // 정상
  }

  entry.count++;
  if (entry.count > config.maxRequests) return true; // 제한 초과

  return false;
}

export function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
    {
      status: 429,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// ─────────────────────────────────────────────
// CSRF 보호 (SameSite=Lax + Origin 헤더 검증)
// ─────────────────────────────────────────────

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * POST/PUT/DELETE 요청에서 Origin 헤더 검증.
 * SameSite=Lax와 함께 CSRF 이중 방어.
 * @returns true = CSRF 공격 의심 (403 반환 필요)
 */
export function isCsrfAttack(request: Request): boolean {
  if (SAFE_METHODS.has(request.method)) return false;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return false; // 동일 출처 요청은 origin 없을 수 있음

  try {
    const originHost = new URL(origin).host;
    // localhost 허용 (개발 환경)
    if (originHost.startsWith("localhost") || originHost.startsWith("127.0.0.1")) {
      return false;
    }
    return originHost !== host;
  } catch {
    return true; // origin 파싱 실패 = 의심
  }
}

export function csrfErrorResponse(): Response {
  return new Response(JSON.stringify({ error: "CSRF 검증 실패" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

// ─────────────────────────────────────────────
// 공통 API 에러 응답
// ─────────────────────────────────────────────

export function unauthorizedResponse(message = "인증이 필요합니다."): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export function forbiddenResponse(message = "접근 권한이 없습니다."): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

export function badRequestResponse(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

// ─────────────────────────────────────────────
// 쿠키 파서 헬퍼
// ─────────────────────────────────────────────

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((part) => {
      const [k, ...v] = part.trim().split("=");
      return [k.trim(), decodeURIComponent(v.join("="))];
    })
  );
}

/**
 * APIContext에서 클라이언트 IP 추출 (Vercel 헤더 우선).
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
