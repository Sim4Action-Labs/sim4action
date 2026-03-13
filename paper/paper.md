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
  - name: Juan Castilla-Rho
    orcid: 0000-0002-8468-8636
    affiliation: 1
affiliations:
  - name: Sim4Action Labs
    index: 1
date: 17 February 2026
bibliography: paper.bib
---

# Summary

SIM4Action (Social-Environmental Interactive Mapping Platform for Action) is an interactive web platform for visualising, exploring, and simulating complex socio-environmental systems through configurable causal network graphs. The platform operationalises a three-stage adaptive management workflow---Understand, Intervene, Monitor---through dedicated analytical laboratories, each backed by standalone computational libraries. The Diagnostics Lab exposes structural analysis tools including feedback loop detection and community detection. The Intervention Lab implements a novel token-based causal diffusion algorithm in both probabilistic (agent-based random walk) and deterministic (proportional flow splitting) modes, with forward and backward propagation for impact assessment and root-cause analysis respectively. The Monitoring Lab provides five centrality metrics to identify leverage points and sentinel indicators for monitoring programme design. The platform's domain-agnostic, configuration-driven architecture allows a single deployment to serve multiple system maps---from fisheries and water governance to lithium extraction---each defined by a Google Sheets data source and a JSON configuration file.

# Statement of Need

Understanding complex socio-environmental systems requires tools that bridge the gap between qualitative systems thinking and quantitative network analysis. Researchers, policymakers, and communities increasingly use causal loop diagrams and systems maps to reason about the interconnected dynamics of ecological, economic, social, and governance factors [@sterman2000; @meadows2008]. However, existing tools present significant limitations for applied participatory research.

SIM4Action was conceived in 2020 during a research project for the ITLA Foundation in Finland, which sought to map the systemic drivers of long-term social assistance use. The platform was subsequently developed through participatory workshops with stakeholders, NGOs, and fishing communities for Humboldt Current fisheries in Chile and Peru (Walton Foundation), deployed in the Western Indian Ocean under the HIF-ID Blue programme (WIOMSA, Mindaro Foundation), and most recently extended through a collaboration with the CSIRO and the Blue Economy CRC for Australian Commonwealth fisheries managed by Austral. The platform has also been applied to water resource governance in New South Wales (Australia) and lithium brine extraction from the Salar de Atacama (Chile).

Each new application context reinforced the need for a domain-agnostic engine capable of integrating participatory data collection, interactive visualisation, causal simulation, and quantitative network analysis in a single platform. Existing alternatives address only subsets of this requirement: Mental Modeler [@gray2013mental] focuses on fuzzy cognitive maps [@kosko1986fuzzy] but lacks network-level analytics; Kumu provides rich visualisation but no causal simulation; FCMpy [@mkhitaryan2022fcmpy] offers programmatic fuzzy cognitive map analysis but no interactive interface; PRSM [@prsm2024] supports collaborative mapping but without integrated diffusion modelling or centrality analysis.

# Methods and Analytical Workflow

SIM4Action structures analysis around a three-stage workflow aligned with adaptive management: *understand* the system, *design interventions*, and *monitor outcomes*. Each stage is implemented as a dedicated laboratory within the platform, supported by standalone computational libraries.

## Stage 1: Diagnostics --- Understanding System Structure

A causal system map is represented as a directed weighted graph $G = (V, E)$ where nodes $V$ represent system factors (variables) and edges $E$ represent causal relationships. Each edge carries three properties: *polarity* (same-direction or opposite-direction influence), *strength* (strong, medium, or weak), and *temporal delay* (days, months, or years).

The Diagnostics Lab provides three structural analysis capabilities:

**Feedback loop detection.** The platform enumerates all cycles in $G$ up to a configurable maximum length using depth-first search, then classifies each loop's polarity by computing the product of edge polarities around the cycle. Loops with a positive product are *reinforcing* (amplifying change); loops with a negative product are *balancing* (resisting change). Duplicate cycles starting from different nodes are deduplicated via canonical rotation.

**Community detection.** Two algorithms identify clusters of tightly coupled factors: the Louvain method [@blondel2008louvain], which optimises modularity to find dense subgroups, and the Girvan-Newman algorithm [@girvan2002community], which iteratively removes high-betweenness edges to reveal natural community boundaries. Bridge edges between clusters identify the critical inter-subsystem pathways through which changes propagate.

**Interactive filtering.** Factors and relationships can be filtered by domain, polarity, strength, and temporal scale, enabling focused exploration of specific subsystems or causal pathways.

## Stage 2: Intervention --- Causal Diffusion Simulation

The Intervention Lab models how perturbations propagate through the causal network using a token-based diffusion framework. The platform implements two complementary algorithms:

