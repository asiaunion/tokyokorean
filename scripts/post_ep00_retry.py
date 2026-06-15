import os, json, time, urllib.request, urllib.error
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("BUFFER_ACCESS_TOKEN")
channels = {
    "X-EN": os.getenv("BUFFER_X_CHANNEL_ID"),
    "X-KO": os.getenv("BUFFER_X_CHANNEL_ID"),
    "LinkedIn-EN": os.getenv("BUFFER_LINKEDIN_CHANNEL_ID"),
    "LinkedIn-KO": os.getenv("BUFFER_LINKEDIN_CHANNEL_ID"),
    "Threads-EN": os.getenv("BUFFER_THREADS_CHANNEL_ID"),
    "Threads-KO": os.getenv("BUFFER_THREADS_CHANNEL_ID")
}

texts = {
    "X-EN": "Tokyo has 23 wards. Each feels like a different city.\n\nI mapped all of them — by brand, price, income, and foreigner-friendliness — in a 12-part data series starting today.\n\nhttps://gsfark.com/posts/tokyo-ward-guide-series-prologue/\n\n#TokyoRealEstate #Relocation",
    "X-KO": "도쿄 23구, 각각 완전히 다른 도시입니다.\n\n가격·브랜드·소득·외국인 친화도를 기준으로 전 구를 분석하는 12부작 데이터 시리즈를 오늘 시작합니다.\n\nhttps://gsfark.com/posts/tokyo-ward-guide-series-prologue/\n\n#도쿄부동산 #도쿄이주",
    "LinkedIn-EN": "Tokyo has 23 special wards. On a map, they look like one undifferentiated blob. Ask anyone who has actually lived or invested there, and the answer is the same: each ward feels like a completely different city.\n\nToday I'm launching a 12-part data series on Tokyo's ward-by-ward breakdown — covering mansion prices, rental yields, household income, and what it's actually like to live there as a foreign resident.\n\nThe framework is brand and lifestyle identity, not just price bands. Because \"expensive\" doesn't tell you whether a place fits your life or your portfolio.\n\nEpisode 1 drops tomorrow: Chiyoda, Chuo, and Minato — Tokyo's most iconic and most expensive addresses.\n\nFull series map + prologue: https://gsfark.com/posts/tokyo-ward-guide-series-prologue/",
    "LinkedIn-KO": "도쿄 23구, 지도 위에서는 하나의 덩어리처럼 보입니다. 하지만 실제로 살아보거나 투자해본 사람이라면 공통적으로 말합니다. 각 구는 완전히 다른 도시라고.\n\n오늘부터 12부작 도쿄 구별 데이터 시리즈를 시작합니다. 맨션 가격, 임대 수익률, 가구 소득, 외국인 거주 환경까지 — 숫자로 풀어낸 도쿄 지역 분석입니다.\n\n분류 기준은 가격대가 아닌 브랜드와 라이프스타일 정체성입니다. \"비싸다\"는 말만으로는 그 동네가 내 삶과 포트폴리오에 맞는지 알 수 없으니까요.\n\nEp.1은 내일 발행됩니다 — 치요다·주오·미나토, 도쿄에서 가장 비싼 세 구.\n\n시리즈 전체 로드맵: https://gsfark.com/posts/tokyo-ward-guide-series-prologue/",
    "Threads-EN": "Tokyo has 23 wards. Each feels like a different city.\n\nLaunching a 12-part data series today — ward by ward breakdown of prices, rents, income, and foreigner-friendliness.\n\nEpisode 1 tomorrow: Chiyoda, Chuo, Minato 🗼\n\nhttps://gsfark.com/posts/tokyo-ward-guide-series-prologue/\n\n#TokyoRealEstate #Relocation",
    "Threads-KO": "도쿄 23구, 사실 각각 완전히 다른 도시예요.\n\n브랜드·가격·소득·외국인 친화도 기준으로 전 구를 분석하는 12부작 시리즈 오늘 시작합니다.\n\n내일은 Ep.1 — 치요다·주오·미나토 🗼\n\nhttps://gsfark.com/posts/tokyo-ward-guide-series-prologue/\n\n#도쿄부동산 #도쿄이주"
}

CREATE_MUTATION = """
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess { post { id status } }
    ... on InvalidInputError { message }
    ... on UnauthorizedError { message }
    ... on LimitReachedError { message }
    ... on UnexpectedError   { message }
  }
}
"""

def create_buffer_post(channel_id, text, platform_name):
    variables = {
        "input": {
            "channelId": channel_id,
            "text": text,
            "schedulingType": "automatic",
            "mode": "shareNow"
        }
    }
    payload = json.dumps({"query": CREATE_MUTATION, "variables": variables}).encode()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    req = urllib.request.Request("https://api.buffer.com/graphql", data=payload, headers=headers, method="POST")
    while True:
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                body = json.loads(resp.read())
                data = body.get('data', {}).get('createPost', {})
                if data.get('post'):
                    print(f"[{platform_name}] ✅ Successfully shared! Post ID: {data['post']['id']}")
                    return data['post']['id']
                err = data.get('message', str(body))
                print(f"[{platform_name}] Mutation Error: {err}")
                if "RATE_LIMIT" in err:
                    print("Waiting 65s for rate limit...")
                    time.sleep(65)
                    continue
                return "manual"
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"[{platform_name}] Rate limit (429) — waiting 65초...")
                time.sleep(65)
            else:
                print(f"[{platform_name}] HTTP {e.code}")
                return "manual"
        except Exception as e:
            print(f"[{platform_name}] Error: {e}")
            return "manual"

def main():
    log_path = "/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog/sns-drafts/sns-log.json"
    with open(log_path, "r", encoding="utf-8") as f:
        logs = json.load(f)

    buffer_ids = {}
    for platform, text in texts.items():
        channel_id = channels[platform]
        if not channel_id: continue
        post_id = create_buffer_post(channel_id, text, platform)
        buffer_ids[platform] = post_id
        time.sleep(1) # Prevent rapid fire
        
    for post in logs.get("published", []):
        if post.get("slug") == "tokyo-ward-guide-series-prologue":
            post["buffer_ids"] = buffer_ids
            post["mode"] = "published"
            break

    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
