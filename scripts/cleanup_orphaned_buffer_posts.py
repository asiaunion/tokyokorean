#!/usr/bin/env python3
import os, sys, json, urllib.request, urllib.error, time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_FILE = os.path.join(BASE_DIR, "sns-drafts", "sns-log.json")
ENV_FILE = os.path.join(BASE_DIR, ".env")
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

DELETE_MUTATION = """
mutation DeletePost($id: String!) {
  deletePost(input: { id: $id }) {
    ... on PostActionSuccess { post { id } }
    ... on InvalidInputError { message }
    ... on UnauthorizedError { message }
    ... on UnexpectedError   { message }
  }
}
"""

def delete_buffer_post(token, post_id):
    payload = json.dumps({"query": DELETE_MUTATION, "variables": {"id": post_id}}).encode()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    req = urllib.request.Request(GQL_URL, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read())
            data = body.get('data', {}).get('deletePost', {})
            if data.get('post'):
                time.sleep(0.3)
                return True
            err = data.get('message', str(body))
            print(f"  ⚠️  삭제 실패: {err}")
            return False
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print("  ⏳ Rate limit — 65초 대기...")
            time.sleep(65)
            return delete_buffer_post(token, post_id)
        print(f"  ❌ HTTP {e.code}")
        return False
    except Exception as e:
        print(f"  ❌ {e}")
        return False

def get_pending_updates(token, profile_id):
    all_updates = []
    page = 1
    while True:
        url = f"https://api.bufferapp.com/1/profiles/{profile_id}/updates/pending.json?count=100&page={page}&access_token={token}"
        headers = {"Authorization": f"Bearer {token}"}
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read())
                updates = data.get('updates', [])
                if not updates:
                    break
                all_updates.extend([u['id'] for u in updates])
                page += 1
                time.sleep(0.5)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print("  ⏳ Rate limit on fetch — 65초 대기...")
                time.sleep(65)
                continue
            print(f"  ❌ HTTP {e.code} for page {page}")
            break
        except Exception as e:
            print(f"  ❌ Exception for page {page}: {e}")
            break
    return all_updates

def main():
    env = load_env()
    TOKEN = env['BUFFER_ACCESS_TOKEN']
    channels = {
        env['BUFFER_X_CHANNEL_ID'],
        env['BUFFER_LINKEDIN_CHANNEL_ID'],
        env['BUFFER_THREADS_CHANNEL_ID']
    }

    # 1. Load valid IDs from sns-log.json
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        log = json.load(f)
    
    valid_ids = set()
    for item in log.get('published', []):
        for ch, pid in item.get('buffer_ids', {}).items():
            if pid and pid != "manual":
                valid_ids.add(pid)
    
    print(f"✅ sns-log.json 내 유효한 최신 Buffer ID: {len(valid_ids)}건")

    # 2. Fetch all pending IDs from Buffer
    all_pending_ids = set()
    for ch_id in channels:
        print(f"📡 Channel {ch_id} 대기열 조회 중...")
        pids = get_pending_updates(TOKEN, ch_id)
        print(f"   -> {len(pids)}건 확인됨")
        all_pending_ids.update(pids)
    
    print(f"\n🔍 Buffer 대기열 총계 (고유 ID): {len(all_pending_ids)}건")

    # 3. Find orphans
    orphans = all_pending_ids - valid_ids
    print(f"🗑️ 삭제 대상(고아 포스트): {len(orphans)}건\n")

    if not orphans:
        print("🎉 정리할 중복 포스트가 없습니다.")
        return

    # 4. Delete orphans
    deleted = 0
    for i, pid in enumerate(orphans, 1):
        print(f"[{i}/{len(orphans)}] 고아 포스트 삭제 중: {pid} ... ", end="", flush=True)
        if delete_buffer_post(TOKEN, pid):
            print("OK")
            deleted += 1
        else:
            print("FAIL")
    
    print(f"\n✅ 고아 포스트 정리 완료: {deleted}/{len(orphans)}건 삭제됨.")

if __name__ == "__main__":
    main()
