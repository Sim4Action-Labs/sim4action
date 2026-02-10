# SIM4Action

**Social-Environmental Interactive Mapping Platform for Action**

An interactive web platform for social-environmental systems mapping and causal analysis. SIM4Action lets you visualize, explore, and simulate complex socio-environmental system dynamics through configurable network graphs—with one shared engine serving multiple system maps (e.g. fisheries, water resources, ecosystems) from a single deployment.

---

## Features

### Landing page (catalogue)

- **System map catalogue** — Browse all registered system maps from one entry point.
- **Categories** — Organise maps by category (e.g. Fisheries, Water Resources). Filter by category and view grouped by category.
- **View modes** — **Cards** (default), **List**, or **Compact** for different levels of detail.
- **Add system map** — Wizard to register a new map: name, category, description, Google Sheets URL(s), optional image. Built-in validation of sheet structure and an **info popup** explaining required tabs and columns.
- **Edit system map** — Update name, description, or category from the catalogue (edit icon on each card/row).
- **Remove system map** — Delete a map from the catalogue (and remove its config directory) with confirmation.

### Interactive map (per system)

- **Interactive network** — D3.js force-directed graph with drag, zoom, and pan.
- **Three analysis labs**:
  - **Diagnostics Lab** — Filter by domain, relationship type, strength, and temporal scale. Domains are **auto-populated from the spreadsheet** (FACTORS → `domain_name`).
  - **Intervention Lab** — Token diffusion (single and ensemble) for causal analysis.
  - **Monitoring Lab** — Centrality (degree, betweenness, closeness, eigenvector, Katz) to find leverage points.
- **Feedback loops** — Detect and visualise reinforcing and balancing loops.
- **Clustering** — Louvain and Girvan–Newman community detection.
- **Drawing layer** — Annotate maps with shapes and text.

### Architecture

- **Single engine** — One codebase (`platform/`) serves all system maps; each map is defined by a config file and optional image(s).
- **Config-driven** — System-specific data (title, Google Sheet IDs, images) lives in `systems/{id}/config.json`; the app loads by URL: `app.html?system={id}`.

---

## Project structure

```
Fishery-Systems-Mapping/
├── platform/                     # Shared engine (single source of truth)
│   ├── index.html               # Landing page: catalogue, add/edit/delete
│   ├── app.html                 # Main app (generic, config-driven)
│   ├── server.py                 # HTTP server + API (see below)
│   ├── diffusion.js
│   ├── diffusion.py
│   ├── browser_analysis.py
│   ├── feedback_loops.py
│   ├── networkx_loader.py
│   ├── drawing-layer.js
│   ├── drawing-integration.js
│   ├── drawing-controls.css
│   └── assets/
│       └── sim4action-logo.png
│
├── systems/
│   ├── catalogue.json           # Master list + categories (see schema below)
│   └── {system_id}/             # One folder per system map
│       ├── config.json          # id, name, title, description, category, spreadsheets, apiKey, images
│       ├── system-image.png     # Optional (map view + catalogue thumbnail)
│       └── thumbnail.png        # Optional; if missing, system-image.png is used for cards
│
└── README.md
```

### Catalogue schema (`systems/catalogue.json`)

```json
{
  "categories": ["Fisheries", "Water Resources"],
  "systems": [
    {
      "id": "sessf",
      "name": "SESSF Fishery",
      "description": "...",
      "thumbnail": "sessf/system-image.png",
      "category": "Fisheries"
    }
  ]
}
```

---

## Quick start

### 1. Start the server

From the repository root:

```bash
python3 platform/server.py
```

Default URL: **http://localhost:8000/**

Custom port:

```bash
python3 platform/server.py --port 9000
```

### 2. Use the platform

1. Open **http://localhost:8000/** — landing page with the system map catalogue.
2. Filter by category or switch view (Cards / List / Compact).
3. Click **Launch** on a system to open the interactive map.
4. Use **Add New System Map** to register a map from a Google Sheet; use the **info** button for spreadsheet structure guidance.

### 3. Requirements

- **Python 3.8+**
- Modern browser (Chrome, Firefox, Safari, Edge)
- Internet (Google Sheets API, CDN assets)

---

## Adding and editing system maps

### Via the web UI

