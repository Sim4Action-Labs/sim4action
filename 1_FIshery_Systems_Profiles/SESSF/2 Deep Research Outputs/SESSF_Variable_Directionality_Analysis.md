# SESSF Variable Directionality Analysis

This document presents the directionality analysis of variables in the SESSF system, identifying directional terms and proposing neutral alternatives.

## Directionality Analysis Table
| Variable ID | Current Name | Current Description | Neutral Name | Neutral Description | Notes |
|-------------|--------------|-------------------|--------------|-------------------|-------|
| V1 | Stock Level | Current biomass of fish stock | Stock Biomass | Total biomass of fish in the stock | Removed "current" as it implies temporal bias |
| V2 | Recruitment Level | Number of new fish entering the stock | Recruitment Rate | Rate of new fish entering the stock | Changed to rate for consistency with other flow variables |
| V3 | Stock Depletion Rate | Rate at which stock is being depleted | Stock Mortality Rate | Rate of fish removal from stock | Removed directional term "depletion" |
| V4 | Total Allowable Catch | Maximum allowed catch | Catch Limit | Maximum permitted catch quantity | Removed "allowable" as it implies permission |
| V5 | Fishing Mortality Rate | Rate of fish removal | Fishing Mortality Rate | Rate of fish removal | Already neutral |
| V6 | Stock Recovery Rate | Rate of stock rebuilding | Stock Growth Rate | Rate of stock biomass change | Removed directional term "recovery" |
| V7 | Catch Volume | Amount of fish caught | Catch Volume | Amount of fish caught | Already neutral |
| V8 | Profitability | Economic performance | Profit Level | Level of economic return | Removed directional term "ability" |
| V9 | Fleet Size | Number of vessels | Fleet Size | Number of vessels | Already neutral |
| V10 | Fishing Efficiency | Catch per unit effort | Fishing Efficiency | Catch per unit effort | Already neutral |
| V11 | Ocean Temperature | Water temperature | Ocean Temperature | Water temperature | Already neutral |
| V12 | Species Distribution | Geographic range | Species Distribution | Geographic range | Already neutral |
| V13 | Fishing Pattern | Spatial effort distribution | Fishing Pattern | Spatial effort distribution | Already neutral |
| V14 | Market Price | Fish price | Market Price | Fish price | Already neutral |
| V15 | Fishing Effort | Fishing activity level | Fishing Effort | Fishing activity level | Already neutral |
| V16 | Market Supply | Available fish quantity | Market Supply | Available fish quantity | Already neutral |
| V17 | Trophic Structure | Food web organization | Trophic Structure | Food web organization | Already neutral |
| V18 | Predation Rate | Rate of predation | Predation Rate | Rate of predation | Already neutral |
| V19 | Competition Level | Interspecific competition | Competition Level | Interspecific competition | Already neutral |
| V20 | Technological Innovation | Rate of technology adoption | Technology Adoption Rate | Rate of technology adoption | Removed directional term "innovation" |
| V21 | Catchability | Fishing technology effectiveness | Catchability | Fishing technology effectiveness | Already neutral |
| V22 | Import Volume | Imported fish quantity | Import Volume | Imported fish quantity | Removed directional term "ed" |
| V23 | Domestic Supply | Local fish availability | Domestic Supply | Local fish availability | Already neutral |
| V24 | Quota Value | Market value of fishing rights | Quota Value | Market value of fishing rights | Already neutral |
| V25 | Fishing Rights Investment | Investment in quota | Quota Investment Level | Level of investment in fishing rights | Removed directional term "investment" |
| V26 | Enforcement Level | Level of monitoring | Enforcement Level | Level of monitoring | Already neutral |
| V27 | Compliance Rate | Adherence to regulations | Compliance Rate | Rate of regulatory adherence | Removed directional term "adherence" |
| V28 | Illegal Take | Unauthorized catch | Illegal Catch | Unauthorized catch quantity | Removed directional term "take" |

## Summary of Changes
1. Variables Modified: 8
   - V1: Stock Level → Stock Biomass
   - V2: Recruitment Level → Recruitment Rate
   - V3: Stock Depletion Rate → Stock Mortality Rate
   - V4: Total Allowable Catch → Catch Limit
   - V6: Stock Recovery Rate → Stock Growth Rate
   - V8: Profitability → Profit Level
   - V20: Technological Innovation → Technology Adoption Rate
   - V22: Import Volume → Import Volume
   - V25: Fishing Rights Investment → Quota Investment Level
   - V27: Compliance Rate → Compliance Rate
   - V28: Illegal Take → Illegal Catch

2. Variables Unchanged: 17
   - Most variables were already directionally neutral
   - Many flow variables already used appropriate neutral terms

## Notes
1. Most variables were already directionally neutral
2. Main changes focused on:
   - Removing temporal bias (e.g., "current")
   - Removing directional terms (e.g., "depletion", "recovery")
   - Standardizing rate terminology
   - Removing implied outcomes
3. All variables now allow for both increase and decrease
4. Directionality is now only expressed in relationships 