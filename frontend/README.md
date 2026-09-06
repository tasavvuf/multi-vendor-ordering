# Frontend

The frontend is the React/Vite client for the multi-vendor ordering application.

For the complete repository setup, environment variables, route map, API reference, database setup, deployment guidance, and verification steps, see the root [README.md](../README.md).

## Frontend Commands

```bash
bun install
bun run dev
bun run lint
bun run build
bun run preview
```

Set `VITE_API_URL` in `frontend/.env.local` to the backend API base URL, for example:

```text
VITE_API_URL=http://localhost:4000/api
```
