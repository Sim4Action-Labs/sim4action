import networkx as nx
import json
from typing import List, Dict, Set, Tuple

class FeedbackLoopAnalyzer:
    def __init__(self, graph: nx.DiGraph):
        self.graph = graph
        self._node_names = {node: data.get('name', node) for node, data in graph.nodes(data=True)}
        self._node_domains = {node: data.get('domain', 'Unknown') for node, data in graph.nodes(data=True)}

    def get_feedback_loops_by_length(self, length: int) -> Dict[str, List[Dict]]:
        """
        Find all feedback loops of a specific length in the graph.
        
        Args:
            length: The number of nodes in the feedback loops to find
            
        Returns:
            Dictionary containing positive and negative feedback loops
        """
        if length < 2:
            return {"error": "Length must be at least 2"}

        # Find all simple cycles of the specified length
        cycles = list(nx.simple_cycles(self.graph))
        cycles = [cycle for cycle in cycles if len(cycle) == length]

        positive_loops = []
        negative_loops = []

        for cycle in cycles:
            polarity = self._calculate_cycle_polarity(cycle)
            loop_data = {
                "nodes": cycle,
                "length": len(cycle),
                "polarity": polarity,
                "node_names": [self._node_names[node] for node in cycle],
                "node_domains": [self._node_domains[node] for node in cycle]
            }
            
            if polarity == "positive":
                positive_loops.append(loop_data)
            else:
                negative_loops.append(loop_data)

        return {
            "feedback_loops": {
                length: {
                    "positive": positive_loops,
                    "negative": negative_loops
                }
            }
        }

    def _calculate_cycle_polarity(self, cycle: List[str]) -> str:
        """
        Calculate the polarity of a cycle (positive or negative feedback loop).
        
        Args:
            cycle: List of node IDs forming a cycle
            
        Returns:
            "positive" if the cycle has an even number of negative relationships,
            "negative" if it has an odd number of negative relationships
        """
        negative_count = 0
        for i in range(len(cycle)):
            source = cycle[i]
            target = cycle[(i + 1) % len(cycle)]
            
            # Get the relationship type from the edge data
            edge_data = self.graph.get_edge_data(source, target)
            if edge_data and edge_data.get('type') == 'opposite':
                negative_count += 1

        return "positive" if negative_count % 2 == 0 else "negative"

def get_feedback_loops_by_length(length: int) -> str:
    """
    Wrapper function to be called from JavaScript.
    
    Args:
        length: The number of nodes in the feedback loops to find
        
    Returns:
        JSON string containing the feedback loops data
    """
    try:
        # Get the graph from the global scope (set by networkx_loader.py)
        graph = globals().get('G')
        if not graph:
            return json.dumps({"error": "Graph not initialized"})

        analyzer = FeedbackLoopAnalyzer(graph)
        result = analyzer.get_feedback_loops_by_length(length)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"error": str(e)}) 