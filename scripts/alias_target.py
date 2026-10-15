#!/usr/bin/env python3
"""Print the deployment id that BLOG_DOMAIN currently resolves to.

Reads the /v4/aliases JSON on stdin. Prints an empty line when the domain has
no alias yet, so the caller can poll until it points where it should.
"""
import json
import os
import sys

domain = os.environ.get("BLOG_DOMAIN", "")

try:
    payload = json.load(sys.stdin)
except ValueError:
    sys.exit(0)

for alias in payload.get("aliases", []):
    if alias.get("alias") == domain:
        print(alias.get("deploymentId") or (alias.get("deployment") or {}).get("id") or "")
        break
