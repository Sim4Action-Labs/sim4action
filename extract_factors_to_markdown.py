#!/usr/bin/env python3
"""
SESSF Factors Extractor

A simple script to extract factor/variable information from a CSV file 
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
    """Create markdown from factors data."""
    if not data or len(data) <= 1:
        print("No data to process.")
        return False
    
    try:
        headers = data[0]
        rows = data[1:]
        
        # Find index for each required column
        try:
            id_idx = headers.index('factor_id')
            name_idx = headers.index('name')
            domain_idx = headers.index('domain_name')
            intervenable_idx = headers.index('intervenable')
            definition_idx = headers.index('definition')
        except ValueError as e:
            print(f"Required column missing: {e}")
            print(f"Available columns: {headers}")
            return False
        
        with open(output_file, 'w', encoding='utf-8') as f:
            # Write header
            f.write("# SESSF Variables (Factors)\n\n")
            f.write("This document contains all variables identified in the SESSF system.\n\n")
            
            # Write factors table
            f.write("## Variables Table\n\n")
            f.write("| Variable ID | Variable Name | Domain | Intervenable | Definition |\n")
            f.write("|-------------|---------------|--------|--------------|------------|\n")
            
            for row in rows:
                # Skip incomplete rows
                if len(row) <= max(id_idx, name_idx, domain_idx, intervenable_idx, definition_idx):
                    continue
                
                var_id = row[id_idx]
                name = row[name_idx]
                domain = row[domain_idx]
                intervenable = row[intervenable_idx]
                definition = row[definition_idx]
                
                # Escape pipe characters to not break the table
                definition = definition.replace('|', '\\|')
                
                f.write(f"| {var_id} | {name} | {domain} | {intervenable} | {definition} |\n")
            
            # Write domain summary
            f.write("\n## Domain Summary\n\n")
            domain_counts = {}
            for row in rows:
                if len(row) > domain_idx:
                    domain = row[domain_idx]
                    domain_counts[domain] = domain_counts.get(domain, 0) + 1
            
            f.write("| Domain | Variable Count |\n")
            f.write("|--------|---------------|\n")
            for domain, count in sorted(domain_counts.items()):
                f.write(f"| {domain} | {count} |\n")
            
            # Write intervenable summary
            f.write("\n## Intervenability Summary\n\n")
            intervenable_counts = {"yes": 0, "no": 0}
            for row in rows:
                if len(row) > intervenable_idx:
                    value = row[intervenable_idx].lower()
                    if value in intervenable_counts:
                        intervenable_counts[value] += 1
            
            f.write("| Intervenable | Variable Count |\n")
            f.write("|--------------|---------------|\n")
            for value, count in intervenable_counts.items():
                f.write(f"| {value} | {count} |\n")
            
            # Write general statistics
            f.write("\n## Summary Statistics\n\n")
            f.write(f"- **Total Variables:** {len(rows)}\n")
            f.write(f"- **Number of Domains:** {len(domain_counts)}\n")
            intervenable_percent = (intervenable_counts.get("yes", 0) / len(rows)) * 100
            f.write(f"- **Intervenable Variables:** {intervenable_counts.get('yes', 0)} ({intervenable_percent:.1f}%)\n")
            
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
        input_file = "factors_data.csv"
    
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    else:
        # Default output file
        output_file = "sessf_factors.md"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        print("Usage: python extract_factors_to_markdown.py [input_csv] [output_md]")
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