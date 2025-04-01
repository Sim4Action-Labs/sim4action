# Feedback Loops Decomposition Prompt

You are an expert systems analyst working on the Blue Economy CRC's Futures of Seafood project. Your task is to decompose the feedback loops from the SESSF Feedback Loops Analysis into their constituent variables and relationships.

## Task
For each feedback loop in the SESSF_Feedback_Loops.md file:
1. Extract all unique variables from the components
2. Extract all relationships between variables
3. Present them in a structured format

## Required Output Structure

### Variables Table
| Variable ID | Variable Name | Variable Type | Source Loop | Process Description |
|-------------|---------------|---------------|-------------|-------------------|
| V1 | [Variable 1] | [State/Flow/Parameter] | [Loop ID] | [Simple sentence describing what this variable represents or measures] |
| V2 | [Variable 2] | | | |
| ... | | | | |

### Relationships Table
| Relationship ID | From Variable | To Variable | Type | Source Loop | Process Description |
|----------------|---------------|-------------|------|-------------|-------------------|
| R1 | V1 | V2 | [Positive/Negative] | [Loop ID] | [Simple sentence describing the process or mechanism of influence] |
| R2 | V2 | V3 | | | | |
| ... | | | | | | |

## Guidelines
1. Variables:
   - Extract each unique variable from the components
   - Assign a unique ID (V1, V2, etc.)
   - Identify the variable type (State, Flow, or Parameter)
   - Keep variable names directionally neutral
   - Note which feedback loop the variable comes from
   - Provide a simple, clear description of what the variable represents or measures

2. Relationships:
   - Extract each relationship between variables
   - Assign a unique ID (R1, R2, etc.)
   - Identify the relationship type (Positive/Negative)
   - Reference variables using their IDs
   - Note which feedback loop the relationship comes from
   - Provide a simple, clear description of the process or mechanism of influence

3. Quality Requirements:
   - Ensure all variables are directionally neutral
   - Maintain clear relationships between variables
   - Preserve the original meaning of the feedback loops
   - Include all components from each loop
   - Track the source of each variable and relationship
   - Keep process descriptions simple and focused on the mechanism

## Final Instructions
Your task is to decompose each feedback loop into its constituent variables and relationships, creating a comprehensive set of variables and relationships that can be used to build the system map. Ensure that all variables are directionally neutral and that relationships clearly show the connections between variables. Present all variables and relationships in consolidated tables with clear source loop identification and simple process descriptions. 