#!/usr/bin/env node
/**
 * Turso DB 연결 확인 스크립트 (세션 1-B 검증용)
 * 실행: node scripts/verify-db-connection.mjs
 */

import { createClient } from "@libsql/client/http";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env 파일 파싱 (dotenv 미사용, 직접 파싱)
function loadEnv() {
  const envPath = resolve(__dirname, "../.env");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
  return env;
}

async function main() {
  console.log("🔍 Turso DB 연결 확인 시작...\n");

  const env = loadEnv();
  const url = env["TURSO_DATABASE_URL"];
  const authToken = env["TURSO_AUTH_TOKEN"];

  if (!url || !authToken) {
    console.error("❌ TURSO_DATABASE_URL 또는 TURSO_AUTH_TOKEN 미설정");
    process.exit(1);
  }

  console.log(`   URL: ${url}`);

  const db = createClient({ url, authToken });

  // 1. 테이블 목록 조회
  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log(`\n✅ DB 연결 성공!`);
  console.log(`\n📋 테이블 목록 (${tables.rows.length}개):`);
  for (const row of tables.rows) {
    console.log(`   ✓ ${row.name}`);
  }

  // 2. 인덱스 수 확인
  const indexes = await db.execute(
    "SELECT count(*) as cnt FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'"
  );
  console.log(`\n🗂️  커스텀 인덱스: ${indexes.rows[0].cnt}개`);

  // 3. 간단한 INSERT/SELECT/DELETE 테스트 (audit_log)
  await db.execute({
    sql: "INSERT INTO audit_log (user_email, action) VALUES (?, ?)",
    args: ["test@verify.local", "db-connection-test"],
  });
  const testRow = await db.execute(
    "SELECT id, action FROM audit_log WHERE user_email='test@verify.local' LIMIT 1"
  );
  await db.execute(
    "DELETE FROM audit_log WHERE user_email='test@verify.local'"
  );
  console.log(`\n✅ INSERT/SELECT/DELETE 테스트 성공 (id: ${testRow.rows[0]?.id})`);

  console.log("\n🎉 세션 1-B DB 검증 완료!");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ DB 연결 실패:", err.message);
  process.exit(1);
});
