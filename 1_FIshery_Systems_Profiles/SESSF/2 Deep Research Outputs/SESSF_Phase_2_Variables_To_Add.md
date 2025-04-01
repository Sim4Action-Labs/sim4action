# SESSF Phase 2 Variables to Add

This document tracks variables from Phase 2 that need to be incorporated into the master files.

## Environmental Variables (Section 3.2)
| Variable ID | Variable Name | Variable Type | Unit of Measurement | Data Source | Process Description | Notes |
|-------------|---------------|---------------|-------------------|-------------|-------------------|--------|
| V41 | Sea Surface Temperature | State | °C | CSIRO Marine and Atmospheric Research | Temperature of the ocean surface layer | Global hotspot for ocean warming |
| V42 | Bottom Temperature | State | °C | CMEMS; CSIRO; IMOS | Temperature at the ocean floor | Critical for demersal species |
| V43 | Chlorophyll-a | State | μg/L | CMEMS; IMOS | Photosynthetic pigment indicating primary productivity | Key ecosystem productivity indicator |
| V44 | Southern Oscillation Index | State | Standardized index | Bureau of Meteorology | Measure of El Niño/La Niña intensity | Influences ocean currents |
| V45 | Southern Annular Mode | State | Standardized index | Bureau of Meteorology | Indicator of westerly wind movement | Affects storm patterns |
| V46 | Diatom:Dinoflagellate Ratio | State | Ratio | IMOS; CSIRO | Food web structure indicator | Base of food web for fished species |
| V47 | Ocean Acidification | State | pH units | CSIRO | Ocean pH level | Impacts shellfish and coral |
| V48 | Ocean Currents | State | m/s; degrees | IMOS; CMEMS | Direction and strength of currents | Affects species distribution |
| V49 | Upwelling Intensity | State | Various indices | IMOS; CSIRO | Strength of nutrient-rich water upwelling | Critical for ecosystem productivity |
| V50 | Oxygen Levels | State | mg/L | IMOS; CSIRO | Dissolved oxygen concentration | Declining with warming |
| V51 | Extreme Weather Events | State | Various metrics | Bureau of Meteorology; CSIRO | Frequency and intensity of storms | Disrupts fishing operations |

## Economic Variables (Section 3.3)
| Variable ID | Variable Name | Variable Type | Unit of Measurement | Data Source | Process Description | Notes |
|-------------|---------------|---------------|-------------------|-------------|-------------------|--------|
| V52 | Gross Value of Production | Flow | AUD | ABARES | Total market value at landing | 20% of Commonwealth fisheries' GVP |
| V53 | Net Economic Returns | Flow | AUD | ABARES Economic Survey | Profits after all costs | Key performance indicator |
| V54 | Total Factor Productivity | State | Index | ABARES | Efficiency in input conversion | Base year = 100 |
| V55 | Quota Values | State | AUD/kg | AFMA; Industry reports | Market value of ITQs | Reflects profitability |
| V56 | Operating Costs | Flow | AUD | ABARES Economic Survey | Fishing operation costs | Varies by sector |
| V57 | Employment | State | FTE | ABARES; ABS | Number of employed people | Declining with fleet consolidation |
| V58 | Fleet Capacity | State | Various | AFMA; ABARES | Fishing power measure | Decreasing with consolidation |
| V59 | Export Value | Flow | AUD | ABARES; DFAT | International market value | Affected by exchange rates |
| V60 | Financial Performance | State | % | ABARES | Profit margins and ROI | Varies by sector |

## Social Variables (Section 3.4)
| Variable ID | Variable Name | Variable Type | Unit of Measurement | Data Source | Process Description | Notes |
|-------------|---------------|---------------|-------------------|-------------|-------------------|--------|
| V61 | Employment in Fishery | State | FTE | ABARES; ABS | Direct harvesting employment | Important for coastal communities |
| V62 | Fleet Size | State | Count | AFMA; ABARES | Active fishing vessels | Declining with consolidation |
| V63 | Community Economic Dependence | State | % | ABARES; University research | Community reliance on fishery | Varies by location |
| V64 | Indigenous Participation | State | % | AFMA; Indigenous organizations | Indigenous commercial fishing | Cultural and economic importance |
| V65 | Gender Composition | State | % | ABARES; ABS | Gender breakdown | Equity indicator |
| V66 | Age Structure | State | Years | ABARES; ABS | Age distribution | Succession indicator |
| V67 | Fisher Wellbeing | State | Various indices | University research | Physical and mental health | Understudied aspect |
| V68 | Community Perceptions | State | Survey responses | University research | Public attitudes | Social license indicator |
| V69 | Food Security Contribution | State | tonnes; % | ABARES | Domestic seafood supply | Important protein source |
| V70 | Cultural Heritage Value | State | Qualitative | Cultural assessments | Community identity | Non-economic value |

