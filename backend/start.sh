#!/bin/sh
set -e

echo "Running migrations..."
npm run migrate || {
  echo "Warning: Migration failed. Continuing anyway..."
}

echo "Starting application..."
npm start
