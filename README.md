# SIM4Action

**Social-Environmental Interactive Mapping Platform for Action**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![CI](https://github.com/Sim4Action-Labs/sim4action/actions/workflows/ci.yml/badge.svg)](https://github.com/Sim4Action-Labs/sim4action/actions)

An interactive web platform for social-environmental systems mapping and causal analysis. SIM4Action lets you visualise, explore, and simulate complex socio-environmental system dynamics through configurable network graphs—with one shared engine serving multiple system maps from a single deployment.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Sim4Action-Labs/sim4action.git
cd sim4action

# Install Python dependencies
pip install -r requirements.txt

# Start the server (serves the included demo system)
python platform/server.py

# Open http://localhost:8000/
```

The demo system (based on the SESSF fishery) is included in the repository and works out of the box.

Custom port:

```bash
python platform/server.py --port 9000
```

### Requirements

- Python 3.8+
- Modern browser (Chrome, Firefox, Safari, Edge)
- Internet connection (Google Sheets API, CDN assets)

---

## Features

### Interactive Systems Mapping
- **Force-directed network graph** powered by D3.js with drag, zoom, and pan
- **Google Sheets data source** — define factors and relationships in a spreadsheet, see them rendered as an interactive network

### Three Analysis Labs
- **Diagnostics Lab** — Filter by domain, relationship type, strength, and temporal scale
- **Intervention Lab** — Token diffusion simulation (probabilistic and deterministic) for causal analysis, with forward and backward propagation
- **Monitoring Lab** — Centrality analysis (degree, betweenness, closeness, eigenvector, Katz) to identify leverage points

### Network Analysis
- **Feedback loops** — Detect and visualise reinforcing and balancing feedback loops
- **Community detection** — Louvain and Girvan–Newman algorithms
- **Drawing layer** — Annotate maps with shapes and text

### Multi-System Architecture
- **Single engine** — One codebase (`platform/`) serves all system maps
- **Config-driven** — Each system is defined by `systems/{id}/config.json`; loaded via `app.html?system={id}`
- **Catalogue browser** — Landing page with filterable catalogue of all registered systems

---

## Core Libraries

SIM4Action's analytical capabilities are implemented as standalone libraries with zero browser dependencies. They can be used outside the web interface in any Python or Node.js environment.

### Python (`platform/`)

| Library | Purpose |
|---------|---------|
| `browser_analysis.py` | Network centrality, community detection, graph metrics (NetworkX) |
| `feedback_loops.py` | Cycle enumeration, polarity classification, deduplication |
| `networkx_loader.py` | `build_graph_from_data()` — graph construction from tabular data |

### JavaScript (`platform/`)

| Library | Purpose |
|---------|---------|
| `diffusion.js` | Probabilistic and deterministic causal diffusion simulation |

### Standalone Usage

```bash
# Python: network analysis + feedback loops
python examples/analyze_network.py

# Node.js: diffusion simulation
node examples/run_diffusion.mjs
```

See `examples/` for complete working scripts.

---

## Using with Your Own Systems

### Via the Web UI

1. Open the landing page and click **Add New System Map**
2. Enter name, category, description, and Google Sheets URL
3. Click **Validate Google Sheet Structure**, then **Create System Map**

### Manually

Create `systems/my_system/config.json`:

```json
{
  "id": "my_system",
  "name": "My System",
  "title": "My System - SIM4Action",
  "description": "A brief description.",
  "spreadsheets": { "main": "GOOGLE_SHEET_ID" },
  "apiKey": "YOUR_GOOGLE_SHEETS_API_KEY",
  "images": {
    "systemImage": { "src": "system-image.png", "alt": "My System" }
  }
}
```

Add the system to `systems/catalogue.json` and restart the server.

### External Systems Directory

Keep your system maps in a separate directory (useful for private data):

```bash
python platform/server.py --systems-dir /path/to/my/systems --users-file /path/to/users.json
```

---

## Google Sheets Structure

Each system map is driven by a Google Sheet with two tabs. Share it with **"Anyone with the link" → Viewer**.

**FACTORS** (columns A–E): `factor_id`, `name`, `domain_name`, `intervenable`, `definition`

**RELATIONSHIPS** (columns A–I): `relationship_id`, `from`, `to`, `from_factor_id`, `to_factor_id`, `polarity`, `strength`, `delay`, `definition`

---

## Project Structure

```
sim4action/
├── platform/                # Shared engine
│   ├── index.html          # Landing page (catalogue browser)
│   ├── app.html            # Main app (config-driven per system)
│   ├── server.py           # Python HTTP server + REST API
│   ├── diffusion.js        # Token diffusion (JS, standalone)
│   ├── browser_analysis.py # Network analysis (Python, standalone)
│   ├── feedback_loops.py   # Feedback loops (Python, standalone)
│   └── networkx_loader.py  # Graph construction (Python, standalone)
├── systems/
│   ├── catalogue.json      # System registry
│   └── demo_fishery/       # Included demo system
├── examples/               # Standalone usage examples
├── tests/                  # Automated test suite
├── paper/                  # JOSS paper
├── LICENSE                 # AGPL-3.0
├── CITATION.cff
├── CONTRIBUTING.md
└── requirements.txt
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) — no build step |
| Visualisation | D3.js v7 |
| Charts | Chart.js |
| Graph (client) | Graphology |
| Graph (analysis) | NetworkX via Pyodide (in-browser Python) |
| Data source | Google Sheets API v4 |
| Server | Python 3 `http.server` |
| Diffusion | Custom `diffusion.js` (probabilistic + deterministic) |

---

## Testing

```bash
# Python tests
pytest tests/ -v

# Node.js diffusion tests
node tests/test_diffusion_node.mjs

# Lint
ruff check platform/*.py tests/*.py
```

---

## Citation

If you use SIM4Action in your research, please cite:

```bibtex
@software{castilla_rho_sim4action,
  author    = {Castilla-Rho, Javier},
  title     = {SIM4Action: Social-Environmental Interactive Mapping Platform for Action},
  year      = {2026},
  url       = {https://github.com/Sim4Action-Labs/sim4action}
}
```

See `CITATION.cff` for the full citation metadata.

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

SIM4Action is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0).

---

## Acknowledgements

Development of SIM4Action has been supported by the ITLA Foundation (Finland), the Walton Foundation, the Mindaro Foundation through WIOMSA, and the Blue Economy Cooperative Research Centre with CSIRO under the Seafood Futures programme.