1. On the landing page, click **Add New System Map** (or the + card in List/Compact view).
2. Enter **name**, **category** (choose existing or “+ New”), **description**, and **Google Sheets URL (Main)**. Optional: draft sheet URL, one **system image** (used for both map view and catalogue card; a transparent PNG works best).
3. Click **Validate Google Sheet Structure** to check FACTORS and RELATIONSHIPS tabs.
4. Click **Create System Map**. The server creates `systems/{id}/` and updates the catalogue.

To **edit** a system (name, description, category): click the **edit** (pencil) icon on its card/row, change fields, and **Save Changes**.

To **remove** a system: click the **delete** (trash) icon and confirm. The system folder and catalogue entry are removed.

### Manually

1. Create `systems/my_system/` and add `config.json`:

```json
{
  "id": "my_system",
  "name": "My System",
  "title": "My System - SIM4Action",
  "description": "Short description for the catalogue.",
  "spreadsheets": { "main": "SPREADSHEET_ID", "draft": "SPREADSHEET_ID_OR_SAME" },
  "apiKey": "YOUR_GOOGLE_SHEETS_API_KEY",
  "images": {
    "systemImage": { "src": "system-image.png", "alt": "My System" },
    "thumbnail": { "src": "system-image.png", "alt": "My System" }
  }
}
```

2. Add `systems/my_system/system-image.png` (optional).
3. Append the system to `systems/catalogue.json` in both `categories` (if new) and `systems` with `id`, `name`, `description`, `thumbnail`, `category`.

---

## Google Sheets structure

Each system map is driven by a **single Google Sheet** with two tabs. Share the sheet with **“Anyone with the link” → Viewer**.

| Tab           | Purpose                          |
|---------------|-----------------------------------|
| **FACTORS**   | One row per factor (node)         |
| **RELATIONSHIPS** | One row per directed link   |

### FACTORS (columns A–E, row 1 = headers)

| Column | Header       | Required | Notes |
|--------|--------------|----------|--------|
| A      | factor_id    | Yes      | e.g. V1, V2 |
| B      | name         | Yes      | Display name |
| C      | domain_name  | Yes      | Used for colours and filters (e.g. Environmental, Management) |
| D      | intervenable | No       | Yes/No |
| E      | definition   | No       | Shown in tooltips |

### RELATIONSHIPS (columns A–I, row 1 = headers)

| Column | Header         | Required | Notes |
|--------|----------------|----------|--------|
| A      | relationship_id | No     | e.g. R1, R2 |
| B      | from           | No       | Source name (informational) |
| C      | to             | No       | Target name (informational) |
| D      | from_factor_id | Yes      | Must match FACTORS column A |
| E      | to_factor_id   | Yes      | Must match FACTORS column A |
| F      | polarity       | No       | same / opposite |
| G      | strength       | No       | strong / medium / weak |
| H      | delay          | No       | days / months / years |
| I      | definition     | No       | Optional description |

On the **Add New System Map** form, the **“How should my spreadsheet be configured?”** button opens a detailed guide (including recognised domain names and allowed values).

---

## Server API

The server (`platform/server.py`) serves static files and provides REST endpoints used by the landing page:

| Method | Path                  | Purpose |
|--------|-----------------------|---------|
| GET    | `/`                   | Landing page (`platform/index.html`) |
| GET    | `/api/catalogue`      | Return `systems/catalogue.json` |
| GET    | `/api/systems/:id/config` | Return `systems/:id/config.json` |
| POST   | `/api/systems`        | Create a new system (body: id, name, description, category, spreadsheets, apiKey, images, optional base64 images) |
| PUT    | `/api/systems/:id`    | Update system metadata (body: name, description, category) |
| PUT    | `/api/catalogue`      | Replace `systems/catalogue.json` (body: full catalogue JSON) |
| DELETE | `/api/systems/:id`    | Remove system directory and catalogue entry |

---

## Technology stack

- **Frontend:** HTML5, JavaScript (ES6), D3.js v7, Chart.js
- **Graph:** Graphology (client), NetworkX via Pyodide
- **In-browser Python:** Pyodide (NetworkX, feedback loops, centrality, diffusion)
- **Data:** Google Sheets API v4
- **Server:** Python 3 `http.server` (custom handler for routes and APIs)

---

## License and attribution

Part of the **Futures of Seafood** work under the [Blue Economy CRC](https://blueeconomycrc.com.au). For more on the program and research context, see the repository and linked project documentation.
