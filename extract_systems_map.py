#!/usr/bin/env python3
"""
SESSF Systems Map Extractor

This script extracts system map information from Google Sheets 
and formats it into a structured markdown file for further analysis.
"""

import pandas as pd
import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import json

def authenticate_google_sheets(credentials_file):
    """Authenticate with Google Sheets API."""
    try:
        # Load credentials
        credentials = Credentials.from_service_account_file(
            credentials_file,
            scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
        )
        # Build the service
        service = build('sheets', 'v4', credentials=credentials)
        return service
    except Exception as e:
        print(f"Authentication failed: {e}")
        return None

def get_sheet_data(service, spreadsheet_id, range_name):
    """Get data from Google Sheet."""
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=range_name
        ).execute()
        values = result.get('values', [])
        return values
    except Exception as e:
        print(f"Failed to retrieve data: {e}")
        return []

def factors_to_dataframe(data):
    """Convert factors data to pandas DataFrame."""
    if not data or len(data) <= 1:
        return pd.DataFrame()
    
    # Extract headers and data
    headers = data[0]
    rows = data[1:]
    
    # Create DataFrame
    df = pd.DataFrame(rows, columns=headers)
    return df

def relationships_to_dataframe(data):
    """Convert relationships data to pandas DataFrame."""
    if not data or len(data) <= 1:
        return pd.DataFrame()
    
    # Extract headers and data
    headers = data[0]
    rows = data[1:]
    
    # Create DataFrame
    df = pd.DataFrame(rows, columns=headers)
    return df

def extract_feedback_loops(relationships_df, factors_df):
    """
    Identify and extract potential feedback loops from relationships.
    A feedback loop occurs when relationships form a cycle.
    
    This is a simplified implementation - in reality, finding all feedback loops
    would require more sophisticated graph analysis.
    """
    if relationships_df.empty:
        return []
    
    # Create a dictionary where keys are 'from' nodes and values are lists of 'to' nodes
    graph = {}
    
    # Populate the graph
    for _, row in relationships_df.iterrows():
        from_node = row['from']
        to_node = row['to']
        
        if from_node not in graph:
            graph[from_node] = []
        graph[from_node].append(to_node)
    
    # Find simple feedback loops (A → B → A)
    simple_loops = []
    for node in graph:
        for target in graph.get(node, []):
            if target in graph and node in graph.get(target, []):
                # Found a simple loop: node → target → node
                loop_type = "Reinforcing" if determine_loop_type(relationships_df, node, target) else "Balancing"
                factors_involved = find_factors_by_names([node, target], factors_df)
                simple_loops.append({
                    'nodes': [node, target],
                    'type': loop_type,
                    'factors': factors_involved
                })
    
    # Find triplet loops (A → B → C → A)
    triplet_loops = []
    for node in graph:
        for first_target in graph.get(node, []):
            for second_target in graph.get(first_target, []):
                if second_target in graph and node in graph.get(second_target, []):
                    # Found a triplet loop: node → first_target → second_target → node
                    triplet_loops.append({
                        'nodes': [node, first_target, second_target],
                        'type': "Complex",  # Would need more analysis for accurate type
                        'factors': find_factors_by_names([node, first_target, second_target], factors_df)
                    })
    
    return simple_loops + triplet_loops

def determine_loop_type(relationships_df, node1, node2):
    """
    Determine if a simple feedback loop is reinforcing or balancing.
    A loop is reinforcing if it has an even number of negative relationships,
    and balancing if it has an odd number of negative relationships.
    """
    # Get relationship from node1 to node2
    rel1 = relationships_df[(relationships_df['from'] == node1) & (relationships_df['to'] == node2)]
    # Get relationship from node2 to node1
    rel2 = relationships_df[(relationships_df['from'] == node2) & (relationships_df['to'] == node1)]
    
    if rel1.empty or rel2.empty:
        return None
    
    # Count negative relationships (opposite polarity)
    negative_count = 0
    if rel1.iloc[0]['polarity'] == 'opposite':
        negative_count += 1
    if rel2.iloc[0]['polarity'] == 'opposite':
        negative_count += 1
    
    # Even number of negative relationships = reinforcing, odd = balancing
    return negative_count % 2 == 0  # True if reinforcing, False if balancing

