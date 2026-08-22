import requests, json
import sys
sys.path.append(r'c:\SHARAN PROJECTS\Finora\backend')
from ai.tools import TOOLS_SCHEMA

payload = {
    "model": "gemma3:4b",
    "messages": [{"role": "user", "content": "What is my match rate?"}],
    "tools": TOOLS_SCHEMA,
    "stream": False
}
r = requests.post("http://127.0.0.1:11434/api/chat", json=payload)
print(r.status_code)
print(r.text)
