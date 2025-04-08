# Phase 1 Implementation Guide: Feedback Loop Extraction and Initial Matrix Setup

## Overview
This guide provides instructions for using AI prompts to extract feedback loops and create the initial matrix structure from the SESSF Phase 3 System Dynamics Analysis document (SESSF_Phase_3.md). The focus is on verbatim extraction without creating new variables or relationships.

## Source Material
The only source material to be used is:
- `1_FIshery_Systems_Profiles/2_Deep_Research_Outputs/SESSF/Perplexity/SESSF_Phase_3.md`

This document contains:
- Section 3.2: Core Relationships
- Section 3.3: Secondary Relationships
- Section 3.4: Feedback Loops
- Section 3.5: Time Delays

All variables, relationships, and feedback loops must be extracted directly from these sections.

## Core Principles
1. **Verbatim Extraction**
   - Extract only what is explicitly stated in SESSF_Phase_3.md
   - Do not create new variables or relationships
   - Maintain exact wording from source document
   - Document all source references using section numbers and line numbers (e.g., [3.2:45])

2. **Variable Naming**
   - Variables should be expressed as quantities that can increase or decrease
   - Avoid directional terms in variable names
   - Example: "Stock abundance" (not "declining stock")
   - Example: "Fishing effort" (not "increased fishing")
   - In relationships and feedback loops, always show both ID and name: "V1 (Fishing mortality)"

3. **Relationship Documentation**
   - Direction of effect encoded in relationship arrow
   - Polarity (+/-) clearly specified for each relationship
   - Evidence quality noted for each relationship
   - Source references maintained using section and line numbers
   - Variables shown as "V1 (Variable Name)" in all relationship tables

## Step 1: Variable Extraction and Standardization

### 1.1 Variable Extraction Process
1. **Initial Extraction**
   - Extract all variables mentioned in sections 3.2-3.5
   - Include variables from:
     * Direct relationships
     * Secondary relationships
     * Feedback loops
     * Time delays
   - Document line numbers for each variable
   - Note the context in which each variable appears

2. **Variable Identification Criteria**
   - Must be a measurable quantity
   - Must be explicitly mentioned in source text
   - Must be relevant to system dynamics
   - Must be able to increase or decrease
   - Must have clear units or measurement method

3. **Variable Documentation Format**
   ```markdown
   Variable ID: V1
   Name: [standardized name]
   Domain: [ecological/economic/social/etc.]
   Definition: [from source]
   Units: [if specified]
   Evidence Quality: [High/Medium/Low]
   Source: [section:line reference]
   Context: [brief description of where/how variable appears]
   ```

### 1.2 Variable Standardization Rules
1. **Directional Terms to Remove**
   - "Increasing/Decreasing"
   - "Higher/Lower"
   - "More/Less"
   - "Better/Worse"
   - "Improved/Declined"
   - "Enhanced/Reduced"
   - "Growing/Shrinking"
   - "Rising/Falling"
   - "Expanding/Contracting"
   - "Strengthening/Weakening"
   - "Deteriorating/Improving"
   - "Worsening/Enhancing"
   - "Declining/Increasing"
   - "Reducing/Expanding"
   - "Minimizing/Maximizing"

2. **Standardization Examples**
   ```markdown
   Original → Standardized
   - "Declining stock" → "Stock abundance"
   - "Increased fishing effort" → "Fishing effort"
   - "Reduced recruitment" → "Recruitment rate"
   - "Higher prices" → "Market price"
   - "Lower catch rates" → "Catch rate"
   - "Improved compliance" → "Compliance rate"
   - "Enhanced efficiency" → "Fishing efficiency"
   - "Growing fleet size" → "Fleet size"
   - "Weakening ecosystem" → "Ecosystem health"
   - "Strengthening enforcement" → "Enforcement level"
   - "Deteriorating habitat" → "Habitat quality"
   - "Worsening conditions" → "Environmental conditions"
   - "Declining profits" → "Profitability"
   - "Reducing bycatch" → "Bycatch rate"
   - "Minimizing impact" → "Environmental impact"
   ```

