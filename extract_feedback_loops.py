#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract feedback loops from fishery systems map relationship data.

This script identifies both simple (2-node) and complex (3+ node) feedback loops
from relationship data, categorizes them as reinforcing or balancing,
and generates a markdown report with detailed descriptions.

Usage:
    python extract_feedback_loops.py [relationships_csv] [factors_csv] [output_md]

    relationships_csv: Path to CSV file with relationship data (default: relationships_data.csv)
    factors_csv: Path to CSV file with factor data (default: factors_data.csv)
    output_md: Path for output markdown file (default: sessf_feedback_loops.md)
"""

import csv
import sys
import networkx as nx
from collections import defaultdict


def read_csv_file(file_path):
    """
    Read data from a CSV file and return it as a list of dictionaries.
    
    Args:
        file_path (str): Path to the CSV file
        
    Returns:
        list: List of dictionaries with CSV data
        
    Raises:
        FileNotFoundError: If the specified file is not found
        Exception: For other reading errors
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as csv_file:
            reader = csv.DictReader(csv_file)
            return list(reader)
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading '{file_path}': {str(e)}")
        sys.exit(1)


def identify_feedback_loops(relationships_data):
    """
    Identify simple and complex feedback loops from relationship data.
    
    Args:
        relationships_data (list): List of dictionaries with relationship data
        
    Returns:
        tuple: (simple_loops, complex_loops) where each is a list of identified loops
    """
    # Create a directed graph
    G = nx.DiGraph()
    
    # Process relationship data to build the graph
    for rel in relationships_data:
        from_id = rel.get('from_factor_id', rel.get('from_id', ''))
        to_id = rel.get('to_factor_id', rel.get('to_id', ''))
        from_name = rel.get('from', '')
        to_name = rel.get('to', '')
        polarity = rel.get('polarity', 'same')
        strength = rel.get('strength', '')
        delay = rel.get('delay', '')
        
        # Skip if missing essential data
        if not (from_id and to_id and from_name and to_name):
            continue
        
        # Add nodes and edge with attributes
        G.add_node(from_id, name=from_name)
        G.add_node(to_id, name=to_name)
        G.add_edge(from_id, to_id, 
                   polarity=polarity, 
                   strength=strength, 
                   delay=delay,
                   from_name=from_name,
                   to_name=to_name)
    
    # Find simple cycles (length 2) - direct reciprocal relationships
    simple_loops = []
    for node1 in G.nodes():
        for node2 in G.successors(node1):
            if G.has_edge(node2, node1):  # Check for reciprocal edge
                cycle = [node1, node2]
                # Get the edges in this cycle
                edges = [(cycle[i], cycle[(i+1) % len(cycle)]) for i in range(len(cycle))]
                # Get edge data
                edge_data = [G.get_edge_data(u, v) for u, v in edges]
                
                # Create a loop entry
                loop_entry = {
                    'nodes': cycle,
                    'edges': edges,
                    'edge_data': edge_data,
                    'type': determine_loop_type(edge_data)
                }
                
                # Check if this cycle is already in the list (in reverse order)
                reverse_cycle = [node2, node1]
                if not any(set(l['nodes']) == set(cycle) for l in simple_loops):
                    simple_loops.append(loop_entry)
    
    # Find complex cycles (length 3+)
    complex_loops = []
    try:
        for cycle in nx.simple_cycles(G):
            if len(cycle) >= 3:  # Only consider cycles with 3 or more nodes
                # Get the edges in this cycle
                edges = [(cycle[i], cycle[(i+1) % len(cycle)]) for i in range(len(cycle))]
                # Get edge data
                edge_data = [G.get_edge_data(u, v) for u, v in edges]
                
                # Create a loop entry
                loop_entry = {
                    'nodes': cycle,
                    'edges': edges,
                    'edge_data': edge_data,
                    'type': determine_loop_type(edge_data)
                }
                
                # Add to complex loops if not already present
                if not any(set(l['nodes']) == set(cycle) for l in complex_loops):
                    complex_loops.append(loop_entry)
    except Exception as e:
        print(f"Warning: Error finding complex cycles: {str(e)}")
    
    return simple_loops, complex_loops


def determine_loop_type(edges):
    """
    Determine if a feedback loop is reinforcing or balancing.
    
    A reinforcing loop has an even number of 'opposite' relationships (including zero).
    A balancing loop has an odd number of 'opposite' relationships.
    
    Args:
        edges (list): List of edge data dictionaries
        
    Returns:
        str: 'Reinforcing' or 'Balancing'
    """
    # Count the number of 'opposite' relationships
    opposite_count = sum(1 for edge in edges if edge.get('polarity', '') == 'opposite')
    
    # Even number of 'opposite' relationships (including zero) = reinforcing loop
    # Odd number of 'opposite' relationships = balancing loop
    return "Reinforcing" if opposite_count % 2 == 0 else "Balancing"


