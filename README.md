# Geo-Track Frontend

This is the React (Vite) frontend for the Geo-Track HR platform. 

## Requirements
- **Node.js** (v16 or higher)
- **npm** (v7 or higher)

## Local Development Setup

1. **Install Dependencies**
   Run the following command to install all required packages:
   ```bash
   npm install
   ```

2. **Run the Development Server**
   To start the frontend locally with hot-reload enabled:
   ```bash
   npm run dev
   ```
   By default, the server will start on `http://localhost:3000`.

3. **Backend API Connection**
   For local development, the frontend proxy is configured to route `/api` requests to `http://localhost:8085`. Ensure your Spring Boot backend is running on port 8085.

## Building for Production

To create a production-ready build:
```bash
npm run build
```
The output will be placed in the `dist` directory.

## Deployment (Vercel)

This project is optimized for deployment on Vercel. 
- Ensure you set the `VITE_API_BASE_URL` environment variable in your Vercel project settings (e.g., `https://your-backend-api.onrender.com/api`).
- A `vercel.json` file is included to handle React Router single-page application (SPA) fallback rules.
