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
    affiliation: "1, 2"
affiliations:
  - name: Centre for Environmental Governance, Faculty of Business, Governance and Law, University of Canberra, Australia
    index: 1
  - name: Sim4Action Pty Ltd
    index: 2
date: 20 March 2026
bibliography: paper.bib
---

# Summary

SIM4Action (Social-Environmental Interactive Mapping Platform for Action) is an interactive web platform for visualising, exploring, and simulating complex socio-environmental systems through configurable causal network graphs. The platform operationalises a three-stage adaptive management workflow---Understand, Intervene, Monitor---through dedicated analytical laboratories, each backed by standalone computational libraries. The Diagnostics Lab exposes structural analysis tools including feedback loop detection and community detection. The Intervention Lab implements a novel token-based causal diffusion algorithm in both probabilistic (agent-based random walk) and deterministic (proportional flow splitting) modes, with forward and backward propagation for impact assessment and root-cause analysis respectively. The Monitoring Lab provides five centrality metrics to identify leverage points and sentinel indicators for monitoring programme design. The platform's domain-agnostic, configuration-driven architecture allows a single deployment to serve multiple system maps---from fisheries and water governance to lithium extraction---each defined by a Google Sheets data source and a JSON configuration file.

# Statement of Need

Understanding complex socio-environmental systems requires tools that bridge the gap between qualitative systems thinking and quantitative network analysis. Researchers, policymakers, and communities increasingly use causal loop diagrams and systems maps to reason about the interconnected dynamics of ecological, economic, social, and governance factors [@sterman2000; @meadows2008]. However, existing tools present significant limitations for applied participatory research.

