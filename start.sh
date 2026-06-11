#!/bin/bash

echo "🚀 Starting My AI Hub..."

# Kill anything already on these ports
kill $(lsof -ti:8000) 2>/dev/null
kill $(lsof -ti:5173) 2>/dev/null
sleep 1

# Clean up stale Rails PID
rm -f backend-ruby/tmp/pids/server.pid

# Load rbenv
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

# Start backend
echo "  → Backend  http://localhost:8000"
cd "$(dirname "$0")/backend-ruby" && bundle exec rails server -p 8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# Start frontend
echo "  → Frontend http://localhost:5173"
cd "$(dirname "$0")/frontend" && npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "Both servers running. Press Ctrl+C to stop."
echo "(Logs: logs/backend.log and logs/frontend.log)"

# Stop both cleanly on Ctrl+C
trap "
  echo ''
  echo 'Stopping servers...'
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  kill \$(lsof -ti:8000) 2>/dev/null
  kill \$(lsof -ti:5173) 2>/dev/null
  rm -f backend-ruby/tmp/pids/server.pid
  echo 'Stopped.'
  exit 0
" SIGINT SIGTERM

# Keep script alive, restart either server if it crashes
while true; do
  if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend crashed — restarting..."
    cd "$(dirname "$0")/backend-ruby" && bundle exec rails server -p 8000 >> ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
  fi
  if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "Frontend crashed — restarting..."
    cd "$(dirname "$0")/frontend" && npm run dev >> ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
  fi
  sleep 3
done
