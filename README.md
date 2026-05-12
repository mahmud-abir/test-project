# AI-Powered Fitness & Health App

A modern, mobile-first fitness and health application built with React 18, TypeScript, Vite, and TailwindCSS v4.

## Features

- **Smart Onboarding**: 4-step profile setup with health conditions tracking
- **AI-Powered Habits**: Personalized habit generation based on your profile and health conditions
- **Real-Time Dashboard**: Weather widget, AI tips, quick stats, and watch connection status
- **Habit Tracking**: Recurring reminders and daily routines with streak tracking
- **Bluetooth Integration**: Real Web Bluetooth API support with simulation fallback
- **Dark Theme**: Modern dark UI with smooth animations using Framer Motion

## Tech Stack

- React 18 + TypeScript
- Vite (Build Tool)
- TailwindCSS v4 (Styling)
- Zustand (State Management)
- Framer Motion (Animations)
- Lucide React (Icons)

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

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deploy to Vercel

This project is configured for easy deployment to Vercel:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

Or connect your GitHub repository to Vercel for automatic deployments.

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx       # Main dashboard screen
│   ├── HabitsList.tsx      # Habits tracking screen
│   ├── OnboardingForm.tsx  # 4-step onboarding flow
│   ├── ProfileSettings.tsx # User profile screen
│   └── TabBar.tsx          # Navigation tab bar
├── store/
│   └── useAppStore.ts      # Zustand state management
├── utils/
│   ├── bluetoothService.ts # Bluetooth device integration
│   ├── habitGenerator.ts   # AI habit generation logic
│   └── tipGenerator.ts     # AI tip generation system
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Main app component
└── main.tsx                # Entry point
```

## License

MIT
