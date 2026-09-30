# MongoDB Atlas Setup

1. Create an Atlas project and a cluster. The free shared tier is suitable for local development; Atlas Search and Vector Search limits depend on the tier and may change.
2. Create a database user with only `readWrite` access to the `recipemaster` database. Do not use an Atlas account or project-admin credential in the application.
3. In Network Access, allow your current development IP. For production, allow the hosting provider's outbound IP addresses; do not use `0.0.0.0/0` as a production shortcut.
4. Copy the Atlas connection string into `MONGODB_URI` in `backend/.env` and set `MONGODB_DB_NAME=recipemaster`. URL-encode reserved characters in the database password.
5. Start the API and check `GET /api/health`. A connected database returns `db: connected`; a missing or unreachable database returns a safe unavailable status.
6. Run `npm.cmd run seed --workspace backend` to add the labeled original demo recipes. The seed uses upserts by recipe slug and can be run again safely.

The application stores recipe content in MongoDB. Do not put database credentials in frontend environment variables; the only frontend setting is the public API base URL (`VITE_API_URL`). Configure HTTPS, strict origin allow-listing, and Atlas network access before deploying publicly.