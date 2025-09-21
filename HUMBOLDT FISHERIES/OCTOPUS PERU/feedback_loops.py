import networkx as nx
import json
from typing import List, Dict, Tuple, Set
from collections import defaultdict

class FeedbackLoop:
    def __init__(self, nodes: List[str], edges: List[Tuple[str, str]], polarity: str, length: int):
        self.nodes = nodes
        self.edges = edges
        self.polarity = polarity  # 'positive' or 'negative'
        self.length = length

    def to_dict(self) -> Dict:
        return {
            'nodes': self.nodes,
            'edges': self.edges,
            'polarity': self.polarity,
            'length': self.length
        }

def find_cycles(G: nx.DiGraph, max_length: int = 6) -> List[List[str]]:
    """
    Find all cycles in the graph up to a specified maximum length.
    Returns a list of node sequences representing each cycle.
    """
    cycles = []
    for node in G.nodes():
        # Use DFS to find cycles starting from each node
        visited = set()
        path = []
        
        def dfs(current, start, length):
            if length > max_length:
                return
                
            visited.add(current)
            path.append(current)
            
            for neighbor in G.successors(current):
                if neighbor == start and length >= 2:  # Found a cycle
                    cycles.append(path.copy())
                elif neighbor not in visited:
                    dfs(neighbor, start, length + 1)
            
            path.pop()
            visited.remove(current)
        
        dfs(node, node, 0)
    
    # Remove duplicate cycles (same cycle starting from different nodes)
    unique_cycles = []
    seen = set()
    for cycle in cycles:
        # Normalize cycle representation by rotating to start with smallest node ID
        min_idx = cycle.index(min(cycle))
        normalized = tuple(cycle[min_idx:] + cycle[:min_idx])
        if normalized not in seen:
            seen.add(normalized)
            unique_cycles.append(cycle)
    
    return unique_cycles

def calculate_cycle_polarity(G: nx.DiGraph, cycle: List[str]) -> str:
    """
    Calculate the overall polarity of a cycle by multiplying the polarities of its edges.
    Returns 'positive' if the product is positive, 'negative' otherwise.
    """
    polarity_product = 1
    for i in range(len(cycle)):
        source = cycle[i]
        target = cycle[(i + 1) % len(cycle)]
        edge_data = G.get_edge_data(source, target)
        if edge_data and 'polarity' in edge_data:
            # Convert polarity to numerical value: 'same' = 1, 'opposite' = -1
            polarity = 1 if edge_data['polarity'].lower() == 'same' else -1
            polarity_product *= polarity
    
    return 'positive' if polarity_product > 0 else 'negative'

def get_cycle_edges(G: nx.DiGraph, cycle: List[str]) -> List[Tuple[str, str]]:
    """
    Get the edges that form a cycle, including their attributes.
    """
    edges = []
    for i in range(len(cycle)):
        source = cycle[i]
        target = cycle[(i + 1) % len(cycle)]
        edge_data = G.get_edge_data(source, target)
        if edge_data:
            edges.append((source, target))
    return edges

def find_feedback_loops(G: nx.DiGraph, max_length: int = 6) -> List[Dict]:
    """
    Find all feedback loops in the graph up to a specified maximum length.
    Returns a list of FeedbackLoop objects converted to dictionaries.
    """
    cycles = find_cycles(G, max_length)
    feedback_loops = []
    
    for cycle in cycles:
        polarity = calculate_cycle_polarity(G, cycle)
        edges = get_cycle_edges(G, cycle)
        
        # Create node names list for better readability
        node_names = [G.nodes[node]['name'] for node in cycle]
        
        feedback_loop = FeedbackLoop(
            nodes=node_names,
            edges=edges,
            polarity=polarity,
            length=len(cycle)
        )
        feedback_loops.append(feedback_loop.to_dict())
    
    return feedback_loops

def get_feedback_loops_by_length(max_length: int = 6) -> Dict:
    """
    Main function to be called from JavaScript.
    Returns feedback loops grouped by length and polarity.
    """
    try:
        # Get the graph from networkx_loader
        from networkx_loader import create_networkx_graph
        G, _ = create_networkx_graph()
        
        if not G:
            return {'error': 'Failed to create graph'}
        
        feedback_loops = find_feedback_loops(G, max_length)
        
        # Group feedback loops by length and polarity
        grouped_loops = defaultdict(lambda: {'positive': [], 'negative': []})
        for loop in feedback_loops:
            length = loop['length']
            polarity = loop['polarity']
            grouped_loops[length][polarity].append(loop)
        
        # Convert defaultdict to regular dict for JSON serialization
        result = {
            'feedback_loops': dict(grouped_loops),
            'total_loops': len(feedback_loops),
            'max_length': max_length
        }
        
        return json.dumps(result)
        
    except Exception as e:
        return json.dumps({'error': str(e)}) 