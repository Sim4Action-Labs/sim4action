"""Tests for browser_analysis.py — NetworkAnalyzer core library."""
import sys
from pathlib import Path

import networkx as nx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'platform'))
from browser_analysis import NetworkAnalyzer


class TestNetworkAnalyzerConstruction:

    def test_builds_graph_from_nodes_and_edges(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        assert analyzer.G.number_of_nodes() == 8
        assert analyzer.G.number_of_edges() == 12

    def test_node_attributes_preserved(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        assert analyzer.G.nodes['V1']['name'] == 'Fish Stock'
        assert analyzer.G.nodes['V1']['domain'] == 'Environmental'

    def test_edge_attributes_preserved(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        edge_data = analyzer.G.edges['V1', 'V2']
        assert edge_data['polarity'] == 'same'

    def test_empty_graph(self):
        analyzer = NetworkAnalyzer([], [])
        assert analyzer.G.number_of_nodes() == 0
        assert analyzer.G.number_of_edges() == 0

    def test_single_node(self):
        nodes = [{'id': 'V1', 'name': 'Alone', 'domain': 'Test'}]
        analyzer = NetworkAnalyzer(nodes, [])
        assert analyzer.G.number_of_nodes() == 1
        assert analyzer.G.number_of_edges() == 0


class TestCentrality:

    def test_degree_centrality(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        centrality = analyzer.calculate_centrality('degree')
        assert 'V1' in centrality
        assert 'V2' in centrality
        top_node = max(centrality, key=centrality.get)
        assert top_node == 'V2'

    def test_betweenness_centrality(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        centrality = analyzer.calculate_centrality('betweenness')
        assert all(0 <= v <= 1 for v in centrality.values())

    def test_closeness_centrality(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        centrality = analyzer.calculate_centrality('closeness')
        assert len(centrality) == 8

    def test_eigenvector_centrality(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        centrality = analyzer.calculate_centrality('eigenvector')
        assert len(centrality) == 8

    def test_invalid_metric_raises(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        with pytest.raises(ValueError, match="Unknown centrality metric"):
            analyzer.calculate_centrality('invalid_metric')


class TestNetworkMetrics:

    def test_metrics_correct_counts(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        metrics = analyzer.get_network_metrics()
        assert metrics['num_nodes'] == 8
        assert metrics['num_edges'] == 12
        assert 0 < metrics['density'] < 1

    def test_density_bounds(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        metrics = analyzer.get_network_metrics()
        assert 0 <= metrics['density'] <= 1


class TestCommunityDetection:

    def test_communities_non_empty(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        communities = analyzer.find_communities()
        assert len(communities) == 8
        assert all(isinstance(v, int) for v in communities.values())

    def test_all_nodes_assigned(self, sample_nodes, sample_edges):
        analyzer = NetworkAnalyzer(sample_nodes, sample_edges)
        communities = analyzer.find_communities()
        for node in sample_nodes:
            assert node['id'] in communities
