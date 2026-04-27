# MessagingPlatefromUI

A production-ready React application for a multi-tenant messaging platform.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Styling**: Vanilla CSS (Custom Design System)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:5008/api
```

### 3. Development
```bash
npm run dev
```

## Folder Structure
- `/src/components`: Reusable UI components
- `/src/pages`: Page components (Login, Register, etc.)
- `/src/services`: API service layers
- `/src/store`: State management (Zustand)
- `/src/hooks`: Custom React hooks
- `/src/types`: TypeScript interfaces and types
- `/src/utils`: Utility functions and axios config
- `/src/layouts`: Page layouts
