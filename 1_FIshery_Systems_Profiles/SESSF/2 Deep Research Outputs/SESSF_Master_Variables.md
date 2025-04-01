# SESSF Master Variables

This document contains all variables identified in the SESSF system analysis, extracted from feedback loops and other system components.

## Variables Table
| Variable ID | Variable Name | Variable Type | Source Loop | Process Description |
|-------------|---------------|---------------|-------------|-------------------|
| V1 | Stock Biomass | State | L1 | Total biomass of fish in the stock |
| V2 | Recruitment Rate | Flow | L1 | Rate of new fish entering the stock |
| V3 | Stock Mortality Rate | Flow | L1 | Rate of fish removal from stock |
| V4 | Catch Limit | Parameter | L2 | Maximum permitted catch quantity |
| V5 | Fishing Mortality Rate | Flow | L2 | Rate of fish removal |
| V6 | Stock Growth Rate | Flow | L2 | Rate of stock biomass change |
| V7 | Catch Volume | Flow | L3 | Amount of fish caught |
| V8 | Profit Level | State | L3 | Level of economic return |
| V9 | Fleet Size | State | L3 | Number of vessels |
| V10 | Fishing Efficiency | Parameter | L3 | Catch per unit effort |
| V11 | Ocean Temperature | State | L4 | Water temperature |
| V12 | Species Distribution | State | L4 | Geographic range |
| V13 | Fishing Pattern | State | L4 | Spatial effort distribution |
| V14 | Market Price | State | L5 | Fish price |
| V15 | Fishing Effort | Flow | L5 | Fishing activity level |
| V16 | Market Supply | State | L5 | Available fish quantity |
| V17 | Trophic Structure | State | L6 | Food web organization |
| V18 | Predation Rate | Flow | L6 | Rate of predation |
| V19 | Competition Level | State | L6 | Interspecific competition |
| V20 | Technology Adoption Rate | Flow | L7 | Rate of technology adoption |
| V21 | Catchability | Parameter | L7 | Fishing technology effectiveness |
| V22 | Import Volume | Flow | L8 | Imported fish quantity |
| V23 | Domestic Supply | State | L8 | Local fish availability |
| V24 | Quota Value | State | L9 | Market value of fishing rights |
| V25 | Quota Investment Level | Flow | L9 | Level of investment in fishing rights |
| V26 | Enforcement Level | Parameter | L10 | Level of monitoring |
| V27 | Compliance Rate | State | L10 | Rate of regulatory adherence |
| V28 | Illegal Catch | Flow | L10 | Unauthorized catch quantity |

## Summary Statistics
- Total Variables: 28
- State Variables: 12
- Flow Variables: 11
- Parameters: 5

## Notes
- All variables are directionally neutral
- Variables are organized by their unique ID
- Each variable has a source loop identification
- Variables can appear in multiple loops 