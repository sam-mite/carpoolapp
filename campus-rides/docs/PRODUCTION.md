# Production Deployment Guide

Recommended deployment flow
1. Containerize backend and frontend with Docker.
2. Use CI (GitHub Actions) to build images and push to registry.
3. Deploy to a managed platform (AKS, Azure App Service, AWS ECS) or VM.

Security notes
- Do not store secrets in source. Use a secrets manager (Azure Key Vault, AWS Secrets Manager) or environment variables set in CI/CD.
- Ensure TLS/HTTPS is enabled at load balancer or reverse proxy.

Database
- Use managed MariaDB service in production. Configure backups and replication.

Static assets
- Build frontend (`npm run build`) and serve from CDN or host behind the backend.
