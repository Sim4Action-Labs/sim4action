# Agentic Deep Research Workflow for Causal System Mapping of Socio-Environmental Systems

## Comprehensive Project Specification

**Version:** 1.0  
**Date:** February 2026  
**Project:** Sim4Action Causal System Map Generator  
**Platform:** n8n Workflow Automation  

---

## Part 1: The Problem from First Principles

### 1.1 Why Causal System Maps Matter

Socio-environmental systems (SES) — fisheries, forests, watersheds, agricultural landscapes, coastal ecosystems — are defined by the entanglement of human decisions with ecological processes. A prawn fishery in Northern Australia is not merely a stock of prawns and a fleet of boats. It is a web of ocean temperatures, monsoon patterns, Indigenous land-sea management, fuel prices, export regulations, trawler technology, bycatch mortality, community livelihoods, and consumer preferences in Tokyo and Sydney, all connected by causal relationships that loop back on themselves across timescales ranging from days to decades.

Understanding these systems requires more than listing their parts. It requires mapping the *causal architecture* — which variables influence which others, in what direction, with what strength, and with what delay. A causal loop diagram (CLD) or causal system map captures this architecture as a directed graph: nodes represent system variables, and edges represent causal relationships with polarity (same-direction or opposite-direction influence), strength, and temporal delay.

Once constructed, such a map can be analysed computationally. The Sim4Action workbench applies graph-theoretic methods (systems mapping metrics, social network analysis centrality measures, and a custom token diffusion algorithm) to reveal the structural properties of the system: which variables are most influential, which are most vulnerable, where feedback loops concentrate, and how perturbations propagate through the network. These analyses inform strategic intervention — identifying high-leverage points where action is most likely to shift system behaviour toward desired outcomes.

### 1.2 The Bottleneck: Map Construction

The analytical power of Sim4Action is gated by the quality and completeness of the causal system map fed into it. Today, constructing these maps is a manual, expert-intensive process. A domain specialist must:

1. **Survey the literature** — government reports, stock assessments, peer-reviewed science, industry analyses, Indigenous knowledge documentation — to understand the system holistically.
2. **Identify variables** — distilling dozens of sources into a coherent set of 20–100 system variables that are directionally neutral, measurable, and span environmental, economic, social, technical, governance, and cultural dimensions.
3. **Extract causal relationships** — for each pair of variables, determining whether a causal link exists, its polarity (same or opposite), its strength (weak, medium, strong), and its characteristic time delay (days, months, years, decades).
4. **Identify feedback loops** — tracing circular causal chains that create reinforcing (amplifying) or balancing (stabilising) dynamics.
5. **Quality-control the result** — checking for orphaned variables, contradictory relationships, missing domains, directional bias in variable names, and logical coherence of loops.
6. **Format the output** — structuring everything into the precise spreadsheet format that Sim4Action requires (a FACTORS sheet and a RELATIONSHIPS sheet with specific column schemas).

This process takes an experienced analyst weeks to months per system. The cognitive load is immense: holding hundreds of potential relationships in mind, synthesising across disciplinary boundaries, and maintaining internal consistency across a growing graph. The result is that causal system mapping remains a boutique activity — performed for a handful of high-priority systems rather than being a routine tool available for any SES that needs understanding.

### 1.3 The Opportunity: Agentic AI Research Teams

Large language models (LLMs) have demonstrated remarkable capability in literature synthesis, causal reasoning, and structured information extraction. However, a single-prompt approach fails for this task because:

- **Scope exceeds context windows.** A thorough system map requires synthesising information from dozens of sources spanning thousands of pages. No single LLM call can process this volume.
- **The task is inherently multi-stage.** Variable identification must precede relationship extraction, which must precede feedback loop analysis. Each stage depends on the outputs of the previous one and may require revision based on findings from later stages.
- **Quality requires iteration.** First-pass variable lists contain redundancies; first-pass relationships contain errors; feedback loops reveal missing variables. The process must cycle through refinement.
- **Different subtasks have different optimal tools.** Deep web research benefits from search-augmented models (Perplexity); complex causal reasoning benefits from frontier reasoning models (Claude); simple formatting tasks waste expensive model capacity.

An *agentic workflow* — a coordinated team of AI agents, each specialised for a subtask, orchestrated by a supervisory agent, and connected through structured data handoffs — addresses all four limitations. The n8n workflow automation platform provides the orchestration infrastructure: conditional branching, loops, API integrations, data transformation, and error handling.

### 1.4 Design Principles

The following principles govern the workflow design:

1. **Research-first, synthesis-second.** Every claim in the final map must trace back to evidence gathered during the research phase. The workflow never fabricates relationships from general knowledge alone.

2. **Iterative refinement over single-pass generation.** Each major artifact (variable list, relationship matrix, feedback loops) passes through at least two cycles: generation and quality review. Review findings feed back into revision.

3. **Fit-for-purpose model selection.** Expensive frontier models are reserved for tasks that require them (causal reasoning, creative synthesis, complex quality judgments). Cheaper models handle formatting, counting, and simple classification.

4. **Structured intermediate artifacts.** Every handoff between agents uses a defined JSON or markdown schema. This eliminates ambiguity, enables validation, and creates an audit trail.

5. **Directional neutrality in variables, explicit polarity in relationships.** Variables are named as quantities that can increase or decrease (e.g., "Ocean Temperature" not "Ocean Warming"). Directionality is expressed only in the relationship polarity field.

6. **Domain completeness.** The workflow explicitly checks that the final map covers all relevant domains: environmental/ecological, economic/market, social/governance, technical, management/policy, and Indigenous/cultural.

7. **Traceable provenance.** Every variable and relationship in the final output includes a source reference linking it to specific evidence gathered during research.

---

## Part 2: The Deliverable

### 2.1 Final Output Schema

The workflow produces an Excel workbook (.xlsx) with two sheets, conforming to the Sim4Action input specification.

#### FACTORS Sheet

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | `factor_id` | String | Unique identifier (V1, V2, ..., Vn) |
| B | `name` | String | Directionally neutral variable name (2–5 words) |
| C | `domain_name` | String | One of: `FOCAL FACTORS`, `Environmental-Ecosystem`, `Stock`, `Technical`, `Economics-Markets`, `Management`, `Social`, `Indigenous` |
| D | `intervenable` | String | `yes` if the variable can be directly controlled by policy/management action; `no` otherwise |
| E | `definition` | String | 1–3 sentence description of what the variable represents, how it is measured, and its significance to the system |

#### RELATIONSHIPS Sheet

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | `relationship_id` | Integer | Sequential identifier (1, 2, 3, ...) |
| B | `from` | String | Name of the source variable (looked up from FACTORS) |
| C | `to` | String | Name of the target variable (looked up from FACTORS) |
| D | `from_factor_id` | String | Factor ID of the source variable |
| E | `to_factor_id` | String | Factor ID of the target variable |
| F | `polarity` | String | `same` (positive feedback — increase in source causes increase in target) or `opposite` (negative feedback — increase in source causes decrease in target) |
| G | `strength` | String | `strong`, `medium`, or `weak` |
| H | `delay` | String | `days`, `months`, `years`, or `decade` |
| I | `definition` | String | 1–2 sentence causal mechanism description explaining *why* the source variable influences the target variable |

### 2.2 Scale Targets

Based on the SESSF reference model:

