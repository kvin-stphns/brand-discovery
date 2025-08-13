# CI/CD

## Backend CI
- GitHub Actions workflow `.github/workflows/backend-ci.yml` runs install, lint, and tests for `backend` folder.

## Frontend CI (optional)
- Add a similar workflow to install and build the `frontend` app.
- Ensure `NEXT_PUBLIC_API_ENDPOINT` is set for preview deployments if you want to hit a live backend.