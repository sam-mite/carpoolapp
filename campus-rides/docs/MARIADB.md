# MariaDB Setup Guide

Local (development)
1. Install MariaDB (10.4+ recommended).
2. Start the server and create a user and database:

```sql
CREATE DATABASE campus_rides_db;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON campus_rides_db.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

3. Update `backend/.env` or environment variables with the connection string and credentials.

Production
- Use a managed DB service, enable backups, strong passwords, and restricted network access.
- Configure connection pooling and timeouts in `application.properties`.
