# SESSF Feedback Loops

## Overview
This document lists all feedback loops identified in the SESSF system, extracted from the Phase 3 System Dynamics Analysis.

## Feedback Loop Matrix
| Loop ID | Name | Type | Components | Evidence Quality | System Impact | Source | Context |
|---------|------|------|------------|------------------|---------------|---------|---------|
| L1 | Stock-recruitment feedback | Reinforcing | V2 (Stock abundance) → V8 (Recruitment) (+), V8 (Recruitment) → V2 (Stock abundance) (+) | High | Major | [3.4:1] | Core biological feedback |
| L2 | Management response cycle | Balancing | V2 (Stock abundance) → V5 (TAC setting) (-), V5 (TAC setting) → V1 (Fishing mortality) (-), V1 (Fishing mortality) → V2 (Stock abundance) (-) | Medium | Major | [3.4:2] | Management control loop |
| L3 | Economic viability loop | Reinforcing | V2 (Stock abundance) → V14 (Economic returns) (+), V14 (Economic returns) → V10 (Technological advancement) (+), V10 (Technological advancement) → V1 (Fishing efficiency) (+), V1 (Fishing efficiency) → V2 (Stock abundance) (-) | Medium | Major | [3.4:3] | Economic-technical feedback |
| L4 | Climate-distribution-effort cycle | Reinforcing | V3 (Climate change) → V4 (Species distribution) (+), V4 (Species distribution) → V1 (Fishing efficiency) (-), V1 (Fishing efficiency) → V2 (Stock abundance) (-) | Medium | Major | [3.4:4] | Climate adaptation loop |
| L5 | Price-effort feedback | Balancing | V2 (Stock abundance) → V6 (Market prices) (-), V6 (Market prices) → V1 (Fishing effort) (+), V1 (Fishing effort) → V2 (Stock abundance) (-) | Medium | Medium | [3.4:5] | Market regulation loop |
| L6 | Ecosystem reorganization loop | Reinforcing | V1 (Fishing pressure) → V12 (Multi-species interactions) (-), V12 (Multi-species interactions) → V2 (Stock recovery) (-), V2 (Stock recovery) → V1 (Fishing pressure) (+) | Medium | Major | [3.4:6] | Ecosystem feedback |
| L7 | Technical efficiency cycle | Reinforcing | V2 (Stock abundance) → V14 (Economic returns) (-), V14 (Economic returns) → V10 (Technological advancement) (+), V10 (Technological advancement) → V1 (Fishing efficiency) (+), V1 (Fishing efficiency) → V2 (Stock abundance) (-) | Medium | Medium | [3.4:7] | Technical adaptation loop |
| L8 | Market substitution feedback | Balancing | V2 (Stock abundance) → V6 (Market prices) (+), V6 (Market prices) → V7 (Import competition) (+), V7 (Import competition) → V6 (Market prices) (-), V6 (Market prices) → V1 (Fishing effort) (-) | Medium | Major | [3.4:8] | Market competition loop |
| L9 | Quota value dynamics | Reinforcing | V2 (Stock abundance) → V15 (Reference points) (+), V15 (Reference points) → V16 (Quota value) (+), V16 (Quota value) → V14 (Economic returns) (+), V14 (Economic returns) → V2 (Stock abundance) (+) | Medium | Medium | [3.4:9] | Quota market loop |
| L10 | Compliance feedback | Balancing | V11 (Management implementation) → V1 (Compliance) (+), V1 (Compliance) → V2 (Stock abundance) (+), V2 (Stock abundance) → V11 (Management implementation) (-) | Low | Medium | [3.4:10] | Management compliance loop |
| L11 | Indigenous knowledge feedback | Reinforcing | V18 (Traditional ecological knowledge) → V2 (Stock abundance) (+), V2 (Stock abundance) → V18 (Traditional ecological knowledge) (+) | Low | Major | [3.7:1] | Indigenous knowledge system |
| L12 | Cultural practice feedback | Balancing | V19 (Cultural fishing practices) → V1 (Fishing mortality) (-), V1 (Fishing mortality) → V2 (Stock abundance) (-), V2 (Stock abundance) → V19 (Cultural fishing practices) (+) | Low | Medium | [3.7:2] | Cultural fishing approaches |
| L13 | Sea Country management feedback | Reinforcing | V20 (Sea Country management) → V9 (Ecosystem properties) (+), V9 (Ecosystem properties) → V2 (Stock abundance) (+), V2 (Stock abundance) → V20 (Sea Country management) (+) | Low | Major | [3.7:3] | Indigenous management framework |
| L14 | Indigenous governance feedback | Balancing | V22 (Indigenous governance) → V11 (Management implementation) (+), V11 (Management implementation) → V2 (Stock abundance) (+), V2 (Stock abundance) → V22 (Indigenous governance) (-) | Medium | Medium | [3.7:7] | Indigenous governance system |

