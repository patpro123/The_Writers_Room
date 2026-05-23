#!/bin/bash

# Configuration
BACKEND_PORT=3001
FRONTEND_PORT=5173
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

echo "========================================"
echo "🔄 Preparing Local Development Servers"
echo "========================================"

# Function to check and kill processes on a port
check_and_kill() {
  local port=$1
  local name=$2
  
  # Find PID(s) listening on the port
  local pids=$(lsof -t -i:$port 2>/dev/null)
  
  if [ -n "$pids" ]; then
    # Format PIDs for display (space-separated)
    local pids_clean=$(echo $pids | xargs)
    echo "⚠️  Found $name running on port $port (PID: $pids_clean)"
    echo "🛑 Stopping existing $name..."
    kill -9 $pids 2>/dev/null || true
    sleep 1.5 # Give the OS time to release the port
    
    # Double check if port is freed
    if lsof -t -i:$port >/dev/null 2>&1; then
      echo "❌ Error: Failed to free port $port. Please kill process $pids_clean manually."
      exit 1
    else
      echo "✅ Port $port successfully freed."
    fi
  else
    echo "✅ No active $name detected on port $port."
  fi
}

# Check and clean up existing processes
check_and_kill $BACKEND_PORT "Backend Server"
check_and_kill $FRONTEND_PORT "Frontend Server"

echo ""
echo "🚀 Starting backend server on port $BACKEND_PORT..."
cd "$BACKEND_DIR" || exit 1
npx ts-node index.ts &
BACKEND_PID=$!
cd ..

echo "🚀 Starting frontend server on port $FRONTEND_PORT..."
cd "$FRONTEND_DIR" || exit 1
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "✅ Both servers have been initiated!"
echo "🔗 Frontend: http://localhost:$FRONTEND_PORT"
echo "🔗 Backend API: http://localhost:$BACKEND_PORT"
echo "========================================"
echo "ℹ️  Piping logs below. Press Ctrl+C to terminate both servers."
echo ""

# Handle graceful shutdown
cleanup() {
  echo -e "\n\n🛑 Shutting down servers..."
  # Send SIGTERM first
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  sleep 1
  # Force kill if still running
  kill -9 $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  echo "👋 Goodbye!"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for background processes to keep script running and output logs
wait $BACKEND_PID $FRONTEND_PID
