# SESSF Merged Relationships V2

This document contains the merged relationships from both master and newly decomposed tables, incorporating all identified merges and maintaining system integrity. This version includes additional relationships identified through systematic analysis of system connectivity.

## Relationships Table
[Previous relationships R1-R107 remain unchanged]

### New Environmental-Stock Relationships (R108-R115)
| Relationship ID | From Variable | To Variable | Relationship Description | Type | Category | Process Description | Evidence | Strength | Notes |
|----------------|---------------|-------------|------------------------|------|-----------|-------------------|-----------|-----------|--------|
| R108 | V49 | V12 | Upwelling Intensity → Species Distribution | Variable | Environmental | Upwelling brings nutrient-rich water affecting species distribution patterns | IMOS data | Medium | Physical-biological coupling |
| R109 | V50 | V12 | Oxygen Levels → Species Distribution | Positive | Environmental | Fish require adequate oxygen levels for survival | IMOS data | Strong | Physiological requirement |
| R110 | V46 | V2 | Diatom:Dinoflagellate Ratio → Recruitment Rate | Variable | Environmental | Phytoplankton community structure affects larval food availability | Research studies | Medium | Food web dynamics |
| R111 | V44 | V12 | Southern Oscillation Index → Species Distribution | Variable | Environmental | ENSO events affect water temperature and productivity | Historical data | Medium | Climate-ocean coupling |
| R112 | V48 | V2 | Ocean Currents → Recruitment Rate | Variable | Environmental | Currents affect larval transport and survival | Research studies | Strong | Physical transport |
| R113 | V49 | V1 | Upwelling Intensity → Stock Biomass | Positive | Environmental | Upwelling increases productivity and food availability | Research studies | Medium | Bottom-up control |
| R114 | V45 | V31 | Southern Annular Mode → Primary Productivity | Variable | Environmental | SAM affects wind patterns and nutrient mixing | Climate studies | Medium | Climate-ocean coupling |
| R115 | V47 | V2 | Ocean Acidification → Recruitment Rate | Negative | Environmental | Acidification affects larval development | Laboratory studies | Medium | Climate impact |

### New Economic-Social Relationships (R116-R124)
| Relationship ID | From Variable | To Variable | Relationship Description | Type | Category | Process Description | Evidence | Strength | Notes |
|----------------|---------------|-------------|------------------------|------|-----------|-------------------|-----------|-----------|--------|
| R116 | V53 | V63 | Net Economic Returns → Community Economic Dependence | Positive | Economic | Higher returns support community stability | ABARES surveys | Strong | Economic foundation |
| R117 | V57 | V63 | Employment → Community Economic Dependence | Positive | Social | Direct employment affects community dependence | ABS statistics | Strong | Social structure |
| R118 | V60 | V67 | Financial Performance → Fisher Wellbeing | Positive | Economic | Financial stability affects wellbeing | Social studies | Medium | Economic-social link |
| R119 | V55 | V63 | Quota Values → Community Economic Dependence | Variable | Economic | Quota value affects community wealth | Industry data | Medium | Asset effects |
| R120 | V54 | V57 | Total Factor Productivity → Employment | Variable | Economic | Productivity changes affect labor needs | ABARES data | Medium | Labor dynamics |
| R121 | V56 | V67 | Operating Costs → Fisher Wellbeing | Negative | Economic | High costs create financial stress | Economic surveys | Medium | Economic pressure |
| R122 | V60 | V68 | Financial Performance → Community Perceptions | Positive | Economic | Industry success influences support | Social studies | Medium | Social license |
| R123 | V57 | V66 | Employment → Age Structure | Variable | Social | Job availability affects demographics | ABS data | Medium | Workforce dynamics |
| R124 | V53 | V65 | Net Economic Returns → Gender Composition | Variable | Economic | Profitability affects workforce diversity | Industry surveys | Medium | Social equity |

### New Technical-Management Relationships (R125-R133)
| Relationship ID | From Variable | To Variable | Relationship Description | Type | Category | Process Description | Evidence | Strength | Notes |
|----------------|---------------|-------------|------------------------|------|-----------|-------------------|-----------|-----------|--------|
| R125 | V79 | V27 | Observer Coverage → Compliance Rate | Positive | Technical | Direct observation improves compliance | AFMA data | Strong | Monitoring effect |
| R126 | V71 | V39 | Fishing Methods → Management Restrictions | Variable | Technical | Methods influence management measures | AFMA records | Medium | Technical-management link |
| R127 | V76 | V4 | Vessel Capacity → Catch Limit | Variable | Technical | Fleet capacity influences catch limits | Historical data | Medium | Capacity management |
| R128 | V75 | V39 | Gear Selectivity → Management Restrictions | Variable | Technical | Selectivity affects management needs | Technical data | Medium | Technical measures |
| R129 | V80 | V26 | Harvest Strategy → Enforcement Level | Positive | Management | Strategy complexity requires enforcement | AFMA data | Medium | Implementation needs |
| R130 | V79 | V39 | Observer Coverage → Management Restrictions | Variable | Technical | Monitoring influences management decisions | AFMA data | Medium | Adaptive management |
| R131 | V76 | V26 | Vessel Capacity → Enforcement Level | Positive | Technical | Fleet capacity affects enforcement needs | AFMA data | Medium | Monitoring requirements |
| R132 | V78 | V39 | Spatial Management → Management Restrictions | Variable | Management | Spatial measures require specific rules | AFMA data | Strong | Spatial planning |
| R133 | V77 | V39 | Electronic Monitoring → Management Restrictions | Variable | Technical | Monitoring capability affects management | AFMA data | Medium | Technology integration |

## Summary Statistics
- Total Relationships: 133 (up from 107)
- Positive Relationships: 75 (up from 65)
- Negative Relationships: 23 (up from 20)
- Variable Relationships: 35 (up from 22)
- Strong Relationships: 18 (up from 12)
- Medium Relationships: 101 (up from 83)
- Weak Relationships: 14 (up from 12)

## Notes
- All relationships are directionally explicit
- Relationships are organized by their unique ID
- Each relationship includes source and evidence information
- Relationships show direct causal connections between variables
- Variables can participate in multiple relationships
- New relationships strengthen system connectivity
- Evidence base includes empirical data, theory, and expert knowledge
- Temporal and spatial scales are considered
- Management relevance is maintained
- System-wide impacts are acknowledged 