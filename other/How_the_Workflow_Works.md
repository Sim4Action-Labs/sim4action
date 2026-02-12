# How the SES Causal Map Workflow Works

**A Plain-English Guide**

---

## What Is This Workflow?

Imagine you want to understand a complex environmental system — like a fishery, a forest, or a river basin — and map out all the things that influence each other within it. What affects what? If one thing changes, what else changes as a result?

This workflow is an automated AI-powered research team that does exactly that. You give it a plain description of a system (for example, "The Northern Prawn Fishery in Australia"), and it produces a structured map of all the important factors and how they connect — a **causal system map**.

The final output is an Excel spreadsheet that lists every important variable (like "Water Temperature" or "Fish Stock Biomass") and every cause-and-effect relationship between them, ready to be loaded into the Sim4Action analysis platform.

---

## The Team: Who Does What?

The workflow uses three different AI models, each chosen for what it does best. Think of them as specialists on a research team.

### The Research Leader (Claude Sonnet)

This is the **project manager**. It plans the research, coordinates the team, reviews work, writes summaries, and makes sure everything meets quality standards. It handles tasks that require good judgement and clear communication but don't need the deepest analytical thinking.

**Tasks it handles:**
- Creating the research plan
- Writing the system overview
- Checking for research gaps
- Reviewing variables and relationships
- Analysing feedback loops and gaps
- Writing the final summary report

### The Deep Analysts (Claude Opus)

These are the **senior researchers** — the heavy hitters brought in for the most intellectually demanding work. They do the detailed extraction and analysis that requires deep reasoning and careful attention to rules.

**Tasks they handle:**
- Extracting variables from research (with strict naming and quality rules)
- Revising variables when the reviewer finds problems
- Extracting causal relationships (with detailed mechanism explanations)
- Revising relationships when the reviewer finds problems
- Running the final quality control check

### The Field Researchers (Perplexity Sonar)

These are the **internet researchers**. They go out and search the web for real, current information about the system — scientific papers, government reports, news articles — and come back with factual findings and citations.

**Tasks they handle:**
- Researching each domain of the system (environment, economics, social impacts, etc.)
- Conducting targeted follow-up research when gaps are found

---

## How They Work Together: Step by Step

### Step 1: You Describe the System

You start by telling the workflow what system you want to map. You can do this in three ways:

- **Fill out a web form** — a simple form where you type a description and pick some options
- **Send an API request** — a JSON message sent to the workflow's web address
- **Use the manual trigger** — for testing inside the n8n editor

You provide:
- A description of the system (required) — e.g., "The South East Australian Shark and Scalefish Fishery, a multi-species trawl and gillnet fishery..."
- Optionally, how many variables and relationships you'd like (defaults are 60–100 variables and 80–160 relationships)
- Optionally, any specific constraints or focus areas

### Step 2: The Research Leader Creates a Plan

The Research Leader reads your description and creates a structured research plan. It:

1. **Defines the system scope** — gives it a name, identifies the geography, and sets the time frame
2. **Identifies 6–8 research domains** — these are the different angles from which to study the system. For a fishery, this might be: Environment, Fish Stocks, Fishing Technology, Economics, Management, Social Impacts, and Indigenous Knowledge
3. **Writes specific research questions** for each domain — 3–5 targeted, search-optimised queries per domain
4. **Identifies focal variables** — the 1–3 most central things the whole system revolves around (e.g., "Prawn Stock Biomass" for a prawn fishery)

The plan is tailored to the specific system. A forest ecosystem gets different domains than a fishery. An Australian system gets different governance questions than a Southeast Asian one.

> **Report saved:** Research Plan Report

### Step 3: The Field Researchers Investigate Each Domain

Now the Field Researchers (Perplexity Sonar) go to work. They take the research plan and, **one domain at a time**, conduct deep web searches using the prepared queries.

For each domain, a Field Researcher produces a **Domain Research Brief** containing:

- **Key findings** — a 500–1,000 word summary of what they found
- **Variables spotted** — things that can go up or down in this domain
- **Relationships spotted** — early observations about what causes what
- **Key dynamics** — feedback loops, time delays, or tipping points they noticed
- **Knowledge gaps** — things they couldn't find good information about
- **Sources** — citations for everything they report

This happens for every domain (typically 6–8), so the workflow loops through each one. If Google Drive saving is enabled, each individual domain brief is saved to Drive as soon as it finishes — so even if something goes wrong later, you still have the early research.

> **Reports saved:** Individual Domain Briefs + Consolidated Domain Briefs

### Step 4: The Research Leader Synthesises Everything

Once all domain research is complete, the Research Leader reads every brief and writes a **System Overview Report**. This is a big-picture synthesis — a 2,000–3,000 word narrative that:

- Describes the system and why it matters
- Identifies key stakeholders
- Highlights the major challenges and dynamics
- Points out how different domains interact with each other
- Notes critical uncertainties

