# Task 1: Variable Identification

## Objective
Identify exactly 20 key variables that comprehensively represent the Southern and Eastern Scalefish and Shark Fishery (SESSF) system, ensuring consistency in core concepts while capturing the various ways these concepts are expressed in the Fishery System Profile. Provide a robust assessment of the frequency of each core concept using the interquartile range (IQR) method.

## Context
This task is the first step in a 9-task process for creating a systems map of the Southern and Eastern Scalefish and Shark Fishery (SESSF). The variables identified here will form the foundation for subsequent tasks, including relationship extraction, matrix creation, feedback loop identification, and visualization. The ultimate goal is to create a comprehensive, nuanced understanding of the fishery's dynamics to inform strategic decision-making.

## Input
- Fishery System Profile for Southern and Eastern Scalefish and Shark Fishery (SESSF)
- Results from previous iterations (if applicable)

## Process

1. Initial Profile Analysis:
   - Read through the Fishery System Profile systematically
   - Extract all variables mentioned in the "Key Variables Table" section
   - Note the categorization of variables (Environmental/Ecological, Economic/Market, Social/Governance, etc.)
   - Identify variables that appear in different sections of the profile

2. Variable Identification:
   - List potential variables, aiming for 25-30 initially
   - Ensure coverage of all major themes in the profile
   - Pay special attention to variables that:
     - Are supported by specific references in the profile
     - Have clear measurement units or assessment methods
     - Represent critical system components

3. Core Concept Definition:
   - For each variable, identify the core concept it represents
   - Create a short (2-3 word) label that captures this core concept
   - Ensure the label is consistent with terminology used in the profile
   - Cross-reference with government reports and scientific literature cited in the profile

4. Similar Term Identification:
   - For each core concept, identify similar terms or phrases used in the profile
   - Document the specific sections where each term appears
   - Include relevant citations from the profile

5. Variable Description:
   - Write a brief description that elaborates on the core concept
   - Incorporate specific examples from the profile
   - Include relevant statistics or measurements from the profile
   - Reference specific government reports or scientific studies cited in the profile

6. Measurement Unit:
   - Specify a unit of measurement or assessment method for each variable
   - Use units and methods consistent with those used in the profile
   - Include relevant standards or protocols mentioned in the profile

7. Frequency Assessment:
   a. For each core concept and its related terms:
      - Count the number of specific mentions within the profile
      - Use stemming or lemmatization to catch variations of words
   b. Calculate the relative frequency:
      Relative Frequency = (Number of occurrences / Total number of sections) x 100
   c. Calculate the interquartile range (IQR) of the relative frequencies:
      - Q1 = 25th percentile of relative frequencies
      - Q3 = 75th percentile of relative frequencies
      - IQR = Q3 - Q1
   d. Categorize the relative frequencies:
      - High: Relative Frequency > Q3
      - Medium: Q1 ≤ Relative Frequency ≤ Q3
      - Low: Relative Frequency < Q1
   e. Record the raw count, relative frequency, and category for each core concept

8. Variable Relationship Brainstorming:
   a. For each identified variable:
      - Extract direct causal relationships from the profile
      - Identify variables that directly affect the target variable
      - Identify variables that are directly affected by the target variable
      - Document the evidence source for each relationship
      - Note the strength and direction of relationships
      - Include relevant citations from the profile

   b. Relationship Analysis:
      - Create a relationship matrix for each variable
      - Identify bidirectional relationships
      - Note temporal aspects of relationships
      - Document spatial or contextual dependencies
      - Record any threshold effects
      - Include relevant statistics or measurements

   c. Evidence Integration:
      - Document confidence levels
      - Include specific examples or case studies
      - Reference supporting literature
      - Note temporal patterns
      - Document spatial factors

   d. Feedback Loop Identification:
      - Look for circular relationships
      - Identify reinforcing loops
      - Note balancing loops
      - Document loop strength
      - Include temporal aspects
      - Note spatial/contextual factors

   e. Relationship Documentation:
      - Create relationship tables
      - Include evidence citations
      - Note relationship strength
      - Document temporal aspects
      - Include spatial considerations
      - Note contextual factors

9. Refinement and Consolidation:
   - Review the list to identify any overlaps or redundancies
   - Use the similar terms lists and frequency assessments to help identify potential consolidations or splits
   - Aim for a final list of exactly 20 variables
   - Ensure the final list represents the most important variables for the fishery

