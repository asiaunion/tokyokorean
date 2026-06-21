import os, json, requests
from dotenv import load_dotenv

load_dotenv("/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog/.env")

token = os.getenv("BUFFER_ACCESS_TOKEN")
linkedin_id = os.getenv("BUFFER_LINKEDIN_CHANNEL_ID")
threads_id = os.getenv("BUFFER_THREADS_CHANNEL_ID")

GQL_URL = "https://api.buffer.com/graphql"

MUTATION = """
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess { post { id status } }
    ... on InvalidInputError { message }
    ... on UnauthorizedError { message }
    ... on LimitReachedError { message }
    ... on UnexpectedError { message }
  }
}
"""

def post_now(channel_id, text, image_url, platform):
    variables = {
        "input": {
            "channelId": channel_id,
            "text": text,
            "schedulingType": "automatic",
            "mode": "shareNow",
            "assets": [
                {
                    "link": {
                        "url": "https://gsfark.com/posts/tokyo-shinjuku-shibuya-bunkyo/?utm_source=buffer&utm_medium=social"
                    }
                }
            ]
        }
    }
    
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    resp = requests.post(GQL_URL, json={"query": MUTATION, "variables": variables}, headers=headers)
    print(f"[{platform}]", resp.status_code, resp.text)

linkedin_text = """"Expensive means best" is a lazy conclusion — and it's wrong in Tokyo's Core 6.

Shibuya leads on long-term capital appreciation (¥1.800M/㎡ average, highest in Core 6). Bunkyo leads on gross yield (4.5–5.5%), with the most affordable entry price in the premium tier. Shinjuku leads on tenant diversity and vacancy resilience — foreign resident ratio of 12.6%, the highest in Tokyo.

For yield-focused investors: Bunkyo. For capital gain plays: Shibuya. For community depth: Shinjuku.

Episode 2 of the Tokyo 23 Wards series:
https://gsfark.com/posts/tokyo-shinjuku-shibuya-bunkyo/"""

threads_text = """Shibuya = best capital gain in Core 6
Bunkyo = best yield in Core 6
Shinjuku = lowest vacancy risk in Core 6

All premium tier. All completely different bets.

https://gsfark.com/posts/tokyo-shinjuku-shibuya-bunkyo/

#TokyoRealEstate"""

image_url = "https://gsfark.com/assets/images/blog/tokyo-shinjuku-shibuya-bunkyo-hero.webp"

print("Posting to LinkedIn...")
post_now(linkedin_id, linkedin_text, image_url, "LinkedIn")

print("Posting to Threads...")
post_now(threads_id, threads_text, image_url, "Threads")