It also produces a **consolidated list** of all the variables and relationships spotted across all domains, merging duplicates and organising them.

> **Report saved:** System Overview Report

### Step 5: The Research Leader Checks for Gaps

Before moving on, the Research Leader reviews the research for completeness:

- Are there any domains with too few variables?
- Are there domains with no identified relationships?
- Are there cross-domain connections mentioned but not well-evidenced?
- Do any domain briefs contradict each other?

If significant gaps are found, the Field Researchers are sent back out to do **targeted follow-up research** on those specific gaps. This can happen up to 2 times to fill in missing information.

### Step 6: The Deep Analysts Extract Variables

Now a Deep Analyst (Claude Opus) takes the entire research corpus and carefully extracts all the important **system variables** — the things that can increase or decrease within this system.

This is a meticulous process with strict rules:

- **Names must be neutral** — "Ocean Temperature" is correct; "Ocean Warming" is wrong (because "warming" implies direction)
- **Variables must be measurable** — "Dissolved Oxygen Concentration" is good; "Water Quality" is too vague
- **Right level of detail** — not too specific ("January Rainfall in Zone 3") and not too broad ("Climate"), but just right ("Seasonal Rainfall")
- **Every domain must be covered** — at least 3 variables per domain
- **Actionable variables are flagged** — things that managers can directly control (like catch limits) are marked as "intervenable"

The target is 60–100 variables, each with an ID (V1, V2, etc.), a name, the domain it belongs to, a definition, and evidence sources.

### Step 7: The Research Leader Reviews the Variables

The Research Leader now acts as a **peer reviewer**, checking the variable list against a detailed checklist:

1. Are all names directionally neutral? (No "increase", "decline", "improvement" in names)
2. Are there duplicates? (Two variables describing the same thing under different names)
3. Is everything measurable?
4. Does every domain have enough variables?
5. Are there focal variables at the centre?
6. Is the total count within the target range?
7. Are some variables marked as intervenable?
8. Are there any orphan variables that seem disconnected?

If the review **passes**, the workflow moves forward. If it **fails**, the reviewer sends specific feedback explaining what's wrong and what to fix.

### Step 8: If Needed, the Deep Analyst Revises

When the review fails, the Deep Analyst receives the specific feedback and produces a **revised variable list** that addresses each issue — renaming variables with directional language, merging duplicates, adding missing domains, etc.

The revised list goes back to the reviewer. This **review-revise loop can repeat up to 3 times**. If it still hasn't fully passed after 3 rounds, the workflow moves forward with warnings attached.

> **Report saved:** Variable List Report

### Step 9: The Deep Analysts Extract Relationships

With a solid variable list in hand, a Deep Analyst now identifies all the **causal relationships** — how the variables affect each other.

For each relationship, the analyst determines:

- **From** which variable **to** which variable (using the IDs)
- **Polarity** — "same" (when one goes up, the other goes up too) or "opposite" (when one goes up, the other goes down)
- **Strength** — strong (primary driver), medium (significant), or weak (minor)
- **Time delay** — how long before the effect is felt (days, months, years, or decades)
- **Mechanism** — a detailed explanation of *why* and *how* the cause-and-effect works, not just that it exists

The analyst works through relationships systematically:
1. First, all relationships involving the focal variables
2. Then, relationships within each domain
3. Then, cross-domain relationships
4. Finally, any others identified

The target is 80–160 relationships, and every one must be backed by evidence from the research.

### Step 10: The Research Leader Reviews Relationships

Just like with variables, the Research Leader reviews the relationship list against its own checklist:

1. Does every relationship cite evidence?
2. Does the polarity match the described mechanism?
3. No variable relates to itself
4. No duplicate relationships
5. If A affects B and B affects A, are those genuinely different mechanisms?
6. Is every variable connected to at least one relationship?
7. Are the distributions reasonable? (roughly 55–85% "same" polarity, balanced strength distribution, etc.)
8. Do the definitions explain the actual mechanism, not just restate the direction?

### Step 11: If Needed, the Deep Analyst Revises Relationships

Same as with variables — if the review fails, specific feedback is given, the analyst revises, and the loop repeats (up to 3 times).

> **Report saved:** Relationship List Report

### Step 12: The Research Leader Identifies Feedback Loops

Now the Research Leader looks at the completed map and traces **feedback loops** — circular chains where a change in one variable eventually comes back around to affect itself.

For example: Higher fish stocks → more fishing effort → lower fish stocks → reduced fishing effort → fish stocks recover → more fishing effort... This is a **balancing loop** — it counteracts change and tends toward equilibrium.

Or: More investment in fishing technology → higher catch rates → more profit → more investment... This is a **reinforcing loop** — it amplifies change and can spiral.

Each loop is classified as reinforcing or balancing, rated by strength, and described in plain language explaining how it works in the real system.

### Step 13: The Research Leader Analyses Gaps in the Map

The Research Leader also checks the entire map for structural and thematic gaps:

