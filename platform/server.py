#!/usr/bin/env python3
"""
SIM4Action Platform Server

Serves the SIM4Action platform with support for multiple system maps.
Handles static file serving from platform/ and systems/ directories,
plus API endpoints for adding new system maps.

Includes session-based authentication: all pages and API endpoints require
a valid session cookie. Use manage_users.py to create user accounts.

Usage:
    python platform/server.py [--port PORT] [--session-expiry HOURS]
                              [--systems-dir PATH] [--users-file PATH]

    Run from the project root directory, or the server will auto-detect paths.
    Use --systems-dir to serve system maps from an external directory (e.g. a
    private atlas repository). Use --users-file to locate users.json elsewhere.
"""

import http.server
import socketserver
import os
import sys
import json
import argparse
import re
import base64
import hashlib
import secrets
import shutil
import time
from http.cookies import SimpleCookie
from pathlib import Path
from urllib.parse import urlparse, parse_qs


def find_project_root():
    """Find the project root (parent of platform/ directory)."""
    server_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    # If we're inside platform/, go up one level
    if server_dir.name == 'platform':
        return server_dir.parent
    return server_dir


PROJECT_ROOT = find_project_root()
PLATFORM_DIR = PROJECT_ROOT / 'platform'
SYSTEMS_DIR = PROJECT_ROOT / 'systems'
CATALOGUE_FILE = SYSTEMS_DIR / 'catalogue.json'
USERS_FILE = PROJECT_ROOT / 'users.json'

# Session store: {token: {"username": str, "created": float}}
active_sessions = {}

# Default session expiry (overridden by --session-expiry CLI arg)
SESSION_EXPIRY_HOURS = 24

# Paths that do NOT require authentication
PUBLIC_PATHS = {
    'login.html',
    'api/login',
}
PUBLIC_PREFIXES = (
    'assets/',          # Logo and static assets needed by login page
)

PBKDF2_ITERATIONS = 100_000


# ── Authentication helpers ──────────────────────────────────────────────────

def load_users():
    """Load the users file."""
    if USERS_FILE.exists():
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {"users": []}


def save_users(data):
    """Write users data back to disk."""
    with open(USERS_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def migrate_users():
    """Auto-add role and allowed_systems fields to user entries that lack them.

    Users named 'admin' get role='admin' and allowed_systems=['*'].
    All others get role='user' and allowed_systems=[] (no access until granted).
    """
    data = load_users()
    if not data.get('users'):
        return
    changed = False
    for user in data['users']:
        if 'role' not in user:
            user['role'] = 'admin' if user['username'] == 'admin' else 'user'
            changed = True
        if 'allowed_systems' not in user:
            user['allowed_systems'] = ['*'] if user['role'] == 'admin' else []
            changed = True
    if changed:
        save_users(data)


def get_user_record(username):
    """Return the full user dict for a username, or None."""
    data = load_users()
    for u in data.get('users', []):
        if u['username'] == username:
            return u
    return None


def user_can_access_system(username, system_id):
    """Check whether a user is allowed to access a given system map."""
    user = get_user_record(username)
    if not user:
        return False
    allowed = user.get('allowed_systems', [])
    return '*' in allowed or system_id in allowed


def is_admin(username):
    """Return True if the given user has the admin role."""
    user = get_user_record(username)
    return user is not None and user.get('role') == 'admin'


def verify_password(password, stored_hash):
    """Verify a password against a PBKDF2-SHA256 hash (salt:hex_digest)."""
    salt, expected = stored_hash.split(':')
    h = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), PBKDF2_ITERATIONS)
    return secrets.compare_digest(h.hex(), expected)


def create_session(username):
    """Create a new session token for a user, cleaning up expired sessions."""
    # Purge expired sessions
    now = time.time()
    expired = [t for t, s in active_sessions.items()
               if now - s['created'] > SESSION_EXPIRY_HOURS * 3600]
    for t in expired:
        del active_sessions[t]

    token = secrets.token_urlsafe(32)
    active_sessions[token] = {'username': username, 'created': now}
    return token


