# Installation and Setup Guide

This guide provides detailed instructions for setting up and using the SESSF Systems Map Analysis Tools, including Google Sheets API configuration.

## Prerequisites

- Python 3.6 or higher
- Pip (Python package installer)
- Access to the Google Sheet containing the SESSF systems map data
- A Google account for creating API credentials

## Installation Steps

1. **Clone or download the repository**:
   ```bash
   git clone [repository-url]
   cd [repository-directory]
   ```

2. **Install required packages**:
   ```bash
   pip install pandas networkx google-api-python-client google-auth
   ```

## Setting Up Google Sheets API Access

If you want to directly access data from Google Sheets, follow these steps:

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
   - Rename this file to `credentials.json` and place it in the same directory as the scripts

5. **Share the Google Sheet**:
   - Open the Google Sheet containing your SESSF systems map data
   - Click the "Share" button in the top-right corner
   - Add the email address of your service account (found in the service account details page)
   - Grant "Viewer" access to the service account
   - Click "Done"

6. **Update Script Configuration**:
   - Open the `extract_systems_map.py` script in a text editor
   - Update the `SPREADSHEET_ID` variable with your Google Sheet ID (the long string in the URL of your spreadsheet)
   - Update any sheet names or ranges as needed

## Using the Scripts

### Extracting Data from Google Sheets

1. **Run the main extraction script**:
   ```bash
   python extract_systems_map.py
   ```
   
   This will:
   - Connect to the Google Sheet using your credentials
   - Download the factors (nodes) and relationships (edges) data
   - Save the data to CSV files (`factors_data.csv` and `relationships_data.csv`)
   - Generate markdown reports (`sessf_factors.md` and `sessf_relationships.md`)

2. **Extract Feedback Loops**:
   ```bash
   python extract_feedback_loops.py relationships_data.csv factors_data.csv sessf_feedback_loops.md
   ```

### Using Local CSV Files

If you already have the CSV files or prefer not to use Google Sheets API, you can:

1. **Place the CSV files in the script directory**:
   - `factors_data.csv`: Should contain factor information
   - `relationships_data.csv`: Should contain relationship information

2. **Run the analysis scripts directly**:
   ```bash
   python extract_factors_to_markdown.py factors_data.csv sessf_factors.md
   python extract_relationships_to_markdown.py relationships_data.csv sessf_relationships.md
   python extract_feedback_loops.py relationships_data.csv factors_data.csv sessf_feedback_loops.md
   ```

## CSV File Format Requirements

### Factors CSV Format
The file should contain the following columns:
- `factor_id`: Unique identifier for each factor
- `name`: Name of the factor
- `domain_name`: Category/domain the factor belongs to
- Additional columns may be present but are not required

### Relationships CSV Format
The file should contain the following columns:
- `from`: Source node name
- `to`: Target node name
- `from_factor_id`: ID of the source node
- `to_factor_id`: ID of the target node
- `polarity`: Relationship polarity ('same' or 'opposite')
- `strength`: Relationship strength
- `delay`: Delay information (optional)

## Troubleshooting

### Authentication Issues
- Make sure the `credentials.json` file is in the same directory as the script
- Verify that the Google Sheet is shared with the service account email
- Check that the Google Sheets API is enabled in your Google Cloud project

### Data Range Issues
- If you get errors about invalid ranges, check that the sheet names and ranges in the script match your Google Sheet structure

### CSV File Issues
- Ensure your CSV files have the required column names
- Check for special characters or formatting issues in your CSV files

### Connection Problems
- Verify your internet connection
- Check your firewall settings if you're behind a corporate network

## Offline Mode

All scripts can work with local CSV files without requiring an internet connection. This is useful for:
- Working offline
- Sharing analysis results without granting Google Sheet access
- Creating multiple reports from the same dataset

Simply provide the paths to your CSV files as arguments to the scripts. 