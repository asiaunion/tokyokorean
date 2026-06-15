/**
 * Astro 미들웨어
 * /admin/* 경로에 JWT 인증 게이트 적용
 *
 * @see §8 세션 검증 흐름
 * @see §10 애드센스 안전 조치
 */

import { defineMiddleware } from "astro:middleware";
import { verifyJwt, AUTH_COOKIE_NAME } from "./admin/lib/auth";
import { parseCookies } from "./admin/lib/security";

// 인증 없이 접근 가능한 /admin 하위 경로 (화이트리스트)
const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/admin/login/",
  "/admin/api/auth/login",
  "/admin/api/auth/login/",
  "/admin/api/auth/callback",
  "/admin/api/auth/callback/",
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  let response: Response;

  // /admin/* 경로 인증 검증
  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname)) {
    const cookies = parseCookies(context.request.headers.get("cookie"));
    const token = cookies[AUTH_COOKIE_NAME];

    if (!token) {
      response = new Response(null, { status: 302, headers: { Location: "/admin/login/" } });
    } else {
      const payload = await verifyJwt(token).catch(() => null);

      if (!payload) {
        // 만료/위조/블랙리스트 — 로그인 페이지로
        const headers = new Headers({
          Location: "/admin/login/?error=session_expired",
        });
        headers.append(
          "Set-Cookie",
          `${AUTH_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/admin; Max-Age=0; Secure`
        );
        response = new Response(null, { status: 302, headers });
      } else {
        // context.locals에 사용자 정보 주입
        (context.locals as Record<string, unknown>).user = {
          email: payload.sub,
          name: payload.name,
          picture: payload.picture,
        };
        response = await next();
      }
    }
  } else {
    // /admin/* 이 아니거나 공개된 /admin 경로는 통과
    response = await next();
  }

  // 글로벌 보안 헤더 주입
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  return response;
});
