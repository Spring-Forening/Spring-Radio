# Spring Radio Admin Interface

This is the admin interface for Spring Radio, allowing administrators to manage the livestream and scheduling through LibreTime integration.

## Features

- Schedule management with calendar interface
- Livestream settings configuration
- File upload to Google Cloud Storage
- Integration with LibreTime API

## Prerequisites

- Node.js and npm installed
- LibreTime instance running and accessible
- Google Cloud Storage account and credentials
- Environment variables configured

## Setup

1. Install dependencies:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Fill in the required environment variables:
     - `LIBRETIME_API_URL`: Your LibreTime instance API URL
     - `LIBRETIME_API_KEY`: Your LibreTime API key
     - `GOOGLE_CLOUD_KEY_FILE`: Path to your Google Cloud service account key file
     - `GOOGLE_CLOUD_PROJECT_ID`: Your Google Cloud project ID
     - `GOOGLE_CLOUD_BUCKET_NAME`: Your Google Cloud Storage bucket name

3. Start the development servers:
```bash
# Start the backend server
cd server
npm run dev

# In a new terminal, start the frontend
cd client
npm start
```

4. Access the admin interface at `http://localhost:3000/admin`

## API Endpoints

### Schedule Management
- `GET /api/schedule` - Get current schedule
- `POST /api/schedule` - Create/update schedule entry

### Livestream Settings
- `GET /api/livestream/status` - Get current livestream status
- `PUT /api/livestream/settings` - Update livestream settings

### File Upload
- `POST /api/upload` - Upload files to Google Cloud Storage

## Tech Stack

- Frontend:
  - React
  - Material-UI
  - React Big Calendar
  - React Router

- Backend:
  - Node.js
  - Express
  - Google Cloud Storage SDK
  - LibreTime API integration

## Development

The project uses a client-server architecture:
- Frontend runs on port 3000
- Backend runs on port 5000

Make sure both servers are running for full functionality.
