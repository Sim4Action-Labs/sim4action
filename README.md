# Fishery Systems Map Extraction Tools

A Python script for extracting fishery systems map data from Google Sheets and formatting it into AI-friendly markdown format for quality control and analysis.

## Overview

This tool provides a streamlined way to:

1. Download fishery systems map data from Google Sheets
2. Process the data into a structured format
3. Generate a markdown report optimized for AI agent processing
4. Save the raw data as CSV files for further analysis

The output is specifically formatted to be easily processed by AI agents for quality control and systems analysis purposes.

## Installation and Setup

See the [Installation and Setup Guide](INSTALL.md) for detailed instructions on:
- Installing required packages
- Setting up Google Sheets API access
- Configuring the script
- Troubleshooting common issues

## Script Functionality

The main script `extract_systems_map.py` performs the following functions:

1. **Data Acquisition**:
   - Connects to Google Sheets using API credentials 
   - Downloads factors (variables) and relationships data
   - Provides fallback to local CSV files if available
   - Creates sample data for testing if no data sources are available

2. **Data Processing**:
   - Converts data to structured format
   - Calculates basic statistics and summaries
   - Organizes data for AI readability

3. **Output Generation**:
   - Creates a markdown file with clear sections and tables
   - Saves raw data as CSV files for future use
   - Includes JSON metadata for easy AI parsing

## Requirements

- Python 3.6 or higher
- Required packages:
  - `pandas` (for data processing)
  - `google-api-python-client` and `google-auth` (for Google Sheets access)

## Usage

### Basic Usage

```bash
python extract_systems_map.py
```

This will:
- Use the default spreadsheet ID specified in the script
- Look for `credentials.json` in the current directory
- Save output to `fishery_systems_map.md`

### Custom Spreadsheet

```bash
python extract_systems_map.py your_spreadsheet_id_here
```

### Offline Mode

If you have previously downloaded the data as CSV files (`factors_data.csv` and `relationships_data.csv`), the script will automatically use these files instead of connecting to Google Sheets.

## Output Format

The generated markdown file includes:

1. **Variables (Factors)**: A table listing all system variables with their properties
2. **Relationships**: A table showing connections between variables
3. **Domain Statistics**: Distribution of variables across domains
4. **Relationship Statistics**: Counts of different relationship types
5. **Summary Statistics**: Overall counts and metrics
6. **Metadata**: JSON object with key statistics for easy parsing

## AI Processing

The output markdown is specifically structured for AI agent processing:

- Clear, consistent section headings
- Well-structured tables with defined columns
- Explicit descriptions of data elements
- JSON metadata for programmatic access
- Uniform formatting of data values

## Contributing

Contributions to improve this tool are welcome. Please ensure that any pull requests maintain compatibility with the existing code structure and the focus on AI-readability. 