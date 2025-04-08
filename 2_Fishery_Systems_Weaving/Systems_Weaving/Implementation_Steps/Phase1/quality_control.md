# Quality Control and Consistency Check Guide

## Overview
This guide provides instructions for performing comprehensive quality control and consistency checks across the three main system dynamics analysis files:
1. variables.md
2. relationships.md
3. feedback_loops.md

## File-Specific Checks

### 1. variables.md Checks
1. **Variable Count Verification**
   - Count total variables in matrix
   - Verify count matches Domain Summary
   - Verify count matches Evidence Quality Distribution
   - Check for any duplicate Variable IDs
   - Ensure sequential numbering (no gaps)

2. **Domain Distribution Check**
   - Count variables per domain in matrix
   - Verify matches Domain Summary section
   - Check domain categorization consistency
   - Verify no variables are missing domains

3. **Evidence Quality Check**
   - Count evidence quality levels in matrix
   - Verify matches Evidence Quality Distribution
   - Check quality rating consistency
   - Verify no variables are missing quality ratings

4. **Source Reference Check**
   - Verify all variables have source references
   - Check source format consistency
   - Verify line numbers are accurate
   - Check for any missing sources

### 2. relationships.md Checks
1. **Relationship Count Verification**
   - Count total relationships in matrix
   - Verify matches Matrix Summary
   - Check Direct vs. Implied relationship counts
   - Verify no duplicate relationships

2. **Variable Reference Check**
   - Verify all variables in relationships exist in variables.md
   - Check variable ID consistency
   - Verify variable names match variables.md
   - Check for any undefined variables

3. **Domain Coverage Check**
   - Count relationships per domain
   - Verify matches Matrix Summary
   - Check domain categorization consistency
   - Verify no relationships are missing domains

4. **Evidence Quality Check**
   - Count evidence quality levels
   - Verify matches Matrix Summary
   - Check quality rating consistency
   - Verify no relationships are missing quality ratings

### 3. feedback_loops.md Checks
1. **Loop Count Verification**
   - Count total loops in matrix
   - Verify matches Matrix Summary
   - Check Reinforcing vs. Balancing loop counts
   - Verify no duplicate loops

2. **Component Check**
   - Verify all components exist in relationships.md
   - Check component polarities match relationships.md
   - Verify all components are properly documented
   - Check for any missing components

3. **Variable Reference Check**
   - Verify all variables in loops exist in variables.md
   - Check variable ID consistency
   - Verify variable names match variables.md
   - Check for any undefined variables

4. **Evidence Quality Check**
   - Count evidence quality levels
   - Verify matches Matrix Summary
   - Check quality rating consistency
   - Verify no loops are missing quality ratings

## Cross-File Consistency Checks

### 1. Variable Consistency
1. **Variable Names**
   - Check variable names are identical across all files
   - Verify no variations in naming
   - Check for any missing variables
   - Verify variable IDs are consistent

2. **Variable Properties**
   - Verify domain assignments are consistent
   - Check evidence quality ratings align
   - Verify source references match
   - Check context descriptions align

### 2. Relationship Consistency
1. **Direct Relationships**
   - Verify all direct relationships in relationships.md appear in feedback loops
   - Check relationship polarities are consistent
   - Verify evidence quality ratings align
   - Check time delays are consistent

2. **Implied Relationships**
   - Verify implied relationships are properly documented
   - Check relationship chains are complete
   - Verify evidence quality ratings align
   - Check time delays are consistent

### 3. Feedback Loop Consistency
1. **Loop Components**
   - Verify all loop components exist in relationships.md
   - Check component polarities match
   - Verify evidence quality ratings align
   - Check time delays are consistent

2. **Loop Properties**
   - Verify loop types are consistent
   - Check system impact ratings align
   - Verify evidence quality ratings match
   - Check context descriptions align

## Time Delay Consistency
1. **Delay Periods**
   - Verify delay periods are consistent across files
   - Check delay categorization (short/medium/long-term)
   - Verify delay documentation is complete
   - Check for any missing delays

## Evidence Quality Consistency
1. **Quality Ratings**
   - Verify quality ratings are consistent across files
   - Check rating scale is uniform
   - Verify no missing ratings
   - Check rating documentation is complete

## Source Reference Consistency
1. **Source Documentation**
   - Verify source references are consistent
   - Check section and line numbers match
   - Verify no missing sources
   - Check source format is uniform

## Action Items for Corrections
1. **Variable Corrections**
   - Update variable names for consistency
   - Correct domain assignments
   - Adjust evidence quality ratings
   - Update source references

2. **Relationship Corrections**
   - Add missing relationships
   - Correct relationship polarities
   - Update evidence quality ratings
   - Adjust time delays

3. **Feedback Loop Corrections**
   - Add missing components
   - Correct loop types
   - Update evidence quality ratings
   - Adjust system impact ratings

## Quality Control Process
1. Run all file-specific checks
2. Perform cross-file consistency checks
3. Document all inconsistencies
4. Make necessary corrections
5. Verify corrections
6. Update summary statistics
7. Final consistency check

## Notes
- Maintain detailed records of all checks
- Document any assumptions made
- Note any ambiguities found
- Flag items requiring future updates
- Keep track of all corrections made 