# Mariposa Financial System

Full-stack financial management application with Express.js backend and Next.js frontend.

## Project Structure

```
mariposa-financial-system/
├── backend/          # Express + MongoDB + TypeScript
└── frontend/         # Next.js + Zustand + TypeScript
```

## Quick Start

### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your JWT secret

5. Run backend:
```bash
npm run dev
```

Backend runs on [http://localhost:5000](http://localhost:5000)

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Run frontend:
```bash
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000)

## Features

### Backend
- ✅ Express.js with TypeScript
- ✅ MongoDB with Mongoose
- ✅ JWT Authentication
- ✅ Role-based access control (User/Admin)
- ✅ CORS configured
- ✅ RESTful API structure
- ✅ Error handling middleware
- ✅ Sample CRUD operations

### Frontend
- ✅ Next.js 14 with App Router
- ✅ TypeScript
- ✅ Zustand state management
- ✅ JWT token handling
- ✅ Protected routes
- ✅ Admin-only pages
- ✅ Axios API client with interceptors
- ✅ Responsive design

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Items
- `GET /api/items` - Get all items (Protected)
- `GET /api/items/:id` - Get single item (Protected)
- `POST /api/items` - Create item (Protected)
- `PUT /api/items/:id` - Update item (Protected)
- `DELETE /api/items/:id` - Delete item (Protected)

## Technology Stack

### Backend
- Express.js
- MongoDB + Mongoose
- TypeScript
- JWT (jsonwebtoken)
- bcryptjs
- CORS

### Frontend
- Next.js 14
- React 18
- TypeScript
- Zustand
- Axios

## Database Connection

MongoDB URI is configured in `backend/.env`:
```
mongodb+srv://hatem:87h0u74H@cluster0.5mzimdd.mongodb.net/mariposa-financial-system
```

## Default User Roles

- `user` - Regular user with standard access
- `admin` - Administrator with full access