3. **Standardization Process**
   - Identify directional terms
   - Remove directional terms
   - Convert to present tense
   - Express as measurable quantity
   - Maintain consistency across all variables
   - Document original text for reference
   - Cross-reference with source material
   - Verify standardization with line numbers

### 1.3 Output: variables.md
1. **File Structure**
   ```markdown
   # SESSF Variables

   ## Overview
   This document lists all variables identified in the Southern and Eastern Scalefish and Shark Fishery (SESSF) system, extracted from the Phase 3 System Dynamics Analysis.

   ## Variable Matrix
   | Variable ID | Name | Domain | Definition | Units | Evidence Quality | Source | Context |
   |------------|------|---------|------------|--------|------------------|---------|---------|
   | V1 | [Name] | [Domain] | [Definition] | [Units] | [Quality] | [Section:Line] | [Context] |

   ## Variable Standardization
   ### Rules Applied
   [List of standardization rules]

   ### Examples
   [List of standardization examples]

   ### Process
   [Description of standardization process]

   ## Domain Summary
   - [Domain]: [number] variables
   - [Domain]: [number] variables
   ...

   ## Evidence Quality Distribution
   - High: [number]
   - Medium: [number]
   - Low: [number]

   ## Notes
   - Variables extracted directly from Phase 3 analysis
   - Evidence quality reflects source documentation
   - Some variables may need refinement as more data becomes available
   - Indigenous knowledge variables to be added in future phases
   ```

### 1.4 Quality Control for Variables
1. **Cross-Reference Check**
   - Verify each variable exists in source document
   - Confirm variable appears in at least one relationship or feedback loop
   - Check that variable IDs are sequential with no gaps
   - Ensure no duplicate variables exist
   - Verify line numbers are accurate
   - Check context descriptions are complete

2. **Domain Verification**
   - Count variables per domain in matrix
   - Verify domain summary matches matrix counts
   - Cross-reference domain assignments with source material
   - Ensure domain categorization is consistent
   - Check for missing domains
   - Verify domain definitions

3. **Evidence Quality Check**
   - Count evidence quality levels in matrix
   - Verify evidence quality distribution matches matrix counts
   - Cross-reference evidence quality with source material
   - Ensure evidence quality assignments are consistent
   - Check for missing evidence quality ratings
   - Verify evidence quality criteria

4. **Source Reference Check**
   - Verify all variables have correct section references
   - Confirm all variables appear in specified sections
   - Check for any variables without source references
   - Ensure source references are accurate
   - Verify line numbers are correct
   - Check context descriptions match source

5. **Standardization Check**
   - Verify all directional terms are removed
   - Check for consistent tense usage
   - Ensure measurable quantities are specified
   - Verify standardization is consistent
   - Check original text is preserved
   - Verify examples are complete

## Step 2: Relationship Documentation

### 2.1 Relationship Extraction Process
1. **Initial Extraction**
   - Extract relationships from sections 3.2 and 3.3
   - Include both direct and implied relationships
   - Document line numbers for each relationship
   - Note the context in which each relationship appears
   - Record evidence quality and confidence levels
   - Note time delays from section 3.5

2. **Relationship Identification Criteria**
   - Must be explicitly stated in source text
   - Must involve at least two variables
   - Must have clear direction of effect
   - Must have specified polarity
   - Must have evidence quality rating
   - Must have time delay specification

3. **Relationship Documentation Format**
   ```markdown
   From: V1 (Variable Name)
   To: V2 (Variable Name)
   Type: [Direct/Implied]
   Polarity: [+/-]
   Evidence: [High/Medium/Low]
   Delay: [time period]
   Source: [section:line reference]
   Impact: [Major/Medium/Minor]
   Context: [brief description of where/how relationship appears]
   ```

