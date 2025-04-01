# Relationships Decomposition Prompt

## Task
Extract and decompose relationships from Tables 3.2 (Core Relationships) and 3.3 (Secondary Relationships) into variables and relationships, ensuring all components are directionally neutral and maintaining traceability to their source tables.

## Input Format
For each table, you will receive:
- Table number and title
- List of relationships with their descriptions
- Any additional context or notes

## Output Format

### 1. Variables Table
| Variable ID | Variable Name | Variable Type | Source Table | Process Description |
|-------------|---------------|---------------|--------------|-------------------|
| VX | Name | Type | Table 3.X | Simple process description |

### 2. Relationships Table
| Relationship ID | From Variable | To Variable | Type | Source Table | Process Description |
|----------------|---------------|-------------|------|--------------|-------------------|
| RX | VX | VY | Type | Table 3.X | Simple process description |

### 3. Summary Statistics
- Total Variables: X
- State Variables: X
- Flow Variables: X
- Parameters: X
- Total Relationships: X
- Positive Relationships: X
- Negative Relationships: X

## Guidelines

### Variable Extraction
1. Identify all unique variables in the relationships
2. Classify each variable as:
   - State: Accumulation or stock variables
   - Flow: Rate or change variables
   - Parameter: Constants or control variables
3. Ensure variable names are directionally neutral
4. Provide simple process descriptions
5. Track source table for each variable

### Relationship Extraction
1. Identify all causal connections
2. Determine relationship type:
   - Positive: Variables change in same direction
   - Negative: Variables change in opposite direction
3. Ensure relationships are directionally explicit
4. Provide clear process descriptions
5. Track source table for each relationship

### Quality Requirements
1. All variables must be directionally neutral
2. All relationships must have explicit directionality
3. Each variable and relationship must have a source table reference
4. Process descriptions should be simple and clear
5. No circular references in relationships
6. Maintain consistency with existing master tables

## Example

### Input
Table 3.2 Core Relationships:
- Relationship 1: "Higher stock levels lead to increased recruitment"
- Relationship 2: "Fishing mortality reduces stock biomass"

### Output
Variables:
| Variable ID | Variable Name | Variable Type | Source Table | Process Description |
|-------------|---------------|---------------|--------------|-------------------|
| V1 | Stock Biomass | State | Table 3.2 | Total fish biomass |
| V2 | Recruitment Rate | Flow | Table 3.2 | Rate of new fish entering stock |
| V3 | Fishing Mortality Rate | Flow | Table 3.2 | Rate of fish removal |

Relationships:
| Relationship ID | From Variable | To Variable | Type | Source Table | Process Description |
|----------------|---------------|-------------|------|--------------|-------------------|
| R1 | V1 | V2 | Positive | Table 3.2 | Stock biomass influences recruitment rate |
| R2 | V3 | V1 | Negative | Table 3.2 | Fishing mortality reduces stock biomass |

## Final Instructions
1. Extract all variables and relationships from Tables 3.2 and 3.3
2. Ensure all components are directionally neutral
3. Maintain traceability to source tables
4. Update existing master tables with new entries
5. Provide clear summary statistics
6. Include any necessary notes or clarifications 