# Appointment & Queue Management Backend

This backend repository provides the API layer for the Appointment & Queue Management System.

## Features
- User authentication with JWT
- Role-based authorization for admin, doctor, staff, and patient
- Appointment booking, status updates, and cancellation
- Queue token generation and tracking
- Doctor schedule creation and retrieval
- Notification endpoint placeholder for future email/SMS integration

## Tech Stack
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Bcrypt

## Setup
1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the backend root with the following values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

3. Start the server:

```bash
npm run start
```

## API Endpoints
- `POST /api/auth/register` - Register a patient account and receive JWT
- `POST /api/auth/login` - Login and receive JWT
- `POST /api/users` - Admin creates a user account
- `GET /api/users` - Admin lists users
- `GET /api/users/doctors` - List doctors for appointment booking
- `GET /api/users/profile` - Get the current user's profile
- `POST /api/appointments` - Create appointment (authenticated)
- `GET /api/appointments` - Get appointments (authenticated)
- `PUT /api/appointments/:id` - Update appointment (authenticated)
- `DELETE /api/appointments/:id` - Cancel appointment (authenticated)
- `GET /api/queue/current` - Get current queue status (authenticated)
- `GET /api/queue/list` - Get full queue list (authenticated)
- `PUT /api/queue/update` - Update queue token status (authenticated)
- `POST /api/schedules` - Create a schedule (authenticated)
- `GET /api/schedules` - Get schedules (authenticated; optional `doctorId` query)
- `POST /api/notifications/send` - Send notification request (authenticated)
- `GET /api/notifications` - Get notification history (admins see all; other users see their own)
- `GET /health` - Check API and database availability

## Notes
- This repo is intended as the backend submission only.
- The frontend is a separate project and is not included in this backend repo.
- Add a valid MongoDB URI and JWT secret before running.
- When a doctor has a schedule, appointment requests must use one of its full weekday names (for example, `monday`) and one of its configured slots. Doctors without a schedule can still receive appointments.
- Queue status is scoped to a doctor: patients call `GET /api/queue/current?doctorId=<doctor-id>`, while doctors automatically see their own queue.