### 2.2 Output: relationships.md
1. **File Structure**
   ```markdown
   # SESSF Relationships

   ## Overview
   This document presents the relationship matrix for the SESSF system, extracted from the Phase 3 System Dynamics Analysis.

   ## Direct Relationships
   | From | To | Type | Polarity | Evidence | Delay | Source | Impact | Context |
   |------|----|------|----------|----------|-------|---------|---------|---------|
   | V1 (Fishing mortality) | V2 (Stock abundance) | Direct | - | [Quality] | [Delay] | [Section:Line] | [Impact] | [Context] |

   ## Additional Implied Relationships
   ### [Domain] Relationships
   | From | To | Type | Polarity | Evidence | Delay | Source | Impact | Context |
   |------|----|------|----------|----------|-------|---------|---------|---------|
   | V1 (Fishing mortality) | V2 (Stock abundance) | Implied | + | [Quality] | [Delay] | [Section:Line] | [Impact] | [Context] |

   ## Matrix Summary
   - Total Relationships: [number]
   - Direct: [number]
   - Implied: [number]
   - Domain Coverage: [details]
   - Evidence Quality: [distribution]
   - System Impact: [distribution]
   - Time Delays: [distribution]
   ```

### 2.3 Quality Control for Relationships
1. **Relationship Count Verification**
   - Count total relationships in matrix
   - Verify direct vs. implied relationship counts
   - Cross-reference with source material
   - Ensure no relationships are missing or duplicated
   - Check line numbers are accurate
   - Verify context descriptions

2. **Variable Reference Check**
   - Verify all variables in relationships exist in variables.md
   - Check for any undefined variables
   - Ensure variable IDs are consistent
   - Confirm variable names match variables.md
   - Check for missing variable references
   - Verify variable context matches

3. **Domain Coverage Check**
   - Count relationships per domain
   - Verify domain coverage summary matches matrix
   - Cross-reference with source material
   - Ensure domain categorization is consistent
   - Check for missing domains
   - Verify domain definitions

4. **Evidence Quality Check**
   - Count evidence quality levels in matrix
   - Verify evidence quality distribution matches matrix
   - Cross-reference with source material
   - Ensure evidence quality assignments are consistent
   - Check for missing evidence quality ratings
   - Verify evidence quality criteria

5. **Time Delay Verification**
   - Verify all relationships have delay periods
   - Cross-reference delays with section 3.5
   - Ensure delay periods are consistent
   - Check for any missing delay information
   - Verify delay specifications
   - Check delay context matches

## Step 3: Feedback Loop Documentation

### 3.1 Feedback Loop Extraction Process
1. **Initial Extraction**
   - Extract feedback loops from section 3.4
   - Include both reinforcing and balancing loops
   - Document line numbers for each loop
   - Note the context in which each loop appears
   - Record evidence quality and system impact
   - Note component relationships

2. **Loop Identification Criteria**
   - Must be explicitly stated in source text
   - Must form a complete cycle
   - Must have specified type (reinforcing/balancing)
   - Must have evidence quality rating
   - Must have system impact rating
   - Must have component relationships

3. **Loop Documentation Format**
   ```markdown
   Loop Name: [exact name from source]
   Type: [reinforcing/balancing]
   Components:
   - Variable 1 → Variable 2 (polarity: +/-, evidence: [section:line])
   - Variable 2 → Variable 3 (polarity: +/-, evidence: [section:line])
   ...
   Evidence Quality: [High/Medium/Low]
   System Impact: [Major/Medium/Minor]
   Source: [section:line reference]
   Context: [brief description of where/how loop appears]
   ```

### 3.2 Output: feedback_loops.md
1. **File Structure**
   ```markdown
   # SESSF Feedback Loops

   ## Overview
   This document lists all feedback loops identified in the SESSF system, extracted from the Phase 3 System Dynamics Analysis.

   ## Feedback Loop Matrix
   | Loop ID | Name | Type | Components | Evidence Quality | System Impact | Source | Context |
   |---------|------|------|------------|------------------|---------------|---------|---------|
   | L1 | [Name] | [reinforcing/balancing] | V1 (Fishing mortality) → V2 (Stock abundance) (+), V2 (Stock abundance) → V3 (Climate change) (-) | [High/Medium/Low] | [Major/Medium/Minor] | [Section:Line] | [Context] |

   ## Component Details
   | Loop ID | From Variable | To Variable | Polarity | Evidence | Delay | Source | Context |
   |---------|--------------|-------------|----------|----------|-------|---------|---------|
   | L1 | V1 (Fishing mortality) | V2 (Stock abundance) | + | [Quality] | [Delay] | [Section:Line] | [Context] |
   | L1 | V2 (Stock abundance) | V3 (Climate change) | - | [Quality] | [Delay] | [Section:Line] | [Context] |

   ## Matrix Summary
   - Total Loops: [number]
   - Loop Types:
     - Reinforcing: [number]
     - Balancing: [number]
   - Evidence Quality:
     - High: [number]
     - Medium: [number]
     - Low: [number]
   - System Impact:
     - Major: [number]
     - Medium: [number]
     - Minor: [number]
   - Component Distribution:
     - 2-component loops: [number]
     - 3-component loops: [number]
     - 4+ component loops: [number]
   ```

