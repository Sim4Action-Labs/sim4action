#!/usr/bin/env python3
"""
Fishery Systems Map Extractor

A script to extract system map information from Google Sheets
and format it into structured markdown for AI agent processing and quality control.
"""

import pandas as pd
import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import json
import sys
import networkx as nx

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

def data_to_dataframe(data, data_type):
    """Convert data to pandas DataFrame."""
    if not data or len(data) <= 1:
        print(f"No {data_type} data found or data is incomplete.")
        return pd.DataFrame()
    
    # Extract headers and data
    headers = data[0]
    rows = data[1:]
    
    # Create DataFrame
    df = pd.DataFrame(rows, columns=headers)
    print(f"Processed {len(df)} {data_type} records.")
    return df

def create_markdown(factors_df, relationships_df, output_file):
    """Create markdown file with the extracted information in AI-friendly format."""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            # Write header with clear document structure for AI
            f.write("# Fishery Systems Map Analysis\n\n")
            f.write("This document contains structured information about the fishery systems map extracted from source data.\n")
            f.write("It is formatted for easy processing by AI agents for quality control and analysis.\n\n")
            
            # Write factors section with clear heading
            f.write("## Variables (Factors)\n\n")
            f.write("Variables represent key elements in the fishery system.\n\n")
            f.write("| ID | Name | Domain | Definition | Intervenable |\n")
            f.write("|---|---|---|---|---|\n")
            
            # Get required columns or use empty strings if missing
            required_factor_cols = ['factor_id', 'name', 'domain_name', 'definition', 'intervenable']
            for _, row in factors_df.iterrows():
                values = []
                for col in required_factor_cols:
                    values.append(str(row.get(col, '')) if col in row else '')
                f.write(f"| {' | '.join(values)} |\n")
            
            # Write relationships section with clear heading
            f.write("\n## Relationships\n\n")
            f.write("Relationships represent connections between variables in the fishery system.\n\n")
            f.write("| From | To | Polarity | Strength | Delay | Definition |\n")
            f.write("|---|---|---|---|---|---|\n")
            
            # Get required columns or use empty strings if missing
            required_rel_cols = ['from', 'to', 'polarity', 'strength', 'delay', 'definition']
            for _, row in relationships_df.iterrows():
                values = []
                for col in required_rel_cols:
                    values.append(str(row.get(col, '')) if col in row else '')
                f.write(f"| {' | '.join(values)} |\n")
            
            # Write domain statistics
            f.write("\n## Domain Statistics\n\n")
            if not factors_df.empty and 'domain_name' in factors_df.columns:
                domain_counts = factors_df['domain_name'].value_counts().to_dict()
                f.write("| Domain | Count |\n")
                f.write("|---|---|\n")
                for domain, count in sorted(domain_counts.items()):
                    f.write(f"| {domain} | {count} |\n")
            else:
                f.write("No domain information available.\n")
            
            # Write relationship statistics
            f.write("\n## Relationship Statistics\n\n")
            if not relationships_df.empty and 'polarity' in relationships_df.columns:
                polarity_counts = relationships_df['polarity'].value_counts().to_dict()
                f.write("| Polarity | Count |\n")
                f.write("|---|---|\n")
                for polarity, count in sorted(polarity_counts.items()):
                    f.write(f"| {polarity} | {count} |\n")
            else:
                f.write("No polarity information available.\n")
            
            # Write summary statistics
            f.write("\n## Summary Statistics\n\n")
            f.write(f"- Total Variables: {len(factors_df)}\n")
            f.write(f"- Total Relationships: {len(relationships_df)}\n")
            
            # Add metadata for AI processing
            f.write("\n## Metadata\n\n")
            f.write("```json\n")
            metadata = {
                "total_variables": len(factors_df),
                "total_relationships": len(relationships_df),
                "domains": domain_counts if not factors_df.empty and 'domain_name' in factors_df.columns else {},
                "polarities": polarity_counts if not relationships_df.empty and 'polarity' in relationships_df.columns else {},
                "generated_date": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            f.write(json.dumps(metadata, indent=2))
            f.write("\n```\n")
            
        print(f"Markdown file created: {output_file}")
        return True
    except Exception as e:
        print(f"Error creating markdown: {e}")
        return False

def build_system_map(factors_df, relationships_df):
    """
    Build a NetworkX graph representing the fishery system map.
    
    Args:
        factors_df (pd.DataFrame): DataFrame containing factor information
        relationships_df (pd.DataFrame): DataFrame containing relationship information
        
    Returns:
        nx.DiGraph: A directed graph representing the fishery system
    """
    # Create a directed graph
    G = nx.DiGraph()
    
    # Add nodes (factors) with their attributes
    for _, row in factors_df.iterrows():
        G.add_node(
            row['factor_id'],
            name=row['name'],
            domain=row['domain_name'],
            definition=row['definition'],
            intervenable=row['intervenable']
        )
    
    # Add edges (relationships) with their attributes
    for _, row in relationships_df.iterrows():
        G.add_edge(
            row['from_factor_id'],
            row['to_factor_id'],
            polarity=row['polarity'],
            strength=row['strength'],
            delay=row['delay'],
            definition=row['definition']
        )
    
    return G

def main():
    """Main function."""
    # Configuration
    # Check command line arguments
    if len(sys.argv) > 1:
        SPREADSHEET_ID = sys.argv[1]
    else:
        # Default spreadsheet ID - replace with your actual default ID
        SPREADSHEET_ID = '1w9kl6vpPDiVVfjDEIowZVO9zj9REHr5TwUeD515ZuuU'
    
    # Define other parameters with defaults
    FACTORS_RANGE = 'FACTORS!A1:E1000'  # Adjust range as needed
    RELATIONSHIPS_RANGE = 'RELATIONSHIPS!A1:I1000'  # Adjust range as needed
    CREDENTIALS_FILE = 'credentials.json'  # Path to your Google API credentials
    OUTPUT_FILE = 'fishery_systems_map.md'
    GRAPH_FILE = 'fishery_systems_map.graphml'  # File to save the NetworkX graph
    
    # Check if CSV data files exist (for offline/testing use)
    factors_csv = 'factors_data.csv'
    relationships_csv = 'relationships_data.csv'
    
    if os.path.exists(factors_csv) and os.path.exists(relationships_csv):
        # Load from CSV files
        print(f"Loading data from existing CSV files...")
        factors_df = pd.read_csv(factors_csv)
        relationships_df = pd.read_csv(relationships_csv)
    else:
        # Try to load from Google Sheets
        print(f"Attempting to load data from Google Sheets...")
        
        if not os.path.exists(CREDENTIALS_FILE):
            print(f"Error: Credentials file '{CREDENTIALS_FILE}' not found.")
            print("Please set up Google Sheets API credentials as per the installation guide.")
            print("Creating minimal sample data for demonstration...")
            
            # Create minimal sample data for demonstration
            factors_data = [
                ["factor_id", "name", "domain_name", "intervenable", "definition"],
                ["V1", "Stock Biomass", "Stock", "no", "Total biomass of fish in the stock"],
                ["V2", "Recruitment Rate", "Stock", "no", "Rate of new fish entering the stock"],
                ["V3", "Market Price", "Economics-Markets", "no", "Fish price"],
                ["V4", "Fishing Effort", "Stock", "yes", "Fishing activity level"]
            ]
            
            relationships_data = [
                ["relationship", "from", "to", "from_factor_id", "to_factor_id", "polarity", "strength", "delay", "definition"],
                ["1", "Stock Biomass", "Recruitment Rate", "V1", "V2", "same", "strong", "years", "Higher stock biomass leads to more recruitment"],
                ["2", "Recruitment Rate", "Stock Biomass", "V2", "V1", "same", "medium", "years", "More recruitment increases stock biomass"],
                ["3", "Stock Biomass", "Market Price", "V1", "V3", "opposite", "medium", "months", "Higher supply reduces market price"],
                ["4", "Market Price", "Fishing Effort", "V3", "V4", "same", "medium", "months", "Market price influences fishing effort"]
            ]
            
            factors_df = data_to_dataframe(factors_data, "factors")
            relationships_df = data_to_dataframe(relationships_data, "relationships")
            
            # Save to CSV for future use
            factors_df.to_csv(factors_csv, index=False)
            relationships_df.to_csv(relationships_csv, index=False)
            
            print(f"Sample data saved to {factors_csv} and {relationships_csv}")
        else:
            # Authenticate and fetch data from Google Sheets
            service = authenticate_google_sheets(CREDENTIALS_FILE)
            
            if service:
                print(f"Successfully authenticated with Google Sheets API.")
                print(f"Retrieving data from spreadsheet ID: {SPREADSHEET_ID}")
                
                # Get data from Google Sheets
                factors_data = get_sheet_data(service, SPREADSHEET_ID, FACTORS_RANGE)
                if factors_data:
                    print(f"Retrieved {len(factors_data)} rows from factors sheet.")
                else:
                    print("No factor data found or could not access the factors sheet.")
                
                relationships_data = get_sheet_data(service, SPREADSHEET_ID, RELATIONSHIPS_RANGE)
                if relationships_data:
                    print(f"Retrieved {len(relationships_data)} rows from relationships sheet.")
                else:
                    print("No relationship data found or could not access the relationships sheet.")
                
                # Convert to DataFrame
                factors_df = data_to_dataframe(factors_data, "factors")
                relationships_df = data_to_dataframe(relationships_data, "relationships")
                
                # Save to CSV for future use
                if not factors_df.empty:
                    factors_df.to_csv(factors_csv, index=False)
                    print(f"Factors data saved to {factors_csv}")
                
                if not relationships_df.empty:
                    relationships_df.to_csv(relationships_csv, index=False)
                    print(f"Relationships data saved to {relationships_csv}")
            else:
                print("Failed to authenticate with Google Sheets API. Please check your credentials.")
                print("Using empty dataframes.")
                factors_df = pd.DataFrame()
                relationships_df = pd.DataFrame()
    
    # Create markdown file
    if not factors_df.empty or not relationships_df.empty:
        success = create_markdown(factors_df, relationships_df, OUTPUT_FILE)
        if success:
            print(f"Process completed successfully. Output saved to {OUTPUT_FILE}")
            print(f"Summary: {len(factors_df)} factors, {len(relationships_df)} relationships")
        else:
            print("Failed to create markdown output.")
    else:
        print("No data to process. Please check your input sources.")
    
    # Build and save the NetworkX graph
    if not factors_df.empty and not relationships_df.empty:
        print("\nBuilding NetworkX graph...")
        G = build_system_map(factors_df, relationships_df)
        
        # Save the graph
        nx.write_graphml(G, GRAPH_FILE)
        print(f"Graph saved to {GRAPH_FILE}")
        
        # Print some basic graph statistics
        print("\nGraph Statistics:")
        print(f"Number of nodes: {G.number_of_nodes()}")
        print(f"Number of edges: {G.number_of_edges()}")
        print(f"Number of domains: {len(set(nx.get_node_attributes(G, 'domain').values()))}")
        
        # Calculate and print some basic network metrics
        print("\nNetwork Metrics:")
        print(f"Average degree: {sum(dict(G.degree()).values()) / G.number_of_nodes():.2f}")
        print(f"Network density: {nx.density(G):.4f}")
        
        # Check for feedback loops
        try:
            cycles = list(nx.simple_cycles(G))
            print(f"\nNumber of feedback loops: {len(cycles)}")
            if cycles:
                print("\nExample feedback loop:")
                for i, cycle in enumerate(cycles[0]):
                    node = G.nodes[cycle]
                    print(f"{i+1}. {node['name']} ({node['domain']})")
        except nx.NetworkXNoCycle:
            print("\nNo feedback loops found in the graph.")
    else:
        print("Cannot build graph: missing factor or relationship data.")

if __name__ == "__main__":
    main() 