def find_factors_by_names(names, factors_df):
    """Find factor details given their names."""
    if factors_df.empty:
        return []
    
    factors = []
    for name in names:
        factor = factors_df[factors_df['name'] == name]
        if not factor.empty:
            factors.append({
                'id': factor.iloc[0]['factor_id'],
                'name': factor.iloc[0]['name'],
                'domain': factor.iloc[0]['domain_name']
            })
    return factors

def create_markdown(factors_df, relationships_df, feedback_loops, output_file):
    """Create markdown file with the extracted information."""
    with open(output_file, 'w') as f:
        # Write header
        f.write("# SESSF Systems Map Analysis\n\n")
        
        # Write factors section
        f.write("## Variables (Factors)\n\n")
        f.write("| ID | Name | Domain | Definition | Intervenable |\n")
        f.write("|---|---|---|---|---|\n")
        
        for _, row in factors_df.iterrows():
            factor_id = row.get('factor_id', '')
            name = row.get('name', '')
            domain = row.get('domain_name', '')
            definition = row.get('definition', '')
            intervenable = row.get('intervenable', '')
            
            f.write(f"| {factor_id} | {name} | {domain} | {definition} | {intervenable} |\n")
        
        # Write relationships section
        f.write("\n## Relationships\n\n")
        f.write("| From | To | Polarity | Strength | Delay | Definition |\n")
        f.write("|---|---|---|---|---|---|\n")
        
        for _, row in relationships_df.iterrows():
            from_node = row.get('from', '')
            to_node = row.get('to', '')
            polarity = row.get('polarity', '')
            strength = row.get('strength', '')
            delay = row.get('delay', '')
            definition = row.get('definition', '')
            
            f.write(f"| {from_node} | {to_node} | {polarity} | {strength} | {delay} | {definition} |\n")
        
        # Write feedback loops section
        f.write("\n## Feedback Loops\n\n")
        
        if feedback_loops:
            for i, loop in enumerate(feedback_loops, 1):
                f.write(f"### Loop {i}: {'→'.join(loop['nodes'])}\n\n")
                f.write(f"- **Type:** {loop['type']}\n")
                f.write("- **Factors Involved:**\n")
                
                for factor in loop['factors']:
                    f.write(f"  - {factor['id']}: {factor['name']} ({factor['domain']})\n")
                
                f.write("\n")
        else:
            f.write("No feedback loops identified.\n\n")
        
        # Write summary statistics
        f.write("## Summary Statistics\n\n")
        f.write(f"- **Total Variables:** {len(factors_df)}\n")
        f.write(f"- **Total Relationships:** {len(relationships_df)}\n")
        f.write(f"- **Identified Feedback Loops:** {len(feedback_loops)}\n")
        
        # Count domains
        if not factors_df.empty and 'domain_name' in factors_df.columns:
            domains = factors_df['domain_name'].value_counts().to_dict()
            f.write("- **Variables by Domain:**\n")
            for domain, count in domains.items():
                f.write(f"  - {domain}: {count}\n")
        
        # Count relationship polarities
        if not relationships_df.empty and 'polarity' in relationships_df.columns:
            polarities = relationships_df['polarity'].value_counts().to_dict()
            f.write("- **Relationships by Polarity:**\n")
            for polarity, count in polarities.items():
                f.write(f"  - {polarity}: {count}\n")

