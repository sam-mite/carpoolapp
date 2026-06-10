# Local Setup & Development

Prerequisites
- Java 17+ (matching project Java version)
- Maven
- Node.js 18+
- MariaDB

Backend
1. Navigate to `backend/`.
2. Copy `.env.example` to `.env` or export the variables: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.
3. Start MariaDB and ensure a database named `campus_rides_db` exists (the project will create it if allowed by URL params).
4. Build and run:

```bash
cd backend
mvn clean package
mvn spring-boot:run
```

Frontend
1. Navigate to `carpool-frontend/`.
2. Copy `.env.example` to `.env` and update `VITE_API_URL` if backend is not on `http://localhost:8080`.
3. Install and run:

```bash
cd carpool-frontend
npm install
npm run dev
```

Notes
- API docs available at `http://localhost:8080/swagger-ui.html` when backend runs.
