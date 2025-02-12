#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to start client
start_client() {
  echo -e "${GREEN}Starting client on http://localhost:3000${NC}"
  cd client && npm start
}

# Function to start server
start_server() {
  echo -e "${GREEN}Starting server on http://localhost:5001${NC}"
  cd server && npm run dev
}

# Check if a specific command was passed
if [ "$1" = "start_server" ]; then
  start_server
  exit 0
elif [ "$1" = "start_client" ]; then
  start_client
  exit 0
fi

# Start both in separate terminals
echo -e "${YELLOW}Starting development environment...${NC}"

# Start both in separate terminals
osascript <<EOF
tell application "Terminal"
    do script "cd \"$(pwd)\" && ./dev.sh start_server"
end tell
tell application "Terminal"
    do script "cd \"$(pwd)\" && ./dev.sh start_client"
end tell
EOF

echo -e "${GREEN}Development environment started!${NC}"
echo -e "Client: http://localhost:3000"
echo -e "Server: http://localhost:5001"
