import networkx as nx
import pandas as pd
import json
from pyodide.http import open_url
from js import console, document, js

# Google Sheets configuration
SPREADSHEET_ID = '1ix0v4MP_PxbhDYQmph7cLwN-KElTZGwLm9dS1hgDzMM'
API_KEY = 'AIzaSyBLQvxh102-K54qQ0y1vR2CwLlFwm8p2wA'

def fetch_sheet_data(sheet_name):
    """Fetch data from a specific sheet in the Google Spreadsheet."""
    url = f'https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{sheet_name}!A2:Z?key={API_KEY}'
    try:
        response = open_url(url)
        data = json.loads(response.read())
        return data.get('values', [])
    except Exception as e:
        console.error(f"Error fetching sheet data: {str(e)}")
        raise Exception(f"Failed to fetch {sheet_name} data: {str(e)}")

def create_networkx_graph():
    """Create a NetworkX graph from the systems map data."""
    try:
        # Fetch data from sheets
        factors_data = fetch_sheet_data('FACTORS')
        relationships_data = fetch_sheet_data('RELATIONSHIPS')
        
        # Create empty directed graph
        G = nx.DiGraph()
        
        # Add nodes with attributes
        for row in factors_data:
            if len(row) >= 5:  # Ensure row has all required fields
                node_id = row[0]
                G.add_node(
                    node_id,
                    name=row[1],
                    domain=row[2],
                    intervenable=row[3],
                    definition=row[4] if len(row) > 4 else ""
                )
        
        # Add edges with attributes
        for row in relationships_data:
            if len(row) >= 8:  # Ensure row has all required fields
                source_id = row[3]  # from_factor_id
                target_id = row[4]  # to_factor_id
                G.add_edge(
                    source_id,
                    target_id,
                    relationship_id=row[0],
                    from_name=row[1],
                    to_name=row[2],
                    polarity=row[5],
                    strength=row[6],
                    delay=row[7],
                    definition=row[8] if len(row) > 8 else ""
                )
        
        return G, {
            'num_nodes': G.number_of_nodes(),
            'num_edges': G.number_of_edges(),
            'is_directed': G.is_directed(),
            'domains': list(set(nx.get_node_attributes(G, 'domain').values())),
            'relationship_types': list(set(nx.get_edge_attributes(G, 'polarity').values()))
        }
    
    except Exception as e:
        console.error(f"Error creating NetworkX graph: {str(e)}")
        return None, {'error': str(e)}

def calculate_betweenness_centrality(G):
    """Calculate betweenness centrality for all nodes."""
    try:
        centrality = nx.betweenness_centrality(G)
        sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        top_nodes = sorted_nodes[:10]
        max_centrality = max(centrality.values())
        results = []
        for node_id, score in top_nodes:
            node_data = G.nodes[node_id]
            normalized_score = (score / max_centrality) * 100 if max_centrality else 0
            results.append({
                'node_id': node_id,
                'name': node_data['name'],
                'domain': node_data['domain'],
                'centrality': normalized_score
            })
        return results
    except Exception as e:
        console.error(f"Error calculating betweenness centrality: {str(e)}")
        return None

def calculate_degree_centrality(G):
    try:
        centrality = nx.degree_centrality(G)
        sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        top_nodes = sorted_nodes[:10]
        max_centrality = max(centrality.values())
        results = []
        for node_id, score in top_nodes:
            node_data = G.nodes[node_id]
            normalized_score = (score / max_centrality) * 100 if max_centrality else 0
            results.append({
                'node_id': node_id,
                'name': node_data['name'],
                'domain': node_data['domain'],
                'centrality': normalized_score
            })
        return results
    except Exception as e:
        console.error(f"Error calculating degree centrality: {str(e)}")
        return None

def calculate_closeness_centrality(G):
    try:
        centrality = nx.closeness_centrality(G)
        sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        top_nodes = sorted_nodes[:10]
        max_centrality = max(centrality.values())
        results = []
        for node_id, score in top_nodes:
            node_data = G.nodes[node_id]
            normalized_score = (score / max_centrality) * 100 if max_centrality else 0
            results.append({
                'node_id': node_id,
                'name': node_data['name'],
                'domain': node_data['domain'],
                'centrality': normalized_score
            })
        return results
    except Exception as e:
        console.error(f"Error calculating closeness centrality: {str(e)}")
        return None

def calculate_eigenvector_centrality(G):
    try:
        centrality = nx.eigenvector_centrality_numpy(G)
        sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        top_nodes = sorted_nodes[:10]
        max_centrality = max(centrality.values())
        results = []
        for node_id, score in top_nodes:
            node_data = G.nodes[node_id]
            normalized_score = (score / max_centrality) * 100 if max_centrality else 0
            results.append({
                'node_id': node_id,
                'name': node_data['name'],
                'domain': node_data['domain'],
                'centrality': normalized_score
            })
        return results
    except Exception as e:
        return f"Eigenvector centrality error: {str(e)}"

def calculate_katz_centrality(G):
    try:
        centrality = nx.katz_centrality_numpy(G, alpha=0.1, beta=1.0)
        sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        top_nodes = sorted_nodes[:10]
        max_centrality = max(centrality.values())
        results = []
        for node_id, score in top_nodes:
            node_data = G.nodes[node_id]
            normalized_score = (score / max_centrality) * 100 if max_centrality else 0
            results.append({
                'node_id': node_id,
                'name': node_data['name'],
                'domain': node_data['domain'],
                'centrality': normalized_score
            })
        return results
    except Exception as e:
        return f"Katz centrality error: {str(e)}"

def initialize_networkx():
    """Initialize the NetworkX graph."""
    try:
        G, _ = create_networkx_graph()
        return G
    except Exception as e:
        console.error(f"Error initializing NetworkX: {str(e)}")
        return None

def get_top_centrality_nodes(metric):
    """Return top 10 nodes for the given centrality metric as JSON."""
    try:
        G, _ = create_networkx_graph()
        if G is None:
            return json.dumps({'error': 'Failed to create graph'})
            
        # Calculate centrality based on the requested metric
        if metric == 'betweenness':
            centrality = nx.betweenness_centrality(G)
        elif metric == 'degree':
            centrality = nx.degree_centrality(G)
        elif metric == 'closeness':
            centrality = nx.closeness_centrality(G)
        elif metric == 'eigenvector':
            centrality = nx.eigenvector_centrality_numpy(G)
        elif metric == 'katz':
            centrality = nx.katz_centrality_numpy(G, alpha=0.1, beta=1.0)
        else:
            return json.dumps({'error': 'Unknown metric'})

        # Sort nodes by centrality value
        sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Format results
        results = []
        if sorted_nodes:
            max_centrality = max(centrality.values())
            for node_id, score in sorted_nodes:
                # Verify node exists and has required attributes
                if node_id in G.nodes:
                    node_data = G.nodes[node_id]
                    name = node_data.get('name', 'Unknown')
                    domain = node_data.get('domain', 'Unknown')
                    normalized_score = (score / max_centrality) * 100 if max_centrality else 0
                    
                    results.append({
                        'node_id': node_id,
                        'name': name,
                        'domain': domain,
                        'centrality': normalized_score
                    })
        
        return json.dumps({'nodes': results})
        
    except Exception as e:
        console.error(f"Error calculating {metric} centrality: {str(e)}")
        return json.dumps({'error': f"Error calculating {metric} centrality: {str(e)}"}) 