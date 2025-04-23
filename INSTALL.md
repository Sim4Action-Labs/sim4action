# Installation and Setup Guide

This guide provides detailed instructions for setting up and using the Fishery Systems Map Extraction Tool, including Google Sheets API configuration.

## Prerequisites

- Python 3.6 or higher
- Pip (Python package installer)
- Access to the Google Sheet containing the fishery systems map data
- A Google account for creating API credentials

## Installation Steps

1. **Clone or download the repository**:
   ```bash
   git clone [repository-url]
   cd [repository-directory]
   ```

2. **Install required packages**:
   ```bash
   pip install pandas google-api-python-client google-auth
   ```

## Setting Up Google Sheets API Access

Follow these steps to enable data extraction directly from Google Sheets:

1. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Note your Project ID for future reference

2. **Enable the Google Sheets API**:
   - In your project, navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" and select "Service Account"
   - Fill in the required details for your service account
   - Skip the optional "Grant this service account access" step
   - Click "Done"

4. **Generate a Service Account Key**:
   - In the Credentials page, find your newly created service account
   - Click on the service account name
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format and click "Create"
   - The key file will be downloaded to your computer
   - Rename this file to `credentials.json` and place it in the same directory as the script

5. **Share the Google Sheet**:
   - Open the Google Sheet containing your fishery systems map data
   - Click the "Share" button in the top-right corner
   - Add the email address of your service account (found in the service account details page)
   - Grant "Viewer" access to the service account
   - Click "Done"

6. **Update Script Configuration**:
   - Open the `extract_systems_map.py` script in a text editor
   - Update the `SPREADSHEET_ID` variable with your Google Sheet ID (the long string in the URL of your spreadsheet)
   - Update any sheet names or ranges as needed (e.g., `FACTORS_RANGE` and `RELATIONSHIPS_RANGE`)

## Using the Script

### Extracting Data from Google Sheets

1. **Run the extraction script**:
   ```bash
   python extract_systems_map.py
   ```
   
   This will:
   - Connect to the Google Sheet using your credentials
   - Download the factors (nodes) and relationships (edges) data
   - Save the data to CSV files (`factors_data.csv` and `relationships_data.csv`)
   - Generate a markdown report (`fishery_systems_map.md`)

2. **Custom Spreadsheet ID**:
   To use a different spreadsheet, provide the ID as a command line argument:
   ```bash
   python extract_systems_map.py your_spreadsheet_id_here
   ```

### Using Local CSV Files (Offline Mode)

If you already have the CSV files or prefer not to use Google Sheets API:

1. **Place the CSV files in the script directory**:
   - `factors_data.csv`: Should contain factor information
   - `relationships_data.csv`: Should contain relationship information

2. **Run the script**:
   ```bash
   python extract_systems_map.py
   ```
   
   The script will automatically detect and use the local CSV files instead of connecting to Google Sheets.

## CSV File Format Requirements

### Factors CSV Format
The file should contain the following columns:
- `factor_id`: Unique identifier for each factor
- `name`: Name of the factor
- `domain_name`: Category/domain the factor belongs to
- `intervenable`: Whether the factor can be directly influenced (yes/no)
- `definition`: Description of the factor

### Relationships CSV Format
The file should contain the following columns:
- `from`: Source node name
- `to`: Target node name
- `from_factor_id`: ID of the source node
- `to_factor_id`: ID of the target node
- `polarity`: Relationship polarity ('same' or 'opposite')
- `strength`: Relationship strength
- `delay`: Delay information
- `definition`: Description of the relationship

## Output Files

The script generates the following files:

1. **`factors_data.csv`** and **`relationships_data.csv`**:
   - Raw data files stored in CSV format
   - Created when data is downloaded from Google Sheets
   - Used in subsequent runs to avoid unnecessary API calls

2. **`fishery_systems_map.md`**:
   - Main output file in markdown format
   - Contains structured information about the systems map
   - Optimized for AI processing and quality control
   - Includes metadata in JSON format for programmatic access

## Troubleshooting

### Authentication Issues
- Make sure the `credentials.json` file is in the same directory as the script
- Verify that the Google Sheet is shared with the service account email
- Check that the Google Sheets API is enabled in your Google Cloud project

### Data Range Issues
- If you get errors about invalid ranges, check that the sheet names and ranges in the script match your Google Sheet structure
- The default ranges (e.g., `FACTORS!A1:G1000`) may need adjustment based on your data size

### CSV File Issues
- Ensure your CSV files have the required column names
- Check for special characters or formatting issues in your CSV files

### Connection Problems
- Verify your internet connection
- Check your firewall settings if you're behind a corporate network

## Using the Output with AI Agents

The generated markdown file is specifically formatted for AI agent processing:

1. **Structure**: Clear section headings and consistent formatting make it easy for AI to parse
2. **Tables**: Well-defined tables with consistent columns for structured data access
3. **Descriptions**: Explicit descriptions of data elements for better understanding
4. **Metadata**: JSON block containing key statistics for programmatic access
5. **Consistency**: Uniform formatting of all data values

This format allows AI agents to easily:
- Identify and extract specific data points
- Perform quality control checks
- Analyze system components and connections
- Generate insights based on the systems map 