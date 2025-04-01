# Relationships Merging Prompt

## Task
Merge newly decomposed relationships and variables with existing master tables, identifying and resolving duplicates, similar terms, and related concepts while maintaining system integrity.

## Input Format
You will receive:
1. Master Variables Table
2. Master Relationships Table
3. Newly Decomposed Variables Table
4. Newly Decomposed Relationships Table

## Output Format

### 1. Merged Variables Table
| Variable ID | Variable Name | Variable Type | Source | Process Description | Merged From |
|-------------|---------------|---------------|---------|-------------------|-------------|
| VX | Name | Type | Source | Description | Original IDs |

### 2. Merged Relationships Table
| Relationship ID | From Variable | To Variable | Type | Source | Process Description | Merged From |
|----------------|---------------|-------------|------|---------|-------------------|-------------|
| RX | VX | VY | Type | Source | Description | Original IDs |

### 3. Variable Merging Documentation
Create a separate markdown file documenting:
- Similar terms identified
- Merging decisions made
- Rationale for each merge
- Impact on relationships

## Guidelines

### Variable Merging Rules
1. Identify similar terms:
   - Exact duplicates
   - Different terms for same concept
   - Related concepts that can be combined
   - Hierarchical relationships

2. Consider merging when:
   - Variables represent same concept
   - Variables are closely related
   - Variables can be combined without loss of meaning
   - Variables differ only in temporal/spatial scale

3. Do not merge when:
   - Variables represent distinct concepts
   - Merging would lose important distinctions
   - Variables have different units or scales
   - Variables serve different analytical purposes

### Relationship Merging Rules
1. Update relationship references:
   - Map old variable IDs to new merged IDs
   - Maintain relationship types
   - Preserve source information
   - Update process descriptions

2. Handle relationship conflicts:
   - Resolve contradictory relationships
   - Combine similar relationships
   - Maintain system consistency
   - Document resolution process

### Quality Requirements
1. All merged variables must:
   - Have clear, unique names
   - Maintain directional neutrality
   - Have complete process descriptions
   - Include source information

2. All merged relationships must:
   - Reference valid variable IDs
   - Have explicit directionality
   - Include clear process descriptions
   - Maintain system consistency

3. Documentation must:
   - Explain all merging decisions
   - Provide rationale for each merge
   - List original variable/relationship IDs
   - Note any special considerations

## Example

### Input
Master Variables:
| Variable ID | Variable Name | Variable Type | Source |
|-------------|---------------|---------------|---------|
| V1 | Stock Biomass | State | Master |

New Variables:
| Variable ID | Variable Name | Variable Type | Source |
|-------------|---------------|---------------|---------|
| V1 | Stock Abundance | State | New |
| V2 | Fish Population | State | New |

### Output
Merged Variables:
| Variable ID | Variable Name | Variable Type | Source | Merged From |
|-------------|---------------|---------------|---------|-------------|
| V1 | Stock Biomass | State | Master | Original V1 |
| V2 | Stock Abundance | State | New | New V1, V2 |

Merging Documentation:
```markdown
# Variable Merging Documentation

## Merged Variables
1. Stock Abundance (V2)
   - Merged from: New V1 (Stock Abundance), New V2 (Fish Population)
   - Rationale: Both represent total fish numbers in the stock
   - Impact: Simplified stock measurement while maintaining meaning
```

## Final Instructions
1. Review all variables for potential merging
2. Document all merging decisions
3. Update relationship references
4. Maintain system consistency
5. Provide clear rationale for each merge
6. Include impact assessment for each merge 