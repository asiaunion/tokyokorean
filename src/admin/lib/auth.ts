/**
 * Admin 인증 모듈 (Arctic Google OAuth + jose JWT + Turso 블랙리스트)
 *
 * @see §8 인증 & 세션 상세 설계
 * @see §11-A 인증/세션 보안
 */

import { Google } from "arctic";
import {
  SignJWT,
  jwtVerify,
  type JWTPayload as JoseJWTPayload,
} from "jose";
import { dbExecute } from "./db";

// ─────────────────────────────────────────────
// Google OAuth 클라이언트
// ─────────────────────────────────────────────

function getGoogleClient(): Google {
  const clientId = import.meta.env.GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = import.meta.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth 환경변수 미설정: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI"
    );
  }
  return new Google(clientId, clientSecret, redirectUri);
}

/**
 * Google OAuth 인가 URL 생성 + state/codeVerifier 반환.
 * state와 codeVerifier는 쿠키에 저장 후 callback에서 검증.
 */
export async function createAuthorizationURL(): Promise<{
  url: URL;
  state: string;
  codeVerifier: string;
}> {
  const google = getGoogleClient();
  const state = generateRandomString(32);
  const codeVerifier = generateRandomString(64);

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "email",
    "profile",
  ]);

  return { url, state, codeVerifier };
}

/**
 * OAuth 콜백: code 교환 → ID 토큰 파싱 → 이메일 화이트리스트 검증.
 */
export async function validateOAuthCallback(
  code: string,
  codeVerifier: string
): Promise<{ email: string; name: string; picture?: string }> {
  const google = getGoogleClient();
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);

  // ID 토큰에서 사용자 정보 추출 (JWT decode, 서명 검증 불필요 — Google이 보장)
  const idToken = tokens.idToken();
  const claims = decodeIdTokenClaims(idToken);

  const email = claims["email"] as string;
  const name = (claims["name"] as string) || email;
  const picture = claims["picture"] as string | undefined;

  if (!email) throw new Error("OAuth ID 토큰에 email 클레임 없음");

  // 화이트리스트 검증
  const allowed = getAllowedEmails();
  if (!allowed.includes(email.toLowerCase())) {
    throw new AuthorizationError(`비인가 이메일: ${email}`);
  }

  return { email, name, picture };
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

function getAllowedEmails(): string[] {
  const raw = import.meta.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
}

// ─────────────────────────────────────────────
// JWT (jose)
// ─────────────────────────────────────────────

export type AdminJwtPayload = JoseJWTPayload & {
  sub: string;       // email
  name: string;
  picture?: string;
  jti: string;
};

const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7일

function getJwtSecret(prev = false): Uint8Array {
  const key = prev
    ? import.meta.env.JWT_SECRET_PREVIOUS
    : import.meta.env.JWT_SECRET;
  if (!key) throw new Error("JWT_SECRET 환경변수 미설정");
  return new TextEncoder().encode(key);
}

/**
 * JWT 생성 (HttpOnly 쿠키용).
 */
export async function createJwt(user: {
  email: string;
  name: string;
  picture?: string;
}): Promise<string> {
  const jti = generateRandomString(24);
  const secret = getJwtSecret();

  return new SignJWT({
    name: user.name,
    picture: user.picture,
    jti,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.email)
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRY_SECONDS}s`)
    .sign(secret);
}

/**
 * JWT 검증 (서명 + 만료 + 블랙리스트).
 * 키 로테이션: 현재 키 실패 시 이전 키로 재시도.
 */
export async function verifyJwt(
  token: string
): Promise<AdminJwtPayload | null> {
  let payload: AdminJwtPayload | null = null;

  // 1. 현재 키로 검증
  try {
    const { payload: p } = await jwtVerify(token, getJwtSecret());
    payload = p as AdminJwtPayload;
  } catch {
    // 2. 이전 키로 재검증 (키 로테이션 지원)
    try {
      if (import.meta.env.JWT_SECRET_PREVIOUS) {
        const { payload: p } = await jwtVerify(token, getJwtSecret(true));
        payload = p as AdminJwtPayload;
      }
    } catch {
      return null;
    }
  }

  if (!payload || !payload.jti) return null;

  // 3. 블랙리스트 확인
  const revoked = await dbExecute(
    "SELECT 1 FROM revoked_tokens WHERE jti = ?",
    [payload.jti]
  );
  if (revoked.rows.length > 0) return null;

  return payload;
}

/**
 * 로그아웃: jti를 블랙리스트에 등록.
 */
export async function revokeJwt(jti: string): Promise<void> {
  await dbExecute("INSERT OR IGNORE INTO revoked_tokens (jti) VALUES (?)", [
    jti,
  ]);
}

// ─────────────────────────────────────────────
// 쿠키 헬퍼
// ─────────────────────────────────────────────

export const AUTH_COOKIE_NAME = "admin_session";
export const OAUTH_STATE_COOKIE = "oauth_state";
export const OAUTH_VERIFIER_COOKIE = "oauth_verifier";

export function buildSessionCookie(token: string): string {
  return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/admin; Max-Age=${JWT_EXPIRY_SECONDS}; Secure`;
}

export function buildClearCookie(): string {
  return `${AUTH_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/admin; Max-Age=0; Secure`;
}

export function buildOAuthCookies(state: string, codeVerifier: string): string[] {
  const opts = "HttpOnly; SameSite=Lax; Path=/admin; Max-Age=600; Secure";
  return [
    `${OAUTH_STATE_COOKIE}=${state}; ${opts}`,
    `${OAUTH_VERIFIER_COOKIE}=${codeVerifier}; ${opts}`,
  ];
}

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────

function generateRandomString(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

/** ID 토큰(JWT) claims를 서명 검증 없이 디코딩 (Google이 발급한 토큰이므로 안전). */
function decodeIdTokenClaims(idToken: string): Record<string, unknown> {
  const parts = idToken.split(".");
  if (parts.length < 2) throw new Error("유효하지 않은 ID 토큰");
  const payload = parts[1];
  const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decoded);
}