### 3.3 Quality Control for Feedback Loops
1. **Loop Count Verification**
   - Count total loops in matrix
   - Verify reinforcing vs. balancing loop counts
   - Cross-reference with source material
   - Ensure no loops are missing or duplicated
   - Check line numbers are accurate
   - Verify context descriptions

2. **Component Check**
   - Verify all components exist in relationships.md
   - Check for any undefined relationships
   - Ensure component polarities match relationships.md
   - Confirm all components are properly documented
   - Check for missing components
   - Verify component context matches

3. **Variable Reference Check**
   - Verify all variables in loops exist in variables.md
   - Check for any undefined variables
   - Ensure variable IDs are consistent
   - Confirm variable names match variables.md
   - Check for missing variable references
   - Verify variable context matches

4. **Evidence Quality Check**
   - Count evidence quality levels in matrix
   - Verify evidence quality distribution matches matrix
   - Cross-reference with source material
   - Ensure evidence quality assignments are consistent
   - Check for missing evidence quality ratings
   - Verify evidence quality criteria

5. **Time Delay Verification**
   - Verify all components have delay periods
   - Cross-reference delays with section 3.5
   - Ensure delay periods are consistent
   - Check for any missing delay information
   - Verify delay specifications
   - Check delay context matches

## Final Quality Control Checklist

### 1. Cross-Document Consistency
- [ ] All variables in relationships.md exist in variables.md
- [ ] All variables in feedback_loops.md exist in variables.md
- [ ] All relationships in feedback_loops.md exist in relationships.md
- [ ] All variable IDs are consistent across all documents
- [ ] All variable names are consistent across all documents
- [ ] All line numbers are accurate and consistent
- [ ] All context descriptions match across documents

### 2. Source Material Verification
- [ ] All variables appear in source material
- [ ] All relationships appear in source material
- [ ] All feedback loops appear in source material
- [ ] All evidence quality levels match source material
- [ ] All time delays match source material
- [ ] All line numbers are correct
- [ ] All context descriptions are accurate

### 3. Count Verification
- [ ] Variable counts match across all summaries
- [ ] Relationship counts match across all summaries
- [ ] Feedback loop counts match across all summaries
- [ ] Domain distribution counts are accurate
- [ ] Evidence quality distribution counts are accurate
- [ ] Component distribution counts are accurate
- [ ] Time delay distribution counts are accurate

### 4. Format Verification
- [ ] All tables follow specified format
- [ ] All references use correct section and line numbers
- [ ] All polarities are consistently marked (+/-)
- [ ] All delays are consistently formatted
- [ ] All impacts are consistently categorized
- [ ] All context fields are completed
- [ ] All evidence quality ratings are consistent

## Workflow
1. Extract and standardize variables from SESSF_Phase_3.md (variables.md)
2. Document relationships from sections 3.2 and 3.3 (relationships.md)
3. Extract feedback loops from section 3.4 (feedback_loops.md)
4. Perform quality checks for each document
5. Perform cross-document consistency checks
6. Verify against source material
7. Update all files for consistency
8. Prepare for Phase 2

## Notes
- Maintain strict adherence to SESSF_Phase_3.md content
- Document all assumptions
- Note any ambiguities
- Preserve evidence quality
- Keep detailed section and line references
- Follow exact file structure templates
- Perform all quality control checks before finalizing
- Document any deviations from standard process
- Note any missing information
- Flag items requiring future updates 