# SIM4Action - Social-Environmental Interactive Mapping Platform for Action

An interactive web platform for social-environmental systems mapping and causal analysis. SIM4Action enables researchers and practitioners to visualize, explore, and simulate complex socio-environmental system dynamics through interactive network graphs.

## Features

- **Interactive Network Visualization** - D3.js force-directed graph with drag, zoom, and pan
- **Three Analysis Labs**:
  - **Diagnostics Lab** - Explore system structure with filtering by domain, relationship type, strength, and temporal scale
  - **Intervention Lab** - Token diffusion simulation (single scenario and ensemble) for causal analysis
  - **Monitoring Lab** - Centrality analysis (degree, betweenness, closeness, eigenvector, Katz) to identify key leverage points
- **Feedback Loop Detection** - Discover and visualize reinforcing and balancing feedback loops
- **Cluster Detection** - Louvain and Girvan-Newman community detection algorithms
- **Drawing/Annotation Layer** - Annotate maps with drawings, text, and shapes
- **Multiple System Maps** - Single platform engine serving any number of system maps via configuration files
- **Add New Systems** - Built-in wizard to register new system maps from Google Sheets data

## Project Structure

```
Fishery-Systems-Mapping/
  platform/                    # Shared engine (single source of truth)
    index.html                 # Landing page / system catalogue
    app.html                   # Main application (generic, config-driven)
    server.py                  # Python HTTP server with API endpoints
    diffusion.js               # Token diffusion algorithm (JavaScript)
    diffusion.py               # Token diffusion algorithm (Python/Pyodide)
    browser_analysis.py        # Network analysis (Python/Pyodide)
    feedback_loops.py          # Feedback loop detection (Python/Pyodide)
    networkx_loader.py         # NetworkX graph loader (Python/Pyodide)
    drawing-layer.js           # Drawing/annotation layer
    drawing-integration.js     # Drawing controls integration
    drawing-controls.css       # Drawing controls styles
    assets/                    # Shared platform assets
      sim4action-logo.png     # Platform logo

  systems/                     # Per-system-map configurations
    catalogue.json             # Master list of all available system maps
    sessf/                     # Example: SESSF Fishery
      config.json              # System configuration
      system-image.png         # System-specific image
    coastal_basins/            # Example: Coastal Basins
      config.json
      system-image.png
    ...                        # Additional system maps
```

## Quick Start

### 1. Start the server

```bash
python3 platform/server.py
```

The server starts at `http://localhost:8000/` by default.

### 2. Open the platform

Navigate to `http://localhost:8000/` in your browser to see the system map catalogue.

### 3. Launch a system map

Click "Launch" on any system card to open the interactive visualization.

### Custom port

```bash
python3 platform/server.py --port 9000
```

## Adding a New System Map

### Option A: Using the web wizard

1. Open the landing page at `http://localhost:8000/`
2. Click the "Add New System Map" card
3. Fill in the system name and paste the Google Sheets URL
4. Click "Validate" to verify the spreadsheet structure
5. Click "Create System Map" to register it

### Option B: Manual configuration

1. Create a directory: `systems/my_system/`
2. Create `systems/my_system/config.json`:

```json
{
  "id": "my_system",
  "name": "My System",
  "title": "My System - Interactive Visualization",
  "description": "Description for the catalogue card.",
  "spreadsheets": {
    "main": "YOUR_GOOGLE_SPREADSHEET_ID",
    "draft": "OPTIONAL_DRAFT_SPREADSHEET_ID"
  },
  "apiKey": "YOUR_GOOGLE_API_KEY",
  "images": {
    "systemImage": { "src": "system-image.png", "alt": "My System" },
    "logo": null,
    "thumbnail": { "src": "system-image.png", "alt": "My System" }
  }
}
```

3. Add an image file (optional): `systems/my_system/system-image.png`
4. Add an entry to `systems/catalogue.json`

### Google Sheets Structure

Your Google Sheet must have two tabs:

**FACTORS tab** (columns A-E, row 1 = headers):

| Column | Name | Required |
|--------|------|----------|
| A | factor_id (e.g., V1, V2) | Yes |
| B | name | Yes |
| C | domain_name | Yes |
| D | intervenable | No |
| E | definition | No |

**RELATIONSHIPS tab** (columns A-I, row 1 = headers):

| Column | Name | Required |
|--------|------|----------|
| A | relationship_id | No |
| B | from (source name) | No |
| C | to (target name) | No |
| D | from_factor_id | Yes |
| E | to_factor_id | Yes |
| F | polarity (same/opposite) | No |
| G | strength (strong/medium/weak) | No |
| H | delay (days/months/years) | No |
| I | definition | No |

**Important:** The spreadsheet must be shared with "Anyone with the link" as Viewer.

## Technology Stack

- **Frontend**: HTML5, JavaScript (ES6), D3.js v7, Chart.js
- **Graph Libraries**: Graphology (client-side), NetworkX (via Pyodide)
- **Python in Browser**: Pyodide v0.24.1
- **Data Source**: Google Sheets API v4
- **Server**: Python 3 (`http.server`)

## Requirements

- Python 3.6+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Google Sheets API and CDN libraries)

## Architecture

The platform uses a config-driven architecture where a single generic engine (`platform/app.html`) serves any system map by loading its configuration from `systems/{id}/config.json` via URL parameter:

```
http://localhost:8000/platform/app.html?system=coastal_basins
```

Domain colors are auto-discovered from the data using an intelligent color mapping system with 20+ predefined domain-to-color mappings and automatic HSL generation for unknown domains.
