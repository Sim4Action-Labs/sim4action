import networkx as nx
import pandas as pd
import json

# ── Pure-Python graph construction (no browser dependencies) ────────────

def build_graph_from_data(factors_rows, relationships_rows):
    """Build a NetworkX DiGraph from raw FACTORS and RELATIONSHIPS row data.

    This function has zero browser dependencies and can be used standalone
    in any Python environment (CLI, notebooks, tests).

    Args:
        factors_rows: list of lists, each row [factor_id, name, domain, intervenable, definition, ...]
        relationships_rows: list of lists, each row [rel_id, from_name, to_name, from_factor_id,
                            to_factor_id, polarity, strength, delay, definition, ...]

    Returns:
        tuple: (nx.DiGraph, dict with graph summary stats)
    """
    G = nx.DiGraph()

    for row in factors_rows:
        if len(row) >= 3:
            node_id = row[0]
            G.add_node(
                node_id,
                name=row[1] if len(row) > 1 else "",
                domain=row[2] if len(row) > 2 else "",
                intervenable=row[3] if len(row) > 3 else "",
                definition=row[4] if len(row) > 4 else ""
            )

    for row in relationships_rows:
        if len(row) >= 5:
            source_id = row[3]
            target_id = row[4]
            if source_id in G.nodes and target_id in G.nodes:
                G.add_edge(
                    source_id,
                    target_id,
                    relationship_id=row[0] if len(row) > 0 else "",
                    from_name=row[1] if len(row) > 1 else "",
                    to_name=row[2] if len(row) > 2 else "",
                    polarity=row[5] if len(row) > 5 else "",
                    strength=row[6] if len(row) > 6 else "",
                    delay=row[7] if len(row) > 7 else "",
                    definition=row[8] if len(row) > 8 else ""
                )

    stats = {
        'num_nodes': G.number_of_nodes(),
        'num_edges': G.number_of_edges(),
        'is_directed': G.is_directed(),
        'domains': list(set(nx.get_node_attributes(G, 'domain').values())),
        'relationship_types': list(set(nx.get_edge_attributes(G, 'polarity').values()))
    }

    return G, stats


# ── Pyodide-specific data access layer ──────────────────────────────────
# The imports below are only available when running inside Pyodide (browser).
# They are deferred so that build_graph_from_data() can be imported anywhere.

try:
    from pyodide.http import open_url
    from js import console
    _HAS_PYODIDE = True
except ImportError:
    _HAS_PYODIDE = False

    class _FallbackConsole:
        @staticmethod
        def error(msg): print(f"[ERROR] {msg}")
        @staticmethod
        def log(msg): print(msg)

    console = _FallbackConsole()

# Google Sheets configuration
# Must be set via set_config() before use - no defaults hardcoded
SPREADSHEET_ID = None
API_KEY = None

def set_config(spreadsheet_id, api_key=None):
    """Update the spreadsheet configuration."""
    global SPREADSHEET_ID, API_KEY
    SPREADSHEET_ID = spreadsheet_id
    if api_key:
        API_KEY = api_key

def fetch_sheet_data(sheet_name):
    """Fetch data from a specific sheet in the Google Spreadsheet (Pyodide only)."""
    if not _HAS_PYODIDE:
        raise RuntimeError("fetch_sheet_data() requires Pyodide (browser environment)")
    url = f'https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{sheet_name}!A2:Z?key={API_KEY}'
    try:
        response = open_url(url)
        data = json.loads(response.read())
        return data.get('values', [])
    except Exception as e:
        console.error(f"Error fetching sheet data: {str(e)}")
        raise Exception(f"Failed to fetch {sheet_name} data: {str(e)}")

def create_networkx_graph():
    """Create a NetworkX graph from the systems map data (Pyodide entry point)."""
    try:
        factors_data = fetch_sheet_data('FACTORS')
        relationships_data = fetch_sheet_data('RELATIONSHIPS')
        return build_graph_from_data(factors_data, relationships_data)
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