SIM4Action originated in 2020 as a Python/Streamlit application [@sim4action_workbench] developed for the ITLA Foundation in Finland to map systemic drivers of long-term social assistance use. Between 2020 and 2023, the platform was iteratively extended through participatory modelling workshops with stakeholders, NGOs, and fishing communities across Humboldt Current fisheries in Chile and Peru (Walton Foundation), coastal basin mapping in central Chile (Proyecto Anillo, Pontificia Universidad Cat\'olica de Chile), and deployment in the Western Indian Ocean under the HIF-ID Blue programme (WIOMSA, Minderoo Foundation). In 2025, growing demands for richer interactive visualisation and browser-based analysis led to a major re-implementation using web technologies (HTML5, JavaScript, D3.js, Pyodide), producing the current platform. Most recently, SIM4Action has been extended through collaboration with CSIRO and the Blue Economy CRC for Australian Commonwealth fisheries managed by Austral, and applied to water resource governance in New South Wales and lithium brine extraction from the Salar de Atacama (Chile).

Each new application context reinforced the need for a domain-agnostic engine capable of integrating participatory data collection, interactive visualisation, causal simulation, and quantitative network analysis in a single platform accessible to non-technical stakeholders---and iteratively refined the conceptual framework that the platform embodies.

# State of the Field

Several tools support systems mapping and fuzzy cognitive map analysis, but none integrates the full workflow required by participatory socio-environmental research.

**Mental Modeler** [@gray2013mental] provides a web interface for constructing and running fuzzy cognitive maps [@kosko1986fuzzy]. It supports scenario-based simulation through matrix multiplication but does not offer network-level structural analysis (feedback loop enumeration, community detection, centrality metrics) or temporal delay modelling in causal propagation.

**Kumu** [@kumu2024] is a proprietary platform offering rich network visualisation and stakeholder engagement features. However, it provides no causal simulation engine, no programmatic API for analytical pipelines, and its closed-source nature limits extensibility and reproducibility in research contexts.

**FCMpy** [@mkhitaryan2022fcmpy] implements fuzzy cognitive map inference, learning algorithms, and sensitivity analysis as a Python library. While powerful for programmatic analysis, it provides no interactive visualisation or web interface, making it inaccessible to non-technical stakeholders in participatory settings.

**PRSM** [@prsm2024] (Participatory System Mapper) supports real-time collaborative systems mapping through a web interface. It focuses on the mapping process itself but does not include causal diffusion simulation, centrality-based analysis, or feedback loop detection.

SIM4Action was built rather than contributed to an existing project because the required combination of capabilities---interactive web-based visualisation, participatory data collection via Google Sheets, two-mode causal diffusion simulation with temporal delays, structural network analysis (feedback loops, community detection, five centrality metrics), and a domain-agnostic configuration-driven architecture---is not present in any single existing tool. The closest alternatives are either proprietary (Kumu), lack an interactive interface (FCMpy), lack simulation and network analytics (Mental Modeler, PRSM), or address only a subset of the analytical workflow. SIM4Action's core analytical libraries are implemented as standalone, importable modules with zero browser dependencies, ensuring they can be used independently of the web interface in scripted research pipelines.

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

SIM4Action's architecture reflects three design tensions encountered over six years of participatory research deployment: (1) analytical rigour versus accessibility for non-technical stakeholders, (2) reusability of computational libraries versus ease of interactive use, and (3) deployment simplicity versus analytical power. \autoref{fig:architecture} summarises the platform's layered architecture and three-stage workflow.

![SIM4Action platform architecture. The three-stage analytical workflow (top) is supported by standalone core libraries with zero browser dependencies (bottom left), a web presentation layer (bottom right), and a data layer backed by Google Sheets and JSON configuration files.\label{fig:architecture}](figures/sim4action-architecture.png)

**Separation of analytical libraries from the web layer.** The core computational modules---`browser_analysis.py` (centrality metrics, community detection via NetworkX [@hagberg2008networkx]), `feedback_loops.py` (cycle enumeration and polarity classification), `networkx_loader.py` (graph construction from tabular data), and `diffusion.js` (both diffusion algorithms with delay pipelines and polarity-aware flow)---have zero browser dependencies. Each is importable and executable standalone in any Python or Node.js environment, with `examples/` providing CLI usage scripts and a test suite (45 Python + 18 Node.js tests) validating all libraries outside the browser. This separation ensures that the analytical engine is scriptable, testable, and reusable in research pipelines independent of the web interface.

**In-browser Python via Pyodide rather than a server-side API.** Running NetworkX [@hagberg2008networkx] and the Python analysis modules directly in the browser via Pyodide [@pyodide2024] and WebAssembly eliminates the need for server-side compute infrastructure. This was a deliberate choice to minimise deployment barriers: a single static file server (or even a local `python -m http.server`) is sufficient, making the platform deployable in low-resource institutional contexts where provisioning backend services is impractical.

**Google Sheets as a data source rather than a database.** Participatory workshops produce causal maps collaboratively, often with non-technical participants. Google Sheets provides a familiar, accessible interface for data entry and review, avoids database administration, and allows stakeholders to retain ownership of their data. The trade-off---dependence on an internet connection and Google's API---is acceptable because the platform's primary use case involves facilitated workshops with connectivity.

**Configuration-driven, domain-agnostic engine.** Rather than building separate applications for each system (fisheries, water, lithium), a single codebase in `platform/` serves all system maps. Each system is defined by a JSON configuration file and a Google Sheets data source under `systems/{id}/`. This architecture emerged from the practical need to support over ten system maps across different countries and domains without duplicating code, and allows new systems to be added by non-developers through the web interface.

**No build step.** The frontend uses plain HTML5, CSS3, and ES6+ JavaScript loaded directly via `<script>` tags and CDN, with no bundler, transpiler, or package manager. This choice lowers the barrier for researcher-developers who may not be familiar with modern JavaScript toolchains, and simplifies deployment to a single directory served by any HTTP server.

**Domain-informed conceptual design.** The technical architecture above serves a conceptual framework whose shape was determined by participatory fieldwork, not by engineering convenience. The three-stage workflow (Understand, Intervene, Monitor) was not derived from a theoretical model and then implemented; it crystallised from repeated observation that workshop participants naturally follow this cognitive sequence---they need to *see* the system structure before they can reason about interventions, and they need to explore interventions before they can decide what to monitor. The choice of two complementary diffusion modes addresses two distinct stakeholder needs that emerged in practice: the probabilistic mode produces uncertainty bounds that resonate with communities accustomed to stochastic natural systems (e.g., fisheries catch variability), while the deterministic mode enables the precise, reproducible scenario comparisons that policymakers require for briefing documents. Forward and backward propagation address the two questions stakeholders consistently ask: "what happens if we act here?" (the practitioner's intervention question) and "what drives this outcome?" (the policymaker's diagnostic question). The five centrality metrics were selected not for mathematical completeness but because each maps to a distinct practical role in monitoring programme design---hub variables, bottleneck variables, rapid-response indicators, influence-connected factors, and cumulative-pathway factors---categories that emerged from co-design sessions with environmental regulators and fisheries managers.

**Web presentation layer.** D3.js [@bostock2011d3] renders force-directed network visualisation with interactive filtering; Graphology [@graphology2024] provides client-side graph operations; and the drawing layer enables SVG annotation of system maps during workshops.

# Research Impact

The scholarly contribution of SIM4Action is not the code; it is the conceptual framework for operationalising adaptive management through causal network analysis in participatory settings---a framework that was iteratively refined through real-world deployment across diverse socio-environmental domains over six years (2020--2026), four countries (Finland, Chile, Peru, Australia), and the Western Indian Ocean region.

**Community-driven development.** SIM4Action's features were not designed in isolation and then tested on users; they were co-designed with stakeholders who shaped the platform's capabilities through participatory modelling workshops. This form of community engagement---where fishing communities, NGOs, government regulators, and research organisations directly influence which features are built and how they work---represents a deeper mode of collaborative development than code commits alone. During stakeholder workshops in Chile and the Western Indian Ocean, participants expressed a need to explore and compare the downstream impacts of different intervention strategies on their system maps; this requirement gave rise to the token-based causal diffusion simulation, which became the core of the Intervention Lab. The SVG drawing and annotation layer was added to support real-time collaborative annotation during facilitated workshops. The genetic algorithm optimiser emerged from stakeholders wanting to systematically compare resource allocation strategies across multiple intervention points rather than testing them one at a time. The three-stage workflow (Understand, Intervene, Monitor) itself emerged from the practical cognitive sequence that workshop participants naturally follow, rather than from a purely theoretical design process. The repository README documents each case study with its scope, contributing organisations, and photographic evidence from workshops, providing a public record of this sustained collaborative development.

**Deployed system maps.** The platform currently hosts over ten causal system maps spanning diverse socio-environmental domains: Humboldt Current fisheries (octopus, southern hake) in Chile and Peru; Australian Commonwealth fisheries (Southern and Eastern Scalefish and Shark Fishery, Northern Prawn Fishery, Northwest Shelf Trap Fishery) under the Blue Economy CRC Seafood Futures programme; coastal basin ecosystems in central Chile; water resource compliance in New South Wales, Australia; lithium brine extraction from the Salar de Atacama, Chile; and long-term social assistance systems in Finland. The successful application of the same analytical framework across domains as different as artisanal fisheries and lithium mining demonstrates the generalisability of the conceptual model, not merely the flexibility of the code.

**Funded research projects.** Development has been supported by the ITLA Foundation (Finland, 2020); the Walton Foundation through Advanced Conservation Strategies (Chile and Peru, 2021--2024); the Minderoo Foundation and WIOMSA under the HIF-ID Blue programme (Western Indian Ocean, 2023--2025); CSIRO and the Blue Economy CRC Seafood Futures programme with Austral (Australia, 2024--2026); the Natural Resources Access Regulator and UNSW (New South Wales, Australia); and Proyecto Anillo through Pontificia Universidad Cat\'olica de Chile and SECOS (coastal basins, Chile).

**Development history.** The platform was originally implemented as a Python/Streamlit application [@sim4action_workbench] between 2020 and 2023. In 2025, it was re-implemented using web technologies (HTML5, JavaScript, D3.js, Pyodide) to provide richer interactive visualisation and eliminate server-side compute dependencies, producing the current repository.

**Reuse and sustainability.** The configuration-driven architecture means new socio-environmental system maps can be created and deployed without code changes, by any researcher with access to Google Sheets. The standalone analytical libraries can be imported into scripted research pipelines independent of the web interface. This extensibility, combined with the platform's open governance and contribution pathways, positions SIM4Action for reuse beyond the projects that funded its development.

# AI Usage Disclosure

Development was assisted by Cursor IDE with Anthropic Claude (claude-3.5-sonnet and claude-3.7-sonnet) for code generation, refactoring, test scaffolding, debugging, and documentation drafting. All outputs were reviewed, tested, and validated by the author. The human contributions---which cannot be generated by AI---comprise the problem framing rooted in six years of participatory research, the three-stage analytical workflow design and its domain-specific abstractions, the participatory data architecture, and the iterative validation of platform features against real-world workshop outcomes with diverse stakeholder groups across four countries. Some system maps are marked `source_type: gen_ai`, indicating AI-assisted drafting of causal structure, as distinct from maps developed through participatory workshops (`source_type: workshop`).

# Future Work: AI-Assisted Systems Mapping

Just as generative AI tools have compressed software development timelines, an analogous opportunity exists for the development of causal system maps themselves. Constructing comprehensive socio-environmental system maps through participatory workshops is a multi-year process requiring sustained stakeholder engagement across multiple sessions. The platform already distinguishes map provenance through its `source_type` metadata (`workshop` for maps developed through participatory processes, `gen_ai` for AI-drafted maps). We are actively exploring the use of teams of AI research agents to generate draft causal system maps from scientific literature and domain knowledge, which can then be validated, refined, and enriched through participatory workshops with local stakeholders. This hybrid approach---AI-generated structure complemented by community-validated context---has the potential to significantly accelerate the initial mapping phase while preserving the participatory engagement that gives these maps their legitimacy and local relevance. This line of work is beyond the scope of the current paper.

# Acknowledgements

The author thanks Josh Donlan, Stefan Gelcich, Rodrigo Est\'evez, and Ra\'ul Arteaga at Advanced Conservation Strategies for supporting the Humboldt Current fisheries mapping in Chile and Peru; Sebasti\'an Vicu\~na and Inti Lefort (Pontificia Universidad Cat\'olica de Chile) for collaboration on the coastal basins project; WIOMSA and the Minderoo Foundation for supporting the Western Indian Ocean deployment; CSIRO, the Blue Economy CRC, and Austral for the Australian fisheries collaboration; the Natural Resources Access Regulator and UNSW for the water compliance project; and the ITLA Foundation (Finland) for funding the original prototype.

# References
