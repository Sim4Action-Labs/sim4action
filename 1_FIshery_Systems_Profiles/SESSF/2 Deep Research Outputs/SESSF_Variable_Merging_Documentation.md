# SESSF Variable Merging Documentation

This document details the merging decisions made when integrating newly decomposed variables with the master variables table.

## Similar Terms Identified

### Stock-Related Variables
1. Stock Abundance (V1) and Stock Biomass (Master V1)
   - Status: Merged
   - Rationale: Both represent total fish numbers in the stock
   - Impact: Maintains consistency with existing master variable
   - Final Name: Stock Biomass

2. Stock Status (V30) and Stock Biomass
   - Status: Not Merged
   - Rationale: Stock Status includes additional management context
   - Impact: Preserves distinct management perspective

### Ecosystem Variables
1. Ecosystem Properties (V10) and Ecosystem Function (V37)
   - Status: Merged
   - Rationale: Both represent overall ecosystem state
   - Impact: Simplifies ecosystem representation
   - Final Name: Ecosystem Function

2. Trophic Structure (V28) and Multi-species Interactions (V16)
   - Status: Not Merged
   - Rationale: Different levels of ecological organization
   - Impact: Maintains distinct ecological concepts

### Management Variables
1. Management Implementation (V14) and Management Restrictions (V39)
   - Status: Not Merged
   - Rationale: Different aspects of management
   - Impact: Preserves distinct management concepts

2. Compliance Rate (V15) and Social License (V38)
   - Status: Not Merged
   - Rationale: Different types of social acceptance
   - Impact: Maintains distinct social concepts

### Economic Variables
1. Economic Returns (V20) and Economic Performance (V40)
   - Status: Merged
   - Rationale: Both represent economic outcomes
   - Impact: Simplifies economic representation
   - Final Name: Economic Performance

2. Industry Investment (V21) and Quota Trading (V32)
   - Status: Not Merged
   - Rationale: Different types of economic activities
   - Impact: Preserves distinct economic concepts

## Merging Decisions

### Merged Variables
1. Stock Biomass (V1)
   - Original IDs: Master V1, New V1
   - Rationale: Same concept, different terminology
   - Impact: Standardized terminology

2. Ecosystem Function (V10)
   - Original IDs: V10, V37
   - Rationale: Combined ecosystem state indicators
   - Impact: Simplified ecosystem representation

3. Economic Performance (V20)
   - Original IDs: V20, V40
   - Rationale: Combined economic outcome indicators
   - Impact: Streamlined economic metrics

### Non-Merged Variables
1. Stock Status (V30)
   - Kept separate from Stock Biomass
   - Rationale: Includes management context
   - Impact: Preserves management perspective

2. Trophic Structure (V28)
   - Kept separate from Multi-species Interactions
   - Rationale: Different ecological concepts
   - Impact: Maintains ecological detail

3. Management Implementation (V14)
   - Kept separate from Management Restrictions
   - Rationale: Different management aspects
   - Impact: Preserves management complexity

## Impact on Relationships

### Updated Relationships
1. Stock Biomass relationships
   - Updated to use merged variable ID
   - Maintained all original relationships
   - No loss of information

2. Ecosystem Function relationships
   - Combined relationships from both sources
   - Maintained distinct ecological processes
   - Enhanced ecosystem representation

3. Economic Performance relationships
   - Combined economic outcome relationships
   - Preserved distinct economic processes
   - Streamlined economic analysis

### Preserved Relationships
1. Stock Status relationships
   - Maintained separate management context
   - Preserved management-specific relationships
   - Enhanced management analysis

2. Trophic Structure relationships
   - Kept distinct ecological relationships
   - Maintained food web complexity
   - Preserved ecosystem detail

3. Management Implementation relationships
   - Preserved implementation-specific relationships
   - Maintained management process detail
   - Enhanced management analysis

## Special Considerations

### Temporal Scales
- Some variables represent different time scales
- Kept separate to maintain temporal resolution
- Important for dynamic analysis

### Spatial Scales
- Some variables represent different spatial scales
- Maintained separate for spatial analysis
- Important for spatial management

### Management Context
- Some variables include management context
- Preserved for management analysis
- Important for decision-making

### Ecological Detail
- Some variables represent different ecological concepts
- Maintained for ecological analysis
- Important for ecosystem management

## Conclusion
The merging process successfully:
1. Identified and resolved similar terms
2. Maintained system integrity
3. Preserved important distinctions
4. Enhanced system clarity
5. Improved analysis potential
6. Maintained management relevance 