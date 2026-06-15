/**
 * Admin DB 클라이언트 (Turso / libSQL)
 * Edge Runtime 호환: fetch 기반 HTTP 클라이언트 사용
 *
 * @see §14 세션 1-B: Turso DB 설정 + 스키마
 * @see §11-B SQL Injection 방지 — Prepared statement만 사용
 */

import { createClient, type Client, type InStatement, type InArgs } from "@libsql/client/http";

let _client: Client | null = null;

/**
 * Turso 클라이언트 싱글톤 반환.
 * Edge Runtime 호환을 위해 fetch 기반 HTTP 클라이언트 사용.
 */
export function getDb(): Client {
  if (_client) return _client;

  const url = import.meta.env.TURSO_DATABASE_URL;
  const authToken = import.meta.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      "DB 환경변수 미설정: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN 를 .env에 추가하세요."
    );
  }

  _client = createClient({ url, authToken });
  return _client;
}

/**
 * Prepared statement로 단일 쿼리 실행.
 * ⚠️ 문자열 연결 금지 — args 파라미터만 사용 (SQL Injection 방지)
 */
export async function dbExecute(sql: string, args: InArgs = []) {
  const db = getDb();
  return db.execute({ sql, args });
}

/**
 * 트랜잭션으로 여러 쿼리 일괄 실행.
 */
export async function dbBatch(statements: InStatement[]) {
  const db = getDb();
  return db.batch(statements, "write");
}
