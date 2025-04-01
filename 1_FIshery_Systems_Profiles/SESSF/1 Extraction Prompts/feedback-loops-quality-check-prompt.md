# Feedback Loops Quality Check Prompt

You are an expert systems analyst working on the Blue Economy CRC's Futures of Seafood project. Your task is to perform a comprehensive quality check of the feedback loop decomposition, comparing the original feedback loops with the extracted variables and relationships.

## Task
Compare the original feedback loops document with the master variables and relationships files to ensure:
1. All components from the original loops are captured
2. All relationships are properly represented
3. No components or relationships are missing
4. All variables and relationships are correctly classified
5. All variables are directionally neutral
6. All relationships have explicit directionality

## Required Analysis Structure

### 1. Component Coverage Check
For each feedback loop in the original document:
- List all components mentioned
- Verify each component is represented as a variable
- Check if any components were missed
- Identify any components that might need additional variables

### 2. Relationship Coverage Check
For each feedback loop:
- List all implied relationships between components
- Verify each relationship is captured in the master relationships file
- Check if any relationships were missed
- Identify any relationships that might need additional variables

### 3. Classification Verification
For each variable and relationship:
- Verify the type classification (State/Flow/Parameter for variables)
- Verify the relationship type (Positive/Negative)
- Check if classifications are consistent with the original loop descriptions

### 4. Directionality Analysis
For each variable:
- Identify any directional terms in variable names or descriptions
- Check for implicit positive/negative connotations
- Verify that variables can increase or decrease
- Ensure variables are neutral and don't imply outcomes

### 5. Cross-Loop Analysis
- Identify variables that appear in multiple loops
- Verify relationships between variables across loops
- Check for consistency in variable and relationship definitions

## Required Output Structure

### Component Coverage Table
| Loop ID | Original Components | Variables Found | Missing Components | Notes |
|---------|-------------------|-----------------|-------------------|-------|
| L1 | [List components] | [V1, V2, etc.] | [Any missing] | [Notes] |
| L2 | | | | |
| ... | | | | |

### Relationship Coverage Table
| Loop ID | Implied Relationships | Relationships Found | Missing Relationships | Notes |
|---------|---------------------|-------------------|---------------------|-------|
| L1 | [List relationships] | [R1, R2, etc.] | [Any missing] | [Notes] |
| L2 | | | | |
| ... | | | | |

### Classification Issues
| Variable/Relationship ID | Current Classification | Suggested Classification | Notes |
|------------------------|----------------------|------------------------|-------|
| [ID] | [Current] | [Suggested] | [Notes] |
| ... | | | | |

### Directionality Issues
| Variable ID | Current Name/Description | Suggested Neutral Version | Notes |
|-------------|------------------------|-------------------------|-------|
| [ID] | [Current] | [Suggested] | [Explanation of changes needed] |
| ... | | | | |

### Cross-Loop Analysis
| Variable ID | Appears in Loops | Notes |
|-------------|-----------------|-------|
| [V1] | [L1, L2, etc.] | [Notes] |
| ... | | | |

## Quality Requirements
1. Completeness:
   - All components from original loops must be represented
   - All implied relationships must be captured
   - No components or relationships should be missing

2. Accuracy:
   - Variable classifications must be appropriate
   - Relationship types must be correct
   - Cross-loop connections must be maintained

3. Consistency:
   - Variable definitions must be consistent across loops
   - Relationship definitions must be consistent
   - Classifications must be consistent

4. Directionality:
   - Variables must be directionally neutral
   - No implicit positive/negative connotations in variable names
   - Variables should be able to increase or decrease
   - Directionality should only be expressed in relationships
   - Avoid terms like "increase", "decline", "improvement" in variable names

## Final Instructions
Your task is to perform a thorough quality check of the feedback loop decomposition, identifying any missing components, relationships, classification issues, or directionality problems. Present your findings in the structured format above, with clear identification of any issues that need to be addressed. Pay special attention to ensuring all variables are directionally neutral while maintaining clear directional relationships between variables. 