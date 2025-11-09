# BlitzPhoto Mobile Application

Lightning-fast photo upload system built with React Native and Expo.

## Tech Stack

- **React Native 0.81.5** - Mobile framework
- **Expo SDK 54** - Development platform
- **TypeScript 5.x** - Type safety
- **React Navigation 7.x** - Navigation library
- **React Query (@tanstack/react-query)** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **Expo Image Picker** - Photo selection
- **Expo Camera** - Camera access

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
npm install
```

### Development

```bash
# Start Expo development server
npm start

# Run on iOS (requires macOS)
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

### Build

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Environment Variables

Configure API URL in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:8080/api/v1"
    }
  }
}
```

## Project Structure

```
mobile/
├── src/
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # Screen components
│   ├── components/        # Reusable components
│   ├── services/          # API services
│   ├── store/            # Zustand stores
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   ├── constants/         # Constants and theme
│   └── utils/             # Utility functions
├── App.tsx                # Root component
├── app.json               # Expo configuration
└── package.json           # Dependencies
```

## Features

- ✅ React Native + Expo setup
- ✅ TypeScript configuration
- ✅ React Navigation with tabs
- ✅ React Query for server state
- ✅ Zustand for client state
- ✅ Axios with JWT interceptors
- ✅ Authentication screens
- ✅ Theme configuration
- ✅ Responsive design

## Next Steps

- PR 4.2: Camera & Gallery Integration
- PR 4.3: Background Upload System
- PR 4.4: Mobile Gallery & UI Polish

## Permissions

The app requires the following permissions:

- **Camera** - To take photos
- **Photo Library** - To select photos from gallery

These are configured in `app.json` and will be requested at runtime.

