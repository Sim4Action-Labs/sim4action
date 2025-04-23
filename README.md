# SESSF System Map Analysis Tools

A collection of Python scripts for extracting and analyzing data from the SESSF fishery systems map.

## Installation and Setup

See the [Installation and Setup Guide](INSTALL.md) for detailed instructions on:
- Installing required packages
- Setting up Google Sheets API access
- Configuring the scripts
- Troubleshooting common issues

## Available Scripts

The repository contains the following scripts:

1. `extract_systems_map.py`: Main script that connects to Google Sheets, downloads data, and creates a basic systems map markdown report.

2. `extract_factors_to_markdown.py`: Extracts factor (node) data and generates a markdown report.

3. `extract_relationships_to_markdown.py`: Extracts relationship (edge) data and generates a markdown report.

4. `extract_feedback_loops.py`: Identifies feedback loops in the systems map and generates a markdown report.

## Requirements

- Python 3.6 or higher
- Required packages:
  - `pandas`
  - `networkx` (for feedback loop analysis)
  - `google-api-python-client` and `google-auth` (for Google Sheets access)

## Usage

### Main Extraction Script

```bash
python extract_systems_map.py
```

This script checks for existing CSV files. If not found, it attempts to download data from Google Sheets using the API credentials.

### Extracting Feedback Loops

```bash
python extract_feedback_loops.py [relationships_csv] [factors_csv] [output_md]
```

#### Arguments:
- `relationships_csv`: Path to the CSV file containing relationship data (default: relationships_data.csv)
- `factors_csv`: Path to the CSV file containing factor data (default: factors_data.csv)
- `output_md`: Path to the output markdown file (default: sessf_feedback_loops.md)

#### Input File Format:

The relationships CSV file should have the following columns:
- `from`: Source node name
- `to`: Target node name
- `from_factor_id`: ID of the source node
- `to_factor_id`: ID of the target node
- `polarity`: Relationship polarity ('same' or 'opposite')
- `strength`: Relationship strength
- `delay`: Delay information

The factors CSV file should have the following columns:
- `factor_id`: Unique identifier for the factor
- `name`: Name of the factor
- `domain_name`: Domain/category the factor belongs to

#### Output:

The script identifies and categorizes feedback loops in the system, producing a markdown report that includes:
- Simple feedback loops (2 nodes)
- Complex feedback loops (3+ nodes)
- Loop types (reinforcing or balancing)
- Summary statistics
- Implications for management

Feedback loops are classified as:
- **Reinforcing**: Loops with an even number of 'opposite' relationships (including zero)
- **Balancing**: Loops with an odd number of 'opposite' relationships

### Extracting Factors and Relationships

Similar usage patterns apply for the other scripts:

```bash
python extract_factors_to_markdown.py [input_csv] [output_md]
python extract_relationships_to_markdown.py [input_csv] [output_md]
```

## Examples

Extract systems map data from Google Sheets (requires credentials.json):
```bash
python extract_systems_map.py
```

Extract feedback loops using default file names:
```bash
python extract_feedback_loops.py
```

Extract feedback loops with custom file names:
```bash
python extract_feedback_loops.py my_relationships.csv my_factors.csv feedback_loops_report.md
```

## Contributing

Contributions to improve these scripts are welcome. Please ensure that any pull requests include appropriate documentation and maintain compatibility with the existing code structure. 