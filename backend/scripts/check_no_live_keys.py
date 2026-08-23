#!/usr/bin/env python3
"""
Security Lint Check: Enforce Test-Mode Key Isolation.
Scans the entire repository to ensure no live Razorpay keys ('rzp_live_') exist.
Fails with exit code 1 if any occurrences are found.
"""
import os
import sys

FORBIDDEN_PATTERNS = ["rzp_live_"]
IGNORED_DIRS = [".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", "scratch"]
IGNORED_FILES = ["check_no_live_keys.py", "PROJECT_MEMORY.md", "README.md"]
SOURCE_EXTENSIONS = ('.py', '.ts', '.tsx', '.js', '.jsx', '.json', '.sql', '.env', '.yaml', '.yml')

def scan_repo(root_dir):
    violations = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip ignored dirs
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]
        
        for fname in filenames:
            if fname in IGNORED_FILES or fname.endswith('.pyc') or fname.endswith('.log'):
                continue
            if not fname.endswith(SOURCE_EXTENSIONS):
                continue
            
            fpath = os.path.join(dirpath, fname)
            try:
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    for line_num, line in enumerate(f, 1):
                        for pattern in FORBIDDEN_PATTERNS:
                            if pattern in line:
                                violations.append((fpath, line_num, pattern, line.strip()))
            except Exception:
                pass
                
    return violations

if __name__ == "__main__":
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    print(f"[*] Scanning repository for forbidden live key patterns at: {repo_root}")
    violations = scan_repo(repo_root)
    
    if violations:
        print("\n[!] CRITICAL SECURITY VIOLATION: Live key patterns found in codebase:")
        for fpath, lnum, pat, line in violations:
            rel_path = os.path.relpath(fpath, repo_root)
            print(f"    - {rel_path}:{lnum} -> Found '{pat}': {line}")
        print("\n[X] Build / Lint Check FAILED. Replace all live keys with 'rzp_test_' identifiers.\n")
        sys.exit(1)
    else:
        print("[+] SUCCESS: Zero live key patterns found. Test-mode key isolation verified.\n")
        sys.exit(0)
