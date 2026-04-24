#!/bin/bash

# AI Employee Sentiment Analyzer - Start Script
# This script sets up the database, seeds data, and starts the application

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "=================================================="
echo "  🧠 AI Employee Sentiment Analyzer"
echo "  Starting Application..."
echo "=================================================="
echo -e "${NC}"

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Loaded .env configuration${NC}"
else
  echo -e "${RED}✗ .env file not found! Please create one.${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

# Function to kill processes on ports
cleanup_ports() {
  echo -e "\n${BLUE}🔧 Cleaning up ports...${NC}"
  for PORT in $BACKEND_PORT $FRONTEND_PORT; do
    PID=$(lsof -ti:$PORT 2>/dev/null || true)
    if [ -n "$PID" ]; then
      echo -e "  Killing process on port $PORT (PID: $PID)"
      kill -9 $PID 2>/dev/null || true
      sleep 1
    fi
  done
  echo -e "${GREEN}✓ Ports cleaned${NC}"
}

# Function to cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null || true
  fi
  cleanup_ports
  echo -e "${GREEN}✓ Application stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Clean up ports first
cleanup_ports

# Setup PostgreSQL database
echo -e "\n${BLUE}🗄️  Setting up PostgreSQL database...${NC}"

# Check if PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
  echo -e "${YELLOW}Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
  sleep 3
fi

# Create database if it doesn't exist
DB_NAME="sentiment_analyzer"
if ! psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw $DB_NAME; then
  echo -e "  Creating database '$DB_NAME'..."
  createdb $DB_NAME 2>/dev/null || true
fi

# Run schema
echo -e "  Running schema..."
psql -d $DB_NAME -f backend/db/schema.sql -q 2>/dev/null || psql -d $DB_NAME -f backend/db/schema.sql 2>&1 | head -5

# Run seed data
echo -e "  Seeding data..."
psql -d $DB_NAME -f backend/db/seed.sql -q 2>/dev/null || psql -d $DB_NAME -f backend/db/seed.sql 2>&1 | head -5

echo -e "${GREEN}✓ Database ready with seed data${NC}"

# Install dependencies if needed
echo -e "\n${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
  echo -e "  Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo -e "  Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

echo -e "${GREEN}✓ Dependencies ready${NC}"

# Start backend with nodemon (hot reload)
echo -e "\n${BLUE}🚀 Starting backend on port $BACKEND_PORT...${NC}"
cd "$PROJECT_DIR/backend"
npx nodemon server.js &
BACKEND_PID=$!
cd "$PROJECT_DIR"

sleep 2

# Start frontend with Vite (hot reload built-in)
echo -e "${BLUE}🚀 Starting frontend on port $FRONTEND_PORT...${NC}"
cd "$PROJECT_DIR/frontend"
npx vite --port $FRONTEND_PORT &
FRONTEND_PID=$!
cd "$PROJECT_DIR"

sleep 3

echo -e "\n${PURPLE}=================================================="
echo -e "  🧠 AI Employee Sentiment Analyzer is RUNNING!"
echo -e "==================================================${NC}"
echo -e ""
echo -e "  ${GREEN}Frontend:${NC}  http://localhost:$FRONTEND_PORT"
echo -e "  ${GREEN}Backend:${NC}   http://localhost:$BACKEND_PORT"
echo -e "  ${GREEN}API Health:${NC} http://localhost:$BACKEND_PORT/api/health"
echo -e ""
echo -e "  ${YELLOW}Login Credentials:${NC}"
echo -e "    Email: admin@sentiment.com"
echo -e "    Password: password123"
echo -e ""
echo -e "  ${BLUE}Press Ctrl+C to stop${NC}"
echo -e ""

# Wait for both processes
wait
