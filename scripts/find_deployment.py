#!/usr/bin/env python3
"""Print "<uid> <url> <readyState>" for the Vercel deployment of a commit.

Reads the /v6/deployments JSON on stdin and the commit SHA from the SHA env var.
Exits quietly with no output when that commit has no deployment yet, so the
calling workflow can simply poll until it appears.
"""
import json
import os
import sys

sha = os.environ.get("SHA", "")
if not sha:
    sys.exit(0)

try:
    payload = json.load(sys.stdin)
except ValueError:
    sys.exit(0)

for dep in payload.get("deployments", []):
    meta = dep.get("meta") or {}
    if meta.get("githubCommitSha") == sha:
        print(dep.get("uid", ""), dep.get("url", ""), dep.get("readyState", ""))
        break