| Metric | Reference (SESSF) | Target Range |
|--------|-------------------|--------------|
| Total variables | 95 | 40–120 |
| Domains represented | 8 | 6–10 |
| Total relationships | 129 | 60–200 |
| Polarity: same | 76% | 55–85% |
| Polarity: opposite | 22% | 15–45% |
| Strength: strong | 19% | 10–30% |
| Strength: medium | 79% | 50–80% |
| Strength: weak | 2% | 5–20% |
| Delay: days | 9% | 5–20% |
| Delay: months | 46% | 30–50% |
| Delay: years | 41% | 25–50% |
| Delay: decade | 4% | 0–15% |
| Intervenable variables | 3% | 3–15% |
| Variables with ≥1 relationship | 100% | 100% (hard constraint) |

### 2.3 Intermediate Artifacts

The workflow produces intermediate artifacts at each stage. These serve as audit trail, enable human review at checkpoints, and provide inputs to downstream agents.

| Artifact | Format | Produced By | Consumed By |
|----------|--------|-------------|-------------|
| System Overview Report | Markdown | Research Phase | All subsequent agents |
| Domain Research Briefs (×6–8) | Markdown | Domain Research Agents | Variable Identification Agent |
| Draft Variable List | JSON | Variable Identification Agent | Variable Review Agent |
| Refined Variable List | JSON | Variable Review Agent | Relationship Extraction Agent |
| Draft Relationship List | JSON | Relationship Extraction Agent | Relationship Review Agent |
| Refined Relationship List | JSON | Relationship Review Agent | Feedback Loop Agent |
| Feedback Loop Catalog | JSON | Feedback Loop Agent | Gap Analysis Agent |
| Gap Analysis Report | Markdown | Gap Analysis Agent | Integration Agent |
| Completeness Report | JSON | Quality Control Agent | Integration Agent |
| Final System Map | Excel (.xlsx) | Output Generation Agent | Sim4Action / User |

### 2.4 Intermediate Output Reports (Audit Trail)

To support quality control, debugging, and audit requirements, the workflow generates **structured markdown reports** at the completion of each major phase. These reports are stored in the state object and included in the final response, enabling full traceability of the map construction process.

| Output Report | Phase | Trigger Point | Contents |
|---------------|-------|---------------|----------|
| **Research Plan Report** | 0 | After Research Leader | System scope, domains, queries, focal variables |
| **Domain Briefs Report** | 1 | After all domain research completes | Consolidated research findings by domain with citations |
| **System Overview Report** | 1 | After synthesis | Narrative overview, consolidated variables & relationships |
| **Variable List Report** | 2 | After variable review passes | Final variable table with domains, definitions, sources |
| **Relationship List Report** | 3 | After relationship review passes | Complete relationship matrix with mechanisms |
| **Feedback & Gap Report** | 4 | After gap analysis | Feedback loops catalog, gap analysis, structural metrics |
| **Final Quality Report** | 5 | After QC and output generation | QC results, statistics, warnings, summary |

**Report Format:**

Each intermediate report follows a consistent markdown structure:

```markdown
# [Report Title]

**System:** [System Name]
**Phase:** [Phase Number and Name]
**Generated:** [ISO Timestamp]
**Iteration:** [Current iteration count, if applicable]

---

## Summary
[Brief summary of phase outcomes]

## Details
[Structured content specific to each report type]

## Statistics
[Counts, distributions, metrics]

## Issues & Warnings
[Any problems encountered or quality concerns]

## Next Steps
[What the next phase will do with this output]
```

**Access Methods:**

1. **During execution:** Reports are stored in `state.intermediate_outputs.[report_name]`
2. **In final response:** All reports included in `response.audit_trail` array
3. **Via n8n UI:** Each "Output: [Phase]" node displays the formatted markdown

---

## Part 3: Workflow Architecture

### 3.1 High-Level Pipeline

The workflow follows a five-phase pipeline with iterative loops within each phase:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 0: INITIALISATION                       │
│  User defines SES → Research Leader plans research strategy      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PHASE 1: DEEP RESEARCH                          │
│  Perplexity agents conduct parallel domain research              │
│  Research Leader synthesises into System Overview                 │
│  Loop: identify gaps → targeted follow-up research               │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               PHASE 2: VARIABLE IDENTIFICATION                   │
│  Claude extracts candidate variables from research corpus        │
│  Review agent checks neutrality, completeness, redundancy        │
│  Loop: revise → re-check until criteria met                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              PHASE 3: RELATIONSHIP EXTRACTION                    │
│  Claude extracts pairwise causal relationships                   │
│  Review agent checks polarity, strength, evidence, consistency   │
│  Loop: revise → re-check until criteria met                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│            PHASE 4: FEEDBACK LOOPS & GAP ANALYSIS                │
│  Claude identifies feedback loops from relationship graph        │
│  Gap agent checks for orphans, missing domains, weak areas       │
│  Loop: targeted research to fill gaps → update variables/rels    │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           PHASE 5: INTEGRATION & OUTPUT GENERATION               │
│  Final quality control pass                                      │
│  Generate Excel workbook in Sim4Action format                    │
│  Produce summary report                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Agent Roster

| Agent | Role | Primary Model | Rationale |
|-------|------|---------------|-----------|
| **Research Leader** | Plans research strategy, synthesises findings, identifies gaps, directs follow-up research | Claude Sonnet 4.5 | Strategic planning and synthesis require strong reasoning but not maximum capability |
| **Domain Researcher** (×6–8 parallel) | Conducts deep research on a specific domain using Perplexity API | Perplexity (sonar-deep-research) | Purpose-built for web research with citation tracking |
| **System Overview Writer** | Synthesises domain briefs into a cohesive system narrative | Claude Sonnet 4.5 | Requires narrative synthesis across domains |
| **Variable Extractor** | Identifies candidate variables from research corpus | Claude Opus 4.5 | Core analytical task requiring nuanced causal reasoning |
| **Variable Reviewer** | Checks variable quality: neutrality, completeness, redundancy, measurability | Claude Sonnet 4.5 | Systematic checking against defined criteria |
| **Relationship Extractor** | Identifies pairwise causal relationships with polarity, strength, delay | Claude Opus 4.5 | Most demanding reasoning task in the workflow |
| **Relationship Reviewer** | Checks relationship quality: evidence, consistency, completeness | Claude Sonnet 4.5 | Systematic validation |
| **Feedback Loop Analyst** | Traces feedback loops through the relationship graph | Claude Sonnet 4.5 | Pattern recognition in directed graphs |
| **Gap Analyst** | Identifies missing variables, relationships, underrepresented domains | Claude Sonnet 4.5 | Cross-referencing against completeness criteria |
| **Quality Controller** | Final validation of the entire system map | Claude Opus 4.5 | Holistic assessment requiring maximum reasoning capability |
| **Output Formatter** | Generates the Excel workbook in Sim4Action format | Claude Haiku 4.5 | Mechanical formatting task; fast and cheap |
| **Summary Reporter** | Produces a human-readable summary of the system map | Claude Sonnet 4.5 | Narrative writing |

### 3.3 Model Selection Rationale

| Model | Cost Tier | Use Cases | Why |
|-------|-----------|-----------|-----|
| **Perplexity sonar-deep-research** | Medium | Web research with citations | Returns grounded, cited information; superior to LLM hallucination for factual claims |
| **Claude Opus 4.5** | High | Variable extraction, relationship extraction, final QC | These are the highest-stakes analytical tasks; errors propagate through the entire map |
| **Claude Sonnet 4.5** | Medium | Planning, synthesis, review, feedback loops, gap analysis | Strong reasoning at lower cost; appropriate for tasks with structured criteria |
| **Claude Haiku 4.5** | Low | Formatting, simple classification, data transformation | Mechanical tasks that don't benefit from frontier reasoning |

---

## Part 4: Detailed Phase Specifications

### 4.0 Phase 0 — Initialisation