def create_loop_description(loop, factors_data):
    """
    Create a human-readable description of a feedback loop.
    
    Args:
        loop (dict): Dictionary with loop information
        factors_data (list): List of dictionaries with factor data
        
    Returns:
        str: Markdown formatted description of the loop
    """
    nodes = loop['nodes']
    edge_data = loop['edge_data']
    
    # Create a mapping of factor_id to domain
    factor_domains = {}
    for factor in factors_data:
        factor_id = factor.get('factor_id', '')
        domain = factor.get('domain_name', '')
        if factor_id and domain:
            factor_domains[factor_id] = domain
    
    # Build description
    description = []
    for i in range(len(nodes)):
        from_id = nodes[i]
        to_id = nodes[(i+1) % len(nodes)]
        
        # Get edge data
        edge = next((e for e in edge_data if e.get('from_name') == G.nodes[from_id]['name'] and 
                     e.get('to_name') == G.nodes[to_id]['name']), None)
        
        if edge:
            from_name = edge.get('from_name', G.nodes[from_id]['name'])
            to_name = edge.get('to_name', G.nodes[to_id]['name'])
            polarity = edge.get('polarity', 'same')
            strength = edge.get('strength', '')
            delay = edge.get('delay', '')
            
            # Get domains if available
            from_domain = factor_domains.get(from_id, '')
            to_domain = factor_domains.get(to_id, '')
            
            # Create relationship description
            rel_str = f"**{from_name}** ({from_domain})" if from_domain else f"**{from_name}**"
            rel_str += " → "
            
            # Add polarity indicator
            if polarity == 'same':
                rel_str += "+"
            else:
                rel_str += "-"
            
            rel_str += " "
            rel_str += f"**{to_name}** ({to_domain})" if to_domain else f"**{to_name}**"
            
            # Add strength and delay if present
            if strength:
                rel_str += f" (Strength: {strength}"
                if delay:
                    rel_str += f", Delay: {delay})"
                else:
                    rel_str += ")"
            elif delay:
                rel_str += f" (Delay: {delay})"
            
            description.append(rel_str)
    
    return "\n".join(description)


