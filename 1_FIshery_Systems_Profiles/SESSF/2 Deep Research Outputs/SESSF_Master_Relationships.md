# SESSF Master Relationships

This document contains all relationships identified in the SESSF system analysis, extracted from feedback loops and other system components.

## Relationships Table
| Relationship ID | From Variable | To Variable | Type | Source Loop | Process Description |
|----------------|---------------|-------------|------|-------------|-------------------|
| R1 | V1 (Stock Biomass) | V2 (Recruitment Rate) | Positive | L1 | Higher stock biomass leads to more recruitment |
| R2 | V2 (Recruitment Rate) | V1 (Stock Biomass) | Positive | L1 | More recruitment increases stock biomass |
| R3 | V3 (Stock Mortality Rate) | V1 (Stock Biomass) | Negative | L1 | Mortality reduces stock biomass |
| R4 | V1 (Stock Biomass) | V4 (Catch Limit) | Positive | L2 | Stock biomass influences catch limit |
| R5 | V4 (Catch Limit) | V5 (Fishing Mortality Rate) | Negative | L2 | Catch limit constrains fishing mortality |
| R6 | V5 (Fishing Mortality Rate) | V1 (Stock Biomass) | Negative | L2 | Fishing mortality reduces stock biomass |
| R7 | V6 (Stock Growth Rate) | V1 (Stock Biomass) | Positive | L2 | Growth increases stock biomass |
| R8 | V7 (Catch Volume) | V8 (Profit Level) | Positive | L3 | Higher catches increase profit level |
| R9 | V8 (Profit Level) | V9 (Fleet Size) | Positive | L3 | Profit level influences fleet size |
| R10 | V9 (Fleet Size) | V10 (Fishing Efficiency) | Positive | L3 | Fleet size affects efficiency |
| R11 | V10 (Fishing Efficiency) | V7 (Catch Volume) | Positive | L3 | Efficiency increases catch volume |
| R12 | V11 (Ocean Temperature) | V12 (Species Distribution) | Positive | L4 | Temperature affects distribution |
| R13 | V12 (Species Distribution) | V13 (Fishing Pattern) | Positive | L4 | Distribution influences fishing patterns |
| R14 | V13 (Fishing Pattern) | V7 (Catch Volume) | Positive | L4 | Fishing patterns affect catch volume |
| R15 | V7 (Catch Volume) | V14 (Market Price) | Negative | L5 | Higher supply reduces market price |
| R16 | V14 (Market Price) | V15 (Fishing Effort) | Positive | L5 | Market price influences fishing effort |
| R17 | V15 (Fishing Effort) | V7 (Catch Volume) | Positive | L5 | Effort affects catch volume |
| R18 | V5 (Fishing Mortality Rate) | V17 (Trophic Structure) | Negative | L6 | Fishing mortality affects food web |
| R19 | V17 (Trophic Structure) | V18 (Predation Rate) | Positive | L6 | Food web affects predation rate |
| R20 | V18 (Predation Rate) | V2 (Recruitment Rate) | Negative | L6 | Predation affects recruitment rate |
| R21 | V7 (Catch Volume) | V20 (Technology Adoption Rate) | Positive | L7 | Catch decline drives technology adoption |
| R22 | V20 (Technology Adoption Rate) | V21 (Catchability) | Positive | L7 | Technology adoption increases catchability |
| R23 | V21 (Catchability) | V7 (Catch Volume) | Positive | L7 | Catchability affects catch volume |
| R24 | V7 (Catch Volume) | V23 (Domestic Supply) | Positive | L8 | Catches affect domestic supply |
| R25 | V23 (Domestic Supply) | V14 (Market Price) | Negative | L8 | Supply affects market price |
| R26 | V14 (Market Price) | V22 (Import Volume) | Positive | L8 | Market price influences import volume |
| R27 | V1 (Stock Biomass) | V24 (Quota Value) | Positive | L9 | Stock biomass affects quota value |
| R28 | V24 (Quota Value) | V25 (Quota Investment Level) | Positive | L9 | Quota value influences investment level |
| R29 | V25 (Quota Investment Level) | V7 (Catch Volume) | Positive | L9 | Investment level affects catch volume |
| R30 | V26 (Enforcement Level) | V27 (Compliance Rate) | Positive | L10 | Enforcement level improves compliance rate |
| R31 | V27 (Compliance Rate) | V28 (Illegal Catch) | Negative | L10 | Compliance rate reduces illegal catch |
| R32 | V28 (Illegal Catch) | V1 (Stock Biomass) | Negative | L10 | Illegal catch affects stock biomass |

## Summary Statistics
- Total Relationships: 32
- Positive Relationships: 20
- Negative Relationships: 12
- Relationships per Loop: 3-4

## Notes
- All relationships are directionally explicit (Positive/Negative)
- Relationships are organized by their unique ID
- Each relationship has a source loop identification
- Relationships show direct causal connections between variables
- Variables can participate in multiple relationships across different loops 