## Component Details
| Loop ID | From Variable | To Variable | Polarity | Evidence | Delay | Source | Context |
|---------|--------------|-------------|----------|----------|-------|---------|---------|
| L1 | V2 (Stock abundance) | V8 (Recruitment) | + | High | 1-5 years | [3.4:1] | Stock-recruitment relationship |
| L1 | V8 (Recruitment) | V2 (Stock abundance) | + | High | 1-5 years | [3.4:1] | Recruitment contribution |
| L2 | V2 (Stock abundance) | V5 (TAC setting) | - | Medium | 1 year | [3.4:2] | Management response |
| L2 | V5 (TAC setting) | V1 (Fishing mortality) | - | Medium | 1 year | [3.4:2] | TAC control |
| L2 | V1 (Fishing mortality) | V2 (Stock abundance) | - | High | 1-5 years | [3.4:2] | Fishing impact |
| L3 | V2 (Stock abundance) | V14 (Economic returns) | + | Medium | 2-5 years | [3.4:3] | Economic performance |
| L3 | V14 (Economic returns) | V10 (Technological advancement) | + | Medium | 3-10 years | [3.4:3] | Investment in technology |
| L3 | V10 (Technological advancement) | V1 (Fishing efficiency) | + | Medium | 3-10 years | [3.4:3] | Technical improvement |
| L3 | V1 (Fishing efficiency) | V2 (Stock abundance) | - | Medium | 1-5 years | [3.4:3] | Efficiency impact |
| L4 | V3 (Climate change) | V4 (Species distribution) | + | Medium | 5-20+ years | [3.4:4] | Climate impact |
| L4 | V4 (Species distribution) | V1 (Fishing efficiency) | - | Medium | 1-5 years | [3.4:4] | Distribution effect |
| L4 | V1 (Fishing efficiency) | V2 (Stock abundance) | - | Medium | 1-5 years | [3.4:4] | Efficiency impact |
| L5 | V2 (Stock abundance) | V6 (Market prices) | - | Medium | Months-1 year | [3.4:5] | Supply effect |
| L5 | V6 (Market prices) | V1 (Fishing effort) | + | Medium | Months-1 year | [3.4:5] | Price incentive |
| L5 | V1 (Fishing effort) | V2 (Stock abundance) | - | High | 1-5 years | [3.4:5] | Effort impact |
| L6 | V1 (Fishing pressure) | V12 (Multi-species interactions) | - | Medium | 5-20+ years | [3.4:6] | Trophic impact |
| L6 | V12 (Multi-species interactions) | V2 (Stock recovery) | - | Medium | 5-20+ years | [3.4:6] | Recovery effect |
| L6 | V2 (Stock recovery) | V1 (Fishing pressure) | + | Medium | 1-5 years | [3.4:6] | Recovery response |
| L7 | V2 (Stock abundance) | V14 (Economic returns) | - | Medium | 2-5 years | [3.4:7] | Economic impact |
| L7 | V14 (Economic returns) | V10 (Technological advancement) | + | Medium | 3-10 years | [3.4:7] | Investment effect |
| L7 | V10 (Technological advancement) | V1 (Fishing efficiency) | + | Medium | 3-10 years | [3.4:7] | Technical improvement |
| L7 | V1 (Fishing efficiency) | V2 (Stock abundance) | - | Medium | 1-5 years | [3.4:7] | Efficiency impact |
| L8 | V2 (Stock abundance) | V6 (Market prices) | + | Medium | Months-1 year | [3.4:8] | Supply effect |
| L8 | V6 (Market prices) | V7 (Import competition) | + | Medium | Months-1 year | [3.4:8] | Price effect |
| L8 | V7 (Import competition) | V6 (Market prices) | - | Medium-High | Months-1 year | [3.4:8] | Competition effect |
| L8 | V6 (Market prices) | V1 (Fishing effort) | - | Medium | Months-1 year | [3.4:8] | Price response |
| L9 | V2 (Stock abundance) | V15 (Reference points) | + | High | 1 year | [3.4:9] | Status effect |
| L9 | V15 (Reference points) | V16 (Quota value) | + | Medium | Months-1 year | [3.4:9] | Value effect |
| L9 | V16 (Quota value) | V14 (Economic returns) | + | Medium | Months-1 year | [3.4:9] | Economic effect |
| L9 | V14 (Economic returns) | V2 (Stock abundance) | + | Medium | 2-5 years | [3.4:9] | Investment effect |
| L10 | V11 (Management implementation) | V1 (Compliance) | + | Medium | 1-2 years | [3.4:10] | Implementation effect |
| L10 | V1 (Compliance) | V2 (Stock abundance) | + | Low | 3-10+ years | [3.4:10] | Compliance effect |
| L10 | V2 (Stock abundance) | V11 (Management implementation) | - | Medium | 1 year | [3.4:10] | Management response |
| L11 | V18 (Traditional ecological knowledge) | V2 (Stock abundance) | + | Low | 5-20+ years | [3.7:1] | Indigenous knowledge impact |
| L11 | V2 (Stock abundance) | V18 (Traditional ecological knowledge) | + | Low | 5-20+ years | [3.7:1] | Knowledge feedback |
| L12 | V19 (Cultural fishing practices) | V1 (Fishing mortality) | - | Low | 1-5 years | [3.7:2] | Cultural practice effect |
| L12 | V1 (Fishing mortality) | V2 (Stock abundance) | - | High | 1-5 years | [3.7:2] | Fishing impact |
| L12 | V2 (Stock abundance) | V19 (Cultural fishing practices) | + | Low | 1-5 years | [3.7:2] | Cultural feedback |
| L13 | V20 (Sea Country management) | V9 (Ecosystem properties) | + | Low | 5-20+ years | [3.7:3] | Indigenous management impact |
| L13 | V9 (Ecosystem properties) | V2 (Stock abundance) | + | Medium | 5-20+ years | [3.7:3] | Ecosystem effect |
| L13 | V2 (Stock abundance) | V20 (Sea Country management) | + | Low | 5-20+ years | [3.7:3] | Management feedback |
| L14 | V22 (Indigenous governance) | V11 (Management implementation) | + | Medium | 1-2 years | [3.7:7] | Governance integration |
| L14 | V11 (Management implementation) | V2 (Stock abundance) | + | Medium | 3-10+ years | [3.7:7] | Management effect |
| L14 | V2 (Stock abundance) | V22 (Indigenous governance) | - | Medium | 1-2 years | [3.7:7] | Governance feedback |

## Matrix Summary
- Total Loops: 14
- Loop Types:
  - Reinforcing: 9
  - Balancing: 5
- Evidence Quality:
  - High: 2
  - Medium: 8
  - Low: 4
- System Impact:
  - Major: 10
  - Medium: 4
- Component Distribution:
  - 2-component loops: 1
  - 3-component loops: 8
  - 4+ component loops: 5 