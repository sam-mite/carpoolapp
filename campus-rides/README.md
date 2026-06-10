# Campus Rides

Project Overview
- Campus carpooling web application with Spring Boot backend and React + Vite frontend.

Features
- User registration and authentication
- Driver onboarding and verification
- Ride creation and booking
- File uploads (driver documents, vehicle images)

Tech Stack
- Backend: Java, Spring Boot, Maven, MariaDB
- Frontend: React, Vite
- Authentication: JWT

Architecture
- Monorepo with `backend/` and `carpool-frontend/` directories. Backend exposes REST APIs consumed by the frontend.

Installation Guide
1. Clone repository
2. Create environment files as shown in `.env.example` for backend and frontend
3. Start MariaDB and run schema initialization

Database Setup
- Use MariaDB. See `backend/src/main/resources/schema.sql` for schema and seed data.

Backend Setup
- Create `.env` or set environment variables: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.
- Build and run with Maven: `mvn spring-boot:run` (from `backend/`).

Frontend Setup
- Create `.env` in `carpool-frontend/` with `VITE_API_URL` set to your backend URL.
- Install and run: `npm install && npm run dev` (from `carpool-frontend/`).

API Information
- Backend base path: `/api`
- Swagger UI available at `/swagger-ui.html` when backend is running.

Screenshots
- (Add screenshots to `docs/` and reference here)

Future Improvements
- CI pipeline, automated tests, Docker deployment, and production-ready configuration.