**Triggers:** The workflow supports multiple entry points:

1. **Webhook Trigger** — POST request to `/causal-map` endpoint with JSON body
2. **Form Trigger** — Interactive web form for manual submission
3. **Manual Trigger** — For testing within the n8n editor

**Form Trigger Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `system_description` | Textarea | Yes | Natural-language description of the SES to be mapped (500-2000 characters recommended) |
| `target_variable_count` | Dropdown | No | Target range: "40-60", "60-100" (default), "80-120" |
| `target_relationship_count` | Dropdown | No | Target range: "60-100", "80-160" (default), "120-200" |
| `user_constraints` | Textarea | No | Specific focus areas, constraints, or priorities |
| `save_to_google_drive` | Checkbox | No | Enable to save intermediate reports to Google Drive (default: off) |

**Webhook/JSON Input:** User provides a natural-language description of the socio-environmental system to be mapped.

**Input Examples:**
- "The Northern Prawn Fishery in Australia"
- "Coffee production systems in the Ethiopian highlands"
- "The Baltic Sea cod fishery and its interactions with eutrophication"
- "Coral reef tourism and fisheries in the Maldives"

**Research Leader Agent Actions:**

1. **Parse the system definition** — Extract the focal system, geographic scope, key sectors, and any user-specified constraints (e.g., "focus on climate adaptation" or "include Indigenous knowledge").

2. **Define domain research plan** — Determine which domain categories to research. Default domains:
   - Environmental / Ecological
   - Stock / Biological Resource (if applicable)
   - Technical / Operational
   - Economic / Market
   - Management / Governance / Policy
   - Social / Community / Cultural
   - Indigenous / Traditional Knowledge (if applicable)
   - Climate / Future Pressures

3. **Generate research queries** — For each domain, produce 3–5 specific research queries tailored to the system. Example for "Northern Prawn Fishery, Environmental domain":
   - "Northern Prawn Fishery environmental conditions ocean temperature monsoon"
   - "Gulf of Carpentaria marine ecosystem prawn habitat"
   - "NPF bycatch threatened species environmental impacts"

4. **Determine focal variable(s)** — Identify 1–3 variables likely to be the focal point of the system (e.g., "Prawn Stock Biomass" for a prawn fishery).

**Output:** Research Plan JSON

```json
{
  "system_name": "Northern Prawn Fishery",
  "geographic_scope": "Gulf of Carpentaria and adjacent waters, Northern Australia",
  "focal_variables": ["Prawn Stock Biomass"],
  "domains": [
    {
      "domain_id": "ENV",
      "domain_name": "Environmental-Ecosystem",
      "research_queries": [
        "Northern Prawn Fishery environmental conditions ocean temperature monsoon rainfall",
        "Gulf of Carpentaria marine ecosystem seagrass mangrove habitat",
        "NPF bycatch turtle seabird syngnathid environmental impacts"
      ],
      "key_sources": ["CSIRO", "AFMA", "ABARES"]
    }
  ],
  "user_constraints": [],
  "target_variable_count": "60-100",
  "target_relationship_count": "80-160"
}
```

---

### 4.1 Phase 1 — Deep Research

**Objective:** Build a comprehensive evidence base about the system across all domains.

**Architecture:** Parallel execution of domain research agents, followed by synthesis and gap-filling.

#### Step 1.1: Parallel Domain Research

For each domain in the research plan, a **Domain Researcher agent** executes:

1. **Primary research** — Call Perplexity API with each research query. Use the `sonar-deep-research` model for comprehensive results with citations.
   
   **Perplexity API Call Structure:**
   ```json
   {
     "model": "sonar-deep-research",
     "messages": [
       {
         "role": "system",
         "content": "You are a research analyst investigating the [DOMAIN] aspects of [SYSTEM]. Provide comprehensive, factual information with specific data points, statistics, and citations. Focus on: current conditions, key variables that can increase or decrease, causal mechanisms, temporal dynamics, and management interventions."
       },
       {
         "role": "user",
         "content": "[RESEARCH QUERY]"
       }
     ],
     "return_citations": true,
     "search_recency_filter": "year"
   }
   ```

2. **Secondary research** — Based on gaps or leads from primary results, generate 2–3 follow-up queries and execute them.

3. **Compile domain brief** — Organise findings into a structured markdown document.

**Domain Brief Schema:**

```markdown
# Domain Research Brief: [Domain Name]

## System: [System Name]
## Date: [Date]
## Sources Consulted: [Count]

### Key Findings
[Narrative synthesis of 500-1000 words]

### Identified Variables
| Variable Name | Description | Evidence | Source |
|---|---|---|---|
| [Name] | [What it measures] | [Key data point] | [Citation] |

### Identified Causal Relationships
| From | To | Direction | Mechanism | Evidence | Source |
|---|---|---|---|---|---|
| [Var A] | [Var B] | same/opposite | [Why A affects B] | [Data] | [Citation] |

### Key Dynamics
- [Feedback loops mentioned in literature]
- [Time delays noted]
- [Thresholds or tipping points identified]

### Knowledge Gaps
- [Areas where evidence is thin or contradictory]

### Sources
1. [Full citation with URL]
2. ...
```

#### Step 1.2: Research Synthesis

The **System Overview Writer** receives all domain briefs and produces:

1. **System Overview Report** — A 2,000–3,000 word narrative covering:
   - System description and significance
   - Geographic and temporal scope
   - Key stakeholders
   - Major challenges and dynamics
   - Cross-domain interactions
   - Critical uncertainties

2. **Consolidated evidence base** — A merged list of all identified variables, relationships, and sources across domains.

#### Step 1.3: Gap Identification and Follow-Up

The **Research Leader** reviews the synthesis for:

- Domains with fewer than 5 identified variables → triggers additional research
- Domains with no identified causal relationships → triggers targeted follow-up
- Cross-domain relationships that are mentioned but not well-evidenced → triggers targeted research
- Contradictions between domain briefs → triggers verification research

**Iteration gate:** Phase 1 completes when:
- Every domain has ≥5 identified variables with sources
- Every domain has ≥3 identified causal relationships with sources
- The System Overview Report passes a coherence check
- No more than 2 gap-filling cycles have been executed (to prevent infinite loops)

---

### 4.2 Phase 2 — Variable Identification

**Objective:** Distill the research corpus into a definitive, quality-controlled list of system variables.

#### Step 2.1: Variable Extraction

The **Variable Extractor** (Claude Opus 4.5) receives:
- All domain research briefs
- The System Overview Report
- The consolidated evidence base

**Prompt structure (condensed):**

```
You are a systems analyst constructing a causal loop diagram. From the attached research corpus about [SYSTEM], identify all significant system variables.

For each variable, provide:
- A directionally neutral name (2-5 words) that can increase or decrease
- Domain classification
- Whether it is intervenable (directly controllable by policy/management)
- A 1-3 sentence definition including what it measures and its system significance
- Source evidence (which research brief and citation)

CRITICAL RULES:
1. Variables must be DIRECTIONALLY NEUTRAL. Use "Ocean Temperature" not "Ocean Warming". Use "Stock Biomass" not "Stock Decline".
2. Variables must be MEASURABLE or ASSESSABLE — they represent quantities that change.
3. Avoid vague meta-variables like "Sustainability" or "Ecosystem Health". Decompose into specific measurable components.
4. Ensure coverage across ALL domains identified in the research.
5. Identify 1-3 FOCAL VARIABLES that sit at the centre of the system.
6. Aim for [TARGET COUNT] variables total.

Output as JSON array.
```

**Variable JSON Schema:**

