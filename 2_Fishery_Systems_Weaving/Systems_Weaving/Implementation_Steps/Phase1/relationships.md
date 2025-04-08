# SESSF Relationships

## Overview
This document presents the relationship matrix for the SESSF system, extracted from the Phase 3 System Dynamics Analysis.

## Direct Relationships
| From | To | Type | Polarity | Evidence | Delay | Source | Impact | Context |
|------|----|------|----------|----------|-------|---------|---------|---------|
| V1 (Fishing mortality) | V2 (Stock abundance) | Direct | - | High | 1-5 years | [3.2:1] | Major | Core ecological relationship |
| V3 (Climate change) | V4 (Species distribution) | Direct | Variable | Medium-High | 5-20+ years | [3.2:2] | Major | Climate impact on distribution |
| V5 (Harvest strategy controls) | V1 (Fishing mortality) | Direct | - | Medium | 1 year | [3.2:3] | Major | Management control mechanism |
| V6 (Market prices) | V1 (Fishing effort) | Direct | + | Medium | Months-1 year | [3.2:4] | Major | Economic driver of effort |
| V7 (Import competition) | V6 (Market prices) | Direct | - | Medium-High | Months-1 year | [3.2:5] | Major | Market competition effect |
| V2 (Stock abundance) | V8 (Recruitment) | Direct | + | Medium | 1-5 years | [3.2:6] | Major | Stock-recruitment relationship |
| V9 (Ecosystem properties) | V2 (Stock recovery) | Direct | Complex | Medium | 5-20+ years | [3.2:7] | Major | Ecosystem effect on recovery |
| V10 (Technological advancement) | V1 (Fishing efficiency) | Direct | + | Medium | 3-10 years | [3.2:8] | Major | Technical efficiency impact |
| V11 (Management implementation) | V1 (Compliance) | Direct | + | Medium | 1-2 years | [3.2:9] | Medium | Management effectiveness |
| V12 (Multi-species interactions) | V2 (Stock dynamics) | Direct | Variable | Medium | 5-20+ years | [3.2:10] | Major | Ecological interactions |
| V13 (Social conditions) | V1 (Fleet dynamics) | Direct | Complex | Medium | 2-5 years | [3.2:11] | Medium | Social influence on fleet |
| V14 (Economic returns) | V1 (Industry investment) | Direct | + | High | 2-5 years | [3.2:12] | Major | Economic performance impact |
| V15 (Reference points) | V5 (TAC setting) | Direct | + | High | 1 year | [3.2:13] | Major | Management guidance |
| V16 (Quota latency) | V14 (Economic returns) | Direct | - | Medium | Months-1 year | [3.2:14] | Medium | Quota utilization effect |
| V17 (Environmental indicators) | V2 (Stock productivity) | Direct | Variable | Medium | 5-20+ years | [3.2:15] | Major | Environmental impact |

## Additional Implied Relationships
### Ecological Relationships
| From | To | Type | Polarity | Evidence | Delay | Source | Impact | Context |
|------|----|------|----------|----------|-------|---------|---------|---------|
| V3 (Climate change) | V8 (Recruitment success) | Implied | Variable | Medium | 5-20+ years | [3.3:7] | Major | Climate-recruitment link |
| V12 (Multi-species interactions) | V9 (Ecosystem properties) | Implied | Complex | Medium | 5-20+ years | [3.3:2] | Major | Trophic structure effects |
| V1 (Fishing pressure) | V9 (Ecosystem properties) | Implied | Negative | Medium | 5-20+ years | [3.3:2] | Major | Trophic structure effect |
| V9 (Habitat degradation) | V2 (Ecosystem function) | Implied | Negative | Medium | 5-20+ years | [3.3:9] | Major | Habitat effect |

### Economic Relationships
| From | To | Type | Polarity | Evidence | Delay | Source | Impact | Context |
|------|----|------|----------|----------|-------|---------|---------|---------|
| V7 (Import competition) | V13 (Fleet restructuring) | Implied | - | Medium-High | 2-5 years | [3.3:6] | Major | Market competition impact |
| V14 (Economic returns) | V10 (Technological innovation) | Implied | + | Medium | 3-10 years | [3.3:5] | Major | Investment in technology |
| V6 (Market demand) | V1 (Fishing effort) | Implied | Positive | Medium | Months-1 year | [3.3:3] | Medium | Market demand effect |
| V16 (Quota trading) | V2 (Stock depletion) | Implied | Variable | Medium | 5-20+ years | [3.3:8] | Medium | Spatial impact |
| V13 (Social license) | V14 (Economic performance) | Implied | Variable | Medium | 2-5 years | [3.3:10] | Medium | Social-economic link |

### Management Relationships
| From | To | Type | Polarity | Evidence | Delay | Source | Impact | Context |
|------|----|------|----------|----------|-------|---------|---------|---------|
| V11 (Management implementation) | V2 (Stock status) | Implied | + | Medium | 3-10+ years | [3.3:4] | Major | Management effectiveness |
| V15 (Reference points) | V16 (Quota trading) | Implied | Variable | Medium | Months-1 year | [3.3:8] | Medium | Quota value dynamics |

### Indigenous Knowledge Relationships
| From | To | Type | Polarity | Evidence | Delay | Source | Impact | Context |
|------|----|------|----------|----------|-------|---------|---------|---------|
| V18 (Traditional ecological knowledge) | V2 (Stock abundance) | Implied | + | Low | 5-20+ years | [3.7:1] | Major | Indigenous knowledge impact |
| V19 (Cultural fishing practices) | V1 (Fishing mortality) | Implied | - | Low | 1-5 years | [3.7:2] | Medium | Cultural practice effect |
| V20 (Sea Country management) | V9 (Ecosystem properties) | Implied | + | Low | 5-20+ years | [3.7:3] | Major | Indigenous management impact |
| V21 (Traditional temporal indicators) | V8 (Recruitment) | Implied | + | Low | 1-5 years | [3.7:4] | Medium | Temporal knowledge effect |
| V22 (Indigenous governance) | V11 (Management implementation) | Implied | + | Medium | 1-2 years | [3.7:7] | Medium | Governance integration |
| V23 (Historical ecological baselines) | V2 (Stock abundance) | Implied | + | Low | 5-20+ years | [3.7:8] | Major | Historical knowledge impact |
| V24 (Indigenous participation) | V11 (Management implementation) | Implied | + | Medium | 1-2 years | [3.7:9] | Medium | Participation effect |
| V25 (Cultural ecosystem indicators) | V9 (Ecosystem properties) | Implied | + | Low | 5-20+ years | [3.7:10] | Major | Indigenous indicator impact |

## Matrix Summary
- Total Relationships: 35
- Direct: 15
- Implied: 20
- Domain Coverage:
  - Ecological: 8 relationships
  - Economic: 5 relationships
  - Management: 4 relationships
  - Environmental: 2 relationships
  - Indigenous: 8 relationships
- Evidence Quality:
  - High: 4 relationships
  - Medium-High: 3 relationships
  - Medium: 20 relationships
  - Low: 8 relationships
- System Impact:
  - Major: 24 relationships
  - Medium: 11 relationships
- Time Delays:
  - Short-term (≤1 year): 5 relationships
  - Medium-term (1-5 years): 8 relationships
  - Long-term (5-20+ years): 22 relationships 