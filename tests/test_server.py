"""Tests for platform/server.py — HTTP server and REST API."""
import json
import os
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError

import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SERVER_SCRIPT = PROJECT_ROOT / 'platform' / 'server.py'


def _start_server(systems_dir, port=0):
    """Start the server on a random port, return (process, port)."""
    import socket
    if port == 0:
        with socket.socket() as s:
            s.bind(('', 0))
            port = s.getsockname()[1]

    users_file = systems_dir.parent / 'no_users.json'
    cmd = [sys.executable, str(SERVER_SCRIPT), '--port', str(port),
           '--systems-dir', str(systems_dir), '--users-file', str(users_file)]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            cwd=str(PROJECT_ROOT))

    for _ in range(30):
        time.sleep(0.2)
        try:
            urlopen(f'http://localhost:{port}/', timeout=2)
            return proc, port
        except Exception:
            if proc.poll() is not None:
                raise RuntimeError(f"Server exited early: {proc.stderr.read().decode()}")
            continue

    proc.kill()
    raise RuntimeError("Server failed to start within 6 seconds")


def _stop_server(proc):
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()


def _api_get(port, path):
    url = f'http://localhost:{port}/{path}'
    req = Request(url)
    resp = urlopen(req, timeout=5)
    return json.loads(resp.read().decode())


def _api_request(port, path, method='GET', data=None):
    url = f'http://localhost:{port}/{path}'
    body = json.dumps(data).encode() if data else None
    req = Request(url, data=body, method=method)
    req.add_header('Content-Type', 'application/json')
    try:
        resp = urlopen(req, timeout=5)
        return resp.status, json.loads(resp.read().decode())
    except HTTPError as e:
        body_text = e.read().decode()
        try:
            return e.code, json.loads(body_text)
        except json.JSONDecodeError:
            return e.code, {'error': body_text}


@pytest.fixture(scope='module')
def server(tmp_path_factory):
    """Start a test server with a temporary systems directory."""
    tmp = tmp_path_factory.mktemp('server_test')
    systems_dir = tmp / 'systems'
    systems_dir.mkdir()

    demo_dir = systems_dir / 'demo_fishery'
    demo_dir.mkdir()
    config = {
        'id': 'demo_fishery', 'name': 'Demo Fishery',
        'title': 'Demo - SIM4Action', 'description': 'Test',
        'spreadsheets': {'main': 'test_id'}, 'apiKey': 'test', 'images': {}
    }
    (demo_dir / 'config.json').write_text(json.dumps(config))

    catalogue = {
        'categories': ['Fisheries'],
        'systems': [{'id': 'demo_fishery', 'name': 'Demo Fishery',
                      'description': 'Test', 'thumbnail': None, 'category': 'Fisheries'}]
    }
    (systems_dir / 'catalogue.json').write_text(json.dumps(catalogue))

    proc, port = _start_server(systems_dir)
    yield port, systems_dir
    _stop_server(proc)


class TestServerBasics:

    def test_serves_landing_page(self, server):
        port, _ = server
        resp = urlopen(f'http://localhost:{port}/', timeout=5)
        assert resp.status == 200
        content = resp.read().decode()
        assert 'SIM4Action' in content or 'html' in content.lower()


class TestCatalogueAPI:

    def test_get_catalogue(self, server):
        port, _ = server
        data = _api_get(port, 'api/catalogue')
        assert 'systems' in data
        assert len(data['systems']) >= 1

    def test_catalogue_has_demo(self, server):
        port, _ = server
        data = _api_get(port, 'api/catalogue')
        ids = [s['id'] for s in data['systems']]
        assert 'demo_fishery' in ids


class TestSystemConfigAPI:

    def test_get_demo_config(self, server):
        port, _ = server
        data = _api_get(port, 'api/systems/demo_fishery/config')
        assert data['id'] == 'demo_fishery'
        assert data['name'] == 'Demo Fishery'

    def test_get_nonexistent_returns_404(self, server):
        port, _ = server
        status, data = _api_request(port, 'api/systems/nonexistent_system/config')
        assert status == 404


class TestSystemCRUD:

    def test_create_system(self, server):
        port, systems_dir = server
        new_system = {
            'id': 'test_system_create',
            'name': 'Test Create',
            'description': 'Created by test',
            'category': 'Test',
            'spreadsheets': {'main': 'test_sheet_id'},
            'apiKey': 'test_key',
        }
        status, data = _api_request(port, 'api/systems', method='POST', data=new_system)
        assert status == 200
        assert data['success'] is True
        assert (systems_dir / 'test_system_create' / 'config.json').exists()

    def test_update_system(self, server):
        port, _ = server
        update = {'name': 'Updated Demo', 'description': 'Updated description'}
        status, data = _api_request(port, 'api/systems/demo_fishery', method='PUT', data=update)
        assert status == 200

    def test_delete_system(self, server):
        port, systems_dir = server
        new_system = {
            'id': 'test_system_delete', 'name': 'To Delete',
            'description': 'Will be deleted', 'category': 'Test',
            'spreadsheets': {'main': 'x'}, 'apiKey': 'x',
        }
        _api_request(port, 'api/systems', method='POST', data=new_system)
        assert (systems_dir / 'test_system_delete').exists()

        status, data = _api_request(port, 'api/systems/test_system_delete', method='DELETE')
        assert status == 200
        assert data['success'] is True
        assert not (systems_dir / 'test_system_delete').exists()

    def test_system_id_sanitization(self, server):
        port, systems_dir = server
        new_system = {
            'id': 'BAD System ID!!!',
            'name': 'Sanitized', 'description': 'Test',
            'category': 'Test', 'spreadsheets': {'main': 'x'}, 'apiKey': 'x',
        }
        status, data = _api_request(port, 'api/systems', method='POST', data=new_system)
        assert status == 200
        sanitized_id = data['id']
        assert sanitized_id == 'bad_system_id___'
