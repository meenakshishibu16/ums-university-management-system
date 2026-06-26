#!/bin/bash
# ============================================================
# Generate RSA Key Pair for JWT signing (Quarkus SmallRye JWT)
# Run this once before starting the backend
# ============================================================

set -e

KEYS_DIR="src/main/resources"
mkdir -p "$KEYS_DIR"

echo "Generating RSA 2048-bit key pair..."

# Generate private key (PKCS#8)
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out "$KEYS_DIR/privateKey.pem" 2>/dev/null

# Extract public key
openssl rsa -pubout -in "$KEYS_DIR/privateKey.pem" \
  -out "$KEYS_DIR/publicKey.pem" 2>/dev/null

echo "✓ Private key: $KEYS_DIR/privateKey.pem"
echo "✓ Public key:  $KEYS_DIR/publicKey.pem"
echo ""
echo "Keys generated successfully. Restart the backend to pick them up."