```json
{
  "variables": [
    {
      "id": "V1",
      "name": "Stock Biomass",
      "domain": "FOCAL FACTORS",
      "intervenable": false,
      "definition": "The total weight of the target species population, measured in tonnes. Influenced by recruitment, mortality, growth, and environmental conditions.",
      "evidence_sources": ["ENV-brief-cite-3", "STOCK-brief-cite-1"],
      "similar_terms": ["population size", "stock abundance", "standing stock"]
    }
  ]
}
```

#### Step 2.2: Variable Quality Review

The **Variable Reviewer** (Claude Sonnet 4.5) checks:

| Check | Criterion | Action on Failure |
|-------|-----------|-------------------|
| Directional neutrality | No variable name or definition contains: increase, decrease, improve, decline, growth, reduction, better, worse, loss, gain, degradation, enhancement | Flag for renaming |
| Uniqueness | No two variables represent the same concept under different names | Flag for merging |
| Measurability | Every variable describes something that can be quantified or assessed | Flag for decomposition or removal |
| Domain coverage | Every domain has ≥3 variables | Flag domains needing expansion |
| Focal variables | 1–3 variables marked as FOCAL FACTORS | Flag if missing |
| Count target | Total within ±20% of target | Flag if out of range |
| Intervenability | At least 2 variables marked intervenable | Flag if insufficient |
| Orphan risk | No variable appears disconnected from all others (preliminary assessment) | Flag for review |

**Output:** Review Report with pass/fail per check and specific remediation instructions.

#### Step 2.3: Variable Revision

If the review report contains failures, the Variable Extractor receives the review feedback and produces a revised variable list. This loops at most 3 times.

**Iteration gate:** Phase 2 completes when all quality checks pass or 3 revision cycles are exhausted (in which case, the best version proceeds with warnings).

---

### 4.3 Phase 3 — Relationship Extraction

**Objective:** Identify all significant causal relationships between variables, with polarity, strength, delay, and mechanistic explanation.

#### Step 3.1: Systematic Relationship Extraction

The **Relationship Extractor** (Claude Opus 4.5) works through the variable list systematically. To manage the combinatorial challenge (n variables → n² potential relationships), the extraction is structured:

**Approach: Domain-pair sweeps**

Rather than examining all n² pairs, the agent processes relationships in domain-pair blocks:

1. **Intra-domain relationships** — For each domain, identify relationships between variables within that domain.
2. **Cross-domain relationships** — For each pair of domains, identify relationships between variables across those domains.
3. **Focal variable relationships** — Explicitly check every variable's relationship with each focal variable.

For each identified relationship:

```json
{
  "relationship_id": 1,
  "from_factor_id": "V1",
  "to_factor_id": "V2",
  "polarity": "same",
  "strength": "strong",
  "delay": "years",
  "definition": "Adult fish populations drive reproductive output through density-dependent fecundity mechanisms, with larger spawning biomass producing more viable eggs and larvae.",
  "evidence_sources": ["STOCK-brief-cite-1", "ENV-brief-cite-5"],
  "confidence": "high"
}
```

**Polarity determination rules:**
- `same`: An increase in the source variable causes an increase in the target variable (and vice versa for decreases)
- `opposite`: An increase in the source variable causes a decrease in the target variable (and vice versa)

