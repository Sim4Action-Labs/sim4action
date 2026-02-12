# SES Causal Map Generator - Workflow Documentation

## User Manual & Technical Reference

**Version:** 1.0  
**Workflow ID:** `DS3zOSUJCJPXthho`  
**Platform:** n8n Workflow Automation  
**Created:** February 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Phase 0: Initialization](#3-phase-0-initialization)
4. [Phase 1: Deep Research](#4-phase-1-deep-research)
5. [Phase 2: Variable Identification](#5-phase-2-variable-identification)
6. [Phase 3: Relationship Extraction](#6-phase-3-relationship-extraction)
7. [Phase 4: Feedback Loops & Gap Analysis](#7-phase-4-feedback-loops--gap-analysis)
8. [Phase 5: Integration & Output](#8-phase-5-integration--output)
9. [Intermediate Output Nodes (Audit Trail)](#9-intermediate-output-nodes-audit-trail)
10. [State Object Reference](#10-state-object-reference)
11. [Configuration Guide](#11-configuration-guide)
12. [Testing Guide](#12-testing-guide)
13. [Troubleshooting](#13-troubleshooting)
14. [Cost & Performance](#14-cost--performance)

---

## 1. Overview

### Purpose

The SES Causal Map Generator is an agentic AI workflow that transforms a natural language description of a socio-environmental system into a comprehensive causal system map. The output is an Excel workbook compatible with the Sim4Action analytical platform.

### What It Does

1. **Researches** the system across 6-8 domains using web search
2. **Extracts** 40-120 system variables with definitions
3. **Identifies** 60-200 causal relationships with polarity, strength, and delay
4. **Discovers** feedback loops (reinforcing and balancing)
5. **Quality controls** the entire map against defined criteria
6. **Generates** an Excel workbook with FACTORS and RELATIONSHIPS sheets

### Key Features

- **Multi-agent architecture**: Specialized AI agents for each task
- **Iterative refinement**: Multiple review cycles ensure quality
- **Evidence-based**: All variables and relationships traced to research sources
- **Configurable**: Adjustable targets for variable/relationship counts
- **Single API gateway**: All LLM calls routed through OpenRouter

### Models Used

| Model | OpenRouter ID | Purpose |
|-------|---------------|---------|
| Claude Opus 4.6 | `anthropic/claude-opus-4.6` | Complex reasoning tasks |
| Claude Sonnet 4.5 | `anthropic/claude-sonnet-4.5` | Coordination and review |
| Perplexity Sonar | `perplexity/sonar-deep-research` | Web research with citations |

---

## 2. Architecture

### High-Level Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PHASE 0       │     │   PHASE 1       │     │   PHASE 2       │
│ Initialization  │────▶│ Deep Research   │────▶│ Variable ID     │
│                 │     │ (Perplexity)    │     │ (Claude Opus)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
        ┌───────────────────────────────────────────────┘
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PHASE 3       │     │   PHASE 4       │     │   PHASE 5       │
│ Relationship    │────▶│ Feedback Loops  │────▶│ Integration     │
│ Extraction      │     │ & Gap Analysis  │     │ & Output        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Node Count by Phase

| Phase | Nodes | Description |
|-------|-------|-------------|
| 0 | 6 | Triggers, input parsing, research planning |
| 1 | 13 | Domain research, synthesis, gap checking |
| 2 | 12 | Variable extraction and review loop |
| 3 | 12 | Relationship extraction and review loop |
| 4 | 9 | Feedback loops, gap analysis, targeted research |
| 5 | 9 | Quality control, Excel generation, response |
| **Total** | **61** | Including 6 sticky notes for documentation |

---

## 3. Phase 0: Initialization

### Purpose
Receive user input and create a structured research plan.

### Nodes

#### 3.1 Webhook Trigger
- **Type:** `n8n-nodes-base.webhook`
- **Path:** `/causal-map`
- **Method:** POST
- **Input:** JSON body with system description

**Expected Input Schema:**
```json
{
  "system_description": "string (required) - Natural language description of the SES",
  "user_constraints": ["string"] (optional) - Specific focus areas or constraints,
  "target_variable_count": "string" (optional, default: "60-100"),
  "target_relationship_count": "string" (optional, default: "80-160")
}
```

#### 3.2 Form Trigger
- **Type:** `n8n-nodes-base.formTrigger`
- **Path:** `/causal-map-form`
- **Purpose:** Interactive web form for manual submission without API knowledge

**Form Fields:**

| Field | Type | Required | Options/Validation |
|-------|------|----------|-------------------|
| System Description | Textarea | Yes | Min 100 characters, Max 5000 characters |
| Target Variable Count | Dropdown | No | "40-60", "60-100" (default), "80-120" |
| Target Relationship Count | Dropdown | No | "60-100", "80-160" (default), "120-200" |
| User Constraints | Textarea | No | Optional focus areas or priorities |
| Save to Google Drive | Checkbox | No | Enable to save intermediate reports to Google Drive |

**Form URL:** `https://your-n8n-instance/form/causal-map-form`

#### 3.3 Manual Trigger
- **Type:** `n8n-nodes-base.manualTrigger`
- **Purpose:** Alternative trigger for testing without webhook

#### 3.4 Parse User Input
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Initialize the state object with user input

**Output:** State object with:
- `system_description`: User's input
- `user_constraints`: Any specified constraints
- `target_variable_count`: Target range
- `target_relationship_count`: Target range
- `state`: Initialized state object (see Section 9)

#### 3.4 Research Leader
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-sonnet-4.5`
- **Timeout:** 120 seconds
- **Retries:** 3

**System Prompt:**
```
You are a research director planning a systematic investigation of a socio-environmental 
system for causal system mapping. Your team will conduct deep research across multiple 
domains to build the evidence base for a causal loop diagram.

Given the user's system description, produce a research plan that:
1. Clearly defines the system scope (name, geography, temporal frame)
2. Identifies 6-8 research domains appropriate to this system
3. For each domain, generates 3-5 specific, search-optimised research queries
4. Identifies 1-3 likely focal variables
5. Notes any user constraints or priorities

Consider what makes this specific system unique. A fishery requires different domains 
than a forest or a watershed. An Australian system has different governance structures 
than a Southeast Asian one. Tailor the domains and queries accordingly.

Output strict JSON matching the Research Plan schema.
```

**Output Schema (Research Plan):**
```json
{
  "system_name": "string",
  "geographic_scope": "string",
  "focal_variables": ["string"],
  "domains": [
    {
      "domain_id": "string (e.g., ENV, STOCK, TECH)",
      "domain_name": "string (e.g., Environmental-Ecosystem)",
      "research_queries": ["string"],
      "key_sources": ["string"]
    }
  ],
  "user_constraints": ["string"],
  "target_variable_count": "string",
  "target_relationship_count": "string"
}
```

#### 3.5 Parse Research Plan
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Extract JSON from API response and update state
- **Output:** State with `system_name` and `research_plan` populated

---

## 4. Phase 1: Deep Research

### Purpose
Conduct comprehensive web research across all identified domains and synthesize findings.

### Nodes

#### 4.1 Split Domains
- **Type:** `n8n-nodes-base.splitInBatches`
- **Batch Size:** 1
- **Purpose:** Process each domain from the research plan

#### 4.2 Domain Research (Perplexity)
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `perplexity/sonar-deep-research`
- **Timeout:** 120 seconds
- **Retries:** 3

**System Prompt:**
```
You are a research analyst investigating the [DOMAIN_NAME] aspects of [SYSTEM_NAME]. 
Provide comprehensive, factual information with specific data points, statistics, 
and citations. Focus on: current conditions, key variables that can increase or 
decrease, causal mechanisms, temporal dynamics, and management interventions.

Structure your response as a Domain Research Brief with:
1. Key Findings (500-1000 words narrative)
2. Identified Variables (table format: name, description, evidence)
3. Identified Causal Relationships (from, to, direction, mechanism, evidence)
4. Key Dynamics (feedback loops, time delays, thresholds)
5. Knowledge Gaps
6. Sources with citations
```

**Input:** Research queries from the domain
**Output:** Domain research brief with citations

#### 4.3 Collect Domain Brief
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Format the research response for merging

#### 4.4 More Domains?
- **Type:** `n8n-nodes-base.splitInBatches`
- **Purpose:** Loop controller - continues until all domains processed

#### 4.5 Merge Domain Briefs
- **Type:** `n8n-nodes-base.aggregate`
- **Mode:** Aggregate all item data
- **Output:** Array of all domain briefs

#### 4.6 System Overview Writer
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-sonnet-4.5`
- **Timeout:** 180 seconds

**System Prompt:**
```
You are a systems synthesis expert. You will receive domain research briefs about 
a socio-environmental system. Your task is to synthesize these into a cohesive 
System Overview Report.

The report should include:
1. System Description and Significance (500 words)
2. Geographic and Temporal Scope
3. Key Stakeholders
4. Major Challenges and Dynamics
5. Cross-Domain Interactions
6. Critical Uncertainties

Also produce a consolidated list of:
- All identified variables with their domains
- All identified causal relationships
- Key sources
```

**Output:**
```json
{
  "system_overview": "markdown narrative (2000-3000 words)",
  "consolidated_variables": [{"name": "", "domain": "", "description": "", "source": ""}],
  "consolidated_relationships": [{"from": "", "to": "", "direction": "", "mechanism": "", "source": ""}],
  "key_sources": [""]
}
```

#### 4.7 Parse System Overview
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Update state with overview and consolidated data

#### 4.8 Research Gap Check
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-sonnet-4.5`

**System Prompt:**
```
You are reviewing research completeness for a causal system mapping project. Check for:
1. Domains with fewer than 5 identified variables
2. Domains with no identified causal relationships
3. Cross-domain relationships that are mentioned but not well-evidenced
4. Contradictions between domain briefs
```

**Output:**
```json
{
  "gaps_found": boolean,
  "gaps": [
    {
      "domain": "string",
      "gap_type": "insufficient_variables|missing_relationships|weak_evidence|contradiction",
      "description": "string",
      "suggested_queries": ["string"]
    }
  ],
  "summary": "string"
}
```

#### 4.9 Parse Gap Check
- **Type:** `n8n-nodes-base.set`

#### 4.10 Gaps Found?
- **Type:** `n8n-nodes-base.if`
- **Condition:** `gaps_found === true AND iteration_counts.research_gap_fill < 2`
- **True branch:** Loop back for more research
- **False branch:** Continue to Phase 2

#### 4.11 Increment Research Counter
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Increment `iteration_counts.research_gap_fill`

#### 4.12 Continue to Phase 2
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Pass state to next phase

---

## 5. Phase 2: Variable Identification

### Purpose
Extract a comprehensive, quality-controlled list of system variables.

### Iteration Logic
- **Max iterations:** 3
- **Exit conditions:** Review passes OR max iterations reached

### Nodes

#### 5.1 Init Variable Iteration
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Set `iteration_counts.variable_revision = 0`

#### 5.2 Variable Extractor
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-opus-4.6`
- **Max Tokens:** 8192
- **Timeout:** 300 seconds

**System Prompt:**
```
You are a systems analyst constructing a causal system map. You will receive a 
research corpus about [SYSTEM_NAME]. Your task is to extract all significant 
system variables.

RULES:
1. DIRECTIONAL NEUTRALITY: Every variable name must be a quantity that can 
   increase or decrease. 
   ✓ "Ocean Temperature" ✗ "Ocean Warming"
   ✓ "Stock Biomass" ✗ "Stock Decline"  
   ✓ "Compliance Rate" ✗ "Improved Compliance"
   
2. MEASURABILITY: Each variable must represent something that can be measured, 
   counted, rated, or assessed. Avoid abstract meta-concepts.
   ✓ "Dissolved Oxygen Concentration" ✗ "Water Quality"
   ✓ "Species Abundance" ✗ "Ecosystem Health"
   
3. GRANULARITY: Variables should be specific enough to have clear causal 
   relationships but general enough to avoid redundancy.
   Too specific: "January Rainfall in Zone 3"
   Too general: "Climate"
   Right level: "Seasonal Rainfall"

4. DOMAIN COVERAGE: Ensure representation across all identified domains.

5. INTERVENABILITY: Mark variables as intervenable=true ONLY if they can be 
   directly set or controlled by management/policy action (e.g., catch limits, 
   closed areas, subsidy levels). Most variables are intervenable=false.

Domains to cover: FOCAL FACTORS, Environmental-Ecosystem, Stock, Technical, 
Economics-Markets, Management, Social, Indigenous

Extract 60-100 variables. Output as JSON.
```

**Output Schema (Variable):**
```json
{
  "variables": [
    {
      "id": "V1",
      "name": "string (2-5 words, directionally neutral)",
      "domain": "FOCAL FACTORS|Environmental-Ecosystem|Stock|Technical|Economics-Markets|Management|Social|Indigenous",
      "intervenable": boolean,
      "definition": "1-3 sentence description",
      "evidence_sources": ["source references"],
      "similar_terms": ["alternative names"]
    }
  ]
}
```

#### 5.3 Parse Variables
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Update state with extracted variables

#### 5.4 Variable Reviewer
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-sonnet-4.5`

**System Prompt:**
```
You are reviewing a variable list for a causal system map. Check each criterion 
and provide specific remediation instructions.

CHECKLIST:
1. DIRECTIONAL NEUTRALITY: No variable name or definition contains: increase, 
   decrease, improve, decline, growth, reduction, better, worse, loss, gain, 
   degradation, enhancement
2. UNIQUENESS: No two variables represent the same concept under different names
3. MEASURABILITY: Every variable describes something that can be quantified or assessed
4. DOMAIN COVERAGE: Every domain has >=3 variables
5. FOCAL VARIABLES: 1-3 variables marked as FOCAL FACTORS domain
6. COUNT TARGET: Total within ±20% of target (60-100)
7. INTERVENABILITY: At least 2 variables marked intervenable=true
8. ORPHAN RISK: No variable appears disconnected from all others
```

**Output:**
```json
{
  "passed": boolean,
  "checks": [
    {
      "check_name": "string",
      "passed": boolean,
      "issues": ["specific issues found"],
      "remediation": ["specific fixes needed"]
    }
  ],
  "summary": "string",
  "variable_count": number,
  "variables_by_domain": {}
}
```

#### 5.5 Parse Variable Review
- **Type:** `n8n-nodes-base.set`

#### 5.6 Variable Review Passed?
- **Type:** `n8n-nodes-base.if`
- **Condition:** `review.passed === true`
- **True branch:** Continue to Phase 3
- **False branch:** Check max iterations

#### 5.7 Max Variable Iterations?
- **Type:** `n8n-nodes-base.if`
- **Condition:** `iteration_counts.variable_revision >= 3`
- **True branch:** Continue with warnings
- **False branch:** Revise variables

#### 5.8 Increment Variable Counter
- **Type:** `n8n-nodes-base.set`

#### 5.9 Variable Reviser
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-opus-4.6`
- **Purpose:** Apply review feedback and produce revised variable list

#### 5.10 Parse Revised Variables
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Update state and loop back to reviewer

#### 5.11 Continue to Phase 3
- **Type:** `n8n-nodes-base.set`

---

## 6. Phase 3: Relationship Extraction

### Purpose
Identify all causal relationships between variables with polarity, strength, delay, and mechanistic explanations.

### Iteration Logic
- **Max iterations:** 3
- **Exit conditions:** Review passes OR max iterations reached

### Nodes

#### 6.1 Init Relationship Iteration
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Set `iteration_counts.relationship_revision = 0`

#### 6.2 Relationship Extractor
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-opus-4.6`
- **Max Tokens:** 16384
- **Timeout:** 300 seconds

**System Prompt:**
```
You are a systems analyst extracting causal relationships for a causal loop diagram 
of [SYSTEM_NAME]. You will receive a list of validated variables and the research corpus.

For each relationship, you must identify:
- FROM: The causal source variable (use variable ID, e.g., V1)
- TO: The variable being affected (use variable ID, e.g., V2)
- POLARITY: "same" if increase in FROM causes increase in TO; "opposite" if 
  increase in FROM causes decrease in TO.
- STRENGTH: "strong" (primary driver), "medium" (significant modulator), 
  "weak" (minor influence)
- DELAY: "days", "months", "years", or "decade"
- DEFINITION: A 1-2 sentence explanation of the CAUSAL MECHANISM (not just 
  "X affects Y" but WHY and HOW)

CRITICAL RULES:
1. Every relationship must be supported by evidence from the research corpus.
2. The definition must explain the mechanism, not just restate the polarity.
   ✗ "Higher temperature increases mortality" 
   ✓ "Rising water temperature reduces dissolved oxygen and increases metabolic 
      stress, elevating mortality rates particularly in demersal species near 
      their thermal tolerance limits."
3. Consider relationships ACROSS domains, not just within them.
4. Do not assume relationships exist just because variables are in the same domain.
5. Check: if I increase the FROM variable by 10%, does the TO variable plausibly 
   change? If not, don't include the relationship.

APPROACH:
Process relationships in this order:
1. All relationships involving focal variables
2. Intra-domain relationships for each domain
3. Cross-domain relationships between adjacent domains
4. Any remaining relationships you identify

Target: 80-160 relationships.
```

**Output Schema (Relationship):**
```json
{
  "relationships": [
    {
      "relationship_id": 1,
      "from_factor_id": "V1",
      "to_factor_id": "V2",
      "polarity": "same|opposite",
      "strength": "strong|medium|weak",
      "delay": "days|months|years|decade",
      "definition": "mechanism explanation",
      "evidence_sources": ["source references"],
      "confidence": "high|medium|low"
    }
  ]
}
```

#### 6.3 Parse Relationships
- **Type:** `n8n-nodes-base.set`

#### 6.4 Relationship Reviewer
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-sonnet-4.5`

**System Prompt:**
```
You are reviewing a relationship list for a causal system map.

CHECKLIST:
1. EVIDENCE GROUNDING: Every relationship cites at least one evidence source
2. LOGICAL COHERENCE: Polarity is consistent with the causal mechanism described
3. NO SELF-LOOPS: No variable relates to itself
4. NO EXACT DUPLICATES: No two relationships have the same from->to pair
5. BIDIRECTIONAL CHECK: If A->B and B->A both exist, verify they represent 
   distinct mechanisms
6. ORPHAN CHECK: Every variable participates in at least one relationship
7. POLARITY DISTRIBUTION: Roughly 55-85% same, 15-45% opposite
8. STRENGTH DISTRIBUTION: Roughly 10-30% strong, 50-80% medium, 5-20% weak
9. DELAY DISTRIBUTION: Reasonable spread across days/months/years/decade
10. DEFINITION QUALITY: Each definition explains the mechanism, not just 
    restates the polarity
```

**Output:**
```json
{
  "passed": boolean,
  "checks": [...],
  "summary": "string",
  "statistics": {
    "total_relationships": number,
    "polarity_distribution": {},
    "strength_distribution": {},
    "delay_distribution": {},
    "orphaned_variables": []
  }
}
```

#### 6.5-6.10 (Similar structure to Phase 2)
Review loop with revision cycle, max 3 iterations.

#### 6.11 Continue to Phase 4
- **Type:** `n8n-nodes-base.set`

---

## 7. Phase 4: Feedback Loops & Gap Analysis

### Purpose
Identify feedback loop structures and check for gaps in the system map.

### Iteration Logic
- **Max iterations:** 2
- **Exit conditions:** No significant gaps OR max iterations reached

### Nodes

#### 7.1 Feedback Loop Analyst
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-sonnet-4.5`
- **Timeout:** 180 seconds

**System Prompt:**
```
You are a systems analyst identifying feedback loops in a causal system map.

Your task:
1. Trace closed paths (cycles) through the relationship graph (cycles of length 2-8)
2. Classify each loop as:
   - REINFORCING: even number of 'opposite' polarities in the cycle (amplifying change)
   - BALANCING: odd number of 'opposite' polarities in the cycle (counteracting change)
3. Assess loop strength based on the weakest relationship in the chain
4. Document the mechanism - how does this loop operate in the real system?
```

**Output Schema (Feedback Loop):**
```json
{
  "feedback_loops": [
    {
      "loop_id": "FL1",
      "name": "descriptive name",
      "type": "reinforcing|balancing",
      "variables": ["V1", "V2", ...],
      "relationships": [1, 2, ...],
      "strength": "strong|medium|weak",
      "description": "narrative description of how this loop operates",
      "system_impact": "major|minor"
    }
  ],
  "analysis_summary": "string"
}
```

#### 7.2 Parse Feedback Loops
- **Type:** `n8n-nodes-base.set`

#### 7.3 Gap Analyst
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-sonnet-4.5`

**System Prompt:**
```
You are conducting gap analysis on a causal system map.

STRUCTURAL ANALYSIS:
- Variables with only incoming or only outgoing relationships (sinks/sources)
- Domains with fewer relationships than expected
- Variable pairs that seem logically connected but have no relationship

THEMATIC ANALYSIS:
- Are climate change impacts represented?
- Are management interventions connected to their targets?
- Are market dynamics linked to harvesting decisions?
- Are social/community impacts linked to economic variables?
- Is Indigenous knowledge integrated (where applicable)?

DISTRIBUTION CHECKS (SESSF benchmarks):
- Variables: 40-120 total
- Relationships: 60-200 total
- Polarity: 55-85% same, 15-45% opposite
- Strength: 10-30% strong, 50-80% medium, 5-20% weak
```

**Output:**
```json
{
  "significant_gaps": boolean,
  "structural_gaps": [...],
  "thematic_gaps": [...],
  "distribution_issues": [],
  "summary": "string"
}
```

#### 7.4 Parse Gap Analysis
- **Type:** `n8n-nodes-base.set`

#### 7.5 Significant Gaps?
- **Type:** `n8n-nodes-base.if`
- **Condition:** `significant_gaps === true AND iteration_counts.final_gap_fill < 2`

#### 7.6 Increment Gap Counter
- **Type:** `n8n-nodes-base.set`

#### 7.7 Targeted Gap Research
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `perplexity/sonar-deep-research`
- **Purpose:** Research specific gaps identified by Gap Analyst

#### 7.8 Continue to Phase 5
- **Type:** `n8n-nodes-base.set`

---

## 8. Phase 5: Integration & Output

### Purpose
Final quality control, Excel generation, and response delivery.

### Nodes

#### 8.1 Quality Controller
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-opus-4.6`
- **Timeout:** 300 seconds

**System Prompt:**
```
You are the quality controller for a causal system map of [SYSTEM_NAME]. You will 
receive the complete variable list, relationship list, and feedback loops. Perform 
a comprehensive quality assessment.

CHECK LIST:
1. STRUCTURAL INTEGRITY
   - Every variable has ≥1 relationship (no orphans)
   - No self-referential relationships
   - No duplicate relationships
   - Focal variables are highly connected

2. LOGICAL COHERENCE
   - For each feedback loop: trace the polarity chain and verify the loop 
     classification (reinforcing vs balancing)
   - No contradictory relationship pairs

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

Output a structured quality report with pass/fail for each check, specific issues 
found, and recommended corrections.
```

**Output Schema (Quality Report):**
```json
{
  "overall_pass": boolean,
  "checks": [
    {
      "check_name": "string",
      "passed": boolean,
      "details": "string",
      "corrections": ["string"]
    }
  ],
  "statistics": {
    "total_variables": number,
    "total_relationships": number,
    "total_feedback_loops": number,
    "variables_by_domain": {},
    "relationships_by_polarity": {},
    "relationships_by_strength": {},
    "relationships_by_delay": {},
    "orphan_count": number
  },
  "warnings": ["string"]
}
```

#### 8.2 Parse QC Report
- **Type:** `n8n-nodes-base.set`

#### 8.3 QC Passed?
- **Type:** `n8n-nodes-base.if`
- **True branch:** Generate Excel
- **False branch:** Apply corrections then generate Excel

#### 8.4 Apply QC Corrections
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Add warnings to state when QC fails

#### 8.5 Generate Excel
- **Type:** `n8n-nodes-base.code`
- **Language:** JavaScript

**Function:**
- Creates FACTORS sheet with columns: factor_id, name, domain_name, intervenable, definition
- Creates RELATIONSHIPS sheet with columns: relationship_id, from, to, from_factor_id, to_factor_id, polarity, strength, delay, definition
- Sorts by ID (natural sort)
- Applies VLOOKUP formulas for from/to names

**Output:** Excel data structure for downstream processing

#### 8.6 Summary Reporter
- **Type:** `n8n-nodes-base.httpRequest`
- **Model:** `anthropic/claude-sonnet-4.5`

**Purpose:** Generate human-readable markdown summary including:
- System description
- Map statistics
- Key findings
- Methodology notes
- Source bibliography

#### 8.7 Prepare Response
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Format final response

#### 8.8 Respond to Webhook
- **Type:** `n8n-nodes-base.respondToWebhook`
- **Response Code:** 200
- **Content:** JSON with success status, statistics, summary, and Excel data

---

## 9. Intermediate Output Nodes (Audit Trail)

The workflow includes dedicated nodes that generate markdown-formatted reports at each major phase completion. These reports serve as:

1. **Audit Trail** - Complete record of what was produced at each stage
2. **Quality Control** - Ability to review intermediate outputs before final completion
3. **Debugging** - Identify where issues occur in the workflow
4. **Documentation** - Human-readable reports of the map construction process

### 9.1 Output: Research Plan

**Location:** After `Parse Research Plan` (Phase 0)
**Node Type:** `n8n-nodes-base.code`

**Report Contents:**
- System name and geographic scope
- Focal variables identified
- List of research domains with their queries
- Target counts and user constraints

**Example Output:**
```markdown
# Research Plan Report

**System:** Northern Prawn Fishery
**Phase:** 0 - Initialization
**Generated:** 2026-02-06T10:30:00Z

---

## System Scope
- **Name:** Northern Prawn Fishery
- **Geographic Scope:** Gulf of Carpentaria and adjacent waters, Northern Australia
- **Focal Variables:** Prawn Stock Biomass

## Research Domains (7)

### 1. Environmental-Ecosystem (ENV)
**Research Queries:**
1. Northern Prawn Fishery environmental conditions ocean temperature monsoon rainfall
2. Gulf of Carpentaria marine ecosystem seagrass mangrove habitat
3. NPF bycatch turtle seabird syngnathid environmental impacts

**Key Sources:** CSIRO, AFMA, ABARES

[... additional domains ...]

## Configuration
- **Target Variables:** 60-100
- **Target Relationships:** 80-160
- **User Constraints:** None specified
```

### 9.2 Output: Domain Briefs

**Location:** After `Merge Domain Briefs` (Phase 1)
**Node Type:** `n8n-nodes-base.code`

**Report Contents:**
- Summary of each domain's research findings
- Key variables identified per domain
- Preliminary relationships discovered
- Sources and citations

### 9.3 Output: System Overview

**Location:** After `Parse System Overview` (Phase 1)
**Node Type:** `n8n-nodes-base.code`

**Report Contents:**
- Full system narrative (2000-3000 words)
- Consolidated variable list from all domains
- Preliminary relationship list
- Knowledge gaps identified

### 9.4 Output: Variable List

**Location:** After `Continue to Phase 3` (Phase 2)
**Node Type:** `n8n-nodes-base.code`

**Report Contents:**
- Complete variable table with all fields
- Statistics by domain
- Review status and iteration count
- Any warnings from review process

**Example Output:**
```markdown
# Variable List Report

**System:** Northern Prawn Fishery
**Phase:** 2 - Variable Identification
**Generated:** 2026-02-06T11:45:00Z
**Review Iterations:** 2

---

## Summary
Extracted 78 variables across 8 domains. Review passed on iteration 2.

## Variables by Domain

| Domain | Count | % |
|--------|-------|---|
| FOCAL FACTORS | 1 | 1.3% |
| Environmental-Ecosystem | 15 | 19.2% |
| Stock | 8 | 10.3% |
| Technical | 14 | 17.9% |
| Economics-Markets | 18 | 23.1% |
| Management | 6 | 7.7% |
| Social | 9 | 11.5% |
| Indigenous | 7 | 9.0% |
| **Total** | **78** | **100%** |

## Complete Variable List

| ID | Name | Domain | Intervenable | Definition |
|----|------|--------|--------------|------------|
| V1 | Prawn Stock Biomass | FOCAL FACTORS | No | Total biomass of banana and tiger prawns... |
| V2 | Sea Surface Temperature | Environmental-Ecosystem | No | Average water temperature... |
[... full list ...]

## Review Notes
- Iteration 1: Failed directional neutrality check (3 variables renamed)
- Iteration 2: All checks passed
```

### 9.5 Output: Relationship List

**Location:** After `Continue to Phase 4` (Phase 3)
**Node Type:** `n8n-nodes-base.code`

**Report Contents:**
- Complete relationship matrix
- Polarity, strength, and delay distributions
- Mechanism definitions
- Review status

### 9.6 Output: Feedback & Gap Report

**Location:** After `Continue to Phase 5` (Phase 4)
**Node Type:** `n8n-nodes-base.code`

**Report Contents:**
- Feedback loops catalog with classifications
- Gap analysis results
- Structural metrics
- Targeted research queries (if gaps filled)

**Example Output:**
```markdown
# Feedback Loops & Gap Analysis Report

**System:** Northern Prawn Fishery
**Phase:** 4 - Feedback Loops & Gap Analysis
**Generated:** 2026-02-06T12:30:00Z

---

## Feedback Loops Identified: 12

### Reinforcing Loops (7)

#### FL1: Stock-Recruitment Reinforcing Loop
- **Type:** Reinforcing
- **Strength:** Strong
- **Variables:** V1 (Stock Biomass) → V3 (Recruitment) → V1
- **Mechanism:** Higher stock biomass produces more recruits...

[... additional loops ...]

### Balancing Loops (5)

#### FL8: Fishing Pressure Balancing Loop
- **Type:** Balancing
- **Strength:** Medium
[...]

## Gap Analysis

### Structural Analysis
- Variables with only incoming connections: 3 (V45, V67, V72)
- Variables with only outgoing connections: 2 (V12, V38)
- Orphaned variables: 0

### Thematic Analysis
- ✅ Climate impacts represented
- ✅ Management interventions connected
- ✅ Market dynamics linked
- ⚠️ Indigenous knowledge integration: Limited (3 relationships)

### Significant Gaps Found: No
```

### 9.7 Output: Final Report

**Location:** After `Summary Reporter` (Phase 5)
**Node Type:** `n8n-nodes-base.code`

**Report Contents:**
- Quality control results
- Complete statistics
- Summary narrative
- All warnings and issues
- Source bibliography

### 9.8 Accessing Intermediate Outputs

**In the Final Response:**
All intermediate reports are included in the `audit_trail` field:

```json
{
  "success": true,
  "system_name": "Northern Prawn Fishery",
  "statistics": {...},
  "audit_trail": {
    "research_plan_report": "# Research Plan Report\n...",
    "domain_briefs_report": "# Domain Briefs Report\n...",
    "system_overview_report": "# System Overview Report\n...",
    "variable_list_report": "# Variable List Report\n...",
    "relationship_list_report": "# Relationship List Report\n...",
    "feedback_gap_report": "# Feedback & Gap Report\n...",
    "final_report": "# Final Quality Report\n..."
  }
}
```

**In the n8n UI:**
Each "Output: [Phase]" node displays the markdown report in its output panel, allowing inspection during debugging.

---

## 10. State Object Reference

The workflow maintains a state object that passes through all nodes:

```json
{
  "system_name": "string - Name of the socio-environmental system",
  
  "research_plan": {
    "system_name": "string",
    "geographic_scope": "string",
    "focal_variables": ["string"],
    "domains": [
      {
        "domain_id": "string",
        "domain_name": "string",
        "research_queries": ["string"],
        "key_sources": ["string"]
      }
    ],
    "user_constraints": ["string"],
    "target_variable_count": "string",
    "target_relationship_count": "string"
  },
  
  "domain_briefs": [
    {
      "domain_id": "string",
      "domain_name": "string",
      "research_queries": ["string"],
      "brief_content": "string - Full research brief",
      "citations": ["string"]
    }
  ],
  
  "system_overview": "string - 2000-3000 word markdown narrative",
  
  "consolidated_variables": [
    {
      "name": "string",
      "domain": "string",
      "description": "string",
      "source": "string"
    }
  ],
  
  "consolidated_relationships": [
    {
      "from": "string",
      "to": "string",
      "direction": "string",
      "mechanism": "string",
      "source": "string"
    }
  ],
  
  "variables": [
    {
      "id": "string (V1, V2, ...)",
      "name": "string",
      "domain": "string",
      "intervenable": boolean,
      "definition": "string",
      "evidence_sources": ["string"],
      "similar_terms": ["string"]
    }
  ],
  
  "relationships": [
    {
      "relationship_id": number,
      "from_factor_id": "string",
      "to_factor_id": "string",
      "polarity": "same|opposite",
      "strength": "strong|medium|weak",
      "delay": "days|months|years|decade",
      "definition": "string",
      "evidence_sources": ["string"],
      "confidence": "high|medium|low"
    }
  ],
  
  "feedback_loops": [
    {
      "loop_id": "string (FL1, FL2, ...)",
      "name": "string",
      "type": "reinforcing|balancing",
      "variables": ["string"],
      "relationships": [number],
      "strength": "strong|medium|weak",
      "description": "string",
      "system_impact": "major|minor"
    }
  ],
  
  "gap_analysis": {
    "significant_gaps": boolean,
    "structural_gaps": [],
    "thematic_gaps": [],
    "distribution_issues": [],
    "summary": "string"
  },
  
  "quality_report": {
    "overall_pass": boolean,
    "checks": [],
    "statistics": {},
    "warnings": []
  },
  
  "iteration_counts": {
    "research_gap_fill": 0,
    "variable_revision": 0,
    "relationship_revision": 0,
    "final_gap_fill": 0
  },
  
  "warnings": ["string - Non-fatal issues encountered"],
  
  "errors": ["string - Errors that were handled"]
}
```

---

## 11. Configuration Guide

### 10.1 Required Credential

**OpenRouter API (HTTP Header Auth)**

| Field | Value |
|-------|-------|
| Name | `OpenRouter API` |
| Header Name | `Authorization` |
| Header Value | `Bearer YOUR_OPENROUTER_API_KEY` |

Get your API key from: https://openrouter.ai/keys

### 10.2 Nodes Requiring Credential

All 15 HTTP Request nodes must have the OpenRouter credential assigned:

1. Research Leader
2. Domain Research (Perplexity)
3. System Overview Writer
4. Research Gap Check
5. Variable Extractor
6. Variable Reviewer
7. Variable Reviser
8. Relationship Extractor
9. Relationship Reviewer
10. Relationship Reviser
11. Feedback Loop Analyst
12. Gap Analyst
13. Targeted Gap Research
14. Quality Controller
15. Summary Reporter

### 10.3 Instance Requirements

| Setting | Minimum | Recommended |
|---------|---------|-------------|
| Execution timeout | 60 minutes | 90 minutes |
| Memory | 512 MB | 1 GB |
| Node execution timeout | 5 minutes | 10 minutes |

### 10.4 OpenRouter Requirements

| Requirement | Details |
|-------------|---------|
| Account credits | $25-55 per run |
| Model access | Claude Opus 4.5, Claude Sonnet 4.5, Perplexity Sonar |

### 10.5 Google Drive Integration (Optional)

The workflow can optionally save all intermediate reports to Google Drive for audit trail, collaboration, and archival purposes.

#### Enabling the Feature

**Option 1: Via Webhook/API**
```json
{
  "system_description": "The Northern Prawn Fishery...",
  "save_to_google_drive": true
}
```

**Option 2: Via Form Trigger**
Check the "Save reports to Google Drive" checkbox on the form.

#### Required Credential

Create a Google Drive OAuth2 credential in n8n:
1. Go to **Credentials → Add Credential → Google Drive OAuth2 API**
2. Follow the OAuth setup flow with your Google account
3. Ensure the credential has write access to Google Drive

#### Folder Structure Created

When enabled, the workflow creates a folder at the start of execution:

```
SES_Causal_Map_[SystemName]_[YYYY-MM-DD_HH-MM]/
├── 00_Research_Plan.md                (uploaded after Phase 0)
├── 01_Domain_Brief_ENV.md             (uploaded as each domain completes)
├── 01_Domain_Brief_STOCK.md           
├── 01_Domain_Brief_TECH.md            
├── 01_Domain_Brief_ECON.md            
├── 01_Domain_Brief_MGMT.md            
├── 01_Domain_Brief_SOC.md             
├── 01_Domain_Brief_IND.md             
├── 01_Domain_Briefs_Consolidated.md   (uploaded after all domains merge)
├── 02_System_Overview.md              (uploaded after Phase 1 synthesis)
├── 03_Variable_List.md                (uploaded after Phase 2)
├── 04_Relationship_List.md            (uploaded after Phase 3)
├── 05_Feedback_Gap_Analysis.md        (uploaded after Phase 4)
└── 06_Final_Report.md                 (uploaded after Phase 5)
```

#### Progressive Upload

Reports are uploaded **immediately after each step completes**, not batched at the end. This means:
- **Individual domain briefs** are saved inside the research loop - if domain 5 fails, domains 1-4 are already saved
- If the workflow fails at Phase 3, you still have reports 00-02 saved
- You can monitor progress by checking the folder during execution
- Stakeholders can review early outputs while later phases run

#### Nodes Involved

| Node | Purpose |
|------|---------|
| **Check GDrive Enabled** | Routes based on `save_to_google_drive` flag |
| **Create GDrive Folder** | Creates the timestamped folder in Google Drive |
| **Store Folder ID** | Saves folder ID to state for subsequent uploads |
| **Skip Brief Upload?** | Checks if GDrive enabled inside domain research loop |
| **Upload: Individual Brief** | Uploads each domain brief as it completes (inside loop) |
| **Skip Upload N?** | 7 If nodes that check if GDrive is enabled for phase outputs |
| **Upload: [Report Name]** | 7 Google Drive nodes that upload each consolidated report |

**Total Google Drive upload nodes:** 9 (1 for individual domain briefs + 8 for phase reports)

#### Configuration Options

| Parameter | Location | Description |
|-----------|----------|-------------|
| `save_to_google_drive` | Input JSON / Form | Enable/disable feature (default: false) |
| Parent Folder ID | Create GDrive Folder node | Optional: specify a folder to create subfolders in |

#### Behaviour Summary

| Setting | Google Drive | Audit Trail in Response |
|---------|--------------|------------------------|
| `save_to_google_drive: false` | No API calls | Yes (always included) |
| `save_to_google_drive: true` | Creates folder + uploads files | Yes (always included) |

---

## 12. Testing Guide

### 11.1 Test Input (SESSF Reference)

```json
{
  "system_description": "The South East Australian Shark and Scalefish Fishery (SESSF) - a multi-species trawl and gillnet fishery operating along Australia's southeastern continental shelf and slope, targeting species including blue grenadier, pink ling, and flathead. The fishery is managed by AFMA under quota management with gear restrictions and spatial closures.",
  "target_variable_count": "60-100",
  "target_relationship_count": "80-160"
}
```

### 11.2 Testing via Manual Trigger

1. Open workflow in n8n editor
2. Click on "Manual Trigger" node
3. Click "Test step" or "Test workflow"
4. Monitor execution in the editor

### 11.3 Testing via Webhook

```bash
curl -X POST https://your-n8n-instance/webhook/causal-map \
  -H "Content-Type: application/json" \
  -d '{
    "system_description": "The Northern Prawn Fishery in Australia",
    "target_variable_count": "60-100",
    "target_relationship_count": "80-160"
  }'
```

### 11.4 Expected Response

```json
{
  "success": true,
  "system_name": "Northern Prawn Fishery",
  "statistics": {
    "total_variables": 85,
    "total_relationships": 142
  },
  "summary_report": "# Northern Prawn Fishery Causal System Map...",
  "quality_report": {
    "overall_pass": true,
    "statistics": {...}
  },
  "warnings": [],
  "iteration_counts": {
    "research_gap_fill": 1,
    "variable_revision": 2,
    "relationship_revision": 1,
    "final_gap_fill": 0
  },
  "excel_filename": "Northern_Prawn_Fishery_Causal_Map.xlsx"
}
```

---

## 13. Troubleshooting

### Common Issues

#### API Rate Limits
**Symptom:** 429 errors from OpenRouter
**Solution:** Reduce parallel research calls or add delays between requests

#### Timeout Errors
**Symptom:** Execution stops at Claude Opus nodes
**Solution:** Increase node timeout to 300+ seconds

#### Invalid JSON Response
**Symptom:** Parse errors after LLM calls
**Solution:** Check if response is truncated (increase max_tokens)

#### Orphan Variables
**Symptom:** QC fails with orphan variables
**Solution:** Normal - will be addressed in relationship revision loops

#### Credential Not Found
**Symptom:** 401 errors
**Solution:** Assign OpenRouter credential to all HTTP Request nodes

### Debug Mode

To debug individual phases:
1. Disable nodes after the phase you want to test
2. Run with Manual Trigger
3. Inspect node outputs in the editor

---

## 14. Cost & Performance

### Estimated Costs per Run

| Phase | API Calls | Token Usage | Cost (USD) |
|-------|-----------|-------------|------------|
| Phase 0 | 1 | ~7K | $0.05 |
| Phase 1 | 18-40 | ~280K | $5-15 |
| Phase 2 | 2-8 | ~130K | $5-12 |
| Phase 3 | 2-8 | ~200K | $8-15 |
| Phase 4 | 3-10 | ~110K | $3-10 |
| Phase 5 | 2-4 | ~80K | $3-6 |
| **Total** | **28-71** | **~800K** | **$25-55** |

### Performance Metrics

| Metric | Target |
|--------|--------|
| Total execution time | < 60 minutes |
| Variable orphan rate | 0% |
| Domain coverage | 100% |
| Evidence grounding | ≥ 90% |
| Sim4Action compatibility | 100% |

### Output Quality Targets

| Metric | Target Range |
|--------|--------------|
| Total variables | 40-120 |
| Total relationships | 60-200 |
| Polarity (same) | 55-85% |
| Polarity (opposite) | 15-45% |
| Strength (strong) | 10-30% |
| Strength (medium) | 50-80% |
| Strength (weak) | 5-20% |
| Delay (days) | 5-20% |
| Delay (months) | 30-50% |
| Delay (years) | 25-50% |
| Delay (decade) | 0-15% |
| Intervenable variables | 3-15% |

---

## Appendix: Domain Reference

### Standard Domains

| Domain ID | Domain Name | Description |
|-----------|-------------|-------------|
| FOCAL | FOCAL FACTORS | Central variables the system revolves around |
| ENV | Environmental-Ecosystem | Climate, ocean conditions, habitat, biodiversity |
| STOCK | Stock | Target species population dynamics |
| TECH | Technical | Fishing gear, vessels, technology |
| ECON | Economics-Markets | Prices, costs, trade, markets |
| MGMT | Management | Regulations, quotas, closures, governance |
| SOC | Social | Communities, employment, wellbeing |
| IND | Indigenous | Traditional knowledge, rights, practices |

---

*Document generated for SES Causal Map Generator workflow v1.0*
