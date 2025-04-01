# SESSF Relationships Decomposition

This document contains the decomposed relationships from Tables 3.2 (Core Relationships) and 3.3 (Secondary Relationships) of the SESSF Phase 3 document.

## Variables Table
| Variable ID | Variable Name | Variable Type | Source Table | Process Description |
|-------------|---------------|---------------|--------------|-------------------|
| V1 | Stock Abundance | State | Table 3.2 | Total fish biomass in the stock |
| V2 | Fishing Mortality Rate | Flow | Table 3.2 | Rate of fish removal through fishing |
| V3 | Climate Change Impact | State | Table 3.2 | Level of climate change effects |
| V4 | Species Distribution | State | Table 3.2 | Geographic range of species |
| V5 | Harvest Strategy Controls | Parameter | Table 3.2 | Management control measures |
| V6 | Market Price | State | Table 3.2 | Price of fish in market |
| V7 | Fishing Effort | Flow | Table 3.2 | Level of fishing activity |
| V8 | Import Competition | State | Table 3.2 | Level of competition from imports |
| V9 | Recruitment Rate | Flow | Table 3.2 | Rate of new fish entering stock |
| V10 | Ecosystem Properties | State | Table 3.2 | State of ecosystem components |
| V11 | Stock Recovery Rate | Flow | Table 3.2 | Rate of stock biomass increase |
| V12 | Technological Advancement | State | Table 3.2 | Level of fishing technology |
| V13 | Fishing Efficiency | State | Table 3.2 | Effectiveness of fishing operations |
| V14 | Management Implementation | State | Table 3.2 | Level of management measures |
| V15 | Compliance Rate | State | Table 3.2 | Rate of regulatory adherence |
| V16 | Multi-species Interactions | State | Table 3.2 | Level of species interactions |
| V17 | Stock Dynamics | State | Table 3.2 | Changes in stock characteristics |
| V18 | Social Conditions | State | Table 3.2 | State of social factors |
| V19 | Fleet Dynamics | State | Table 3.2 | Changes in fleet characteristics |
| V20 | Economic Returns | State | Table 3.2 | Level of economic performance |
| V21 | Industry Investment | Flow | Table 3.2 | Rate of industry investment |
| V22 | Reference Points | Parameter | Table 3.2 | Management reference levels |
| V23 | TAC Setting | State | Table 3.2 | Total Allowable Catch determination |
| V24 | Quota Latency | State | Table 3.2 | Delay in quota utilization |
| V25 | Environmental Indicators | State | Table 3.2 | State of environmental factors |
| V26 | Stock Productivity | State | Table 3.2 | Level of stock production |
| V27 | Ocean Temperature | State | Table 3.3 | Water temperature level |
| V28 | Trophic Structure | State | Table 3.3 | Organization of food web |
| V29 | Bycatch Rate | Flow | Table 3.3 | Rate of non-target catch |
| V30 | Stock Status | State | Table 3.3 | Current state of stock |
| V31 | Primary Productivity | State | Table 3.3 | Level of primary production |
| V32 | Quota Trading | Flow | Table 3.3 | Rate of quota exchange |
| V33 | Fishing Patterns | State | Table 3.3 | Spatial distribution of fishing |
| V34 | Spatial Stock Depletion | State | Table 3.3 | Local stock reduction |
| V35 | Habitat Degradation | State | Table 3.3 | Level of habitat damage |
| V36 | Species Abundance | State | Table 3.3 | Number of species |
| V37 | Ecosystem Function | State | Table 3.3 | Level of ecosystem operation |
| V38 | Social License | State | Table 3.3 | Level of social acceptance |
| V39 | Management Restrictions | State | Table 3.3 | Level of management limits |
| V40 | Economic Performance | State | Table 3.3 | Level of economic outcomes |

## Relationships Table
| Relationship ID | From Variable | To Variable | Type | Source Table | Process Description |
|----------------|---------------|-------------|------|--------------|-------------------|
| R1 | V2 | V1 | Negative | Table 3.2 | Fishing mortality reduces stock abundance |
| R2 | V3 | V4 | Variable | Table 3.2 | Climate change affects species distribution |
| R3 | V5 | V2 | Negative | Table 3.2 | Harvest strategy controls reduce fishing mortality |
| R4 | V6 | V7 | Positive | Table 3.2 | Market prices influence fishing effort |
| R5 | V8 | V6 | Negative | Table 3.2 | Import competition reduces domestic prices |
| R6 | V1 | V9 | Positive | Table 3.2 | Stock abundance affects recruitment |
| R7 | V10 | V11 | Complex | Table 3.2 | Ecosystem properties influence stock recovery |
| R8 | V12 | V13 | Positive | Table 3.2 | Technological advancement increases fishing efficiency |
| R9 | V14 | V15 | Positive | Table 3.2 | Management implementation improves compliance |
| R10 | V16 | V17 | Variable | Table 3.2 | Multi-species interactions affect stock dynamics |
| R11 | V18 | V19 | Complex | Table 3.2 | Social conditions influence fleet dynamics |
| R12 | V20 | V21 | Positive | Table 3.2 | Economic returns drive industry investment |
| R13 | V22 | V23 | Positive | Table 3.2 | Reference points influence TAC setting |
| R14 | V24 | V20 | Negative | Table 3.2 | Quota latency reduces economic returns |
| R15 | V25 | V26 | Variable | Table 3.2 | Environmental indicators affect stock productivity |
| R16 | V3 | V27 | Positive | Table 3.3 | Climate change increases ocean temperature |
| R17 | V27 | V4 | Positive | Table 3.3 | Ocean temperature affects species distribution |
| R18 | V2 | V28 | Negative | Table 3.3 | Fishing pressure alters trophic structure |
| R19 | V28 | V11 | Negative | Table 3.3 | Trophic structure affects stock recovery |
| R20 | V7 | V29 | Positive | Table 3.3 | Fishing effort increases bycatch rates |
| R21 | V14 | V15 | Positive | Table 3.3 | Management measures improve compliance |
| R22 | V15 | V30 | Positive | Table 3.3 | Compliance improves stock status |
| R23 | V3 | V31 | Variable | Table 3.3 | Climate change affects primary productivity |
| R24 | V31 | V9 | Positive | Table 3.3 | Primary productivity influences recruitment |
| R25 | V32 | V33 | Variable | Table 3.3 | Quota trading affects fishing patterns |
| R26 | V33 | V34 | Positive | Table 3.3 | Fishing patterns influence spatial stock depletion |
| R27 | V35 | V36 | Negative | Table 3.3 | Habitat degradation reduces species abundance |
| R28 | V36 | V37 | Positive | Table 3.3 | Species abundance affects ecosystem function |
| R29 | V38 | V39 | Variable | Table 3.3 | Social license influences management restrictions |
| R30 | V39 | V40 | Negative | Table 3.3 | Management restrictions affect economic performance |

## Summary Statistics
- Total Variables: 40
- State Variables: 32
- Flow Variables: 6
- Parameters: 2
- Total Relationships: 30
- Positive Relationships: 15
- Negative Relationships: 8
- Variable Relationships: 7

## Notes
1. All variables are directionally neutral
2. All relationships have explicit directionality
3. Each variable and relationship is traced to source tables
4. Process descriptions are clear and concise
5. No circular references in relationships
6. Variables and relationships maintain consistency with existing master tables 