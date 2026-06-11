#!/bin/bash

# Kill anything already on these ports
kill $(lsof -ti:8000) 2>/dev/null
kill $(lsof -ti:5173) 2>/dev/null

# Clean up stale Rails PID
rm -f backend-ruby/tmp/pids/server.pid

# Load rbenv
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

echo "Starting Rails backend on http://localhost:8000 ..."
cd backend-ruby && bundle exec rails server -p 8000 &

echo "Starting React frontend on http://localhost:5173 ..."
cd ../frontend && npm run dev &

echo ""
echo "App running at http://localhost:5173"
echo "Press Ctrl+C to stop both servers"

# Wait and stop both on Ctrl+C
trap "kill %1 %2 2>/dev/null; echo 'Servers stopped.'" EXIT
wait
