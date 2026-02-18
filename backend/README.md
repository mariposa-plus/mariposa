# Mariposa Financial System - Backend

Express.js backend with MongoDB, JWT authentication, and role-based access control.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration (JWT_SECRET, etc.)

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Items (CRUD Example)
- `GET /api/items` - Get all items (Protected)
- `GET /api/items/:id` - Get single item (Protected)
- `POST /api/items` - Create item (Protected)
- `PUT /api/items/:id` - Update item (Protected)
- `DELETE /api/items/:id` - Delete item (Protected)

### Health Check
- `GET /api/health` - Server health check

## Authentication

Add token to request headers:
```
Authorization: Bearer <your_jwt_token>
```

## User Roles

- `user` - Regular user
- `admin` - Admin user with elevated privileges