**Probabilistic (agent-based) diffusion.** Discrete tokens are injected at intervention nodes, each carrying a charge ($+1$ or $-1$). At each simulation step, every token independently selects an outgoing edge via weighted random sampling proportional to normalised edge strength. When traversing an opposite-polarity edge, the token's charge flips. Tokens enter transit for a number of steps determined by the edge's delay parameter, modelling temporal lag. Tokens accumulate at dead-end nodes (no outgoing edges). Running $N$ simulations with different random seeds produces statistical distributions of outcomes, enabling Monte Carlo confidence intervals.

**Deterministic (flow-based) diffusion.** Continuous flow is injected at intervention nodes and splits proportionally across outgoing edges based on normalised strength weights. Each edge maintains a FIFO delay pipeline---flow enters one end and exits after the specified delay steps. The same polarity-flipping rules apply. This mode produces identical results for identical inputs, making it suitable for precise scenario comparison and optimisation.

Both algorithms support **forward propagation** (cause $\rightarrow$ effect: "if I change X, what happens downstream?") and **backward propagation** (effect $\rightarrow$ cause: "what upstream factors most influence Y?"). Backward diffusion reverses the traversal direction, following incoming rather than outgoing edges from a target variable to discover root causes and upstream leverage points. Results include time-series of node and edge flows, controllability metrics (fraction of the system reachable from an intervention point), and area-under-curve (AUC) summaries quantifying cumulative causal influence.

An integrated **genetic algorithm optimiser** uses the deterministic diffusion model as a fitness function to automatically discover optimal allocations of intervention resources across multiple nodes to maximise impact on a specified target variable.

## Stage 3: Monitoring --- Centrality-Based Indicator Selection

The Monitoring Lab applies five centrality metrics from graph theory [@freeman1977centrality] to rank system factors by structural importance, directly informing monitoring programme design:

- **Degree centrality**: identifies the most connected factors (hub variables).
- **Betweenness centrality**: identifies factors that bridge different subsystems (bottleneck variables).
- **Closeness centrality**: identifies factors that can influence (or be influenced by) the system most rapidly.
- **Eigenvector centrality**: identifies factors connected to the most influential parts of the network.
- **Katz centrality**: accounts for both direct and indirect influence paths with distance attenuation.

By combining multiple metrics, practitioners can distinguish *leverage points* (high across metrics---prime intervention targets), *sentinel indicators* (high closeness/eigenvector---early warning signals), *bridge variables* (high betweenness---cross-subsystem monitors), and *outcome variables* (terminal nodes receiving but not propagating influence).

# Software Design

SIM4Action separates analytical computation from web presentation, addressing JOSS's criterion that web-based tools should expose core libraries through their web experience.

**Core analytical libraries (zero browser dependencies):**

- `browser_analysis.py`: `NetworkAnalyzer` class providing all five centrality metrics plus Louvain and Girvan-Newman community detection, built on NetworkX [@hagberg2008networkx].
- `feedback_loops.py`: Cycle enumeration, polarity classification, and deduplication accepting any NetworkX `DiGraph`.
- `networkx_loader.py`: `build_graph_from_data()` for constructing graphs from tabular data---pure Python, separated from the Pyodide data-fetching layer.
- `diffusion.js`: 900-line ES6 module implementing both diffusion algorithms with forward/backward propagation, edge delay pipelines, and polarity-aware flow. No DOM or browser APIs.

Each library is importable and executable standalone: `examples/` demonstrates CLI usage in Python and Node.js, and the test suite (45 Python + 18 Node.js tests) validates all libraries outside the browser.

**Web presentation layer:** D3.js [@bostock2011d3] renders force-directed network visualisation; Pyodide [@pyodide2024] loads NetworkX and the Python analysis modules directly in the browser via WebAssembly; Graphology [@graphology2024] provides client-side graph operations. The `--systems-dir` server flag enables deployments to load system maps from external directories, supporting private data separation.

# Research Impact

SIM4Action has been developed across six years (2020--2026), four countries, and the Western Indian Ocean region, supported by four independent funding sources. The platform hosts over ten system maps spanning fisheries, water resources, extractive industries, and social welfare. Participatory workshops with fishing communities, NGOs, government regulators, and research organisations have directly shaped the platform's analytical capabilities and workflow design.

# AI Usage Disclosure

AI coding assistants were used during development for code generation, debugging, and documentation. All outputs were reviewed, tested, and validated by the author. Some system maps are marked `source_type: gen_ai`, indicating AI-assisted drafting of causal structure, as distinct from maps developed through participatory workshops (`source_type: workshop`).

# References
