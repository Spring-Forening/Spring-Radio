#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting deployment process...${NC}"

# Deploy API service
echo -e "${GREEN}Deploying API service...${NC}"
gcloud app deploy server/app.yaml

# Deploy client service
echo -e "${GREEN}Deploying client service...${NC}"
gcloud app deploy client/app.yaml

# Update routing rules
echo -e "${GREEN}Updating routing rules...${NC}"
gcloud app deploy dispatch.yaml

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "API service: https://api-dot-spring-radio.lm.r.appspot.com"
echo -e "Client service: https://spring-radio.lm.r.appspot.com"
