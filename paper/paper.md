---
title: 'SIM4Action: An Interactive Platform for Social-Environmental Systems Mapping and Causal Analysis'
tags:
  - systems thinking
  - causal analysis
  - socio-environmental systems
  - network analysis
  - participatory modelling
  - Python
  - JavaScript
authors:
  - name: Javier Castilla-Rho
    orcid: 0000-0000-0000-0000
    affiliation: 1
affiliations:
  - name: Sim4Action Labs
    index: 1
date: 17 February 2026
bibliography: paper.bib
---

# Summary

SIM4Action (Social-Environmental Interactive Mapping Platform for Action) is an interactive web platform for visualising, exploring, and simulating complex socio-environmental systems through configurable causal network graphs. The platform integrates force-directed network visualisation with three analytical laboratories: a Diagnostics Lab for structural filtering, an Intervention Lab for causal diffusion simulation, and a Monitoring Lab for network centrality analysis. Its domain-agnostic, configuration-driven architecture allows a single deployment to serve multiple system maps---from fisheries and water governance to lithium extraction---each defined by a Google Sheets data source and a JSON configuration file. The analytical core comprises standalone Python and JavaScript libraries for network analysis, feedback loop detection, community detection, and token-based causal diffusion, exposed through an interactive web interface but usable independently in any Python or Node.js environment.

# Statement of Need

Understanding complex socio-environmental systems requires tools that bridge the gap between qualitative systems thinking and quantitative network analysis. Researchers, policymakers, and communities increasingly use causal loop diagrams (CLDs) and systems maps to reason about the interconnected dynamics of ecological, economic, social, and governance factors [@sterman2000; @meadows2008]. However, existing tools present significant limitations for applied participatory research.

SIM4Action was conceived in 2020 during a research project for the ITLA Foundation in Finland, which sought to map the systemic drivers of long-term social assistance use. The initial prototype revealed a critical gap: no existing tool combined participatory data collection, interactive network visualisation, and integrated quantitative analysis in a single, accessible platform.

The platform was subsequently developed and applied to map Humboldt Current fisheries in Chile and Peru over a three-to-four-year programme funded by the Walton Foundation. Systems maps were constructed through participatory workshops with stakeholders, NGOs, and fishing communities for the octopus fisheries (Chile and Peru), the jumbo flying squid fishery, and the southern hake fishery. The platform was then deployed for participatory workshops in the Western Indian Ocean under the HIF-ID Blue programme, coordinated by the Western Indian Ocean Marine Science Association (WIOMSA) and funded by the Mindaro Foundation.

Each new application context---from social welfare in Finland, to artisanal fisheries in Latin America, to marine governance in East Africa---reinforced the need for a domain-agnostic engine capable of serving diverse systems from a single codebase. Existing alternatives address only subsets of this requirement: Mental Modeler [@gray2013mental] focuses on fuzzy cognitive maps but lacks network-level analytics; Kumu provides rich visualisation but no causal simulation; FCMpy [@mkhitaryan2022fcmpy] offers programmatic fuzzy cognitive map analysis but no interactive visualisation; PRSM [@prsm2024] supports collaborative mapping but without integrated diffusion modelling or centrality analysis; and Loopy provides educational causal loop exploration but is not designed for research-grade analysis of real-world systems.

Most recently, SIM4Action was substantially extended through a collaboration with the CSIRO and the Blue Economy Cooperative Research Centre under the Seafood Futures programme, supporting analysis of Australian Commonwealth fisheries managed by Austral. Concurrently, the platform has been applied to map water resource governance systems---including non-urban water compliance in New South Wales, Australia, in collaboration with the Natural Resources Access Regulator---and the systemic vulnerabilities of lithium brine extraction from closed Andean basins, specifically the Salar de Atacama in Chile.

# Software Design

SIM4Action is designed around the principle of separating analytical computation from web presentation, directly addressing JOSS's criterion that web-based tools should expose core libraries through their web experience.

**Core analytical libraries (zero browser dependencies):**

- `browser_analysis.py`: A `NetworkAnalyzer` class providing degree, betweenness [@freeman1977centrality], closeness, and eigenvector centrality, plus Louvain [@blondel2008louvain] and Girvan-Newman [@girvan2002community] community detection. Built on NetworkX [@hagberg2008networkx].
- `feedback_loops.py`: Cycle enumeration with configurable maximum length, polarity classification (reinforcing vs. balancing), and deduplication. Accepts any NetworkX `DiGraph` as input.
- `networkx_loader.py`: A `build_graph_from_data()` function that constructs a NetworkX graph from tabular factor and relationship data---the pure-Python core separated from the Pyodide data-fetching layer.
- `diffusion.js`: A 900-line ES6 module implementing both probabilistic (random-walk token) and deterministic (proportional-split) causal diffusion algorithms on directed weighted graphs, with forward and backward propagation, edge delay pipelines, and polarity-aware flow. Uses no DOM or browser APIs.

Each library is importable and executable standalone: the `examples/` directory demonstrates CLI usage in Python and Node.js, and the test suite validates all libraries outside the browser.

**Web presentation layer:** The platform renders these libraries through D3.js [@bostock2011d3] force-directed network visualisation, interactive filtering, and Chart.js-based results panels. Pyodide [@pyodide2024] loads NetworkX and the Python analysis modules directly in the browser via WebAssembly, eliminating the need for a computational backend. Graphology [@graphology2024] provides client-side graph operations for the visualisation layer.

**Configuration-driven architecture:** The multi-system design---born from the practical necessity of serving fisheries in Peru, water governance in Australia, and lithium extraction in Chile from a single deployment---uses JSON configuration files and Google Sheets as the universal data interface. System-specific knowledge lives entirely in configuration; the platform code is domain-agnostic. The `--systems-dir` server flag enables deployments to load system maps from external directories, supporting private data separation.

# Research Impact

SIM4Action has been developed and applied across six years (2020--2026), four countries (Finland, Chile, Peru, Australia) and the Western Indian Ocean region, supported by four independent funding sources: the ITLA Foundation, the Walton Foundation, the Mindaro Foundation through WIOMSA, and the Blue Economy CRC with CSIRO. The platform currently hosts over ten system maps spanning fisheries (octopus, jumbo flying squid, southern hake, SESSF, northern prawn, northwest shelf trap), water resources (coastal basins, NSW non-urban water compliance), extractive industries (Salar de Atacama lithium), and social welfare. Participatory workshops with fishing communities, NGOs, government regulators, and research organisations across these domains have directly shaped the platform's design and capabilities.

# AI Usage Disclosure

AI coding assistants were used during development for code generation, debugging, and documentation. All AI-generated outputs were reviewed, tested, and validated by the author. Some system maps in the platform are marked with a `source_type` of `gen_ai`, indicating their causal structure was drafted with AI assistance and subsequently reviewed by domain experts, as distinct from maps developed through participatory workshops (`source_type: workshop`).

# References
