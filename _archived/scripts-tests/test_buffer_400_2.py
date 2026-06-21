import os, json, urllib.request, urllib.error
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("BUFFER_ACCESS_TOKEN")
channel_id = os.getenv("BUFFER_X_CHANNEL_ID")

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

variables = {
    "input": {
        "channelId": channel_id,
        "text": "Buffer test",
        "schedulingType": "automatic",
        "mode": "shareNow"
    }
}
payload = json.dumps({"query": CREATE_MUTATION, "variables": variables}).encode()
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
req = urllib.request.Request("https://api.buffer.com/graphql", data=payload, headers=headers, method="POST")

try:
    with urllib.request.urlopen(req) as resp:
        print(resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}: {e.read().decode()}")
