# 📱 GeoTrack Frontend

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-1.9.7-764ABC.svg?logo=redux)](https://redux-toolkit.js.org/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000.svg?logo=vercel)](https://geotrack-theta.vercel.app)

Modern, high-performance Single-Page Application (SPA) & Progressive Web App (PWA) for **GeoTrack** — an enterprise GPS attendance tracking, workforce analytics, and HR management system.

---

## 🚀 Live Deployment

- **Production App URL:** [GeoTrack on Vercel](https://geotrack-theta.vercel.app)
- **Connected Backend:** `https://geo-track-backend.onrender.com`

---

## ⚡ Core Features

- **🌐 Dedicated Role-Based Portals:**
  - **Employee Workspace (`/e`):** 1-click GPS attendance check-in/out, personal attendance calendar, leave balance tracker, and daily work log submissions.
  - **Manager Dashboard (`/m`):** Team attendance monitoring, live subordinate status, team work log feed, and leave approval workflows.
  - **Admin Console (`/admin`):** Company-wide headcount metrics, employee CRUD management, office geofence configurations, shift timings, and departmental master records.
- **📍 Real-Time GPS & Geofence Validation:**
  - Interactive **Leaflet** map visualizations showing employee coordinate pins against office geofencing perimeters.
  - Live distance calculations to determine whether check-ins occur within valid office boundaries.
- **👥 Employee Directory & Roster Management:**
  - Full CRUD operations: Add new employees, update profiles, reassign departments/managers/shifts, and delete records with automatic subordinate re-linking.
  - Search filtering by name, email, or employee code, with paginated table and mobile card views.
- **📝 Daily Work Logs & Team Activity Feed:**
  - Daily summary submissions with task notes and impediment/blocker indicators.
  - Multi-tab view: personal submission history and team logs feed.
- **🏖️ End-to-End Leave Management:**
  - Request leave with date pickers, reason inputs, and type selectors (Casual, Sick, Paid, Emergency).
  - Quick approval/rejection actions for managers and organization administrators.
- **🎨 Modern Design & Dark Mode System:**
  - Handcrafted modern UI with sleek card elevation, glassmorphism, and responsive tables.
  - Zero-halo dark mode with optimal contrast and typography.
- **📱 PWA & Mobile-First Responsive Design:**
  - Responsive layouts supporting desktop, tablet, and mobile views.
  - Service worker caching and web application manifest for installation.

---

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5 + SWC/Babel
- **State Management:** Redux Toolkit (`authSlice`)
- **Styling:** Tailwind CSS + Vanilla CSS custom tokens
- **Maps:** Leaflet & React-Leaflet
- **Networking:** Axios with JWT request interceptors & automatic 401 token refresh queue
- **Real-Time:** Socket.io client (WebSocket)
- **Routing:** React Router v6
- **Charts & Metrics:** Recharts

---

## 📁 Repository Structure

```
frontend/
├── public/                 # Static assets, icons, and PWA manifest
├── src/
│   ├── assets/             # Brand logos and iconography
│   ├── components/         # Reusable UI components (Modals, Headers, Loaders)
│   ├── context/            # React Contexts (Toast, Theme)
│   ├── hooks/              # Custom React hooks (useSocket, useGeolocation)
│   ├── modules/            # Specialized domain modules (Admin, Manager, Employee)
│   ├── pages/              # Primary route views (Login, Employees, WorkLogs, Attendance, Leave)
│   ├── services/           # Axios API client and backend service wrappers
│   ├── shared/             # Shared RBAC navigation, topbars, and sidebar menus
│   ├── store/              # Redux store & auth slice
│   ├── App.tsx             # Route declarations & role guards
│   ├── index.css           # Global Tailwind tokens, dark mode & skeuomorphic styles
│   └── main.tsx            # Application entrypoint
├── .env.production         # Production environment configuration
├── vercel.json             # Vercel SPA routing & API reverse proxy rewrites
├── vite.config.ts          # Vite configuration & dev proxy
├── package.json
└── README.md
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a local `.env` file in the `frontend` root:
```env
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=http://localhost:8085
```
*Note: In local development, the Vite proxy in `vite.config.ts` automatically redirects `/api` to the backend server.*

### 4. Run Development Server
```bash
npm run dev
```
The application will launch on **`http://localhost:3000`** with Hot Module Replacement (HMR).

### 5. Build for Production
```bash
npm run build
```
Compiled, production-optimized bundles will be generated in the `dist/` directory.

---

## ☁️ Vercel Deployment Guide

This repository is optimized for deployment on **Vercel**:

1. **Connect Repository:** Import the repository into your Vercel account.
2. **Framework Preset:** Select **Vite**.
3. **Build & Output Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --legacy-peer-deps`
4. **Environment Variables:**
   Add the following under **Project Settings $\rightarrow$ Environment Variables**:
   - `VITE_API_BASE_URL`: `https://geo-track-backend.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://geo-track-backend.onrender.com`
5. **SPA Routing & API Reverse Proxy:**
   [`vercel.json`](vercel.json) handles single-page application fallback routing and proxies `/api/*` requests directly to Render.

> **Tip:** If the Vercel deployment asks visitors for an email verification code, navigate to **Project Settings $\rightarrow$ Deployment Protection** and disable **Vercel Authentication** to allow public access.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
