"""Tests for networkx_loader.build_graph_from_data — pure-Python graph construction."""
import sys
from pathlib import Path

import networkx as nx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'platform'))
from networkx_loader import build_graph_from_data


class TestBuildGraphFromData:

    def test_basic_construction(self, sample_factors_rows, sample_relationships_rows):
        G, stats = build_graph_from_data(sample_factors_rows, sample_relationships_rows)
        assert isinstance(G, nx.DiGraph)
        assert stats['num_nodes'] == 8
        assert stats['num_edges'] == 12

    def test_node_attributes(self, sample_factors_rows, sample_relationships_rows):
        G, _ = build_graph_from_data(sample_factors_rows, sample_relationships_rows)
        assert G.nodes['V1']['name'] == 'Fish Stock'
        assert G.nodes['V1']['domain'] == 'Environmental'
        assert G.nodes['V1']['intervenable'] == 'No'

    def test_edge_attributes(self, sample_factors_rows, sample_relationships_rows):
        G, _ = build_graph_from_data(sample_factors_rows, sample_relationships_rows)
        edge = G.edges['V1', 'V2']
        assert edge['polarity'] == 'same'
        assert edge['strength'] == 'strong'
        assert edge['relationship_id'] == 'R1'

    def test_stats_domains(self, sample_factors_rows, sample_relationships_rows):
        _, stats = build_graph_from_data(sample_factors_rows, sample_relationships_rows)
        assert 'Environmental' in stats['domains']
        assert 'Economic' in stats['domains']
        assert stats['is_directed'] is True

    def test_empty_data(self):
        G, stats = build_graph_from_data([], [])
        assert stats['num_nodes'] == 0
        assert stats['num_edges'] == 0

    def test_sparse_rows_handled(self):
        """Rows with fewer columns than expected should still be handled."""
        factors = [['V1', 'Node One', 'Domain A']]
        relationships = [['R1', '', '', 'V1', 'V1']]
        G, stats = build_graph_from_data(factors, relationships)
        assert stats['num_nodes'] == 1
        assert G.nodes['V1']['name'] == 'Node One'
        assert G.nodes['V1']['definition'] == ''

    def test_missing_optional_fields_default(self):
        """Nodes with only 3 columns get empty defaults for intervenable and definition."""
        factors = [['V1', 'A', 'DomA'], ['V2', 'B', 'DomB']]
        relationships = [['R1', '', '', 'V1', 'V2']]
        G, stats = build_graph_from_data(factors, relationships)
        assert G.nodes['V1']['intervenable'] == ''
        assert G.nodes['V1']['definition'] == ''
        assert stats['num_edges'] == 1

    def test_invalid_factor_references_skipped(self):
        """Relationships referencing non-existent factors are skipped."""
        factors = [['V1', 'A', 'DomA']]
        relationships = [['R1', '', '', 'V1', 'V_MISSING']]
        G, stats = build_graph_from_data(factors, relationships)
        assert stats['num_nodes'] == 1
        assert stats['num_edges'] == 0

    def test_self_loops(self):
        """A factor can have a relationship to itself."""
        factors = [['V1', 'Self', 'DomA']]
        relationships = [['R1', '', '', 'V1', 'V1']]
        G, _ = build_graph_from_data(factors, relationships)
        assert G.has_edge('V1', 'V1')
