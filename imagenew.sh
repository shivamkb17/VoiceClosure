#!/usr/bin/env bash
# Generate images via Gemini AI from the command line.
#
# Usage:
#   ./image.sh "a cat in space" --resolution 2K --ratio 16:9
#   ./image.sh "sunset over mountains" --size 4K --output ~/Pictures/sunset.png
#   ./image.sh "logo design" -r 1:1 -s 1K -o logo.png
#   ./image.sh "remove background" --input photo.png --output clean.png
#
# Requires: curl, jq, base64 (all standard on Linux/macOS)

set -euo pipefail

GEMINI_API_KEY="USE_KEY"
DEFAULT_MODEL="gemini-3.1-flash-image-preview"

# Defaults
PROMPT=""
RATIO="auto"
RESOLUTION="1K"
OUTPUT=""
INPUT_IMAGE=""
MODEL="$DEFAULT_MODEL"

usage() {
  cat <<EOF
Usage: $(basename "$0") "PROMPT" [options]

Options:
  -r, --ratio RATIO        Aspect ratio: auto, 1:1, 16:9, 9:16, 4:3, 3:4, 3:2,
                           2:3, 5:4, 4:5, 21:9, 1:4, 4:1, 1:8, 8:1 (default: auto)
  -s, --size, --resolution Resolution: 512, 1K, 2K, 4K (default: 1K)
  -o, --output PATH        Output file path (default: generated_image.<ext>)
  -i, --input PATH         Input image path for editing/transforming
  -m, --model NAME         Gemini model (default: $DEFAULT_MODEL)
  -h, --help               Show this help

Environment:
  GEMINI_API_KEY           Override the built-in API key
EOF
}

# ---- Argument parsing ----
if [[ $# -eq 0 ]]; then
  usage; exit 1
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    -r|--ratio) RATIO="$2"; shift 2 ;;
    -s|--size|--resolution) RESOLUTION="$2"; shift 2 ;;
    -o|--output) OUTPUT="$2"; shift 2 ;;
    -i|--input) INPUT_IMAGE="$2"; shift 2 ;;
    -m|--model) MODEL="$2"; shift 2 ;;
    -*) echo "Unknown option: $1" >&2; usage; exit 1 ;;
    *)
      if [[ -z "$PROMPT" ]]; then PROMPT="$1"
      else echo "Unexpected argument: $1" >&2; exit 1
      fi
      shift ;;
  esac
done

if [[ -z "$PROMPT" ]]; then
  echo "Error: prompt is required." >&2
  usage; exit 1
fi

# ---- Dependency checks ----
for cmd in curl jq base64; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: required command '$cmd' not found." >&2
    exit 1
  fi
done

# ---- Build image_config JSON ----
IMAGE_CONFIG="{}"
if [[ "$RATIO" != "auto" ]]; then
  IMAGE_CONFIG=$(jq -nc --arg r "$RATIO" '{aspect_ratio: $r}')
fi
if [[ "$RESOLUTION" != "1K" ]]; then
  IMAGE_CONFIG=$(echo "$IMAGE_CONFIG" | jq -c --arg s "$RESOLUTION" '. + {image_size: $s}')
fi

# ---- Safety settings (all OFF, matching original) ----
SAFETY_SETTINGS='[
  {"category":"HARM_CATEGORY_HARASSMENT","threshold":"OFF"},
  {"category":"HARM_CATEGORY_HATE_SPEECH","threshold":"OFF"},
  {"category":"HARM_CATEGORY_SEXUALLY_EXPLICIT","threshold":"OFF"},
  {"category":"HARM_CATEGORY_DANGEROUS_CONTENT","threshold":"OFF"},
  {"category":"HARM_CATEGORY_CIVIC_INTEGRITY","threshold":"OFF"}
]'

# ---- Build contents (parts) ----
if [[ -n "$INPUT_IMAGE" ]]; then
  if [[ ! -f "$INPUT_IMAGE" ]]; then
    echo "Error: Input image not found: $INPUT_IMAGE" >&2
    exit 1
  fi
  ext="${INPUT_IMAGE##*.}"
  ext="${ext,,}"
  case "$ext" in
    png)        MIME="image/png" ;;
    jpg|jpeg)   MIME="image/jpeg" ;;
    webp)       MIME="image/webp" ;;
    gif)        MIME="image/gif" ;;
    *)          MIME="image/png" ;;
  esac
  # base64 -w0 on Linux; macOS base64 already produces no wrap by default
  if base64 --help 2>&1 | grep -q -- '-w'; then
    B64=$(base64 -w0 "$INPUT_IMAGE")
  else
    B64=$(base64 "$INPUT_IMAGE" | tr -d '\n')
  fi
  PARTS=$(jq -nc --arg m "$MIME" --arg d "$B64" --arg p "$PROMPT" '
    [{inline_data: {mime_type: $m, data: $d}}, {text: $p}]
  ')
  echo "Generating image: \"$PROMPT\" with input image \"$INPUT_IMAGE\" (ratio=$RATIO, resolution=$RESOLUTION)"
else
  PARTS=$(jq -nc --arg p "$PROMPT" '[{text: $p}]')
  echo "Generating image: \"$PROMPT\" (ratio=$RATIO, resolution=$RESOLUTION)"
fi

# ---- Build full request body ----
BODY=$(jq -nc \
  --argjson parts "$PARTS" \
  --argjson image_config "$IMAGE_CONFIG" \
  --argjson safety "$SAFETY_SETTINGS" \
  '{
    contents: [{parts: $parts}],
    generationConfig: {
      responseModalities: ["IMAGE","TEXT"],
      imageConfig: $image_config
    },
    safetySettings: $safety
  }')

# ---- Call API ----
URL="https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent"

RESPONSE=$(curl -sS -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -d "$BODY")

# ---- Handle API errors ----
if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
  echo "API error:" >&2
  echo "$RESPONSE" | jq '.error' >&2
  exit 1
fi

# ---- Extract image part ----
IMG_DATA=$(echo "$RESPONSE" | jq -r '
  .candidates[0].content.parts[]?
  | select(.inlineData != null or .inline_data != null)
  | (.inlineData // .inline_data)
  | .data' | head -n1)

IMG_MIME=$(echo "$RESPONSE" | jq -r '
  .candidates[0].content.parts[]?
  | select(.inlineData != null or .inline_data != null)
  | (.inlineData // .inline_data)
  | .mimeType // .mime_type // "image/png"' | head -n1)

if [[ -z "$IMG_DATA" || "$IMG_DATA" == "null" ]]; then
  echo "Error: No image returned." >&2
  TEXTS=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[]?.text // empty')
  if [[ -n "$TEXTS" ]]; then
    echo "Model response: $TEXTS" >&2
  fi
  exit 1
fi

# ---- Choose extension ----
case "$IMG_MIME" in
  image/jpeg) EXT="jpg" ;;
  image/webp) EXT="webp" ;;
  *)          EXT="png" ;;
esac

OUT_PATH="${OUTPUT:-generated_image.$EXT}"

# ---- Decode and save ----
echo "$IMG_DATA" | base64 -d > "$OUT_PATH"

# Absolute path
if command -v realpath >/dev/null 2>&1; then
  ABS_PATH=$(realpath "$OUT_PATH")
else
  ABS_PATH="$(cd "$(dirname "$OUT_PATH")" && pwd)/$(basename "$OUT_PATH")"
fi

echo "Saved: $ABS_PATH"