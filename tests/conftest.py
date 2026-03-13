"""Shared fixtures for the SIM4Action test suite."""
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / 'platform'))


# ── Sample data fixtures ────────────────────────────────────────────────

@pytest.fixture
def sample_nodes():
    """Eight-node socio-environmental system across three domains."""
    return [
        {'id': 'V1', 'name': 'Fish Stock', 'domain': 'Environmental', 'intervenable': 'No', 'definition': 'Total biomass'},
        {'id': 'V2', 'name': 'Fishing Effort', 'domain': 'Economic', 'intervenable': 'Yes', 'definition': 'Fishing days per year'},
        {'id': 'V3', 'name': 'Market Price', 'domain': 'Economic', 'intervenable': 'No', 'definition': 'Price per tonne'},
        {'id': 'V4', 'name': 'Fisher Income', 'domain': 'Social', 'intervenable': 'No', 'definition': 'Annual income'},
        {'id': 'V5', 'name': 'Regulation', 'domain': 'Management', 'intervenable': 'Yes', 'definition': 'Regulatory stringency'},
        {'id': 'V6', 'name': 'Ecosystem Health', 'domain': 'Environmental', 'intervenable': 'No', 'definition': 'Overall health index'},
        {'id': 'V7', 'name': 'Community Wellbeing', 'domain': 'Social', 'intervenable': 'No', 'definition': 'Social indicators'},
        {'id': 'V8', 'name': 'Bycatch', 'domain': 'Environmental', 'intervenable': 'No', 'definition': 'Non-target species caught'},
    ]


@pytest.fixture
def sample_edges():
    """Twelve directed relationships with mixed polarity and strength."""
    return [
        {'source': 'V1', 'target': 'V2', 'type': 'same', 'strength': 'strong'},
        {'source': 'V2', 'target': 'V1', 'type': 'opposite', 'strength': 'strong'},
        {'source': 'V1', 'target': 'V3', 'type': 'opposite', 'strength': 'medium'},
        {'source': 'V3', 'target': 'V2', 'type': 'same', 'strength': 'medium'},
        {'source': 'V2', 'target': 'V4', 'type': 'same', 'strength': 'strong'},
        {'source': 'V4', 'target': 'V7', 'type': 'same', 'strength': 'medium'},
        {'source': 'V5', 'target': 'V2', 'type': 'opposite', 'strength': 'strong'},
        {'source': 'V1', 'target': 'V6', 'type': 'same', 'strength': 'medium'},
        {'source': 'V2', 'target': 'V8', 'type': 'same', 'strength': 'medium'},
        {'source': 'V8', 'target': 'V6', 'type': 'opposite', 'strength': 'medium'},
        {'source': 'V6', 'target': 'V5', 'type': 'same', 'strength': 'weak'},
        {'source': 'V6', 'target': 'V1', 'type': 'same', 'strength': 'medium'},
    ]


@pytest.fixture
def sample_factors_rows(sample_nodes):
    """FACTORS sheet rows (list of lists) matching Google Sheets format."""
    return [
        [n['id'], n['name'], n['domain'], n.get('intervenable', 'No'), n.get('definition', '')]
        for n in sample_nodes
    ]


@pytest.fixture
def sample_relationships_rows(sample_edges):
    """RELATIONSHIPS sheet rows (list of lists) matching Google Sheets format."""
    return [
        [f'R{i+1}', '', '', e['source'], e['target'],
         e.get('type', 'same'), e.get('strength', 'medium'), 'medium', '']
        for i, e in enumerate(sample_edges)
    ]


# ── Temporary systems directory ─────────────────────────────────────────

@pytest.fixture
def tmp_systems_dir(tmp_path):
    """Create a temporary systems directory with a demo catalogue and system config."""
    systems_dir = tmp_path / 'systems'
    systems_dir.mkdir()

    demo_dir = systems_dir / 'demo_fishery'
    demo_dir.mkdir()

    config = {
        'id': 'demo_fishery',
        'name': 'Demo Fishery',
        'title': 'Demo Fishery - SIM4Action',
        'description': 'Test system',
        'spreadsheets': {'main': 'test_spreadsheet_id'},
        'apiKey': 'test_api_key',
        'images': {}
    }
    (demo_dir / 'config.json').write_text(json.dumps(config, indent=2))

    catalogue = {
        'categories': ['Fisheries'],
        'systems': [{
            'id': 'demo_fishery',
            'name': 'Demo Fishery',
            'description': 'Test system',
            'thumbnail': None,
            'category': 'Fisheries'
        }]
    }
    (systems_dir / 'catalogue.json').write_text(json.dumps(catalogue, indent=2))

    return systems_dir
