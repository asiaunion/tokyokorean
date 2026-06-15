#!/usr/bin/env python3
"""
즉시 게시 스크립트 (customScheduled → 현재 시각으로 즉시 발행)
사용법: python3 scripts/_post_now.py --platform threads --text "..."
"""
import os, sys, json, argparse, urllib.request, urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
ENV_FILE = BASE_DIR / ".env"
GQL_URL  = "https://api.buffer.com/graphql"

def load_env():
    env = {}
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip()
    return env

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

def post_now(token, channel_id, text, platform_name, canonical_url=None):
    # 현재 시각 + 2분 (Buffer API는 미래 시각 필요)
    now_utc = (datetime.now(timezone.utc) + timedelta(minutes=2)).isoformat()

    assets_payload = []
    if canonical_url and platform_name.lower() != "x":
        assets_payload = [{"link": {"url": canonical_url}}]

    variables = {
        "input": {
            "channelId": channel_id,
            "text": text,
            "schedulingType": "automatic",
            "mode": "customScheduled",
            "dueAt": now_utc,
            "saveToDraft": False,
            "assets": assets_payload
        }
    }

    payload = json.dumps({"query": MUTATION, "variables": variables}).encode()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    req = urllib.request.Request(GQL_URL, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read())
            data = body.get('data', {}).get('createPost', {})
            if data.get('post'):
                print(f"[{platform_name}] ✅ 게시 성공! ID={data['post']['id']} status={data['post']['status']}")
                return data['post']
            err_msg = data.get('message', str(body))
            print(f"[{platform_name}] ❌ 오류: {err_msg}")
            return {"error": err_msg}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"[{platform_name}] ❌ HTTP {e.code}: {err_body[:300]}")
        return {"error": f"HTTP {e.code}: {err_body[:300]}"}
    except Exception as e:
        print(f"[{platform_name}] ❌ 예외: {e}")
        return {"error": str(e)}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--platform", required=True, choices=["threads", "linkedin", "x"])
    parser.add_argument("--text", required=True)
    parser.add_argument("--url", default=None, help="OG 카드용 canonical URL (선택)")
    args = parser.parse_args()

    env = load_env()
    token = env.get("BUFFER_ACCESS_TOKEN")
    channel_map = {
        "threads":  env.get("BUFFER_THREADS_CHANNEL_ID"),
        "linkedin": env.get("BUFFER_LINKEDIN_CHANNEL_ID"),
        "x":        env.get("BUFFER_X_CHANNEL_ID"),
    }

    if not token:
        print("❌ BUFFER_ACCESS_TOKEN 없음")
        sys.exit(1)

    channel_id = channel_map.get(args.platform)
    if not channel_id:
        print(f"❌ {args.platform} Channel ID 없음")
        sys.exit(1)

    result = post_now(token, channel_id, args.text, args.platform, canonical_url=args.url)
    if result.get("error"):
        sys.exit(1)

if __name__ == "__main__":
    main()