def create_markdown(simple_loops, complex_loops, factors_data, output_file):
    """
    Generate a markdown file summarizing identified feedback loops.
    
    Args:
        simple_loops (list): List of dictionaries for simple feedback loops
        complex_loops (list): List of dictionaries for complex feedback loops
        factors_data (list): List of dictionaries with factor data
        output_file (str): Path for output markdown file
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as md_file:
            # Write header
            md_file.write("# Feedback Loops Analysis - SESSF Fishery System\n\n")
            
            # Write summary
            reinforcing_simple = sum(1 for loop in simple_loops if loop['type'] == 'Reinforcing')
            balancing_simple = len(simple_loops) - reinforcing_simple
            
            reinforcing_complex = sum(1 for loop in complex_loops if loop['type'] == 'Reinforcing')
            balancing_complex = len(complex_loops) - reinforcing_complex
            
            md_file.write("## Summary\n\n")
            md_file.write(f"Total feedback loops identified: **{len(simple_loops) + len(complex_loops)}**\n\n")
            md_file.write("### Simple Feedback Loops (2 nodes)\n")
            md_file.write(f"- Total: **{len(simple_loops)}**\n")
            md_file.write(f"- Reinforcing: **{reinforcing_simple}**\n")
            md_file.write(f"- Balancing: **{balancing_simple}**\n\n")
            
            md_file.write("### Complex Feedback Loops (3+ nodes)\n")
            md_file.write(f"- Total: **{len(complex_loops)}**\n")
            md_file.write(f"- Reinforcing: **{reinforcing_complex}**\n")
            md_file.write(f"- Balancing: **{balancing_complex}**\n\n")
            
            # Explanation of feedback loops
            md_file.write("## Understanding Feedback Loops\n\n")
            md_file.write("Feedback loops are circular patterns of cause and effect in a system. They can be:\n\n")
            md_file.write("- **Reinforcing loops**: These amplify change in the system. A change in one variable leads to further change in the same direction. These loops have an even number of 'opposite' relationships (including zero).\n\n")
            md_file.write("- **Balancing loops**: These counteract change and stabilize the system. A change in one variable leads to a response that opposes the initial change. These loops have an odd number of 'opposite' relationships.\n\n")
            md_file.write("Understanding feedback loops is crucial for fishery management as they can explain system behavior, identify leverage points for intervention, and help predict unintended consequences of management actions.\n\n")
            
            # Write simple feedback loops
            md_file.write("## Simple Feedback Loops\n\n")
            md_file.write("These are direct reciprocal relationships between two variables.\n\n")
            
            # Group by type
            reinforcing_loops = [loop for loop in simple_loops if loop['type'] == 'Reinforcing']
            balancing_loops = [loop for loop in simple_loops if loop['type'] == 'Balancing']
            
            md_file.write("### Reinforcing Loops\n\n")
            if reinforcing_loops:
                for i, loop in enumerate(reinforcing_loops, 1):
                    node_names = [G.nodes[node]['name'] for node in loop['nodes']]
                    md_file.write(f"#### Loop {i}: {' — '.join(node_names)}\n\n")
                    
                    # Write loop description
                    md_file.write("**Relationships:**\n\n")
                    for j, edge in enumerate(loop['edge_data']):
                        from_name = edge.get('from_name', '')
                        to_name = edge.get('to_name', '')
                        polarity = edge.get('polarity', 'same')
                        polarity_symbol = "+" if polarity == 'same' else "-"
                        md_file.write(f"- {from_name} {polarity_symbol}→ {to_name}\n")
                    
                    md_file.write("\n**Implications:**\n\n")
                    md_file.write("This reinforcing loop can lead to amplification effects, where changes in either variable can trigger a cascade of increasing (or decreasing) effects throughout the loop.\n\n")
            else:
                md_file.write("No reinforcing simple loops identified.\n\n")
            
            md_file.write("### Balancing Loops\n\n")
            if balancing_loops:
                for i, loop in enumerate(balancing_loops, 1):
                    node_names = [G.nodes[node]['name'] for node in loop['nodes']]
                    md_file.write(f"#### Loop {i}: {' — '.join(node_names)}\n\n")
                    
                    # Write loop description
                    md_file.write("**Relationships:**\n\n")
                    for j, edge in enumerate(loop['edge_data']):
                        from_name = edge.get('from_name', '')
                        to_name = edge.get('to_name', '')
                        polarity = edge.get('polarity', 'same')
                        polarity_symbol = "+" if polarity == 'same' else "-"
                        md_file.write(f"- {from_name} {polarity_symbol}→ {to_name}\n")
                    
                    md_file.write("\n**Implications:**\n\n")
                    md_file.write("This balancing loop can create stabilizing effects, where the system tends to maintain equilibrium by counteracting changes to either variable.\n\n")
            else:
                md_file.write("No balancing simple loops identified.\n\n")
            
            # Write complex feedback loops
            md_file.write("## Complex Feedback Loops\n\n")
            md_file.write("These loops involve three or more variables interacting in a circular pattern.\n\n")
            
            # Group by type
            reinforcing_complex = [loop for loop in complex_loops if loop['type'] == 'Reinforcing']
            balancing_complex = [loop for loop in complex_loops if loop['type'] == 'Balancing']
            
            md_file.write("### Reinforcing Complex Loops\n\n")
            if reinforcing_complex:
                for i, loop in enumerate(reinforcing_complex, 1):
                    node_names = [G.nodes[node]['name'] for node in loop['nodes']]
                    md_file.write(f"#### Loop {i}: {' → '.join(node_names)} → {node_names[0]}\n\n")
                    
                    # Write loop description
                    md_file.write("**Relationships:**\n\n")
                    for j in range(len(loop['nodes'])):
                        from_id = loop['nodes'][j]
                        to_id = loop['nodes'][(j+1) % len(loop['nodes'])]
                        
                        from_name = G.nodes[from_id]['name']
                        to_name = G.nodes[to_id]['name']
                        
                        edge_data = G.get_edge_data(from_id, to_id)
                        polarity = edge_data.get('polarity', 'same')
                        polarity_symbol = "+" if polarity == 'same' else "-"
                        
                        md_file.write(f"- {from_name} {polarity_symbol}→ {to_name}\n")
                    
                    md_file.write("\n**Implications:**\n\n")
                    md_file.write("This complex reinforcing loop can create powerful amplification effects in the system. Management interventions targeting any of the variables in this loop should consider the potential for cascading effects throughout the entire loop.\n\n")
            else:
                md_file.write("No reinforcing complex loops identified.\n\n")
            
            md_file.write("### Balancing Complex Loops\n\n")
            if balancing_complex:
                for i, loop in enumerate(balancing_complex, 1):
                    node_names = [G.nodes[node]['name'] for node in loop['nodes']]
                    md_file.write(f"#### Loop {i}: {' → '.join(node_names)} → {node_names[0]}\n\n")
                    
                    # Write loop description
                    md_file.write("**Relationships:**\n\n")
                    for j in range(len(loop['nodes'])):
                        from_id = loop['nodes'][j]
                        to_id = loop['nodes'][(j+1) % len(loop['nodes'])]
                        
                        from_name = G.nodes[from_id]['name']
                        to_name = G.nodes[to_id]['name']
                        
                        edge_data = G.get_edge_data(from_id, to_id)
                        polarity = edge_data.get('polarity', 'same')
                        polarity_symbol = "+" if polarity == 'same' else "-"
                        
                        md_file.write(f"- {from_name} {polarity_symbol}→ {to_name}\n")
                    
                    md_file.write("\n**Implications:**\n\n")
                    md_file.write("This complex balancing loop helps stabilize the system by counteracting changes. Understanding this loop can help identify leverage points for sustainable management interventions that work with the system's natural stabilizing tendencies.\n\n")
            else:
                md_file.write("No balancing complex loops identified.\n\n")
            
            # Management implications
            md_file.write("## Management Implications\n\n")
            md_file.write("### Key Insights\n\n")
            md_file.write("- **System stability**: The ratio of balancing to reinforcing loops (B/R) provides insight into overall system stability. A higher ratio suggests greater stability.\n\n")
            md_file.write("- **Intervention points**: Variables appearing in multiple feedback loops may be effective intervention points.\n\n")
            md_file.write("- **Delay considerations**: Loops involving significant delays require careful monitoring as effects may take time to manifest.\n\n")
            md_file.write("- **Strength assessment**: Stronger relationships within loops may have greater influence on system behavior.\n\n")
            
            md_file.write("### Recommendations\n\n")
            md_file.write("1. **Monitor key variables** in identified feedback loops, especially those present in multiple loops.\n\n")
            md_file.write("2. **Consider loop dynamics** when implementing management interventions, anticipating how changes might propagate through the system.\n\n")
            md_file.write("3. **Recognize time delays** in system response, particularly for loops with delay attributes.\n\n")
            md_file.write("4. **Use balancing loops** as leverage points for sustainable management.\n\n")
            md_file.write("5. **Be cautious of reinforcing loops** that might amplify negative changes.\n\n")
            
            print(f"Markdown report generated successfully: {output_file}")
            
    except Exception as e:
        print(f"Error generating markdown report: {str(e)}")


if __name__ == "__main__":
    # Define default file paths
    relationships_file = "relationships_data.csv"
    factors_file = "factors_data.csv"
    output_md_file = "sessf_feedback_loops.md"
    
    # Override with command line arguments if provided
    if len(sys.argv) > 1:
        relationships_file = sys.argv[1]
    if len(sys.argv) > 2:
        factors_file = sys.argv[2]
    if len(sys.argv) > 3:
        output_md_file = sys.argv[3]
    
    # Read data from CSV files
    relationships_data = read_csv_file(relationships_file)
    factors_data = read_csv_file(factors_file)
    
    # Create a directed graph
    G = nx.DiGraph()
    
    # Process relationship data to build the graph
    for rel in relationships_data:
        from_id = rel.get('from_factor_id', rel.get('from_id', ''))
        to_id = rel.get('to_factor_id', rel.get('to_id', ''))
        from_name = rel.get('from', '')
        to_name = rel.get('to', '')
        polarity = rel.get('polarity', 'same')
        strength = rel.get('strength', '')
        delay = rel.get('delay', '')
        
        # Skip if missing essential data
        if not (from_id and to_id and from_name and to_name):
            continue
        
        # Add nodes and edge with attributes
        G.add_node(from_id, name=from_name)
        G.add_node(to_id, name=to_name)
        G.add_edge(from_id, to_id, 
                   polarity=polarity, 
                   strength=strength, 
                   delay=delay,
                   from_name=from_name,
                   to_name=to_name)
    
    # Identify feedback loops
    simple_loops, complex_loops = identify_feedback_loops(relationships_data)
    
    # Generate markdown report
    create_markdown(simple_loops, complex_loops, factors_data, output_md_file)
    
    # Print summary
    print(f"Analysis complete! Found {len(simple_loops)} simple and {len(complex_loops)} complex feedback loops.")
    print(f"Results written to: {output_md_file}") 