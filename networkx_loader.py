import networkx as nx
import json
import numpy as np
import centrality_metrics
import feedback_loops

# Global graph variable
G = None

# Make modules available in global scope
globals()['centrality_metrics'] = centrality_metrics
globals()['feedback_loops'] = feedback_loops

def initialize_networkx():
    global G
    G = nx.DiGraph()

def add_node(node_id, name, domain):
    G.add_node(node_id, name=name, domain=domain)

def add_edge(source, target, type, strength, delay):
    G.add_edge(source, target, type=type, strength=strength, delay=delay)

def get_top_centrality_nodes(metric):
    try:
        if not G or G.number_of_nodes() == 0:
            return json.dumps({"error": "Graph is empty"})
        
        # Calculate centrality based on the requested metric
        if metric == 'degree':
            centrality = nx.degree_centrality(G)
        elif metric == 'betweenness':
            centrality = nx.betweenness_centrality(G)
        elif metric == 'closeness':
            centrality = nx.closeness_centrality(G)
        elif metric == 'eigenvector':
            centrality = nx.eigenvector_centrality(G)
        elif metric == 'katz':
            centrality = nx.katz_centrality(G, alpha=0.1, beta=1.0)
        else:
            return json.dumps({"error": f"Unknown centrality metric: {metric}"})
        
        # Convert centrality scores to percentages
        max_centrality = max(centrality.values()) if centrality else 1
        centrality_percentages = {node: (score / max_centrality) * 100 for node, score in centrality.items()}
        
        # Get top nodes
        top_nodes = sorted(centrality_percentages.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Format results
        results = {
            "nodes": [
                {
                    "node_id": node,
                    "name": G.nodes[node]['name'],
                    "domain": G.nodes[node]['domain'],
                    "centrality": score
                }
                for node, score in top_nodes
            ]
        }
        
        return json.dumps(results)
        
    except Exception as e:
        return json.dumps({"error": str(e)}) 