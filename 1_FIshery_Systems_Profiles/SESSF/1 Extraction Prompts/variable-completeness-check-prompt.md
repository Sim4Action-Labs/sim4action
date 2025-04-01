# Variable Completeness Check Prompt

## Purpose
This prompt guides the systematic incorporation of all variables identified in SESSF_Phase_2.md into the merged master variables and relationships files, ensuring comprehensive coverage across all categories.

## Input Format
1. Source Document: SESSF_Phase_2.md
2. Current Master Files:
   - SESSF_Merged_Variables.md
   - SESSF_Merged_Relationships.md

## Variable Categories to Check
1. Environmental Variables (Section 3.2)
2. Economic Variables (Section 3.3)
3. Social Variables (Section 3.4)
4. Technical Variables (Section 3.5)
5. Market Variables (Section 3.6)
6. Indigenous Knowledge Variables (Section 3.7)

## Process Steps

### 1. Variable Extraction and Classification
For each category in SESSF_Phase_2.md:
1. Extract all variables listed in tables
2. Classify each variable as:
   - State (accumulation of a quantity)
   - Flow (rate of change)
   - Parameter (constant or policy value)
3. Create unique variable IDs (V41, V42, etc.)
4. Document measurement units and data sources

### 2. Relationship Identification
For each new variable:
1. Identify direct causal relationships with existing variables
2. Determine relationship type:
   - Positive (+)
   - Negative (-)
   - Variable (context-dependent)
3. Document relationship strength and time delays
4. Create unique relationship IDs (R48, R49, etc.)

### 3. Integration Rules
1. Variable Integration:
   - Add new variables to Variables Table
   - Maintain consistent formatting
   - Include source category
   - Add measurement units
   - Note data availability

2. Relationship Integration:
   - Add new relationships to Relationships Table
   - Maintain bidirectional relationships where appropriate
   - Include feedback loops
   - Document relationship evidence

### 4. Quality Checks
1. Completeness Verification:
   - All Phase 2 variables included
   - All categories represented
   - No duplicates
   - Consistent naming

2. Relationship Verification:
   - All variables have at least one relationship
   - No orphaned variables
   - Logical causal connections
   - Evidence-based relationships

3. System Integrity:
   - Maintains existing relationships
   - Preserves feedback loops
   - Consistent variable types
   - Logical system structure

## Output Format

### Updated Variables Table
| Variable ID | Variable Name | Variable Type | Category | Unit of Measurement | Data Source | Process Description | Notes |
|-------------|---------------|---------------|-----------|-------------------|-------------|-------------------|--------|
| V41 | [New Variable] | [Type] | [Category] | [Unit] | [Source] | [Description] | [Notes] |

### Updated Relationships Table
| Relationship ID | From Variable | To Variable | Type | Category | Process Description | Evidence | Notes |
|----------------|---------------|-------------|------|-----------|-------------------|-----------|--------|
| R48 | [From] | [To] | [Type] | [Category] | [Description] | [Evidence] | [Notes] |

### Summary Statistics
- Total Variables by Category
- Total Relationships by Type
- New Variables Added
- New Relationships Added
- Category Coverage

### Quality Report
1. Completeness Metrics
2. Integration Issues
3. Missing Data
4. Relationship Gaps
5. System Integrity Assessment

## Example

### Variable Addition
Original Phase 2 Variable:
- Name: Sea Surface Temperature (SST)
- Category: Environmental
- Unit: °C
- Data Source: CSIRO Marine and Atmospheric Research

Converted to System Variable:
- ID: V41
- Name: Sea Surface Temperature
- Type: State
- Category: Environmental
- Unit: °C
- Data Source: CSIRO Marine and Atmospheric Research
- Process Description: Temperature of the ocean surface layer
- Notes: Global hotspot for ocean warming

### Relationship Addition
New Relationship:
- ID: R48
- From: V41 (Sea Surface Temperature)
- To: V11 (Ocean Temperature)
- Type: Positive
- Category: Environmental
- Process Description: SST influences overall ocean temperature
- Evidence: Direct measurement correlation
- Notes: Key climate change indicator

## Quality Requirements
1. All Phase 2 variables must be included
2. Each variable must have at least one relationship
3. All relationships must be evidence-based
4. System integrity must be maintained
5. Categories must be properly represented
6. No duplicate variables or relationships
7. Consistent naming conventions
8. Complete documentation of sources and evidence 