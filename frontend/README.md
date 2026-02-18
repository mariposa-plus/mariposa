# Mariposa Financial System - Frontend

Next.js 14 frontend with Zustand state management and JWT authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your backend API URL

4. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **Authentication**: Login/Register with JWT tokens
- **State Management**: Zustand for global state
- **Protected Routes**: Route guards for authenticated users
- **Role-Based Access**: Admin-only pages
- **API Integration**: Axios with automatic token injection
- **TypeScript**: Full type safety

## Pages

- `/` - Home (redirects to dashboard or login)
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard for all users
- `/admin` - Protected admin-only page

## Project Structure

```
src/
├── app/              # Next.js 14 app router pages
├── components/       # Reusable components
├── lib/              # Utilities (API client)
├── services/         # API service functions
├── store/            # Zustand stores
└── types/            # TypeScript types
```