If the direction of influence is genuinely context-dependent (e.g., temperature may help or hinder depending on whether it's above or below an optimum), model this as two separate relationships with different conditions noted in the definition, or choose the dominant direction and note the context-dependence in the definition.

**Strength determination rules:**
- `strong`: Well-documented primary driver; removing this link would fundamentally change system behaviour
- `medium`: Documented influence that modulates system behaviour but is not the primary driver
- `weak`: Plausible influence with limited evidence or small effect size

**Delay determination rules:**
- `days`: Effect manifest within days to weeks
- `months`: Effect manifest within months (1–11 months)
- `years`: Effect manifest over 1–10 years
- `decade`: Effect manifest over 10+ years

#### Step 3.2: Relationship Quality Review

The **Relationship Reviewer** (Claude Sonnet 4.5) checks:

| Check | Criterion | Action on Failure |
|-------|-----------|-------------------|
| Evidence grounding | Every relationship cites at least one evidence source | Flag unsupported relationships |
| Logical coherence | Polarity is consistent with the causal mechanism described | Flag contradictions |
| No self-loops | No variable relates to itself | Remove |
| No exact duplicates | No two relationships have the same from→to pair | Merge or remove |
| Bidirectional check | If A→B and B→A both exist, verify they represent distinct mechanisms | Flag for review |
| Orphan check | Every variable participates in at least one relationship | Flag orphaned variables |
| Polarity distribution | Roughly 55–85% same, 15–45% opposite | Flag if skewed |
| Strength distribution | Roughly 10–30% strong, 50–80% medium, 5–20% weak | Flag if skewed |
| Delay distribution | Reasonable spread across days/months/years/decade | Flag if concentrated |
| Definition quality | Each definition explains the *mechanism*, not just restates the polarity | Flag vague definitions |

#### Step 3.3: Relationship Revision

Iterative loop (max 3 cycles) as in Phase 2.

---

### 4.4 Phase 4 — Feedback Loops and Gap Analysis

**Objective:** Identify feedback loop structures and conduct systematic gap analysis.

#### Step 4.1: Feedback Loop Identification

The **Feedback Loop Analyst** (Claude Sonnet 4.5) receives the validated variable and relationship lists and:

1. **Traces closed paths** through the relationship graph (cycles of length 2–8).
2. **Classifies each loop** as reinforcing (even number of `opposite` polarities in the cycle) or balancing (odd number).
3. **Assesses loop strength** based on the weakest relationship in the chain.
4. **Documents the mechanism** — a narrative description of how the loop operates.

**Feedback Loop Schema:**

```json
{
  "loop_id": "FL1",
  "name": "Stock-Recruitment Reinforcing Loop",
  "type": "reinforcing",
  "variables": ["V1", "V2"],
  "relationships": [1, 2],
  "strength": "strong",
  "description": "Higher stock biomass produces more recruits, which grow to increase stock biomass further. This reinforcing loop can drive rapid recovery when stocks are above critical thresholds, or accelerate decline when below them.",
  "system_impact": "major"
}
```

#### Step 4.2: Gap Analysis

The **Gap Analyst** (Claude Sonnet 4.5) conducts a systematic review:

1. **Structural analysis:**
   - Variables with only incoming or only outgoing relationships (sinks/sources) — are these correct or are relationships missing?
   - Domains with fewer relationships than expected — is this a real feature or a gap?
   - Variable pairs that seem logically connected but have no relationship — are these genuinely unrelated or was the link missed?

2. **Thematic analysis:**
   - Are climate change impacts represented?
   - Are management interventions connected to their targets?
   - Are market dynamics linked to harvesting decisions?
   - Are social/community impacts linked to economic variables?
   - Is Indigenous knowledge integrated (where applicable)?

3. **Comparison with reference models:**
   - The SESSF reference model distributions serve as a benchmark (not a target to match exactly, but a sanity check).

**Output:** Gap Analysis Report listing specific additions or modifications needed, with justification.

#### Step 4.3: Gap-Filling Research (Conditional)

If the gap analysis identifies significant holes, the **Research Leader** triggers targeted Perplexity research to fill them, followed by an incremental update to variables and relationships. This mini-loop runs at most twice.

---

### 4.5 Phase 5 — Integration and Output Generation

**Objective:** Final quality control, Excel generation, and summary reporting.

#### Step 5.1: Final Quality Control

The **Quality Controller** (Claude Opus 4.5) performs a holistic review of the entire system map:

1. **Logical consistency** — Trace every feedback loop and verify the polarity chain produces the expected loop type.
2. **Completeness** — Verify every variable has ≥1 relationship; verify every domain has reasonable coverage.
3. **Evidence quality** — Spot-check 10–20% of relationships for evidence grounding.
4. **Naming consistency** — Verify all variable names are directionally neutral and use consistent terminology.
5. **Definition quality** — Verify all relationship definitions explain mechanisms, not just restate polarity.
6. **Scale check** — Verify variable and relationship counts are within target ranges.
7. **Intervenability check** — Verify intervenable variables are correctly identified.

**Output:** Final Quality Report with pass/fail and any last corrections.

#### Step 5.2: Output Generation

The **Output Formatter** (Claude Haiku 4.5) receives the validated variables and relationships and generates the Excel workbook. This is a mechanical task: mapping JSON fields to spreadsheet columns, applying the VLOOKUP formulas, and sorting appropriately.

**Implementation:** A Python script using `openpyxl` that:
1. Creates FACTORS sheet with all variables
2. Creates RELATIONSHIPS sheet with all relationships
3. Adds VLOOKUP formulas for the `from` and `to` name columns
4. Applies formatting (headers, column widths)
5. Validates the output against the Sim4Action schema

#### Step 5.3: Summary Report

The **Summary Reporter** (Claude Sonnet 4.5) produces a markdown report containing:
- System description
- Map statistics (variable count by domain, relationship count by type, feedback loop count)
- Key findings (most connected variables, strongest feedback loops, critical uncertainties)
- Methodology notes
- Source bibliography

---

## Part 5: n8n Implementation Architecture

### 5.1 Workflow Node Structure

```
[Webhook Trigger] ──┐
[Form Trigger] ─────┼──► [Set Node: Parse User Input]
[Manual Trigger] ───┘         │
                              ▼
              [HTTP Request: Research Leader → Claude Sonnet API]
                              │  Output: Research Plan JSON
                              ▼
              [Code Node: OUTPUT - Research Plan Report] ◄── AUDIT TRAIL
                              │
                              ▼
              [Split In Batches: Domain Research]
                              │
                  ├──► [HTTP Request: Perplexity API - Domain 1]
                  ├──► [HTTP Request: Perplexity API - Domain 2]
                  ├──► [HTTP Request: Perplexity API - Domain 3]
                  ├──► ... (parallel execution)
                              │
                              ▼
              [Merge Node: Collect Domain Briefs]
                              │
                              ▼
              [Code Node: OUTPUT - Domain Briefs Report] ◄── AUDIT TRAIL
                              │
                              ▼
              [HTTP Request: System Overview Writer → Claude Sonnet API]
                              │
                              ▼
              [Code Node: OUTPUT - System Overview Report] ◄── AUDIT TRAIL
                              │
                              ▼
              [HTTP Request: Research Leader Gap Check → Claude Sonnet API]
                              │
                  ├──► [If gaps found] → [Loop back to targeted research]
                              │
                              ▼
              [HTTP Request: Variable Extractor → Claude Opus API]
                              │
                              ▼
              [HTTP Request: Variable Reviewer → Claude Sonnet API]
                              │
                  ├──► [If review fails] → [Loop back with feedback] (max 3)
                              │
                              ▼
              [Code Node: OUTPUT - Variable List Report] ◄── AUDIT TRAIL
                              │
                              ▼
              [HTTP Request: Relationship Extractor → Claude Opus API]
                              │  (may be split for large variable sets)
                              ▼
              [HTTP Request: Relationship Reviewer → Claude Sonnet API]
                              │
                  ├──► [If review fails] → [Loop back with feedback] (max 3)
                              │
                              ▼
              [Code Node: OUTPUT - Relationship List Report] ◄── AUDIT TRAIL
                              │
                              ▼
              [HTTP Request: Feedback Loop Analyst → Claude Sonnet API]
                              │
                              ▼
              [HTTP Request: Gap Analyst → Claude Sonnet API]
                              │
                  ├──► [If gaps found] → [Targeted research] (max 2)
                              │
                              ▼
              [Code Node: OUTPUT - Feedback & Gap Report] ◄── AUDIT TRAIL
                              │
                              ▼
              [HTTP Request: Quality Controller → Claude Opus API]
                              │
                  ├──► [If QC fails] → [Targeted corrections]
                              │
                              ▼
              [Code Node: Generate Excel]
                              │
                              ▼
              [HTTP Request: Summary Reporter → Claude Sonnet API]
                              │
                              ▼
              [Code Node: OUTPUT - Final Report] ◄── AUDIT TRAIL
                              │
                              ▼
              [Respond to Webhook / Return Results]
```

**Legend:**
- `◄── AUDIT TRAIL` indicates intermediate output nodes that generate markdown reports for quality control and traceability

### 5.2 n8n Node Specifications

#### 5.2.1 API Integration Nodes

**Perplexity API Node Configuration:**
```json
{
  "node_type": "HTTP Request",
  "method": "POST",
  "url": "https://api.perplexity.ai/chat/completions",
  "headers": {
    "Authorization": "Bearer {{ $credentials.perplexityApiKey }}",
    "Content-Type": "application/json"
  },
  "body": {
    "model": "sonar-deep-research",
    "messages": "{{ $json.messages }}",
    "return_citations": true
  },
  "retry": {
    "maxRetries": 3,
    "waitBetweenRetries": 5000
  },
  "timeout": 120000
}
```

**Claude API Node Configuration:**
```json
{
  "node_type": "HTTP Request",
  "method": "POST",
  "url": "https://api.anthropic.com/v1/messages",
  "headers": {
    "x-api-key": "{{ $credentials.anthropicApiKey }}",
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json"
  },
  "body": {
    "model": "{{ $json.model }}",
    "max_tokens": "{{ $json.max_tokens }}",
    "system": "{{ $json.system_prompt }}",
    "messages": "{{ $json.messages }}"
  },
  "retry": {
    "maxRetries": 3,
    "waitBetweenRetries": 10000
  },
  "timeout": 300000
}
```

#### 5.2.2 Iteration Control

Each iterative loop uses n8n's built-in loop mechanisms:

```
[Set Node: iteration_count = 0]
    │
    ▼
[Agent Execution Node]
    │
    ▼
[Review Node]
    │
    ├──► [If Node: review.passed == true] → Continue to next phase
    │
    ├──► [If Node: iteration_count >= max_iterations] → Continue with warnings
    │
    └──► [Set Node: iteration_count += 1] → Loop back to Agent Execution
```

#### 5.2.3 Error Handling

Every API call node includes:
- **Retry logic**: 3 retries with exponential backoff
- **Timeout**: 120s for Perplexity, 300s for Claude Opus
- **Error branch**: On failure after retries, log the error and continue with degraded output rather than failing the entire workflow
- **Rate limiting**: Configurable delays between calls (especially for parallel Perplexity calls)

### 5.3 Data Flow and State Management

The workflow uses n8n's built-in data passing between nodes. For complex state that must persist across the entire workflow, a **State Object** is maintained:

```json
{
  "system_name": "...",
  "research_plan": { },
  "domain_briefs": [ ],
  "system_overview": "...",
  "variables": [ ],
  "relationships": [ ],
  "feedback_loops": [ ],
  "gap_analysis": { },
  "quality_report": { },
  "iteration_counts": {
    "research_gap_fill": 0,
    "variable_revision": 0,
    "relationship_revision": 0,
    "final_gap_fill": 0
  },
  "warnings": [ ],
  "errors": [ ]
}
```

This state object is passed through every node and updated incrementally.

---

## Part 6: Prompt Engineering Specifications

### 6.1 Research Leader — Research Plan Generation

```
SYSTEM PROMPT:
You are a research director planning a systematic investigation of a socio-environmental system for causal system mapping. Your team will conduct deep research across multiple domains to build the evidence base for a causal loop diagram.

Given the user's system description, produce a research plan that:
1. Clearly defines the system scope (name, geography, temporal frame)
2. Identifies 6-8 research domains appropriate to this system
3. For each domain, generates 3-5 specific, search-optimised research queries
4. Identifies 1-3 likely focal variables
5. Notes any user constraints or priorities

Consider what makes this specific system unique. A fishery requires different domains than a forest or a watershed. An Australian system has different governance structures than a Southeast Asian one. Tailor the domains and queries accordingly.

Output strict JSON matching the Research Plan schema.
```

### 6.2 Variable Extractor — Core Prompt Structure

```
SYSTEM PROMPT:
You are a systems analyst constructing a causal system map. You will receive a research corpus about [SYSTEM_NAME]. Your task is to extract all significant system variables.

RULES:
1. DIRECTIONAL NEUTRALITY: Every variable name must be a quantity that can increase or decrease. 
   ✓ "Ocean Temperature" ✗ "Ocean Warming"
   ✓ "Stock Biomass" ✗ "Stock Decline"  
   ✓ "Compliance Rate" ✗ "Improved Compliance"
   
2. MEASURABILITY: Each variable must represent something that can be measured, counted, rated, or assessed. Avoid abstract meta-concepts.
   ✓ "Dissolved Oxygen Concentration" ✗ "Water Quality"
   ✓ "Species Abundance" ✗ "Ecosystem Health"
   
3. GRANULARITY: Variables should be specific enough to have clear causal relationships but general enough to avoid redundancy.
   Too specific: "January Rainfall in Zone 3"
   Too general: "Climate"
   Right level: "Seasonal Rainfall"

4. DOMAIN COVERAGE: Ensure representation across all identified domains.

5. INTERVENABILITY: Mark variables as intervenable=true ONLY if they can be directly set or controlled by management/policy action (e.g., catch limits, closed areas, subsidy levels). Most variables are intervenable=false.

USER MESSAGE:
[RESEARCH CORPUS — all domain briefs concatenated]

Extract [TARGET_COUNT] variables. Output as JSON.
```

### 6.3 Relationship Extractor — Core Prompt Structure

```
SYSTEM PROMPT:
You are a systems analyst extracting causal relationships for a causal loop diagram of [SYSTEM_NAME]. You will receive a list of validated variables and the research corpus.

For each relationship, you must identify:
- FROM: The causal source variable
- TO: The variable being affected
- POLARITY: "same" if increase in FROM causes increase in TO; "opposite" if increase in FROM causes decrease in TO. If the relationship is genuinely context-dependent, choose the dominant direction and note the context-dependence in the definition.
- STRENGTH: "strong" (primary driver), "medium" (significant modulator), "weak" (minor influence)
- DELAY: "days", "months", "years", or "decade"
- DEFINITION: A 1-2 sentence explanation of the CAUSAL MECHANISM (not just "X affects Y" but WHY and HOW)

CRITICAL RULES:
1. Every relationship must be supported by evidence from the research corpus.
2. The definition must explain the mechanism, not just restate the polarity.
   ✗ "Higher temperature increases mortality" 
   ✓ "Rising water temperature reduces dissolved oxygen and increases metabolic stress, elevating mortality rates particularly in demersal species near their thermal tolerance limits."
3. Consider relationships ACROSS domains, not just within them.
4. Do not assume relationships exist just because variables are in the same domain.
5. Check: if I increase the FROM variable by 10%, does the TO variable plausibly change? If not, don't include the relationship.

APPROACH:
Process relationships in this order:
1. All relationships involving focal variables
2. Intra-domain relationships for each domain
3. Cross-domain relationships between adjacent domains
4. Any remaining relationships you identify

Output as JSON array.
```

### 6.4 Quality Controller — Final Review Prompt

```
SYSTEM PROMPT:
You are the quality controller for a causal system map of [SYSTEM_NAME]. You will receive the complete variable list, relationship list, and feedback loops. Perform a comprehensive quality assessment.

CHECK LIST:
1. STRUCTURAL INTEGRITY
   - Every variable has ≥1 relationship (no orphans)
   - No self-referential relationships
   - No duplicate relationships
   - Focal variables are highly connected

2. LOGICAL COHERENCE
   - For each feedback loop: trace the polarity chain and verify the loop classification (reinforcing vs balancing)
   - No contradictory relationship pairs (e.g., A→B is "same" but contains mechanism suggesting "opposite")

3. DIRECTIONAL NEUTRALITY
   - Scan all variable names and definitions for directional language

4. DOMAIN BALANCE
   - Calculate variables per domain and relationships per domain
   - Flag any domain with <3 variables or <5 relationships

5. DISTRIBUTION CHECKS
   - Polarity: 55-85% same, 15-45% opposite
   - Strength: 10-30% strong, 50-80% medium, 5-20% weak
   - Delay: reasonable spread

6. DEFINITION QUALITY
   - Sample 20 relationship definitions — do they explain mechanisms?

7. EVIDENCE GROUNDING
   - Sample 20 relationships — do they cite evidence?

Output a structured quality report with pass/fail for each check, specific issues found, and recommended corrections.
```

---

## Part 7: Excel Generation Specification

### 7.1 Python Script for Output Generation

The final Excel workbook is generated by a Python script executed in an n8n Code node. The script:

1. Receives the validated variables and relationships as JSON
2. Creates the FACTORS sheet with proper column structure
3. Creates the RELATIONSHIPS sheet with VLOOKUP formulas
4. Applies formatting
5. Validates the output
6. Returns the file as a binary buffer

**Key formatting requirements:**
- FACTORS sorted by factor_id (natural sort: V1, V2, ..., V10, V11, ...)
- RELATIONSHIPS sorted by relationship_id
- Column widths set for readability
- Header row bold with filter enabled
- VLOOKUP formulas in columns B and C of RELATIONSHIPS sheet referencing FACTORS sheet

### 7.2 Validation Rules

Before output, the script validates:
- No empty factor_id, name, domain_name, or definition in FACTORS
- No empty relationship_id, from_factor_id, to_factor_id, polarity, strength, delay, or definition in RELATIONSHIPS
- All from_factor_id and to_factor_id values exist in FACTORS
- No duplicate factor_ids
- No duplicate from_factor_id + to_factor_id pairs
- polarity values are in {same, opposite}
- strength values are in {strong, medium, weak}
- delay values are in {days, months, years, decade}
- intervenable values are in {yes, no}

---

## Part 8: Configuration and Customisation

### 8.1 Workflow Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `target_variable_count` | 60–100 | Target range for number of variables |
| `target_relationship_count` | 80–160 | Target range for number of relationships |
| `max_research_iterations` | 2 | Maximum gap-filling research cycles in Phase 1 |
| `max_variable_revisions` | 3 | Maximum variable revision cycles |
| `max_relationship_revisions` | 3 | Maximum relationship revision cycles |
| `max_gap_fill_iterations` | 2 | Maximum gap-filling cycles in Phase 4 |
| `perplexity_model` | sonar-deep-research | Perplexity model for research |
| `reasoning_model` | claude-opus-4-5-20251101 | Model for complex analytical tasks |
| `synthesis_model` | claude-sonnet-4-5-20250929 | Model for synthesis and review tasks |
| `formatting_model` | claude-haiku-4-5-20251001 | Model for simple formatting tasks |
| `parallel_research_limit` | 4 | Maximum parallel Perplexity API calls |
| `include_indigenous_domain` | true | Whether to include Indigenous knowledge domain |
| `save_to_google_drive` | false | Whether to save intermediate reports to Google Drive |

### 8.2 Google Drive Integration (Optional)

The workflow supports optional storage of intermediate reports to Google Drive for audit trail and collaboration purposes.

#### Enabling Google Drive Storage

**Via Webhook/API:**
```json
{
  "system_description": "The Northern Prawn Fishery...",
  "save_to_google_drive": true
}
```

**Via Form Trigger:**
A checkbox "Save reports to Google Drive" is available on the input form.

#### Folder Structure

When enabled, the workflow creates a timestamped folder in Google Drive at the start of execution:

```
SES_Causal_Map_[SystemName]_[YYYY-MM-DD_HH-MM]/
├── 00_Research_Plan.md
├── 01_Domain_Brief_ENV.md          ← Individual domain briefs (saved during loop)
├── 01_Domain_Brief_STOCK.md
├── 01_Domain_Brief_TECH.md
├── 01_Domain_Brief_ECON.md
├── 01_Domain_Brief_MGMT.md
├── 01_Domain_Brief_SOC.md
├── 01_Domain_Brief_IND.md
├── 01_Domain_Briefs_Consolidated.md ← All briefs merged
├── 02_System_Overview.md
├── 03_Variable_List.md
├── 04_Relationship_List.md
├── 05_Feedback_Gap_Analysis.md
└── 06_Final_Report.md
```

#### Progressive Upload

Reports are uploaded **immediately after each step completes**, not at the end of the workflow. This provides several benefits:

1. **Fault tolerance**: If the workflow fails midway, completed reports are already saved
2. **Progress monitoring**: You can check the Google Drive folder to see workflow progress
3. **Early review**: Stakeholders can review earlier phases while later phases are still running

| Report | Uploaded After | Phase |
|--------|----------------|-------|
| `00_Research_Plan.md` | Output: Research Plan | 0 |
| `01_Domain_Brief_[ID].md` | Each domain completes (inside loop) | 1 |
| `01_Domain_Briefs_Consolidated.md` | Output: Domain Briefs | 1 |
| `02_System_Overview.md` | Output: System Overview | 1 |
| `03_Variable_List.md` | Output: Variable List | 2 |
| `04_Relationship_List.md` | Output: Relationship List | 3 |
| `05_Feedback_Gap_Analysis.md` | Output: Feedback & Gap | 4 |
| `06_Final_Report.md` | Output: Final Report | 5 |

**Note on Domain Briefs:** Each domain brief (ENV, STOCK, TECH, etc.) is uploaded individually as soon as that domain's research completes. This means if domain research fails on domain 5, you still have domains 1-4 saved. The consolidated briefs document is then saved after all domains complete and merge.

#### Folder Naming Convention

Format: `SES_Causal_Map_[SystemName]_[Timestamp]`

Examples:
- `SES_Causal_Map_Northern_Prawn_Fishery_2026-02-06_14-30`
- `SES_Causal_Map_Baltic_Sea_Cod_2026-02-06_15-45`

The system name is sanitized to remove special characters and spaces are replaced with underscores.

#### Requirements

1. **Google Drive Credential**: OAuth2 credential with write access to Google Drive
2. **Parent Folder ID** (optional): Specify a folder ID to create subfolders within a specific location
3. **Sufficient Drive quota**: Each run creates 7-8 small markdown files (~10-50KB each)

#### Behaviour When Disabled

When `save_to_google_drive` is `false` (default):
- No Google Drive API calls are made
- No credential is required
- Intermediate reports are still generated and included in the final response
- Workflow runs faster (no upload latency)

### 8.2 Domain Customisation

The default domain set can be overridden by the user. The Research Leader agent adapts its plan based on the system type:

| System Type | Typical Domains |
|-------------|----------------|
| Marine fishery | Environmental-Ecosystem, Stock, Technical, Economics-Markets, Management, Social, Indigenous |
| Terrestrial agriculture | Climate, Soil-Water, Crop-Livestock, Economics-Markets, Labour, Governance, Cultural |
| Coastal tourism | Environmental, Biodiversity, Tourism-Economics, Infrastructure, Governance, Community, Climate |
| Watershed | Hydrology, Ecology, Land-Use, Economics, Governance, Community, Climate |
| Urban sustainability | Energy, Transport, Built-Environment, Economics, Governance, Social, Health |

### 8.3 Cost Estimation

| Phase | API Calls | Estimated Token Usage | Approximate Cost (USD) |
|-------|-----------|----------------------|----------------------|
| Phase 0: Initialisation | 1 Claude Sonnet | ~5K in, ~2K out | $0.05 |
| Phase 1: Deep Research | 18–40 Perplexity, 3–5 Claude Sonnet | ~200K in, ~80K out | $5–15 |
| Phase 2: Variables | 2–6 Claude Opus, 2–6 Claude Sonnet | ~100K in, ~30K out | $5–10 |
| Phase 3: Relationships | 2–8 Claude Opus, 2–6 Claude Sonnet | ~150K in, ~50K out | $8–15 |
| Phase 4: Loops & Gaps | 3–6 Claude Sonnet, 0–4 Perplexity | ~80K in, ~30K out | $3–8 |
| Phase 5: Integration | 1–2 Claude Opus, 1 Claude Haiku, 1 Claude Sonnet | ~60K in, ~20K out | $3–6 |
| **Total** | **30–80 API calls** | **~600K–1M tokens** | **$25–55** |

---

## Part 9: Testing and Validation Strategy

### 9.1 Reference System Test

The SESSF fishery serves as the primary validation case. The workflow should produce a system map that, when compared to the manually-constructed SESSF reference:

- Captures ≥80% of the same core variables (allowing for different naming)
- Captures ≥70% of the same core relationships
- Identifies at least the major feedback loops
- Achieves similar domain coverage distribution
- Produces a valid Sim4Action input file

### 9.2 Generalisability Tests

Test the workflow on 3–5 additional systems to verify it adapts appropriately:

1. A tropical fishery (e.g., Northern Prawn Fishery) — tests adaptation to different ecology
2. A non-fishery marine system (e.g., Great Barrier Reef tourism-fisheries interaction) — tests domain flexibility
3. A terrestrial system (e.g., Murray-Darling Basin water management) — tests fundamental domain reconfiguration
4. A non-Australian system (e.g., North Sea cod fishery) — tests geographic adaptation

### 9.3 Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Variable orphan rate | 0% | Variables with no relationships / total variables |
| Domain coverage | 100% | Domains with ≥3 variables / total domains |
| Evidence grounding | ≥90% | Relationships with cited evidence / total relationships |
| Definition quality | ≥85% | Relationships with mechanism-explaining definitions / total |
| Directional neutrality | 100% | Variables passing neutrality check / total variables |
| Sim4Action compatibility | 100% | Output file loads and validates in Sim4Action |
| Completion time | <60 min | Wall-clock time from trigger to output |
| Cost per run | <$60 | Total API costs per workflow execution |

---

## Part 10: Deployment and Operations

### 10.1 n8n Environment Requirements

- n8n instance (self-hosted or cloud) with:
  - Webhook trigger capability
  - HTTP Request nodes with retry and timeout configuration
  - Code nodes with Python runtime (for Excel generation)
  - Split In Batches / Merge nodes for parallel execution
  - If / Switch nodes for conditional branching
  - Loop / Set nodes for iteration control
- Credentials configured for:
  - Anthropic API (Claude models)
  - Perplexity API
- Adequate timeout settings (individual nodes may run 2–5 minutes)
- Sufficient memory for state management (the research corpus may exceed 100KB of text)

### 10.2 Monitoring and Logging

Each workflow execution should log:
- Timestamp and system name
- Phase completion times
- API call counts and costs per phase
- Iteration counts (how many revision cycles were needed)
- Quality check results (pass/fail)
- Warnings and errors
- Final output statistics (variable count, relationship count, etc.)

### 10.3 Human-in-the-Loop Options

The workflow can be configured with optional human review gates:
- **After Phase 1:** Human reviews the System Overview Report before proceeding
- **After Phase 2:** Human reviews the variable list before relationship extraction
- **After Phase 5:** Human reviews the final map before generating Excel output

These gates are implemented as n8n "Wait" nodes that pause execution until a webhook callback is received (e.g., from a review interface or email confirmation).

---

## Appendix A: Complete JSON Schemas

### A.1 Research Plan Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["system_name", "geographic_scope", "focal_variables", "domains"],
  "properties": {
    "system_name": { "type": "string" },
    "geographic_scope": { "type": "string" },
    "focal_variables": { "type": "array", "items": { "type": "string" }, "minItems": 1, "maxItems": 3 },
    "domains": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["domain_id", "domain_name", "research_queries"],
        "properties": {
          "domain_id": { "type": "string" },
          "domain_name": { "type": "string" },
          "research_queries": { "type": "array", "items": { "type": "string" }, "minItems": 3, "maxItems": 5 },
          "key_sources": { "type": "array", "items": { "type": "string" } }
        }
      },
      "minItems": 6,
      "maxItems": 10
    },
    "user_constraints": { "type": "array", "items": { "type": "string" } },
    "target_variable_count": { "type": "string" },
    "target_relationship_count": { "type": "string" }
  }
}
```

### A.2 Variable Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "domain", "intervenable", "definition"],
  "properties": {
    "id": { "type": "string", "pattern": "^V\\d+$" },
    "name": { "type": "string", "minLength": 2, "maxLength": 50 },
    "domain": { 
      "type": "string", 
      "enum": ["FOCAL FACTORS", "Environmental-Ecosystem", "Stock", "Technical", "Economics-Markets", "Management", "Social", "Indigenous"]
    },
    "intervenable": { "type": "boolean" },
    "definition": { "type": "string", "minLength": 20, "maxLength": 500 },
    "evidence_sources": { "type": "array", "items": { "type": "string" } },
    "similar_terms": { "type": "array", "items": { "type": "string" } }
  }
}
```

