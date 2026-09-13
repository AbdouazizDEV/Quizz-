#!/usr/bin/env bash
# Affiche l’empreinte SHA-256 du certificat APK (format assetlinks + hex).
# Usage : ./scripts/print-apk-sha256.sh builds/mon.apk
set -euo pipefail

APK="${1:-}"
if [[ -z "$APK" || ! -f "$APK" ]]; then
  echo "Usage: $0 path/to/app.apk" >&2
  exit 1
fi

if ! command -v apksigner >/dev/null 2>&1; then
  echo "apksigner introuvable (Android build-tools)." >&2
  exit 1
fi

HEX=$(apksigner verify --print-certs "$APK" 2>&1 | sed -n 's/.*SHA-256 digest: //p' | head -1)
if [[ -z "$HEX" ]]; then
  echo "Impossible de lire le certificat." >&2
  exit 1
fi

COLON=$(echo "$HEX" | sed 's/../&:/g' | sed 's/:$//' | tr 'a-f' 'A-F')

echo "SHA-256 (hex)    : $HEX"
echo "SHA-256 (assetlinks) : $COLON"
echo
echo "Backend (.env prod) :"
echo "ANDROID_SHA256_CERT_FINGERPRINTS=$COLON"
