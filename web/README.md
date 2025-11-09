# BlitzPhoto Web Application

Lightning-fast photo upload system with React, TypeScript, and Vite.

## Tech Stack

- **React 19.2.0** - UI library
- **TypeScript 5.x** - Type safety
- **Vite 7.x** - Build tool and dev server
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **React Router 7.x** - Client-side routing
- **React Query (@tanstack/react-query)** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_ENABLE_WEBSOCKET=false
VITE_ENABLE_ANALYTICS=false
```

## Project Structure

```
web/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Zustand stores
│   ├── lib/            # Utility libraries
│   ├── config/         # Configuration
│   ├── types/          # TypeScript types
│   ├── routes/         # Route definitions
│   ├── App.tsx         # Root component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── tailwind.config.js # Tailwind configuration
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies
```

## Features

- ✅ React + TypeScript setup
- ✅ Tailwind CSS configuration
- ✅ React Router routing
- ✅ React Query for server state
- ✅ Zustand for client state
- ✅ Axios with JWT interceptors
- ✅ Authentication store
- ✅ Upload store
- ✅ Responsive design

## Next Steps

- PR 3.2: Upload UI with Drag-Drop
- PR 3.3: Real-Time Progress Tracking
- PR 3.4: Photo Gallery & Management