### A.3 Relationship Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["relationship_id", "from_factor_id", "to_factor_id", "polarity", "strength", "delay", "definition"],
  "properties": {
    "relationship_id": { "type": "integer", "minimum": 1 },
    "from_factor_id": { "type": "string", "pattern": "^V\\d+$" },
    "to_factor_id": { "type": "string", "pattern": "^V\\d+$" },
    "polarity": { "type": "string", "enum": ["same", "opposite"] },
    "strength": { "type": "string", "enum": ["strong", "medium", "weak"] },
    "delay": { "type": "string", "enum": ["days", "months", "years", "decade"] },
    "definition": { "type": "string", "minLength": 20, "maxLength": 500 },
    "evidence_sources": { "type": "array", "items": { "type": "string" } },
    "confidence": { "type": "string", "enum": ["high", "medium", "low"] }
  }
}
```

### A.4 Feedback Loop Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["loop_id", "name", "type", "variables", "relationships", "strength", "description"],
  "properties": {
    "loop_id": { "type": "string", "pattern": "^FL\\d+$" },
    "name": { "type": "string" },
    "type": { "type": "string", "enum": ["reinforcing", "balancing"] },
    "variables": { "type": "array", "items": { "type": "string" }, "minItems": 2 },
    "relationships": { "type": "array", "items": { "type": "integer" }, "minItems": 2 },
    "strength": { "type": "string", "enum": ["strong", "medium", "weak"] },
    "description": { "type": "string" },
    "system_impact": { "type": "string", "enum": ["major", "minor"] }
  }
}
```

