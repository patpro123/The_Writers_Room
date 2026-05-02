#!/bin/bash

echo "🛑 Stopping existing servers..."
kill -9 $(lsof -t -i:3001) 2>/dev/null || true
kill -9 $(lsof -t -i:5173) 2>/dev/null || true

echo "🚀 Starting Backend on port 3001..."
cd backend
npx ts-node index.ts &
BACKEND_PID=$!
cd ..

echo "🚀 Starting Frontend on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers are up and running!"
echo "You can view the app at: http://localhost:5173"
echo "(Press Ctrl+C to stop both servers)"

# Graceful shutdown on Ctrl+C
trap "echo -e '\n🛑 Shutting down servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for both processes to keep the script running and streaming logs
wait $BACKEND_PID $FRONTEND_PID
