import networkx as nx
import pandas as pd
import json
from pyodide.http import open_url
from js import console, document

# Google Sheets configuration
SPREADSHEET_ID = '1w9kl6vpPDiVVfjDEIowZVO9zj9REHr5TwUeD515ZuuU'
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
        
        # Basic graph statistics for verification
        stats = {
            'num_nodes': G.number_of_nodes(),
            'num_edges': G.number_of_edges(),
            'is_directed': G.is_directed(),
            'domains': list(set(nx.get_node_attributes(G, 'domain').values())),
            'relationship_types': list(set(nx.get_edge_attributes(G, 'polarity').values()))
        }
        
        return G, stats
    
    except Exception as e:
        console.error(f"Error creating NetworkX graph: {str(e)}")
        return None, {'error': str(e)}

def calculate_betweenness_centrality(G):
    """Calculate betweenness centrality for all nodes."""
    try:
        # Calculate betweenness centrality
        centrality = nx.betweenness_centrality(G)
        
        # Sort nodes by centrality value in descending order
        sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        
        # Get top 10 nodes
        top_nodes = sorted_nodes[:10]  # Ensure we get 10 nodes
        
        # Format results with node names and centrality scores
        results = []
        max_centrality = max(centrality.values())  # Use max of all values for normalization
        for node_id, score in top_nodes:
            node_data = G.nodes[node_id]
            normalized_score = (score / max_centrality) * 100  # Convert to percentage
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
        # Return a special result indicating failure
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

def update_status_display(stats, G=None):
    """Update the status display with graph statistics and all centralities."""
    status_div = document.getElementById('networkx-status')
    
    if not stats.get('error'):
        # Calculate all centralities if graph is provided
        centrality_html = ""
        if G is not None:
            metrics = [
                ("Betweenness", calculate_betweenness_centrality(G)),
                ("Degree", calculate_degree_centrality(G)),
                ("Closeness", calculate_closeness_centrality(G)),
                ("Eigenvector", calculate_eigenvector_centrality(G)),
                ("Katz", calculate_katz_centrality(G)),
            ]
            for metric_name, top_nodes in metrics:
                centrality_html += f"""
                <div style='margin-top: 20px; background-color: white; padding: 15px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);'>
                    <h4 style='margin: 0 0 15px 0; color: #333;'>Top 10 Nodes by {metric_name} Centrality:</h4>
                """
                if isinstance(top_nodes, str):
                    # Error message from eigenvector centrality
                    centrality_html += f"<div style='color: red; font-size: 13px; margin-bottom: 10px;'>{top_nodes}</div>"
                elif top_nodes:
                    centrality_html += """
                    <div style='max-height: 400px; overflow-y: auto;'>
                        <table style='width: 100%; border-collapse: collapse;'>
                            <thead>
                                <tr style='background-color: #f8f9fa;'>
                                    <th style='padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; position: sticky; top: 0; background: #f8f9fa;'>Node ID & Name</th>
                                    <th style='padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; position: sticky; top: 0; background: #f8f9fa;'>Domain</th>
                                    <th style='padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6; position: sticky; top: 0; background: #f8f9fa;'>Centrality</th>
                                </tr>
                            </thead>
                            <tbody>
                    """
                    for i, node in enumerate(top_nodes):
                        bg_color = '#f8f9fa' if i % 2 == 0 else 'white'
                        centrality_html += f"""
                            <tr style='background-color: {bg_color};'>
                                <td style='padding: 8px 10px; text-align: left; border-bottom: 1px solid #dee2e6;'><strong>{node['node_id']}</strong>: {node['name']}</td>
                                <td style='padding: 8px 10px; text-align: left; border-bottom: 1px solid #dee2e6;'>{node['domain']}</td>
                                <td style='padding: 8px 10px; text-align: right; border-bottom: 1px solid #dee2e6;'>{node['centrality']:.3f}%</td>
                            </tr>
                        """
                    centrality_html += """
                            </tbody>
                        </table>
                    </div>
                    <p style='margin: 10px 0 0 0; font-size: 12px; color: #666;'>* Scores are normalized as percentages relative to the highest value</p>
                    """
                else:
                    centrality_html += "<div style='color: #888; font-size: 13px;'>No data available for this metric.</div>"
                centrality_html += "</div>"
        status_html = f"""
        <div style="background-color: white; padding: 15px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0;">NetworkX Graph Successfully Created!</h3>
            <ul style="margin: 0; padding-left: 20px;">
                <li>Nodes: {stats['num_nodes']}</li>
                <li>Edges: {stats['num_edges']}</li>
                <li>Directed: {stats['is_directed']}</li>
                <li>Domains: {', '.join(stats['domains'])}</li>
                <li>Relationship Types: {', '.join(stats['relationship_types'])}</li>
            </ul>
        </div>
        {centrality_html}
        """
    else:
        status_html = f"""
        <div style="background-color: #fff0f0; padding: 15px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="color: red; margin: 0 0 10px 0;">Error Creating NetworkX Graph</h3>
            <p style="margin: 0; color: #666;">{stats['error']}</p>
        </div>
        """
    status_div.innerHTML = status_html

def initialize_networkx():
    """Initialize the NetworkX graph and display status."""
    try:
        G, stats = create_networkx_graph()
        update_status_display(stats, G)  # Pass the graph object to calculate centrality
        return G
    except Exception as e:
        console.error(f"Error initializing NetworkX: {str(e)}")
        update_status_display({'error': str(e)})
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