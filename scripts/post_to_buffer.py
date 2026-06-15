#!/usr/bin/env python3
import os
import argparse
import requests
from dotenv import load_dotenv

# Load .env file
load_dotenv()

BUFFER_ACCESS_TOKEN = os.getenv("BUFFER_ACCESS_TOKEN")
BUFFER_X_CHANNEL_ID = os.getenv("BUFFER_X_CHANNEL_ID")
BUFFER_LINKEDIN_CHANNEL_ID = os.getenv("BUFFER_LINKEDIN_CHANNEL_ID")
BUFFER_THREADS_CHANNEL_ID = os.getenv("BUFFER_THREADS_CHANNEL_ID")

GRAPHQL_ENDPOINT = "https://api.buffer.com/graphql"

def post_to_channel(channel_id, text, platform_name):
    if not channel_id:
        print(f"[{platform_name}] Error: Channel ID not found in .env")
        return False

    query = """
    mutation CreatePost($input: PostCreateInput!) {
        createPost(input: $input) {
            ... on PostActionSuccess {
                post {
                    id
                    text
                }
            }
            ... on MutationError {
                message
            }
        }
    }
    """
    
    variables = {
        "input": {
            "channelId": channel_id,
            "text": text,
            "schedulingType": "automatic",
            "mode": "addToQueue"
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
        
        if "errors" in data:
            print(f"[{platform_name}] GraphQL Error: {data['errors']}")
            return False
            
        result = data.get("data", {}).get("createPost", {})
        if "message" in result: # MutationError
            print(f"[{platform_name}] Mutation Error: {result['message']}")
            return False
            
        print(f"[{platform_name}] ✅ Successfully added to Buffer Queue! Post ID: {result.get('post', {}).get('id')}")
        return True
    except Exception as e:
        print(f"[{platform_name}] Request Failed: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Post drafted text to Buffer Queue (X, LinkedIn, Threads)")
    parser.add_argument("--platform", type=str, required=True, choices=["x", "linkedin", "threads", "all"], help="Target platform")
    parser.add_argument("--text", type=str, required=True, help="Content to post")
    
    args = parser.parse_args()
    
    if not BUFFER_ACCESS_TOKEN:
        print("Error: BUFFER_ACCESS_TOKEN not found in .env file.")
        exit(1)
        
    success = True
    
    if args.platform in ["x", "all"]:
        if not post_to_channel(BUFFER_X_CHANNEL_ID, args.text, "X"):
            success = False
            
    if args.platform in ["linkedin", "all"]:
        if not post_to_channel(BUFFER_LINKEDIN_CHANNEL_ID, args.text, "LinkedIn"):
            success = False
            
    if args.platform in ["threads", "all"]:
        if not post_to_channel(BUFFER_THREADS_CHANNEL_ID, args.text, "Threads"):
            success = False
            
    if not success:
        exit(1)

if __name__ == "__main__":
    main()
