import os, json, time, urllib.request, urllib.error
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("BUFFER_ACCESS_TOKEN")
channel_id = os.getenv("BUFFER_THREADS_CHANNEL_ID")
JST = timezone(timedelta(hours=9))

items_to_schedule = [
    {
        "slug": "japan-visa-paths-permanent-business-manager-asset-holders",
        "date": "2026-07-13",
        "text": "Japan Visa Routes: Permanent Residency, Business Manager, and J-Find\n\nJapan is aggressively opening to global talent and investors. A breakdown of the 2025/2026 immigration reforms, the 30M JPY capital requirement, and the 1-year fast-track PR route.\n\n→ https://gsfark.com/posts/japan-visa-paths-permanent-business-manager-asset-holders/?utm_source=threads&utm_medium=social&utm_campaign=blog-broadcast\n\n#JapanRealEstate #Tokyo"
    },
    {
        "slug": "tokyo-korean-community-beyond-shinokubo",
        "date": "2026-08-03",
        "text": "Beyond Shin-Okubo: The New Map of Korea-Tokyo Communities & Business 2026\n\nTokyo’s Korean community has expanded. From the global elite networks in Azabu to the K-Startup hub in Toranomon, we map the evolving business bases of Koreans in Tokyo today.\n\n→ https://gsfark.com/posts/tokyo-korean-community-beyond-shinokubo/?utm_source=threads&utm_medium=social&utm_campaign=blog-broadcast\n\n#JapanRealEstate #Tokyo"
    },
    {
        "slug": "tokyo-buying-process-step-by-step",
        "date": "2026-08-07",
        "text": "Tokyo Real Estate Buying Process Demystified: An 8-Step Field Guide\n\nA comprehensive 8-step walkthrough for first-time foreign buyers acquiring property in Tokyo. Covers the 2026 nationality disclosure mandate, non-resident documentation, and title registration.\n\n→ https://gsfark.com/posts/tokyo-buying-process-step-by-step/?utm_source=threads&utm_medium=social&utm_campaign=blog-broadcast\n\n#JapanRealEstate #Tokyo"
    },
    {
        "slug": "macro-barrier-and-super-scarce-real-estate-selection",
        "date": "2026-08-14",
        "text": "Navigating Tight Credit and Selecting Ultra-Scarce Real Estate\n\nAnalyzing the downside resilience of high-end downtown real estate under tight credit regulations and rate hikes. How to apply the elite 1% filter to identify genuinely scarce assets in Tokyo and Seoul.\nFor information purposes only.\n\n→ https://gsfark.com/posts/macro-barrier-and-super-scarce-real-estate-selection/?utm_source=threads&utm_medium=social&utm_campaign=blog-broadcast\n\n#JapanRealEstate #Tokyo"
    }
]

CREATE_MUTATION = """
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess { post { id } }
    ... on InvalidInputError { message }
    ... on UnauthorizedError { message }
    ... on LimitReachedError { message }
    ... on UnexpectedError   { message }
  }
}
"""

def create_post(text, date_str):
    dt = datetime.strptime(f"{date_str} 09:00", "%Y-%m-%d %H:%M").replace(tzinfo=JST)
    due_at = dt.isoformat()
    variables = {
        "input": {
            "channelId": channel_id,
            "text": text,
            "schedulingType": "automatic",
            "mode": "customScheduled",
            "dueAt": due_at,
            "saveToDraft": False,
            "assets": []
        }
    }
    payload = json.dumps({"query": CREATE_MUTATION, "variables": variables}).encode()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    req = urllib.request.Request("https://api.buffer.com/graphql", data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read()).get('data', {}).get('createPost', {})
            if data.get('post'):
                return data['post']['id']
            print("Error:", data.get('message'))
    except Exception as e:
        print("Exception:", e)
    return None

def main():
    log_path = "/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog/sns-drafts/sns-log.json"
    with open(log_path, "r", encoding="utf-8") as f:
        logs = json.load(f)

    for item in items_to_schedule:
        print(f"Scheduling {item['slug']} for {item['date']}...")
        pid = create_post(item["text"], item["date"])
        if pid:
            print(f"✅ Success! ID: {pid}")
            # Update log
            for p in logs.get("published", []):
                if p.get("slug") == item["slug"] and p.get("date") == item["date"]:
                    p.setdefault("buffer_ids", {})["Threads-EN"] = pid
                    # If it was marked as error before but now we fixed it, let's keep it scheduled.
                    # Wait, earlier the main script marked the whole row as ⚠️ because one failed, but the status string was just "scheduled" for the whole row or "error". Actually, the row is marked "scheduled" even if one failed, let's verify. Let's just make sure it's "scheduled".
                    p["mode"] = "scheduled"
                    break
        time.sleep(1)

    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