## Technical Variables (Section 3.5)
| Variable ID | Variable Name | Variable Type | Unit of Measurement | Data Source | Process Description | Notes |
|-------------|---------------|---------------|-------------------|-------------|-------------------|--------|
| V71 | Fishing Methods | Parameter | Categorical | AFMA | Gear and techniques | Multiple methods |
| V72 | Fishing Effort | Flow | Various | AFMA; Logbook data | Fishing activity amount | Key management input |
| V73 | Catch Per Unit Effort | State | kg/unit effort | AFMA; Logbook data | Catch efficiency | Abundance index |
| V74 | Discard Rates | State | % | AFMA; Observer programs | Returned catch proportion | Management target |
| V75 | Gear Selectivity | Parameter | Technical specs | AFMA; Research reports | Species targeting ability | Bycatch reduction |
| V76 | Vessel Capacity | State | Various | AFMA vessel register | Individual vessel power | Technological creep concern |
| V77 | Electronic Monitoring | State | % | AFMA | Monitoring coverage | Compliance tool |
| V78 | Spatial Management | Parameter | km² | AFMA; DCCEEW | Area-based management | Habitat protection |
| V79 | Observer Coverage | State | % | AFMA | Independent monitoring | Data verification |
| V80 | Harvest Strategy | Parameter | Qualitative | AFMA; RAG reports | Decision rules | Climate adaptation |

## Market Variables (Section 3.6)
| Variable ID | Variable Name | Variable Type | Unit of Measurement | Data Source | Process Description | Notes |
|-------------|---------------|---------------|-------------------|-------------|-------------------|--------|
| V81 | Species Price | State | AUD/kg | ABARES; Sydney Fish Market | Landed value | Fluctuating |
| V82 | Market Competition | State | % | ABARES; Trade statistics | Import/substitute competition | Price effects |
| V83 | Consumer Preferences | State | Survey data | Market research | Demand patterns | Sustainability focus |
| V84 | Distribution Channels | State | % | Industry surveys | Supply chain pathways | Multiple intermediaries |
| V85 | Market Concentration | State | % | ACCC; Market research | Market power | Price setting |
| V86 | Export Markets | State | Various | ABARES; DFAT | International destinations | Trade agreements |
| V87 | Value Addition | State | % | Industry surveys | Processing value increase | Premium products |
| V88 | Product Substitutability | State | Elasticity | ABARES; Economic research | Species substitution | Market dynamics |
| V89 | Certification Status | State | % | MSC; AFMA | Eco-certification | Market access |
| V90 | Price Volatility | State | % | ABARES; Sydney Fish Market | Price fluctuations | Supply variations |

## Indigenous Knowledge Variables (Section 3.7)
| Variable ID | Variable Name | Variable Type | Unit of Measurement | Data Source | Process Description | Notes |
|-------------|---------------|---------------|-------------------|-------------|-------------------|--------|
| V91 | Traditional Ecological Knowledge | State | Qualitative | Indigenous organizations | Marine ecosystem understanding | Long-term changes |
| V92 | Cultural Fishing Practices | Parameter | Qualitative | Indigenous organizations | Traditional methods | Cultural heritage |
| V93 | Indigenous Governance | State | % | AFMA; Indigenous organizations | Governance participation | Decision-making |
| V94 | Cultural Values Mapping | State | km² | Indigenous organizations | Significant areas | Spatial management |
| V95 | Indigenous Economic Participation | State | % | AFMA; Indigenous organizations | Commercial involvement | Economic equity |
| V96 | Traditional Seasonal Indicators | State | Qualitative | Indigenous organizations | Environmental cues | Phenological changes |
| V97 | Sea Country Management | State | Qualitative | Indigenous organizations | Resource stewardship | Co-management |
| V98 | Cultural Harvest Levels | State | tonnes | Indigenous organizations | Cultural catch volume | Cultural maintenance |
| V99 | Knowledge Transmission | State | Qualitative | Indigenous organizations | Intergenerational transfer | Cultural continuity |
| V100 | Indigenous Research Partnerships | State | Count | Research institutions | Collaborative projects | Knowledge integration |

## Summary Statistics
- Total New Variables: 60
- Environmental Variables: 11
- Economic Variables: 9
- Social Variables: 10
- Technical Variables: 10
- Market Variables: 10
- Indigenous Knowledge Variables: 10

## Next Steps
1. Review for duplicates with existing master variables
2. Identify relationships between new variables
3. Create relationship matrix
4. Update master files
5. Verify system integrity 