**Structural gaps:**
- Variables that only receive influence but don't cause anything (sinks)
- Variables that only cause things but aren't affected by anything (sources)
- Domains with suspiciously few relationships

**Thematic gaps:**
- Are climate impacts represented?
- Are management actions connected to what they manage?
- Are economic forces linked to harvesting decisions?
- Are social impacts connected to economic variables?
- Is Indigenous knowledge integrated (where applicable)?

If significant gaps are found, the Field Researchers are sent out again for targeted research, and the map is updated. This can happen up to 2 times.

> **Report saved:** Feedback Loops & Gap Analysis Report

### Step 14: Final Quality Control

A Deep Analyst (Claude Opus) now performs a comprehensive **quality control review** of the entire map. This is the most thorough check, covering:

1. **Structural integrity** — no orphan variables, no self-loops, no duplicates, focal variables are well-connected
2. **Logical coherence** — feedback loop classifications are correct, no contradictions
3. **Naming quality** — final check for directional language in variable names
4. **Domain balance** — every domain has enough variables and relationships
5. **Statistical distributions** — polarity, strength, and delay ratios fall within expected ranges
6. **Definition quality** — sampling 20 relationship definitions to check they explain mechanisms
7. **Evidence grounding** — sampling 20 relationships to check they cite evidence

The quality report gives a pass/fail for each check, with specific issues and recommended corrections.

### Step 15: Generate the Excel Spreadsheet

A code node now takes all the validated data and builds an **Excel workbook** with two sheets:

- **FACTORS sheet** — listing every variable with its ID, name, domain, whether it's intervenable, and its definition
- **RELATIONSHIPS sheet** — listing every relationship with its ID, source variable, target variable, polarity, strength, delay, and mechanism explanation

Everything is sorted, cross-referenced, and formatted for direct import into the Sim4Action platform.

### Step 16: The Research Leader Writes the Final Summary

The Research Leader writes a human-readable **summary report** in Markdown format covering:

- System description and significance
- Map statistics (how many variables, relationships, loops)
- Key findings and insights
- Methodology notes
- Complete source bibliography

> **Report saved:** Final Report

### Step 17: Results Are Delivered

The workflow sends back the final response containing:

- A success/failure status
- The system name
- Key statistics
- The summary report
- The quality control report
- Any warnings encountered
- How many revision iterations each phase needed
- The Excel file
- A complete **audit trail** of all intermediate reports (research plan, domain briefs, system overview, variable list, relationship list, feedback analysis, and final report)

If Google Drive saving was enabled, all of these reports are also available as individual files in a timestamped folder on Google Drive.

---

## The Big Picture: Why a Team?

The reason for using multiple AI agents rather than a single one is the same reason human research works best in teams:

- **Specialists do what they're best at.** The web researcher finds facts. The deep analyst does careful extraction with strict rules. The coordinator keeps everything on track and consistent.
- **Peer review catches mistakes.** Having one agent extract variables and a different one review them mirrors academic peer review — the reviewer has fresh eyes and a checklist.
- **Iteration improves quality.** The review-revise loops (up to 3 rounds each) mean problems get caught and fixed, not just flagged.
- **Gap analysis prevents blind spots.** Dedicated gap-checking steps ensure the map is comprehensive, not just a reflection of whatever the first research pass happened to find.
- **Quality control provides assurance.** The final QC step checks everything against quantitative benchmarks before the output is delivered.

This multi-agent, multi-pass approach produces a much more thorough and reliable causal map than any single prompt could achieve.

---

## Summary of All Steps

| Step | Who | What They Do |
|------|-----|-------------|
| 1 | You | Describe the system |
| 2 | Research Leader | Creates a tailored research plan |
| 3 | Field Researchers | Investigate each domain with web search |
| 4 | Research Leader | Synthesises all research into a system overview |
| 5 | Research Leader | Checks for research gaps (loops back if needed) |
| 6 | Deep Analyst | Extracts system variables with strict quality rules |
| 7 | Research Leader | Reviews the variable list |
| 8 | Deep Analyst | Revises variables if needed (up to 3 rounds) |
| 9 | Deep Analyst | Extracts causal relationships with mechanisms |
| 10 | Research Leader | Reviews the relationship list |
| 11 | Deep Analyst | Revises relationships if needed (up to 3 rounds) |
| 12 | Research Leader | Identifies feedback loops |
| 13 | Research Leader | Analyses the map for gaps (loops back if needed) |
| 14 | Deep Analyst | Final quality control |
| 15 | Code | Generates the Excel spreadsheet |
| 16 | Research Leader | Writes the final summary report |
| 17 | Workflow | Delivers everything back to you |

---

## How Long Does It Take?

A typical run takes **30–60 minutes** and costs approximately **$25–55** in AI API usage. The output is a causal system map with **40–120 variables** and **60–200 relationships**, all evidence-based and quality-checked.

---

*Document version 1.0 — SES Causal Map Generator Workflow*
