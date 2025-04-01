# SESSF Relationship Strength Labeling System

## Part 1: Master Relationships File Format
The master relationships file should contain only the essential relationship information with strength labels:

```markdown
| Relationship ID | From Variable | To Variable | Strength |
|----------------|---------------|-------------|----------|
| R1 | Stock Biomass | Recruitment Rate | Strong |
| R2 | Recruitment Rate | Stock Biomass | Strong |
| R3 | Mortality Rate | Stock Biomass | Strong |
```

## Part 2: Relationship Strength Justifications
Create a separate file named `SESSF_Relationship_Strength_Justifications.md` containing detailed evidence for each strength assignment:

```markdown
# SESSF Relationship Strength Justifications

## Strong Relationships

### R1: Stock Biomass → Recruitment Rate
**Strength**: Strong
**Justification**: Well-documented stock-recruitment relationships with consistent data from stock assessments and long-term monitoring. Evidence from Phase 2 shows robust measurement systems and high-quality data collection. Phase 3 confirms strong feedback mechanisms between stock size and recruitment.

### R2: Recruitment Rate → Stock Biomass
**Strength**: Strong
**Justification**: Direct positive relationship supported by biological principles and stock assessment data. Phase 2 demonstrates clear measurement systems, while Phase 3 shows strong evidence of stock-recruitment relationships in the system dynamics analysis.

## Medium Relationships

### R4: Stock Biomass → Catch Limit
**Strength**: Medium
**Justification**: Management rules link biomass to catch limits, but implementation varies by species. Phase 3 shows variable effectiveness of management interventions, while Phase 4 indicates ongoing development of management frameworks.

### R5: Catch Limit → Fishing Mortality
**Strength**: Medium
**Justification**: Regulatory control mechanism with variable compliance and effectiveness. Phase 3 documents mixed success in management implementation, while Phase 2 shows varying levels of monitoring and enforcement.

## Weak Relationships

### R10: Fleet Size → Efficiency
**Strength**: Weak
**Justification**: Complex relationship with technological and operational variables. Phase 2 shows limited data availability, while Phase 3 indicates multiple confounding factors affecting this relationship.
```

## Strength Categories
- **Strong**: Well-documented, consistently observed, high confidence evidence
- **Medium**: Moderately documented, generally observed, moderate confidence evidence
- **Weak**: Limited documentation, variable observations, low confidence evidence

## Justification Guidelines
Each justification should include:
1. Evidence from specific phases
2. Data quality assessment
3. System complexity considerations
4. Any uncertainties or limitations

## Notes
- Keep master files clean and minimal
- Provide detailed evidence in separate justifications file
- Reference specific data sources and phase information
- Consider both direct and indirect evidence
- Account for system complexity and interactions 