10. Consistency Check:
    - If this is not the first iteration, compare your list with previous iterations
    - Ensure core concepts remain consistent, even if descriptions evolve
    - Use the same identifier (e.g., V1, V2) for variables representing the same core concept across iterations
    - Compare similar term lists and frequency assessments across iterations and update as necessary

11. Evolution Documentation:
    - If a variable's description has evolved, briefly note how and why
    - Ensure evolutions refine the understanding of the variable without changing its fundamental meaning
    - Note any significant additions or changes to the list of similar terms or frequency assessments

## Output
A markdown document containing:

1. Metadata Section:
   - Task identification
   - Date
   - Version
   - Status
   - Author
   - Reviewers

2. Variables Table with columns:
   - Identifier
   - Core Concept Label
   - Variable Name
   - Description
   - Similar Terms
   - Unit of Measurement
   - Raw Frequency Count
   - Relative Frequency (%)
   - Frequency Category
   - Evolution Notes

3. Variable Relationships:
   a. Direct Relationships Table:
      - Variable Identifier
      - Affecting Variables
      - Affected Variables
      - Relationship Type
      - Strength
      - Direction
      - Evidence Source
      - Citations

   b. Relationship Matrix:
      - Matrix showing all direct relationships
      - Strength indicators
      - Direction indicators
      - Evidence quality indicators

   c. Feedback Loops:
      - Loop Identifier
      - Variables Involved
      - Loop Type (Reinforcing/Balancing)
      - Strength
      - Temporal Aspects
      - Spatial/Contextual Factors
      - Evidence Base

4. Frequency Analysis:
   - Total Sentences Analyzed
   - IQR Values (Q1, Q3, IQR)

5. Variable Categories:
   - High Frequency Variables
   - Medium Frequency Variables
   - Low Frequency Variables

6. Temporal Considerations:
   - Short-term Variables
   - Long-term Variables

7. Stakeholder Perspectives:
   - Industry Stakeholders
   - Government Stakeholders
   - Research Stakeholders

8. Evidence Base:
   - Strong Evidence
   - Moderate Evidence
   - Limited Evidence

9. Confidence Assessment Table with columns:
   - Variable
   - Confidence Score (0-1)
   - Evidence Type
   - Notes

10. References:
    - List of cited references

11. Notes for Next Task:
    - Key considerations for relationship extraction
    - Potential relationship patterns to look for
    - Areas requiring special attention
    - Feedback loop structures to explore
    - Temporal aspects to consider
    - Spatial/contextual factors to examine

## Quality Control
- Ensure no duplicate core concepts
- Verify that each variable has a clear, concise description that aligns with its core concept
- Check that the total number of variables is exactly 20
- Ensure consistency in frequency assessment methodology across all concepts
- Randomly sample and manually verify a subset of the frequency counts to ensure accuracy
- Verify that similar term lists are comprehensive and accurately reflect the language used in the profile
- Check that the sum of all raw counts does not exceed the total number of sections multiplied by a reasonable factor (e.g., 3-5)
- Ensure all variables are grounded in empirical evidence from the profile

## Iteration
- If this is not the first iteration, use the results of previous iterations as a starting point
- Focus on refining descriptions, similar term lists, and measurements rather than drastically changing the core concepts
- Maintain the same baseline for total sections and frequency thresholds across iterations
- Document any significant changes or insights gained through the iteration process

## Handling Variability
- If certain variables are ambiguous, document alternative interpretations in the description and similar terms list
- For variables with varying definitions in the profile, choose the most prevalent or relevant definition for the core concept, but include the variations in the similar terms list
- For concepts often implied but not explicitly stated, make a note in the analysis and consider adjusting the counting method to include contextual references

## Considerations for Subsequent Tasks
- Consider how each variable might interact with others, as this will be crucial for Task 2 (Relationship Extraction)
- Think about how variables might cluster or form subsystems, which will be helpful for Task 3 (Relationship Matrix Creation) and Task 4 (Feedback Loop Identification)
- Consider the measurability and data availability for each variable, as this will impact Task 8 (Gap and Uncertainty Analysis)
- The similar terms identified for each variable will be valuable in Task 2 for identifying relationships that might be expressed using different terminology
- The evolution notes and frequency assessments may provide insights into system dynamics that could be relevant in Task 5 (Indirect Relationship Analysis) and Task 6 (Context-Dependent Relationship Identification)
- Pay attention to the frequency categories (High/Medium/Low) as they may indicate the relative importance or prominence of different aspects of the system, which could influence how they are treated in subsequent analysis tasks