def validate_session(token):
    """Check if a session token is valid and not expired. Returns username or None."""
    session = active_sessions.get(token)
    if not session:
        return None
    if time.time() - session['created'] > SESSION_EXPIRY_HOURS * 3600:
        del active_sessions[token]
        return None
    return session['username']


def load_catalogue():
    """Load the systems catalogue."""
    if CATALOGUE_FILE.exists():
        with open(CATALOGUE_FILE, 'r') as f:
            return json.load(f)
    return {"systems": []}


def save_catalogue(catalogue):
    """Save the systems catalogue."""
    SYSTEMS_DIR.mkdir(parents=True, exist_ok=True)
    with open(CATALOGUE_FILE, 'w') as f:
        json.dump(catalogue, f, indent=2)


class SIM4ActionHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler for the SIM4Action platform."""

    # ── Authentication ──────────────────────────────────────────────────

    def is_public_path(self):
        """Check if the current request path is publicly accessible (no auth)."""
        parsed = urlparse(self.path)
        url_path = parsed.path.strip('/')
        if url_path in PUBLIC_PATHS:
            return True
        for prefix in PUBLIC_PREFIXES:
            if url_path.startswith(prefix):
                return True
        return False

    def get_session_token(self):
        """Extract the session token from the Cookie header."""
        cookie_header = self.headers.get('Cookie', '')
        cookie = SimpleCookie()
        try:
            cookie.load(cookie_header)
        except Exception:
            return None
        morsel = cookie.get('session')
        return morsel.value if morsel else None

    def check_auth(self):
        """Check if the request has a valid session. Returns username or None."""
        token = self.get_session_token()
        if not token:
            return None
        return validate_session(token)

    def require_auth(self):
        """Enforce auth on the current request. Returns True if authorized, False if denied.
        
        For HTML page requests, redirects to /login.html.
        For API requests, returns a 401 JSON error.
        """
        if self.is_public_path():
            return True

        # If no users file exists or it's empty, skip auth (first-run experience)
        users_data = load_users()
        if not users_data.get('users'):
            return True

        if self.check_auth():
            return True

        # Not authenticated — respond appropriately
        parsed = urlparse(self.path)
        url_path = parsed.path.strip('/')
        if url_path.startswith('api/'):
            self.send_error_response(401, 'Authentication required')
        else:
            self.send_response(302)
            self.send_header('Location', '/login.html')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
        return False

    # ── URL routing ─────────────────────────────────────────────────────

    def translate_path(self, path):
        """Map URL paths to filesystem paths.
        
        Routing:
        - /                     -> platform/index.html
        - /platform/*           -> platform/*
        - /systems/*            -> systems/*
        - /app.html*            -> platform/app.html
        - /assets/*             -> platform/assets/*
        - /diffusion.js etc.    -> platform/*
        - /api/*                -> API endpoints (handled separately)
        """
        # Parse the URL path
        parsed = urlparse(path)
        url_path = parsed.path.strip('/')

        # Root -> landing page
        if url_path == '' or url_path == 'index.html':
            return str(PLATFORM_DIR / 'index.html')

        # Explicit platform/ prefix
        if url_path.startswith('platform/'):
            return str(PROJECT_ROOT / url_path)

        # Explicit systems/ prefix — use SYSTEMS_DIR (may differ from PROJECT_ROOT/systems via --systems-dir)
        if url_path.startswith('systems/'):
            relative = url_path[len('systems/'):]
            return str(SYSTEMS_DIR / relative)

        # Platform engine files (served from platform/)
        platform_files = [
            'app.html', 'overview.html', 'diffusion.js', 'ga-worker.js',
            'drawing-layer.js',
            'drawing-integration.js', 'drawing-controls.css',
            'diffusion.py', 'browser_analysis.py', 'feedback_loops.py',
            'networkx_loader.py', 'diffusion_demo.html', 'presentation.html',
            'login.html'
        ]
        
        # Check if it's a known platform file
        for pf in platform_files:
            if url_path == pf or url_path == f'platform/{pf}':
                return str(PLATFORM_DIR / pf)

        # Assets
        if url_path.startswith('assets/'):
            return str(PLATFORM_DIR / url_path)

        # Default: try platform dir first, then project root
        platform_path = PLATFORM_DIR / url_path
        if platform_path.exists():
            return str(platform_path)

        return str(PROJECT_ROOT / url_path)

    def do_GET(self):
        """Handle GET requests."""
        if not self.require_auth():
            return

        parsed = urlparse(self.path)
        url_path = parsed.path.strip('/')

        # API: Get catalogue (filtered by user's allowed_systems)
        if url_path == 'api/catalogue':
            catalogue = load_catalogue()
            username = self.check_auth()
            if username:
                user = get_user_record(username)
                allowed = user.get('allowed_systems', []) if user else []
                if '*' not in allowed:
                    catalogue = dict(catalogue)
                    catalogue['systems'] = [
                        s for s in catalogue.get('systems', [])
                        if s.get('id') in allowed
                    ]
            self.send_json_response(catalogue)
            return

        # API: Get system config (access-controlled)
        if url_path.startswith('api/systems/') and url_path.endswith('/config'):
            system_id = url_path.split('/')[2]
            username = self.check_auth()
            if username and not user_can_access_system(username, system_id):
                self.send_error_response(403, 'You do not have access to this system map')
                return
            config_path = SYSTEMS_DIR / system_id / 'config.json'
            if config_path.exists():
                with open(config_path, 'r') as f:
                    config = json.load(f)
                self.send_json_response(config)
            else:
                self.send_error_response(404, f'System "{system_id}" not found')
            return

        # API: Get access-control matrix (admin only)
        if url_path == 'api/access-control':
            username = self.check_auth()
            if not username or not is_admin(username):
                self.send_error_response(403, 'Admin access required')
                return
            users_data = load_users()
            catalogue = load_catalogue()
            users_list = [
                {'username': u['username'], 'role': u.get('role', 'user'),
                 'allowed_systems': u.get('allowed_systems', [])}
                for u in users_data.get('users', [])
            ]
            systems_list = [
                {'id': s['id'], 'name': s.get('name', s['id'])}
                for s in catalogue.get('systems', [])
            ]
            self.send_json_response({'users': users_list, 'systems': systems_list})
            return

        # API: Check auth status (useful for frontend)
        if url_path == 'api/auth/status':
            username = self.check_auth()
            role = None
            if username:
                user = get_user_record(username)
                role = user.get('role', 'user') if user else 'user'
            self.send_json_response({
                'authenticated': username is not None,
                'username': username,
                'role': role
            })
            return

        # Guard access to system files (images, configs, etc.)
        if url_path.startswith('systems/'):
            parts = url_path.split('/')
            if len(parts) >= 2:
                system_id = parts[1]
                username = self.check_auth()
                if username and not user_can_access_system(username, system_id):
                    self.send_error_response(403, 'You do not have access to this system map')
                    return

        # Default file serving
        super().do_GET()

    def do_POST(self):
        """Handle POST requests."""
        parsed = urlparse(self.path)
        url_path = parsed.path.strip('/')

        # Login endpoint (public — no auth required)
        if url_path == 'api/login':
            self.handle_login()
            return

        # Logout endpoint (public — works whether authenticated or not)
        if url_path == 'api/logout':
            self.handle_logout()
            return

        if not self.require_auth():
            return

        if url_path == 'api/systems':
            self.handle_create_system()
            return

        if re.match(r'api/systems/[\w-]+/upload', url_path):
            system_id = url_path.split('/')[2]
            self.handle_upload(system_id)
            return

        self.send_error_response(404, 'Not found')

    def do_PUT(self):
        """Handle PUT requests."""
        if not self.require_auth():
            return

        parsed = urlparse(self.path)
        url_path = parsed.path.strip('/')

        if url_path == 'api/catalogue':
            self.handle_update_catalogue()
            return

        # PUT /api/access-control — update per-user permissions (admin only)
        if url_path == 'api/access-control':
            self.handle_update_access_control()
            return

        # PUT /api/systems/<id>  — update system metadata
        match = re.match(r'^api/systems/([\w-]+)$', url_path)
        if match:
            system_id = match.group(1)
            self.handle_update_system(system_id)
            return

        self.send_error_response(404, 'Not found')

    def do_DELETE(self):
        """Handle DELETE requests."""
        if not self.require_auth():
            return

        parsed = urlparse(self.path)
        url_path = parsed.path.strip('/')

        # DELETE /api/systems/<id>
        match = re.match(r'^api/systems/([\w-]+)$', url_path)
        if match:
            system_id = match.group(1)
            self.handle_delete_system(system_id)
            return

        self.send_error_response(404, 'Not found')

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    # ── Login / Logout handlers ──────────────────────────────────────────

    def handle_login(self):
        """Authenticate a user and issue a session cookie."""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            username = data.get('username', '').strip()
            password = data.get('password', '')

            if not username or not password:
                self.send_error_response(400, 'Username and password are required')
                return

            # Look up user
            users_data = load_users()
            user = None
            for u in users_data.get('users', []):
                if u['username'] == username:
                    user = u
                    break

            if not user or not verify_password(password, user['password_hash']):
                self.send_error_response(401, 'Invalid username or password')
                return

            # Create session
            token = create_session(username)
            max_age = int(SESSION_EXPIRY_HOURS * 3600)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header(
                'Set-Cookie',
                f'session={token}; HttpOnly; Path=/; SameSite=Strict; Max-Age={max_age}'
            )
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'username': username
            }).encode('utf-8'))

            self.log_message('Login: user "%s" authenticated', username)

        except json.JSONDecodeError:
            self.send_error_response(400, 'Invalid JSON')
        except Exception as e:
            self.send_error_response(500, str(e))

    def handle_logout(self):
        """Clear the session cookie and remove the session."""
        token = self.get_session_token()
        username = None
        if token and token in active_sessions:
            username = active_sessions[token].get('username')
            del active_sessions[token]

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header(
            'Set-Cookie',
            'session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0'
        )
        self.end_headers()
        self.wfile.write(json.dumps({'success': True}).encode('utf-8'))

        if username:
            self.log_message('Logout: user "%s"', username)

    # ── Access control handler ────────────────────────────────────────────

    def handle_update_access_control(self):
        """Update per-user allowed_systems. Admin only."""
        try:
            username = self.check_auth()
            if not username or not is_admin(username):
                self.send_error_response(403, 'Admin access required')
                return

            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            permissions = data.get('permissions', [])
            if not isinstance(permissions, list):
                self.send_error_response(400, 'permissions must be an array')
                return

            users_data = load_users()
            perm_map = {p['username']: p['allowed_systems'] for p in permissions
                        if 'username' in p and 'allowed_systems' in p}

            for user in users_data.get('users', []):
                if user['username'] in perm_map:
                    # Never downgrade admin's own wildcard access
                    if user.get('role') == 'admin':
                        continue
                    user['allowed_systems'] = perm_map[user['username']]

            save_users(users_data)
            self.send_json_response({'success': True})
            self.log_message('Access control updated by admin "%s"', username)

        except json.JSONDecodeError:
            self.send_error_response(400, 'Invalid JSON')
        except Exception as e:
            self.send_error_response(500, str(e))

    # ── System management handlers ──────────────────────────────────────

    def handle_create_system(self):
        """Create a new system map directory and config."""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            system_id = data.get('id')
            if not system_id:
                self.send_error_response(400, 'System ID is required')
                return

            # Sanitize system_id
            system_id = re.sub(r'[^a-z0-9_-]', '_', system_id.lower())

            # Create system directory
            system_dir = SYSTEMS_DIR / system_id
            system_dir.mkdir(parents=True, exist_ok=True)

            # Build config.json
            config = {
                'id': system_id,
                'name': data.get('name', system_id),
                'title': data.get('title', f"{data.get('name', system_id)} - SIM4Action"),
                'description': data.get('description', ''),
                'spreadsheets': data.get('spreadsheets', {}),
                'apiKey': data.get('apiKey', ''),
                'images': data.get('images', {})
            }

            # Optional new fields
            if data.get('about'):
                config['about'] = data['about']
            if data.get('source_type'):
                config['source_type'] = data['source_type']
            if data.get('location'):
                config['location'] = data['location']
            if data.get('gdrive_md_folder'):
                config['gdrive_md_folder'] = data['gdrive_md_folder']

            # Write config.json
            with open(system_dir / 'config.json', 'w') as f:
                json.dump(config, f, indent=2)

            # Handle base64-encoded images if provided
            for img_key in ['systemImage', 'thumbnail']:
                img_data = data.get(f'{img_key}_base64')
                if img_data:
                    # Extract file extension and data
                    match = re.match(r'data:image/(\w+);base64,(.*)', img_data)
                    if match:
                        ext = match.group(1)
                        if ext == 'jpeg':
                            ext = 'jpg'
                        img_bytes = base64.b64decode(match.group(2))
                        filename = f'{img_key.replace("Image", "-image")}.{ext}'
                        with open(system_dir / filename, 'wb') as f:
                            f.write(img_bytes)
                        # Update config images
                        if 'images' not in config:
                            config['images'] = {}
                        config['images'][img_key] = {
                            'src': filename,
                            'alt': data.get('name', system_id)
                        }

            # Re-write config if images were added
            with open(system_dir / 'config.json', 'w') as f:
                json.dump(config, f, indent=2)

            # Update catalogue
            catalogue = load_catalogue()
            # Remove existing entry with same id
            catalogue['systems'] = [s for s in catalogue['systems'] if s['id'] != system_id]

            # Determine category
            category = data.get('category', 'Uncategorized')

            catalogue_entry = {
                'id': system_id,
                'name': config['name'],
                'description': config['description'],
                'thumbnail': f'{system_id}/thumbnail.png' if (system_dir / 'thumbnail.png').exists() else None,
                'category': category
            }
            if data.get('source_type'):
                catalogue_entry['source_type'] = data['source_type']

            catalogue['systems'].append(catalogue_entry)

            # Ensure category list is up to date
            if 'categories' not in catalogue:
                catalogue['categories'] = []
            if category and category not in catalogue['categories']:
                catalogue['categories'].append(category)
                catalogue['categories'].sort()

            save_catalogue(catalogue)

            self.send_json_response({'success': True, 'id': system_id, 'config': config})

        except json.JSONDecodeError:
            self.send_error_response(400, 'Invalid JSON')
        except Exception as e:
            self.send_error_response(500, str(e))

    def handle_upload(self, system_id):
        """Handle file upload for a system map (accepts JSON with base64 data)."""
        try:
            system_dir = SYSTEMS_DIR / system_id
            if not system_dir.exists():
                self.send_error_response(404, f'System "{system_id}" not found')
                return

            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            uploaded_files = []
            for filename, b64data in data.get('files', {}).items():
                # Extract base64 content
                match = re.match(r'data:[^;]+;base64,(.*)', b64data)
                if match:
                    file_bytes = base64.b64decode(match.group(1))
                    # Sanitize filename
                    safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
                    filepath = system_dir / safe_name
                    with open(filepath, 'wb') as f:
                        f.write(file_bytes)
                    uploaded_files.append(safe_name)

            self.send_json_response({'success': True, 'files': uploaded_files})

        except Exception as e:
            self.send_error_response(500, str(e))

    def handle_update_catalogue(self):
        """Update the catalogue file."""
        try:
            content_length = int(self.headers['Content-Length'])
            put_data = self.rfile.read(content_length)
            catalogue = json.loads(put_data.decode('utf-8'))
            save_catalogue(catalogue)
            self.send_json_response({'success': True})
        except json.JSONDecodeError:
            self.send_error_response(400, 'Invalid JSON')
        except Exception as e:
            self.send_error_response(500, str(e))

    def handle_update_system(self, system_id):
        """Update a system map's metadata (name, description, category)."""
        try:
            content_length = int(self.headers['Content-Length'])
            put_data = self.rfile.read(content_length)
            data = json.loads(put_data.decode('utf-8'))

            system_id = re.sub(r'[^a-z0-9_-]', '_', system_id.lower())

            # Update config.json if it exists
            config_path = SYSTEMS_DIR / system_id / 'config.json'
            if config_path.exists():
                with open(config_path, 'r') as f:
                    config = json.load(f)
                if 'name' in data:
                    config['name'] = data['name']
                    config['title'] = f"{data['name']} Systems Map - Interactive Visualization"
                if 'description' in data:
                    config['description'] = data['description']
                if 'about' in data:
                    config['about'] = data['about']
                if 'spreadsheets' in data:
                    config['spreadsheets'] = data['spreadsheets']
                if 'source_type' in data:
                    config['source_type'] = data['source_type']
                if 'location' in data:
                    config['location'] = data['location']
                if 'gdrive_md_folder' in data:
                    config['gdrive_md_folder'] = data['gdrive_md_folder']

                # Handle base64-encoded images if provided
                system_dir = SYSTEMS_DIR / system_id
                for img_key in ['systemImage', 'thumbnail']:
                    img_data = data.get(f'{img_key}_base64')
                    if img_data:
                        match = re.match(r'data:image/(\w+);base64,(.*)', img_data)
                        if match:
                            ext = match.group(1)
                            if ext == 'jpeg':
                                ext = 'jpg'
                            img_bytes = base64.b64decode(match.group(2))
                            filename = f'{img_key.replace("Image", "-image")}.{ext}'
                            with open(system_dir / filename, 'wb') as f:
                                f.write(img_bytes)
                            if 'images' not in config:
                                config['images'] = {}
                            config['images'][img_key] = {
                                'src': filename,
                                'alt': data.get('name', config.get('name', system_id))
                            }

                with open(config_path, 'w') as f:
                    json.dump(config, f, indent=2)

            # Update catalogue entry
            catalogue = load_catalogue()
            updated = False
            for system in catalogue.get('systems', []):
                if system['id'] == system_id:
                    if 'name' in data:
                        system['name'] = data['name']
                    if 'description' in data:
                        system['description'] = data['description']
                    if 'category' in data:
                        system['category'] = data['category']
                    if 'source_type' in data:
                        system['source_type'] = data['source_type']
                    # Update thumbnail in catalogue if image was uploaded
                    if config_path.exists() and data.get('thumbnail_base64'):
                        with open(config_path, 'r') as f:
                            updated_config = json.load(f)
                        if updated_config.get('images', {}).get('thumbnail', {}).get('src'):
                            system['thumbnail'] = f"{system_id}/{updated_config['images']['thumbnail']['src']}"
                        elif updated_config.get('images', {}).get('systemImage', {}).get('src'):
                            system['thumbnail'] = f"{system_id}/{updated_config['images']['systemImage']['src']}"
                    updated = True
                    break

            if not updated:
                self.send_error_response(404, f'System "{system_id}" not found in catalogue')
                return

            # Ensure the new category is in the categories list
            category = data.get('category')
            if category:
                if 'categories' not in catalogue:
                    catalogue['categories'] = []
                if category not in catalogue['categories']:
                    catalogue['categories'].append(category)
                    catalogue['categories'].sort()

            # Clean up empty categories
            remaining_cats = set(s.get('category') for s in catalogue['systems'] if s.get('category'))
            if 'categories' in catalogue:
                catalogue['categories'] = [c for c in catalogue['categories'] if c in remaining_cats]

            save_catalogue(catalogue)

            self.send_json_response({'success': True, 'id': system_id})

        except json.JSONDecodeError:
            self.send_error_response(400, 'Invalid JSON')
        except Exception as e:
            self.send_error_response(500, str(e))

    def handle_delete_system(self, system_id):
        """Delete a system map: remove its directory and catalogue entry."""
        try:
            # Sanitize
            system_id = re.sub(r'[^a-z0-9_-]', '_', system_id.lower())
            system_dir = SYSTEMS_DIR / system_id

            # Remove directory if it exists
            if system_dir.exists():
                shutil.rmtree(system_dir)

            # Remove from catalogue
            catalogue = load_catalogue()
            original_count = len(catalogue.get('systems', []))
            catalogue['systems'] = [s for s in catalogue.get('systems', []) if s['id'] != system_id]
            removed = original_count - len(catalogue['systems'])

            # Also clean up categories that have no remaining systems
            remaining_cats = set(s.get('category') for s in catalogue['systems'] if s.get('category'))
            if 'categories' in catalogue:
                catalogue['categories'] = [c for c in catalogue['categories'] if c in remaining_cats]

            save_catalogue(catalogue)

            self.send_json_response({
                'success': True,
                'id': system_id,
                'removed': removed > 0,
                'directory_deleted': not system_dir.exists()
            })

        except Exception as e:
            self.send_error_response(500, str(e))

    def send_json_response(self, data, status=200):
        """Send a JSON response."""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error_response(self, status, message):
        """Send a JSON error response."""
        self.send_json_response({'error': message}, status)

    def end_headers(self):
        """Add CORS headers to all responses."""
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        """Custom log format."""
        sys.stderr.write(f"[SIM4Action] {self.address_string()} - {format % args}\n")


def main():
    global SYSTEMS_DIR, CATALOGUE_FILE, USERS_FILE, SESSION_EXPIRY_HOURS

    parser = argparse.ArgumentParser(description='SIM4Action Platform Server')
    parser.add_argument('--port', type=int, default=8000, help='Port to serve on (default: 8000)')
    parser.add_argument('--session-expiry', type=int, default=24,
                        help='Session expiry in hours (default: 24)')
    parser.add_argument('--systems-dir', type=str, default=None,
                        help='Path to systems directory (default: PROJECT_ROOT/systems)')
    parser.add_argument('--users-file', type=str, default=None,
                        help='Path to users.json file (default: PROJECT_ROOT/users.json)')
    args = parser.parse_args()

    PORT = args.port
    SESSION_EXPIRY_HOURS = args.session_expiry

    if args.systems_dir:
        SYSTEMS_DIR = Path(args.systems_dir).resolve()
        if not SYSTEMS_DIR.exists():
            print(f"Error: systems directory does not exist: {SYSTEMS_DIR}")
            sys.exit(1)
    CATALOGUE_FILE = SYSTEMS_DIR / 'catalogue.json'

    if args.users_file:
        USERS_FILE = Path(args.users_file).resolve()

    # Ensure systems directory and catalogue exist
    SYSTEMS_DIR.mkdir(parents=True, exist_ok=True)
    if not CATALOGUE_FILE.exists():
        save_catalogue({"systems": []})

    # Migrate existing users (add role/allowed_systems if missing)
    migrate_users()

    # Check authentication status
    users_data = load_users()
    user_count = len(users_data.get('users', []))
    if user_count > 0:
        auth_status = f"ENABLED ({user_count} user(s), sessions expire in {SESSION_EXPIRY_HOURS}h)"
    else:
        auth_status = "DISABLED (no users — run: python3 manage_users.py add <username>)"

    # Change to project root so relative paths work
    os.chdir(str(PROJECT_ROOT))

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SIM4ActionHandler) as httpd:
        print(f"\n{'='*60}")
        print(f"  SIM4Action Platform Server")
        print(f"{'='*60}")
        print(f"  Landing page:  http://localhost:{PORT}/")
        print(f"  Platform dir:  {PLATFORM_DIR}")
        print(f"  Systems dir:   {SYSTEMS_DIR}")
        print(f"  Users file:    {USERS_FILE}")
        print(f"  Auth:          {auth_status}")
        print(f"{'='*60}")
        print(f"  Press Ctrl+C to stop the server")
        print(f"{'='*60}\n")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            httpd.server_close()


if __name__ == '__main__':
    main()
