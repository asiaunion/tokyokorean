import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

BUFFER_ACCESS_TOKEN = os.getenv("BUFFER_ACCESS_TOKEN")
BUFFER_X_CHANNEL_ID = os.getenv("BUFFER_X_CHANNEL_ID")
BUFFER_LINKEDIN_CHANNEL_ID = os.getenv("BUFFER_LINKEDIN_CHANNEL_ID")
BUFFER_THREADS_CHANNEL_ID = os.getenv("BUFFER_THREADS_CHANNEL_ID")

GRAPHQL_ENDPOINT = "https://api.buffer.com/graphql"

def post_to_channel(channel_id, text, platform_name):
    query = """
    mutation CreatePost($input: PostCreateInput!) {
        createPost(input: $input) {
            ... on PostActionSuccess {
                post { id text }
            }
            ... on MutationError { message }
        }
    }
    """
    variables = {
        "input": {
            "channelId": channel_id,
            "text": text,
            "schedulingType": "immediate" # Or just shareNow
        }
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {BUFFER_ACCESS_TOKEN}"
    }
    try:
        response = requests.post(GRAPHQL_ENDPOINT, json={"query": query, "variables": variables}, headers=headers)
        response.raise_for_status()
        data = response.json()
        result = data.get("data", {}).get("createPost", {})
        if "message" in result:
            print(f"[{platform_name}] Mutation Error: {result['message']}")
            return "manual"
        post_id = result.get("post", {}).get("id")
        print(f"[{platform_name}] ✅ Successfully shared now! Post ID: {post_id}")
        return post_id or "manual"
    except Exception as e:
        print(f"[{platform_name}] Request Failed: {e}")
        return "manual"

texts = {
    "X-KO": "도쿄 이주·투자를 고민 중이라면 어느 구에 살아야 할까? 도쿄 23구와 다마 지역을 행정구역이 아닌 라이프스타일과 브랜드 기준으로 나눈 12편의 가이드 시리즈가 시작됩니다. 매매/임대 시세와 핵심 6구의 성격을 확인해보세요.\nhttps://gsfark.com/ko/posts/tokyo-ward-guide-series-prologue/?utm_source=x&utm_medium=social&utm_campaign=blog-broadcast\n#도쿄부동산 #도쿄이주",
    "X-EN": "Thinking of relocating or investing in Tokyo? Not all 23 wards are the same. We break down Tokyo's neighborhoods not by train lines, but by lifestyle, brand, and real estate data. Discover the \"Core 6 Wards\" and find your ideal area.\nhttps://gsfark.com/posts/tokyo-ward-guide-series-prologue/?utm_source=x&utm_medium=social&utm_campaign=blog-broadcast\n#TokyoRealEstate #RelocateToJapan",
    "LinkedIn-KO": "도쿄 부동산 시장을 이해하려면 23구를 단순한 지리적 구분이 아닌 '브랜드와 라이프스타일' 관점에서 바라보아야 합니다.\nGSF-Blog에서 도쿄 23구와 다마 지역을 12개 테마로 심층 해부하는 가이드 시리즈를 연재합니다. 도심 핵심 6구(치요다, 미나토, 신주쿠 등)의 성격 차이부터 각 지역의 임대/매매 데이터 및 외국인 거주 환경까지, 이주 및 투자 결정에 필요한 객관적 기준을 제시합니다.\n첫 프롤로그에서 전체 로드맵과 23구 가치 히트맵을 확인해 보시기 바랍니다.\nhttps://gsfark.com/ko/posts/tokyo-ward-guide-series-prologue/?utm_source=linkedin&utm_medium=social&utm_campaign=blog-broadcast",
    "LinkedIn-EN": "To truly understand the Tokyo real estate market, one must look beyond administrative boundaries and analyze neighborhoods through the lens of brand and lifestyle.\nGSF-Blog is launching a 12-part data-driven guide covering Tokyo's 23 wards and the Tama region. From the differing characters of the \"Core 6\" wards to rental data and livability for foreign residents, we provide the objective criteria needed for relocation and investment decisions.\nRead our Series Prologue to view the complete roadmap and the 23-ward value heatmap.\nhttps://gsfark.com/posts/tokyo-ward-guide-series-prologue/?utm_source=linkedin&utm_medium=social&utm_campaign=blog-broadcast",
    "Threads-KO": "도쿄 이주나 투자를 생각하고 계신가요? 23구 지도만 보면 다 비슷해 보이지만, 실제로는 구마다 성격과 집값이 완전히 다릅니다. 지하철 노선이 아닌 '라이프스타일과 브랜드' 기준으로 도쿄를 12개로 나눈 가이드 시리즈를 시작합니다! 핵심 6구의 차이와 23구 전체의 가치 히트맵을 프롤로그에서 확인해 보세요.\nhttps://gsfark.com/ko/posts/tokyo-ward-guide-series-prologue/?utm_source=threads&utm_medium=social&utm_campaign=blog-broadcast",
    "Threads-EN": "Planning a move or investment in Tokyo? Looking at a map, the 23 wards might seem like one giant city, but each neighborhood has a completely distinct vibe and price point. We're launching a 12-part series that categorizes Tokyo by lifestyle and brand, rather than just train lines. Check out the Prologue to see the \"Core 6 Wards\" and our full 23-ward value heatmap!\nhttps://gsfark.com/posts/tokyo-ward-guide-series-prologue/?utm_source=threads&utm_medium=social&utm_campaign=blog-broadcast"
}

buffer_ids = {}
buffer_ids["X-EN"] = post_to_channel(BUFFER_X_CHANNEL_ID, texts["X-EN"], "X-EN")
buffer_ids["X-KO"] = post_to_channel(BUFFER_X_CHANNEL_ID, texts["X-KO"], "X-KO")
buffer_ids["LinkedIn-EN"] = post_to_channel(BUFFER_LINKEDIN_CHANNEL_ID, texts["LinkedIn-EN"], "LinkedIn-EN")
buffer_ids["LinkedIn-KO"] = post_to_channel(BUFFER_LINKEDIN_CHANNEL_ID, texts["LinkedIn-KO"], "LinkedIn-KO")
buffer_ids["Threads-EN"] = post_to_channel(BUFFER_THREADS_CHANNEL_ID, texts["Threads-EN"], "Threads-EN")
buffer_ids["Threads-KO"] = post_to_channel(BUFFER_THREADS_CHANNEL_ID, texts["Threads-KO"], "Threads-KO")

log_path = "/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog/sns-drafts/sns-log.json"
with open(log_path, "r", encoding="utf-8") as f:
    logs = json.load(f)

for post in logs.get("published", []):
    if post.get("slug") == "tokyo-ward-guide-series-prologue":
        post["buffer_ids"] = buffer_ids
        post["mode"] = "published"
        break

with open(log_path, "w", encoding="utf-8") as f:
    json.dump(logs, f, indent=2, ensure_ascii=False)

print("sns-log.json updated successfully!")
