"""
Proto Stub Generator
Run this script to compile ai.proto into Python gRPC stubs.

Usage:
    python scripts/generate_protos.py

Output:
    apps/genai-service/generated/ai_pb2.py
    apps/genai-service/generated/ai_pb2_grpc.py
"""

import subprocess
import sys
from pathlib import Path

# Paths
ROOT = Path(__file__).parent.parent.parent.parent  # NexusEd root
PROTO_DIR = ROOT / "libs" / "shared" / "proto"
PROTO_FILE = PROTO_DIR / "ai.proto"
OUTPUT_DIR = Path(__file__).parent.parent / "generated"

OUTPUT_DIR.mkdir(exist_ok=True)

# Create __init__.py in generated/
(OUTPUT_DIR / "__init__.py").write_text("# Auto-generated gRPC stubs\n")

print(f"Compiling proto: {PROTO_FILE}")
print(f"Output dir:      {OUTPUT_DIR}")

result = subprocess.run(
    [
        sys.executable, "-m", "grpc_tools.protoc",
        f"--proto_path={PROTO_DIR}",
        f"--python_out={OUTPUT_DIR}",
        f"--grpc_python_out={OUTPUT_DIR}",
        str(PROTO_FILE),
    ],
    capture_output=True,
    text=True,
)

if result.returncode != 0:
    print("[FAIL] Proto compilation failed:")
    print(result.stderr)
    sys.exit(1)

print("[OK] Generated:")
for f in OUTPUT_DIR.glob("*.py"):
    print(f"   {f.name}")

# ── Patch grpc stub import (grpcio-tools generates a flat import that
#    breaks when stubs are inside a package directory) ────────────────────────
grpc_file = OUTPUT_DIR / "ai_pb2_grpc.py"
if grpc_file.exists():
    content = grpc_file.read_text()
    patched = content.replace(
        "import ai_pb2 as ai__pb2",
        "from generated import ai_pb2 as ai__pb2",
    )
    if patched != content:
        grpc_file.write_text(patched)
        print("   [patched] ai_pb2_grpc.py import fixed for package resolution")

