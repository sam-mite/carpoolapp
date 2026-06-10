# Troubleshooting

Common issues

- Database connection failures:
  - Verify environment variables `DB_URL`, `DB_USER`, `DB_PASSWORD`.
  - Check MariaDB is running and accessible.

- JWT / Authentication errors:
  - Ensure `JWT_SECRET` is set and consistent across backend instances.

- Frontend cannot reach API:
  - Confirm `VITE_API_URL` in `carpool-frontend/.env`.
  - Check CORS headers on backend if served from a different origin.

- Build failures:
  - For backend, run `mvn -X` to see detailed Maven output.
  - For frontend, ensure Node version is compatible and run `npm ci`.
