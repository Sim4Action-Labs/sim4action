# Deploying the Access Control Update

## What this update does

This update adds **per-user access control** to the SIM4Action platform. After deployment:

- Each user has a `role` (`admin` or `user`) and an `allowed_systems` list in `users.json`
- **Admin users** see all system maps and get a "Manage Access" button on the landing page
- **Regular users** only see the system maps they have been granted access to
- Edit/delete/add system map buttons are hidden for non-admin users
- Direct URL access to restricted systems returns "Access Denied"

## Important: migration behavior

On server restart, the migration will automatically update `users.json`:

| Existing user | Gets `role` | Gets `allowed_systems` |
|---|---|---|
| User named `admin` | `admin` | `["*"]` (full access) |
| All other users | `user` | `[]` (no access) |

**All non-admin users will see zero system maps until the admin grants access.**
This is intentional — the admin will configure permissions using the new UI.

## Deployment steps

### 1. Stop the server

```bash
# Find and stop the running server process
lsof -ti:8000 | xargs kill 2>/dev/null
# Or if using a different method:
# pkill -f "python3 platform/server.py"
```

### 2. Pull the latest code

```bash
cd /path/to/Sim4Action-Platform
git pull origin main
```

`users.json` is in `.gitignore` so it will NOT be overwritten by the pull.

### 3. Verify files changed

These files should be updated:

- `platform/server.py` — migration logic, filtered catalogue, access-control API, role in auth status
- `platform/index.html` — "Manage Access" button, admin-only edit/delete, access control modal
- `platform/app.html` — 403 handling for restricted systems
- `platform/overview.html` — 403 handling for restricted systems
- `manage_users.py` — `--admin` flag, role/allowed_systems defaults, improved list output

### 4. Start the server

```bash
cd /path/to/Sim4Action-Platform
python3 platform/server.py
```

On startup the server will:
1. Detect that existing users lack `role` and `allowed_systems` fields
2. Auto-migrate `users.json` — admin gets `["*"]`, everyone else gets `[]`
3. Print `Auth: ENABLED (N user(s), sessions expire in 24h)`

### 5. Configure user access

1. Open the platform in a browser and log in as `admin`
2. Click the **"Manage Access"** button (shield icon, top-right corner next to "Sign Out")
3. An interactive checkbox matrix appears: rows = users, columns = system maps
4. Check the boxes for each user/system combination you want to allow
5. Use the **"All"** button on any row to grant access to all systems at once
6. Click **"Save Changes"**

Repeat as needed. Changes take effect immediately — no server restart required.

### 6. Verify

- Log out, then log in as a non-admin user
- Confirm they only see the system maps you granted
- Try accessing a restricted system by URL — should show "Access Denied"

## Nginx considerations

If the platform is behind an Nginx reverse proxy, ensure the proxy passes these new API routes:

- `GET /api/access-control`
- `PUT /api/access-control`

If your Nginx config already proxies all `/api/` routes to the backend (which it should based on existing setup), no changes are needed.

## Rollback

If anything goes wrong:

1. Stop the server
2. `git checkout HEAD~1 -- platform/server.py platform/index.html platform/app.html platform/overview.html manage_users.py`
3. Manually remove the `role` and `allowed_systems` fields from `users.json` (optional — the old server ignores unknown fields)
4. Restart the server

## Adding new users after this update

```bash
# Regular user (no system access until admin grants it)
python3 manage_users.py add <username>

# Admin user (full access to all systems)
python3 manage_users.py add <username> --admin

# List users with roles and access counts
python3 manage_users.py list
```