def main():
    """Main function."""
    # Configuration
    # For production use, these would come from environment variables or config file
    SPREADSHEET_ID = '1mysczycBt9RnHbfdDNVcZdnI2p6OD1VIfwz9_r_DU0A'  # Example ID
    FACTORS_RANGE = 'FACTORS!A1:G200'  # Adjust range as needed
    RELATIONSHIPS_RANGE = 'RELATIONSHIPS!A1:M200'  # Adjust range as needed
    CREDENTIALS_FILE = 'credentials.json'  # Path to your Google API credentials
    OUTPUT_FILE = 'sessf_systems_map.md'
    
    # Check if CSV data files exist (for offline/testing use)
    factors_csv = 'factors_data.csv'
    relationships_csv = 'relationships_data.csv'
    
    if os.path.exists(factors_csv) and os.path.exists(relationships_csv):
        # Load from CSV files
        print(f"Loading data from CSV files...")
        factors_df = pd.read_csv(factors_csv)
        relationships_df = pd.read_csv(relationships_csv)
    else:
        # Try to load from Google Sheets
        print(f"Attempting to load data from Google Sheets...")
        
        if not os.path.exists(CREDENTIALS_FILE):
            print(f"Error: Credentials file '{CREDENTIALS_FILE}' not found.")
            print("Creating sample data files for testing...")
            
            # Create sample data for demonstration
            factors_data = [
                ["factor_id", "name", "domain_name", "intervenable", "definition"],
                ["V1", "Stock Biomass", "Stock", "no", "Total biomass of fish in the stock"],
                ["V2", "Recruitment Rate", "Stock", "no", "Rate of new fish entering the stock"],
                ["V14", "Market Price", "Economics-Markets", "no", "Fish price"],
                ["V15", "Fishing Effort", "Stock", "yes", "Fishing activity level"]
            ]
            
            relationships_data = [
                ["relationship", "from", "to", "from_factor_id", "to_factor_id", "polarity", "strength", "delay", "definition"],
                ["1", "Stock Biomass", "Recruitment Rate", "V1", "V2", "same", "strong", "years", "Higher stock biomass leads to more recruitment"],
                ["2", "Recruitment Rate", "Stock Biomass", "V2", "V1", "same", "medium", "years", "More recruitment increases stock biomass"],
                ["15", "Stock Biomass", "Market Price", "V1", "V14", "opposite", "medium", "months", "Higher supply reduces market price"],
                ["16", "Market Price", "Fishing Effort", "V14", "V15", "same", "medium", "months", "Market price influences fishing effort"]
            ]
            
            factors_df = factors_to_dataframe(factors_data)
            relationships_df = factors_to_dataframe(relationships_data)
            
            # Save to CSV for future use
            factors_df.to_csv(factors_csv, index=False)
            relationships_df.to_csv(relationships_csv, index=False)
            
            print(f"Sample data saved to {factors_csv} and {relationships_csv}")
        else:
            # Authenticate and fetch data from Google Sheets
            service = authenticate_google_sheets(CREDENTIALS_FILE)
            
            if service:
                # Get data from Google Sheets
                factors_data = get_sheet_data(service, SPREADSHEET_ID, FACTORS_RANGE)
                relationships_data = get_sheet_data(service, SPREADSHEET_ID, RELATIONSHIPS_RANGE)
                
                # Convert to DataFrame
                factors_df = factors_to_dataframe(factors_data)
                relationships_df = relationships_to_dataframe(relationships_data)
                
                # Save to CSV for future use
                factors_df.to_csv(factors_csv, index=False)
                relationships_df.to_csv(relationships_csv, index=False)
                
                print(f"Data retrieved from Google Sheets and saved to {factors_csv} and {relationships_csv}")
            else:
                print("Failed to authenticate with Google Sheets. Please check your credentials.")
                return
    
    # Extract feedback loops
    feedback_loops = extract_feedback_loops(relationships_df, factors_df)
    
    # Create markdown file
    create_markdown(factors_df, relationships_df, feedback_loops, OUTPUT_FILE)
    
    print(f"Markdown file created: {OUTPUT_FILE}")
    print(f"Summary: {len(factors_df)} factors, {len(relationships_df)} relationships, {len(feedback_loops)} feedback loops")

if __name__ == "__main__":
    main() 