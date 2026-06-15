import os, requests
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("BUFFER_ACCESS_TOKEN")
channel_id = os.getenv("BUFFER_THREADS_CHANNEL_ID") # Test on Threads

query = """
mutation CreatePost($input: PostCreateInput!) {
    createPost(input: $input) {
        ... on PostActionSuccess { post { id } }
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
        "schedulingType": "immediate",
        "mode": "shareNow"
    }
}
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
resp = requests.post("https://api.buffer.com/graphql", json={"query": query, "variables": variables}, headers=headers)
print(resp.status_code, resp.text)
