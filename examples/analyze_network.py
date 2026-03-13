#!/usr/bin/env python3
"""Standalone usage of SIM4Action core analysis libraries.

Demonstrates that browser_analysis.py, feedback_loops.py, and
networkx_loader.build_graph_from_data() work as pure Python libraries
outside the browser, with no Pyodide or web dependencies.

Usage:
    python examples/analyze_network.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'platform'))

from browser_analysis import NetworkAnalyzer
from feedback_loops import find_feedback_loops
from networkx_loader import build_graph_from_data

# ── Sample socio-environmental system ───────────────────────────────────
# A small fishery system for demonstration purposes.

NODES = [
    {'id': 'V1', 'name': 'Fish Stock', 'domain': 'Environmental'},
    {'id': 'V2', 'name': 'Fishing Effort', 'domain': 'Economic'},
    {'id': 'V3', 'name': 'Market Price', 'domain': 'Economic'},
    {'id': 'V4', 'name': 'Fisher Income', 'domain': 'Social'},
    {'id': 'V5', 'name': 'Regulation Stringency', 'domain': 'Management'},
    {'id': 'V6', 'name': 'Ecosystem Health', 'domain': 'Environmental'},
    {'id': 'V7', 'name': 'Community Wellbeing', 'domain': 'Social'},
    {'id': 'V8', 'name': 'Bycatch', 'domain': 'Environmental'},
]

EDGES = [
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
]

# ── 1. Build graph using networkx_loader (pure Python path) ────────────

FACTORS_ROWS = [
    [n['id'], n['name'], n['domain'], 'No', ''] for n in NODES
]
RELATIONSHIPS_ROWS = [
    [f'R{i+1}', '', '', e['source'], e['target'], e['type'], e['strength'], 'medium', '']
    for i, e in enumerate(EDGES)
]

G, stats = build_graph_from_data(FACTORS_ROWS, RELATIONSHIPS_ROWS)
print("=== Graph Construction (networkx_loader.build_graph_from_data) ===")
print(f"  Nodes: {stats['num_nodes']}, Edges: {stats['num_edges']}")
print(f"  Domains: {stats['domains']}")
print()

# ── 2. Network analysis using browser_analysis.py ──────────────────────

analyzer = NetworkAnalyzer(NODES, EDGES)

print("=== Centrality Analysis (browser_analysis.NetworkAnalyzer) ===")
for metric in ['degree', 'betweenness', 'closeness']:
    centrality = analyzer.calculate_centrality(metric)
    top = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:3]
    print(f"  {metric.title():12s} top 3: {', '.join(f'{k}={v:.3f}' for k, v in top)}")
print()

metrics = analyzer.get_network_metrics()
print("=== Network Metrics ===")
for key, value in metrics.items():
    print(f"  {key}: {value}")
print()

communities = analyzer.find_communities()
print("=== Community Detection (Louvain) ===")
for node_id, comm_id in sorted(communities.items()):
    name = analyzer.G.nodes[node_id].get('name', node_id)
    print(f"  {node_id} ({name}): community {comm_id}")
print()

# ── 3. Feedback loop detection using feedback_loops.py ─────────────────

loops = find_feedback_loops(analyzer.G, max_length=4)
print(f"=== Feedback Loops (max length 4) ===")
print(f"  Found {len(loops)} loops:")
for loop in loops:
    polarity_label = "Reinforcing" if loop['polarity'] == 'positive' else "Balancing"
    nodes_str = " -> ".join(loop['nodes'])
    print(f"  [{polarity_label}] {nodes_str} (length {loop['length']})")
