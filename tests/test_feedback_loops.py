"""Tests for feedback_loops.py — cycle detection and polarity classification."""
import sys
from pathlib import Path

import networkx as nx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'platform'))
from feedback_loops import (
    find_cycles,
    calculate_cycle_polarity,
    find_feedback_loops,
    get_cycle_edges,
)


def _build_graph(edges, nodes=None):
    """Helper to build a DiGraph from edge tuples with polarity."""
    G = nx.DiGraph()
    if nodes:
        for nid, name in nodes:
            G.add_node(nid, name=name)
    for src, tgt, polarity in edges:
        if src not in G.nodes:
            G.add_node(src, name=src)
        if tgt not in G.nodes:
            G.add_node(tgt, name=tgt)
        G.add_edge(src, tgt, polarity=polarity)
    return G


class TestFindCycles:

    def test_triangle_detected(self):
        G = _build_graph([('A', 'B', 'same'), ('B', 'C', 'same'), ('C', 'A', 'same')])
        cycles = find_cycles(G, max_length=6)
        assert len(cycles) == 1
        assert set(cycles[0]) == {'A', 'B', 'C'}

    def test_four_node_cycle(self):
        G = _build_graph([
            ('A', 'B', 'same'), ('B', 'C', 'same'),
            ('C', 'D', 'same'), ('D', 'A', 'same')
        ])
        cycles = find_cycles(G, max_length=6)
        assert len(cycles) == 1
        assert len(cycles[0]) == 4

    def test_max_length_limits_results(self):
        """A 5-node cycle should not be found with max_length=3."""
        G = _build_graph([
            ('A', 'B', 'same'), ('B', 'C', 'same'),
            ('C', 'D', 'same'), ('D', 'E', 'same'), ('E', 'A', 'same')
        ])
        cycles_short = find_cycles(G, max_length=3)
        assert len(cycles_short) == 0

    def test_acyclic_graph_no_loops(self):
        G = _build_graph([('A', 'B', 'same'), ('B', 'C', 'same'), ('C', 'D', 'same')])
        cycles = find_cycles(G, max_length=6)
        assert len(cycles) == 0

    def test_duplicate_cycles_deduplicated(self):
        G = _build_graph([('A', 'B', 'same'), ('B', 'C', 'same'), ('C', 'A', 'same')])
        cycles = find_cycles(G, max_length=6)
        assert len(cycles) == 1


class TestCyclePolarity:

    def test_all_same_is_positive(self):
        G = _build_graph([('A', 'B', 'same'), ('B', 'C', 'same'), ('C', 'A', 'same')])
        polarity = calculate_cycle_polarity(G, ['A', 'B', 'C'])
        assert polarity == 'positive'

    def test_one_opposite_is_negative(self):
        G = _build_graph([('A', 'B', 'same'), ('B', 'C', 'opposite'), ('C', 'A', 'same')])
        polarity = calculate_cycle_polarity(G, ['A', 'B', 'C'])
        assert polarity == 'negative'

    def test_two_opposite_is_positive(self):
        G = _build_graph([('A', 'B', 'opposite'), ('B', 'C', 'opposite'), ('C', 'A', 'same')])
        polarity = calculate_cycle_polarity(G, ['A', 'B', 'C'])
        assert polarity == 'positive'

    def test_three_opposite_is_negative(self):
        G = _build_graph([('A', 'B', 'opposite'), ('B', 'C', 'opposite'), ('C', 'A', 'opposite')])
        polarity = calculate_cycle_polarity(G, ['A', 'B', 'C'])
        assert polarity == 'negative'


class TestFindFeedbackLoops:

    def test_returns_dict_with_required_keys(self):
        G = _build_graph(
            [('A', 'B', 'same'), ('B', 'C', 'same'), ('C', 'A', 'same')],
            nodes=[('A', 'Node A'), ('B', 'Node B'), ('C', 'Node C')]
        )
        loops = find_feedback_loops(G, max_length=6)
        assert len(loops) == 1
        loop = loops[0]
        assert 'nodes' in loop
        assert 'edges' in loop
        assert 'polarity' in loop
        assert 'length' in loop

    def test_node_names_in_output(self):
        G = _build_graph(
            [('A', 'B', 'same'), ('B', 'C', 'same'), ('C', 'A', 'same')],
            nodes=[('A', 'Fish Stock'), ('B', 'Fishing Effort'), ('C', 'Market Price')]
        )
        loops = find_feedback_loops(G, max_length=6)
        assert 'Fish Stock' in loops[0]['nodes']

    def test_complex_system_loops(self, sample_nodes, sample_edges):
        """Test on the full sample system with mixed polarity/strength."""
        from browser_analysis import NetworkAnalyzer
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        loops = find_feedback_loops(analyzer.G, max_length=4)
        assert len(loops) > 0
        for loop in loops:
            assert loop['polarity'] in ('positive', 'negative')
            assert loop['length'] >= 2


class TestGetCycleEdges:

    def test_returns_correct_edge_tuples(self):
        G = _build_graph([('A', 'B', 'same'), ('B', 'C', 'same'), ('C', 'A', 'same')])
        edges = get_cycle_edges(G, ['A', 'B', 'C'])
        assert ('A', 'B') in edges
        assert ('B', 'C') in edges
        assert ('C', 'A') in edges
