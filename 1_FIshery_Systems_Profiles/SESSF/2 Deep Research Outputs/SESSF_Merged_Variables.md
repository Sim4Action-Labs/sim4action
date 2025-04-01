# SESSF Merged Variables

This document contains the merged variables from both master and newly decomposed tables, incorporating all identified merges and maintaining system integrity.

## Variables Table
| Variable ID | Variable Name | Variable Type | Category | Unit of Measurement | Data Source | Process Description | Notes |
|-------------|---------------|---------------|-----------|-------------------|-------------|-------------------|--------|
| V1 | Stock Biomass | State | Stock | tonnes | AFMA; CSIRO | Total fish biomass in the fishery | Key management target |
| V2 | Recruitment Rate | Flow | Stock | tonnes/year | AFMA; CSIRO | New fish entering the stock | Critical for sustainability |
| V3 | Mortality Rate | Flow | Stock | tonnes/year | AFMA; CSIRO | Fish leaving the stock | Natural and fishing mortality |
| V4 | Catch Limit | Parameter | Management | tonnes/year | AFMA | Maximum allowed catch | Management control |
| V5 | Fishing Mortality | Flow | Fishing | tonnes/year | AFMA; CSIRO | Fish caught by fishing | Key management variable |
| V6 | Growth Rate | Flow | Stock | tonnes/year | AFMA; CSIRO | Fish biomass increase | Natural process |
| V7 | Catch Volume | Flow | Fishing | tonnes/year | AFMA; Logbooks | Actual fish caught | Performance measure |
| V8 | Profit Level | State | Economic | AUD | ABARES | Fishery profitability | Economic indicator |
| V9 | Fleet Size | State | Fishing | Number | AFMA | Active fishing vessels | Capacity measure |
| V10 | Efficiency | State | Fishing | Various | AFMA; ABARES | Fishing efficiency | Performance measure |
| V11 | Ocean Temperature | State | Environmental | °C | CSIRO | Ocean temperature | Climate change impact |
| V12 | Species Distribution | State | Stock | km² | CSIRO | Species spatial range | Climate response |
| V13 | Fishing Patterns | State | Fishing | Various | AFMA | Fishing behavior | Effort distribution |
| V14 | Market Price | State | Economic | AUD/kg | ABARES | Fish market price | Economic driver |
| V15 | Fishing Effort | Flow | Fishing | Various | AFMA | Fishing activity | Management input |
| V16 | Stock Status | State | Stock | Various | AFMA | Overall stock health | Management target |
| V17 | Food Web Structure | State | Ecosystem | Various | CSIRO | Ecosystem relationships | System complexity |
| V18 | Predation Rate | Flow | Ecosystem | Various | CSIRO | Natural mortality | Ecosystem process |
| V19 | Stock Recovery | State | Stock | Various | AFMA | Stock rebuilding | Management goal |
| V20 | Technology Adoption | State | Fishing | Various | AFMA | Fishing technology | Innovation measure |
| V21 | Catchability | State | Fishing | Various | AFMA | Fishing effectiveness | Efficiency factor |
| V22 | Import Volume | State | Market | tonnes | ABARES | Imported fish | Market competition |
| V23 | Domestic Supply | State | Market | tonnes | ABARES | Local fish supply | Market balance |
| V24 | Quota Value | State | Economic | AUD/kg | AFMA | Quota market value | Economic asset |
| V25 | Investment Level | State | Economic | AUD | ABARES | Fishery investment | Growth driver |
| V26 | Enforcement Level | State | Management | Various | AFMA | Management enforcement | Compliance tool |
| V27 | Compliance Rate | State | Management | % | AFMA | Rule compliance | Management success |
| V28 | Illegal Catch | Flow | Fishing | tonnes/year | AFMA | Unauthorized catch | Management challenge |
| V29 | Climate Change Impact | State | Environmental | Various | CSIRO | Climate effects | System pressure |
| V30 | Stock Status | State | Stock | Various | AFMA | Stock condition | Management focus |
| V31 | Primary Productivity | State | Ecosystem | Various | CSIRO | Ecosystem production | Base of food web |
| V32 | Quota Trading | Flow | Economic | Various | AFMA | Quota market activity | Economic efficiency |
| V33 | Fishing Patterns | State | Fishing | Various | AFMA | Spatial effort | Management concern |
| V34 | Spatial Stock Depletion | State | Stock | Various | AFMA | Local stock levels | Management issue |
| V35 | Habitat Degradation | State | Ecosystem | Various | CSIRO | Habitat condition | System pressure |
| V36 | Species Abundance | State | Stock | Various | AFMA | Species numbers | Biodiversity measure |
| V37 | Ecosystem Function | State | Ecosystem | Various | CSIRO | System processes | System health |
| V38 | Social License | State | Social | Various | Public | Public acceptance | Management factor |
| V39 | Management Restrictions | Parameter | Management | Various | AFMA | Management rules | Control measure |
| V40 | Economic Performance | State | Economic | Various | ABARES | Economic health | Success indicator |
| V41 | Sea Surface Temperature | State | Environmental | °C | CSIRO Marine and Atmospheric Research | Temperature of the ocean surface layer | Global hotspot for ocean warming |
| V42 | Bottom Temperature | State | Environmental | °C | CMEMS; CSIRO; IMOS | Temperature at the ocean floor | Critical for demersal species |
| V43 | Chlorophyll-a | State | Environmental | μg/L | CMEMS; IMOS | Photosynthetic pigment indicating primary productivity | Key ecosystem productivity indicator |
| V44 | Southern Oscillation Index | State | Environmental | Standardized index | Bureau of Meteorology | Measure of El Niño/La Niña intensity | Influences ocean currents |
| V45 | Southern Annular Mode | State | Environmental | Standardized index | Bureau of Meteorology | Indicator of westerly wind movement | Affects storm patterns |
| V46 | Diatom:Dinoflagellate Ratio | State | Environmental | Ratio | IMOS; CSIRO | Food web structure indicator | Base of food web for fished species |
| V47 | Ocean Acidification | State | Environmental | pH units | CSIRO | Ocean pH level | Impacts shellfish and coral |
| V48 | Ocean Currents | State | Environmental | m/s; degrees | IMOS; CMEMS | Direction and strength of currents | Affects species distribution |
| V49 | Upwelling Intensity | State | Environmental | Various indices | IMOS; CSIRO | Strength of nutrient-rich water upwelling | Critical for ecosystem productivity |
| V50 | Oxygen Levels | State | Environmental | mg/L | IMOS; CSIRO | Dissolved oxygen concentration | Declining with warming |
| V51 | Extreme Weather Events | State | Environmental | Various metrics | Bureau of Meteorology; CSIRO | Frequency and intensity of storms | Disrupts fishing operations |
| V52 | Gross Value of Production | Flow | Economic | AUD | ABARES | Total market value at landing | 20% of Commonwealth fisheries' GVP |
| V53 | Net Economic Returns | Flow | Economic | AUD | ABARES Economic Survey | Profits after all costs | Key performance indicator |
| V54 | Total Factor Productivity | State | Economic | Index | ABARES | Efficiency in input conversion | Base year = 100 |
| V55 | Quota Values | State | Economic | AUD/kg | AFMA; Industry reports | Market value of ITQs | Reflects profitability |
| V56 | Operating Costs | Flow | Economic | AUD | ABARES Economic Survey | Fishing operation costs | Varies by sector |
| V57 | Employment | State | Economic | FTE | ABARES; ABS | Number of employed people | Declining with fleet consolidation |
| V58 | Fleet Capacity | State | Economic | Various | AFMA; ABARES | Fishing power measure | Decreasing with consolidation |
| V59 | Export Value | Flow | Economic | AUD | ABARES; DFAT | International market value | Affected by exchange rates |
| V60 | Financial Performance | State | Economic | % | ABARES | Profit margins and ROI | Varies by sector |
| V61 | Employment in Fishery | State | Social | FTE | ABARES; ABS | Direct harvesting employment | Important for coastal communities |
| V62 | Fleet Size | State | Social | Count | AFMA; ABARES | Active fishing vessels | Declining with consolidation |
| V63 | Community Economic Dependence | State | Social | % | ABARES; University research | Community reliance on fishery | Varies by location |
| V64 | Indigenous Participation | State | Social | % | AFMA; Indigenous organizations | Indigenous commercial fishing | Cultural and economic importance |
| V65 | Gender Composition | State | Social | % | ABARES; ABS | Gender breakdown | Equity indicator |
| V66 | Age Structure | State | Social | Years | ABARES; ABS | Age distribution | Succession indicator |
| V67 | Fisher Wellbeing | State | Social | Various indices | University research | Physical and mental health | Understudied aspect |
| V68 | Community Perceptions | State | Social | Survey responses | University research | Public attitudes | Social license indicator |
| V69 | Food Security Contribution | State | Social | tonnes; % | ABARES | Domestic seafood supply | Important protein source |
| V70 | Cultural Heritage Value | State | Social | Qualitative | Cultural assessments | Community identity | Non-economic value |
| V71 | Fishing Methods | Parameter | Technical | Categorical | AFMA | Gear and techniques | Multiple methods |
| V72 | Fishing Effort | Flow | Technical | Various | AFMA; Logbook data | Fishing activity amount | Key management input |
| V73 | Catch Per Unit Effort | State | Technical | kg/unit effort | AFMA; Logbook data | Catch efficiency | Abundance index |
| V74 | Discard Rates | State | Technical | % | AFMA; Observer programs | Returned catch proportion | Management target |
| V75 | Gear Selectivity | Parameter | Technical | Technical specs | AFMA; Research reports | Species targeting ability | Bycatch reduction |
| V76 | Vessel Capacity | State | Technical | Various | AFMA vessel register | Individual vessel power | Technological creep concern |
| V77 | Electronic Monitoring | State | Technical | % | AFMA | Monitoring coverage | Compliance tool |
| V78 | Spatial Management | Parameter | Technical | km² | AFMA; DCCEEW | Area-based management | Habitat protection |
| V79 | Observer Coverage | State | Technical | % | AFMA | Independent monitoring | Data verification |
| V80 | Harvest Strategy | Parameter | Technical | Qualitative | AFMA; RAG reports | Decision rules | Climate adaptation |
| V81 | Species Price | State | Market | AUD/kg | ABARES; Sydney Fish Market | Landed value | Fluctuating |
| V82 | Market Competition | State | Market | % | ABARES; Trade statistics | Import/substitute competition | Price effects |
| V83 | Consumer Preferences | State | Market | Survey data | Market research | Demand patterns | Sustainability focus |
| V84 | Distribution Channels | State | Market | % | Industry surveys | Supply chain pathways | Multiple intermediaries |
| V85 | Market Concentration | State | Market | % | ACCC; Market research | Market power | Price setting |
| V86 | Export Markets | State | Market | Various | ABARES; DFAT | International destinations | Trade agreements |
| V87 | Value Addition | State | Market | % | Industry surveys | Processing value increase | Premium products |
| V88 | Product Substitutability | State | Market | Elasticity | ABARES; Economic research | Species substitution | Market dynamics |
| V89 | Certification Status | State | Market | % | MSC; AFMA | Eco-certification | Market access |
| V90 | Price Volatility | State | Market | % | ABARES; Sydney Fish Market | Price fluctuations | Supply variations |
| V91 | Traditional Ecological Knowledge | State | Indigenous | Qualitative | Indigenous organizations | Marine ecosystem understanding | Long-term changes |
| V92 | Cultural Fishing Practices | Parameter | Indigenous | Qualitative | Indigenous organizations | Traditional methods | Cultural heritage |
| V93 | Indigenous Governance | State | Indigenous | % | AFMA; Indigenous organizations | Governance participation | Decision-making |
| V94 | Cultural Values Mapping | State | Indigenous | km² | Indigenous organizations | Significant areas | Spatial management |
| V95 | Indigenous Economic Participation | State | Indigenous | % | AFMA; Indigenous organizations | Commercial involvement | Economic equity |
| V96 | Traditional Seasonal Indicators | State | Indigenous | Qualitative | Indigenous organizations | Environmental cues | Phenological changes |
| V97 | Sea Country Management | State | Indigenous | Qualitative | Indigenous organizations | Resource stewardship | Co-management |
| V98 | Cultural Harvest Levels | State | Indigenous | tonnes | Indigenous organizations | Cultural catch volume | Cultural maintenance |
| V99 | Knowledge Transmission | State | Indigenous | Qualitative | Indigenous organizations | Intergenerational transfer | Cultural continuity |
| V100 | Indigenous Research Partnerships | State | Indigenous | Count | Research institutions | Collaborative projects | Knowledge integration |

## Summary Statistics
- Total Variables: 100
- State Variables: 75
- Flow Variables: 12
- Parameters: 13

## Notes
- All variables are directionally neutral
- Variables are organized by unique ID
- Each variable includes source and measurement information
- Variables show direct causal connections
- Variables can participate in multiple relationships
- Merged variables maintain original functionality while reducing redundancy 