#!/usr/bin/env python3
"""
SESSF Relationships Extractor

A simple script to extract relationship information from a CSV file 
(exported from Google Sheets) and format it as markdown.
"""

import csv
import os
import sys

def read_csv_file(file_path):
    """Read data from a CSV file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            data = list(reader)
        return data
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return []

def create_markdown(data, output_file):
    """Create markdown from relationships data."""
    if not data or len(data) <= 1:
        print("No data to process.")
        return False
    
    try:
        headers = data[0]
        rows = data[1:]
        
        # Find index for each required column
        try:
            rel_id_idx = headers.index('relationship')
            from_idx = headers.index('from')
            to_idx = headers.index('to')
            from_factor_idx = headers.index('from_factor_id')
            to_factor_idx = headers.index('to_factor_id')
            polarity_idx = headers.index('polarity')
            strength_idx = headers.index('strength')
            delay_idx = headers.index('delay')
            definition_idx = headers.index('definition')
        except ValueError as e:
            print(f"Required column missing: {e}")
            print(f"Available columns: {headers}")
            return False
        
        with open(output_file, 'w', encoding='utf-8') as f:
            # Write header
            f.write("# SESSF Relationships\n\n")
            f.write("This document contains all relationships identified in the SESSF system.\n\n")
            
            # Write relationships table
            f.write("## Relationships Table\n\n")
            f.write("| ID | From | To | From ID | To ID | Polarity | Strength | Delay | Definition |\n")
            f.write("|----|----|-----|---------|-------|----------|----------|-------|------------|\n")
            
            for row in rows:
                # Skip incomplete rows
                if len(row) <= max(rel_id_idx, from_idx, to_idx, from_factor_idx, to_factor_idx, 
                                  polarity_idx, strength_idx, delay_idx, definition_idx):
                    continue
                
                rel_id = row[rel_id_idx]
                from_var = row[from_idx]
                to_var = row[to_idx]
                from_factor = row[from_factor_idx]
                to_factor = row[to_factor_idx]
                polarity = row[polarity_idx]
                strength = row[strength_idx]
                delay = row[delay_idx]
                definition = row[definition_idx]
                
                # Escape pipe characters to not break the table
                definition = definition.replace('|', '\\|')
                
                f.write(f"| {rel_id} | {from_var} | {to_var} | {from_factor} | {to_factor} | {polarity} | {strength} | {delay} | {definition} |\n")
            
            # Write polarity summary
            f.write("\n## Polarity Summary\n\n")
            polarity_counts = {}
            for row in rows:
                if len(row) > polarity_idx:
                    polarity = row[polarity_idx]
                    polarity_counts[polarity] = polarity_counts.get(polarity, 0) + 1
            
            f.write("| Polarity | Relationship Count | Percentage |\n")
            f.write("|----------|-------------------|------------|\n")
            for polarity, count in sorted(polarity_counts.items()):
                percentage = (count / len(rows)) * 100
                f.write(f"| {polarity} | {count} | {percentage:.1f}% |\n")
            
            # Write strength summary
            f.write("\n## Strength Summary\n\n")
            strength_counts = {}
            for row in rows:
                if len(row) > strength_idx:
                    strength = row[strength_idx]
                    strength_counts[strength] = strength_counts.get(strength, 0) + 1
            
            f.write("| Strength | Relationship Count | Percentage |\n")
            f.write("|----------|-------------------|------------|\n")
            for strength, count in sorted(strength_counts.items()):
                percentage = (count / len(rows)) * 100
                f.write(f"| {strength} | {count} | {percentage:.1f}% |\n")
            
            # Write delay summary
            f.write("\n## Delay Summary\n\n")
            delay_counts = {}
            for row in rows:
                if len(row) > delay_idx:
                    delay = row[delay_idx]
                    delay_counts[delay] = delay_counts.get(delay, 0) + 1
            
            f.write("| Delay | Relationship Count | Percentage |\n")
            f.write("|-------|-------------------|------------|\n")
            for delay, count in sorted(delay_counts.items()):
                percentage = (count / len(rows)) * 100
                f.write(f"| {delay} | {count} | {percentage:.1f}% |\n")
            
            # Write key node analysis
            f.write("\n## Key Node Analysis\n\n")
            
            # Count connections for each node
            node_connections = {}
            for row in rows:
                if len(row) > from_idx and len(row) > to_idx:
                    from_var = row[from_idx]
                    to_var = row[to_idx]
                    
                    # Count outgoing connections
                    if from_var not in node_connections:
                        node_connections[from_var] = {"outgoing": 0, "incoming": 0, "total": 0}
                    node_connections[from_var]["outgoing"] += 1
                    node_connections[from_var]["total"] += 1
                    
                    # Count incoming connections
                    if to_var not in node_connections:
                        node_connections[to_var] = {"outgoing": 0, "incoming": 0, "total": 0}
                    node_connections[to_var]["incoming"] += 1
                    node_connections[to_var]["total"] += 1
            
            # Sort nodes by total connections
            sorted_nodes = sorted(node_connections.items(), key=lambda x: x[1]["total"], reverse=True)
            
            # Show top 10 most connected nodes
            f.write("### Top 10 Most Connected Variables\n\n")
            f.write("| Variable | Outgoing | Incoming | Total Connections |\n")
            f.write("|----------|----------|----------|------------------|\n")
            
            for node, connections in sorted_nodes[:10]:
                f.write(f"| {node} | {connections['outgoing']} | {connections['incoming']} | {connections['total']} |\n")
            
            # Write general statistics
            f.write("\n## Summary Statistics\n\n")
            f.write(f"- **Total Relationships:** {len(rows)}\n")
            f.write(f"- **Number of Variables with Connections:** {len(node_connections)}\n")
            f.write(f"- **Average Connections per Variable:** {sum(node['total'] for node in node_connections.values()) / len(node_connections):.1f}\n")
            
            print(f"Markdown file created: {output_file}")
            return True
    except Exception as e:
        print(f"Error creating markdown: {e}")
        return False

def main():
    """Main function."""
    # Check command line arguments
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    else:
        # Default input file
        input_file = "relationships_data.csv"
    
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    else:
        # Default output file
        output_file = "sessf_relationships.md"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        print("Usage: python extract_relationships_to_markdown.py [input_csv] [output_md]")
        return
    
    # Read data from CSV
    data = read_csv_file(input_file)
    
    if not data:
        print("No data found. Exiting.")
        return
    
    # Create markdown
    create_markdown(data, output_file)

if __name__ == "__main__":
    main() 