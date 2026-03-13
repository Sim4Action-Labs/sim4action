#!/usr/bin/env python3
"""
SIM4Action User Management CLI

Manage user credentials for the SIM4Action platform's session-based authentication.
Passwords are hashed with PBKDF2-HMAC-SHA256 (100,000 iterations) using only
the Python standard library.

Usage:
    python3 manage_users.py add <username>       # Add a new user (prompts for password)
    python3 manage_users.py remove <username>     # Remove an existing user
    python3 manage_users.py list                  # List all usernames
    python3 manage_users.py reset <username>      # Reset a user's password
"""

import argparse
import getpass
import hashlib
import json
import secrets
import sys
from pathlib import Path


USERS_FILE = Path(__file__).parent / 'users.json'
MIN_PASSWORD_LENGTH = 8
PBKDF2_ITERATIONS = 100_000


# ── Password hashing ────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password with PBKDF2-HMAC-SHA256 and a random 16-byte salt."""
    salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), PBKDF2_ITERATIONS)
    return f"{salt}:{h.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """Verify a password against a stored hash."""
    salt, expected = stored.split(':')
    h = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), PBKDF2_ITERATIONS)
    return secrets.compare_digest(h.hex(), expected)


# ── Users file I/O ──────────────────────────────────────────────────────────

def load_users() -> dict:
    """Load the users file, creating it if it doesn't exist."""
    if USERS_FILE.exists():
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {"users": []}


def save_users(data: dict) -> None:
    """Write users data back to disk."""
    with open(USERS_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"  Users file: {USERS_FILE}")


# ── Helpers ─────────────────────────────────────────────────────────────────

def prompt_password() -> str:
    """Prompt for a password with confirmation, enforcing minimum length."""
    while True:
        password = getpass.getpass("  Password: ")
        if len(password) < MIN_PASSWORD_LENGTH:
            print(f"  Error: Password must be at least {MIN_PASSWORD_LENGTH} characters.")
            continue
        confirm = getpass.getpass("  Confirm:  ")
        if password != confirm:
            print("  Error: Passwords do not match. Try again.")
            continue
        return password


# ── Commands ────────────────────────────────────────────────────────────────

def cmd_add(username: str, admin: bool = False) -> None:
    """Add a new user."""
    data = load_users()

    # Check for duplicates
    for user in data['users']:
        if user['username'] == username:
            print(f"  Error: User '{username}' already exists. Use 'reset' to change the password.")
            sys.exit(1)

    role = 'admin' if admin else 'user'
    allowed = ['*'] if admin else []
    print(f"  Adding user: {username} (role: {role})")
    password = prompt_password()

    data['users'].append({
        'username': username,
        'password_hash': hash_password(password),
        'role': role,
        'allowed_systems': allowed
    })

    save_users(data)
    print(f"  User '{username}' added successfully (role: {role}).")


def cmd_remove(username: str) -> None:
    """Remove an existing user."""
    data = load_users()
    original_count = len(data['users'])
    data['users'] = [u for u in data['users'] if u['username'] != username]

    if len(data['users']) == original_count:
        print(f"  Error: User '{username}' not found.")
        sys.exit(1)

    save_users(data)
    print(f"  User '{username}' removed successfully.")


def cmd_list() -> None:
    """List all registered usernames."""
    data = load_users()
    if not data['users']:
        print("  No users registered.")
        return

    print(f"  Registered users ({len(data['users'])}):")
    for user in data['users']:
        role = user.get('role', 'user')
        allowed = user.get('allowed_systems', [])
        access = 'all systems' if '*' in allowed else f"{len(allowed)} system(s)"
        print(f"    - {user['username']}  (role: {role}, access: {access})")


def cmd_reset(username: str) -> None:
    """Reset a user's password."""
    data = load_users()

    found = False
    for user in data['users']:
        if user['username'] == username:
            found = True
            print(f"  Resetting password for: {username}")
            password = prompt_password()
            user['password_hash'] = hash_password(password)
            break

    if not found:
        print(f"  Error: User '{username}' not found.")
        sys.exit(1)

    save_users(data)
    print(f"  Password for '{username}' reset successfully.")


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='SIM4Action User Management',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 manage_users.py add admin
  python3 manage_users.py add viewer
  python3 manage_users.py list
  python3 manage_users.py reset admin
  python3 manage_users.py remove viewer
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    subparsers.required = True

    # add
    add_parser = subparsers.add_parser('add', help='Add a new user')
    add_parser.add_argument('username', help='Username to create')
    add_parser.add_argument('--admin', action='store_true',
                            help='Grant admin role (full access to all systems)')

    # remove
    remove_parser = subparsers.add_parser('remove', help='Remove an existing user')
    remove_parser.add_argument('username', help='Username to remove')

    # list
    subparsers.add_parser('list', help='List all registered users')

    # reset
    reset_parser = subparsers.add_parser('reset', help='Reset a user\'s password')
    reset_parser.add_argument('username', help='Username whose password to reset')

    args = parser.parse_args()

    print()
    print("  SIM4Action User Management")
    print("  " + "=" * 40)

    if args.command == 'add':
        cmd_add(args.username, admin=args.admin)
    elif args.command == 'remove':
        cmd_remove(args.username)
    elif args.command == 'list':
        cmd_list()
    elif args.command == 'reset':
        cmd_reset(args.username)

    print()


if __name__ == '__main__':
    main()
