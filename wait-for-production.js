const TARGET_URL = "https://gsfark.com/posts/nihonbashi-ninngyocho-test/";

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkProductionLive() {
  console.log(`실제 라이브 사이트(${TARGET_URL}) 배포 완료를 자율 모니터링하기 시작합니다...`);
  const startTime = Date.now();
  const maxTimeout = 240000; // 최대 4분

  while (Date.now() - startTime < maxTimeout) {
    try {
      const response = await fetch(TARGET_URL, { method: "HEAD" });
      console.log(`[URL Check] Status: ${response.status} (Time elapsed: ${Math.round((Date.now() - startTime) / 1000)}s)`);
      
      if (response.status === 200) {
        console.log("\n==============================================");
        console.log("🎉 [100% 무인 자동화 성공] 라이브 사이트에 글이 발행되었습니다!");
        console.log(`- URL: ${TARGET_URL}`);
        console.log("==============================================\n");
        process.exit(0);
      }
    } catch (err) {
      console.warn("⚠️ 연결 실패, 재시도 중...", err.message);
    }
    
    await delay(15000); // 15초 간격 폴링
  }

  console.error("❌ 4분이 지났으나 라이브 배포 완료(200 OK)를 감지하지 못했습니다.");
  process.exit(1);
}

checkProductionLive();
