#!/bin/sh
set -e

echo "Waiting for MinIO to be ready..."
sleep 5

# Use MinIO client (mc) if available, otherwise use curl
if command -v mc > /dev/null 2>&1; then
  mc alias set local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
  mc mb local/dnd-assets --ignore-existing
  mc anonymous set public local/dnd-assets
  echo "Bucket dnd-assets created and set to public"
else
  echo "MinIO client (mc) not available, bucket will be created by backend"
fi

