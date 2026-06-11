#!/bin/bash

echo "Stopping My AI Hub..."
kill $(lsof -ti:8000) 2>/dev/null
kill $(lsof -ti:5173) 2>/dev/null
rm -f backend-ruby/tmp/pids/server.pid
echo "Done."
