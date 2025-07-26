import networkx as nx
import pandas as pd
from typing import Dict, List, Any

class NetworkAnalyzer:
    def __init__(self, nodes: List[Dict], edges: List[Dict]):
        """Initialize the network analyzer with nodes and edges."""
        self.G = nx.DiGraph()
        self._build_graph(nodes, edges)
    
    def _build_graph(self, nodes: List[Dict], edges: List[Dict]):
        """Build the network graph from nodes and edges."""
        # Add nodes
        for node in nodes:
            self.G.add_node(
                node['id'],
                name=node['name'],
                domain=node['domain'],
                intervenable=node.get('intervenable', False),
                definition=node.get('definition', '')
            )
        
        # Add edges
        for edge in edges:
            self.G.add_edge(
                edge['source'],
                edge['target'],
                polarity=edge.get('type', 'same'),
                strength=edge.get('strength', 'medium'),
                delay=edge.get('delay', 'none'),
                definition=edge.get('definition', '')
            )
    
    def calculate_centrality(self, metric: str) -> Dict[str, float]:
        """Calculate centrality measures for the network."""
        if metric == 'degree':
            return dict(nx.degree_centrality(self.G))
        elif metric == 'betweenness':
            return dict(nx.betweenness_centrality(self.G))
        elif metric == 'closeness':
            return dict(nx.closeness_centrality(self.G))
        elif metric == 'eigenvector':
            return dict(nx.eigenvector_centrality(self.G))
        else:
            raise ValueError(f"Unknown centrality metric: {metric}")
    
    def find_feedback_loops(self) -> List[List[str]]:
        """Find all feedback loops in the network."""
        try:
            return list(nx.simple_cycles(self.G))
        except nx.NetworkXNoCycle:
            return []
    
    def get_network_metrics(self) -> Dict[str, Any]:
        """Calculate basic network metrics."""
        return {
            'num_nodes': self.G.number_of_nodes(),
            'num_edges': self.G.number_of_edges(),
            'density': nx.density(self.G),
            'average_degree': sum(dict(self.G.degree()).values()) / self.G.number_of_nodes(),
            'is_strongly_connected': nx.is_strongly_connected(self.G),
            'num_strongly_connected_components': nx.number_strongly_connected_components(self.G)
        }
    
    def find_communities(self) -> Dict[str, int]:
        """Find communities in the network using the Louvain method."""
        # Convert to undirected graph for community detection
        undirected_G = self.G.to_undirected()
        communities = nx.community.louvain_communities(undirected_G)
        
        # Create a mapping of node to community
        community_map = {}
        for i, community in enumerate(communities):
            for node in community:
                community_map[node] = i
        return community_map
    
    def get_node_attributes(self) -> Dict[str, Dict[str, Any]]:
        """Get all node attributes."""
        return {node: self.G.nodes[node] for node in self.G.nodes()}
    
    def get_edge_attributes(self) -> Dict[tuple, Dict[str, Any]]:
        """Get all edge attributes."""
        return {edge: self.G.edges[edge] for edge in self.G.edges()} 