### A.5 Quality Report Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["overall_pass", "checks", "statistics"],
  "properties": {
    "overall_pass": { "type": "boolean" },
    "checks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["check_name", "passed", "details"],
        "properties": {
          "check_name": { "type": "string" },
          "passed": { "type": "boolean" },
          "details": { "type": "string" },
          "corrections": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "statistics": {
      "type": "object",
      "properties": {
        "total_variables": { "type": "integer" },
        "total_relationships": { "type": "integer" },
        "total_feedback_loops": { "type": "integer" },
        "variables_by_domain": { "type": "object" },
        "relationships_by_polarity": { "type": "object" },
        "relationships_by_strength": { "type": "object" },
        "relationships_by_delay": { "type": "object" },
        "orphan_count": { "type": "integer" }
      }
    },
    "warnings": { "type": "array", "items": { "type": "string" } }
  }
}
```

---

## Appendix B: Reference Data from SESSF Model

The SESSF reference model provides these benchmarks:

**Variables by Domain:**
| Domain | Count | Percentage |
|--------|-------|-----------|
| FOCAL FACTORS | 1 | 1.1% |
| Environmental-Ecosystem | 18 | 18.9% |
| Stock | 8 | 8.4% |
| Technical | 18 | 18.9% |
| Economics-Markets | 26 | 27.4% |
| Management | 4 | 4.2% |
| Social | 10 | 10.5% |
| Indigenous | 10 | 10.5% |
| **Total** | **95** | **100%** |

**Relationships by Polarity:**
| Polarity | Count | Percentage |
|----------|-------|-----------|
| same | 98 | 77.2% |
| opposite | 29 | 22.8% |
| **Total** | **127** | **100%** |

*Note: 2 relationships classified as "variable" in the original SESSF reference have been excluded. The workflow enforces binary polarity (same/opposite) only.*

**Relationships by Strength:**
| Strength | Count | Percentage |
|----------|-------|-----------|
| strong | 24 | 18.6% |
| medium | 102 | 79.1% |
| weak | 3 | 2.3% |
| **Total** | **129** | **100%** |

**Relationships by Delay:**
| Delay | Count | Percentage |
|-------|-------|-----------|
| days | 12 | 9.3% |
| months | 59 | 45.7% |
| years | 53 | 41.1% |
| decade | 5 | 3.9% |
| **Total** | **129** | **100%** |

---

## Appendix C: Glossary

| Term | Definition |
|------|-----------|
| **Causal Loop Diagram (CLD)** | A directed graph where nodes represent system variables and edges represent causal relationships with polarity |
| **Polarity** | The direction of causal influence: "same" means both variables move in the same direction; "opposite" means they move in opposite directions. Only binary polarity is used — context-dependent relationships must be resolved to their dominant direction |
| **Reinforcing loop** | A feedback loop where a change amplifies itself (even number of "opposite" links in the cycle) |
| **Balancing loop** | A feedback loop where a change is counteracted (odd number of "opposite" links in the cycle) |
| **Directional neutrality** | The property of a variable name that allows it to increase or decrease without implying whether that change is good or bad |
| **Intervenable variable** | A variable that can be directly set or controlled by management/policy action |
| **Focal variable** | The central variable(s) around which the system map is organised |
| **SES** | Socio-Environmental System |
| **Sim4Action** | An analytical workbench that applies systems mapping, social network analysis, and token diffusion algorithms to causal system maps |
| **Token diffusion** | An algorithm that simulates the propagation of perturbations through a causal network to assess downstream impacts |
| **n8n** | An open-source workflow automation platform used to orchestrate the agentic workflow |
