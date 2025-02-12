#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting build and deploy process...${NC}"

# Set environment variables for production build
echo -e "${GREEN}Setting up environment variables...${NC}"
echo "REACT_APP_API_URL=https://api-dot-spring-radio.lm.r.appspot.com" > client/.env.production

# Build the client
echo -e "${GREEN}Building client...${NC}"
cd client && npm run build
cd ..

# Deploy to App Engine
echo -e "${GREEN}Deploying to App Engine...${NC}"
gcloud app deploy server/app.yaml client/app.yaml dispatch.yaml

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Client: https://spring-radio.lm.r.appspot.com"
echo -e "API: https://api-dot-spring-radio.lm.r.appspot.com"
