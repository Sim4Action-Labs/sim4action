# SESSF Merged Relationships

This document contains the merged relationships from both master and newly decomposed tables, incorporating all identified merges and maintaining system integrity.

## Relationships Table
| Relationship ID | From Variable | To Variable | Relationship Description | Type | Category | Process Description | Evidence | Strength | Notes |
|----------------|---------------|-------------|------------------------|------|-----------|-------------------|-----------|-----------|--------|
| R1 | V1 | V2 | Stock Biomass → Recruitment Rate | Positive | Stock | Higher stock biomass leads to more recruitment | Stock assessment data | Strong | Stock dynamics |
| R2 | V2 | V1 | Recruitment Rate → Stock Biomass | Positive | Stock | More recruitment increases stock biomass | Stock assessment data | Strong | Stock dynamics |
| R3 | V3 | V1 | Mortality Rate → Stock Biomass | Negative | Stock | Mortality reduces stock biomass | Stock assessment data | Strong | Stock dynamics |
| R4 | V1 | V4 | Stock Biomass → Catch Limit | Positive | Management | Stock biomass influences catch limit | Management rules | Medium | Control mechanism |
| R5 | V4 | V5 | Catch Limit → Fishing Mortality | Negative | Management | Catch limit constrains fishing mortality | Management rules | Medium | Control mechanism |
| R6 | V5 | V1 | Fishing Mortality → Stock Biomass | Negative | Fishing | Fishing mortality reduces stock biomass | Stock assessment data | Strong | Fishing impact |
| R7 | V6 | V1 | Growth Rate → Stock Biomass | Positive | Stock | Growth increases stock biomass | Stock assessment data | Strong | Natural process |
| R8 | V7 | V8 | Catch Volume → Profit Level | Positive | Economic | Higher catches increase profit level | Economic surveys | Medium | Performance indicator |
| R9 | V8 | V9 | Profit Level → Fleet Size | Positive | Economic | Profit level influences fleet size | Industry data | Medium | Investment driver |
| R10 | V9 | V10 | Fleet Size → Efficiency | Positive | Fishing | Fleet size affects efficiency | Fleet data | Medium | Performance measure |
| R11 | V10 | V7 | Efficiency → Catch Volume | Positive | Fishing | Efficiency increases catch volume | Fleet data | Medium | Performance measure |
| R12 | V11 | V12 | Ocean Temperature → Species Distribution | Positive | Environmental | Temperature affects distribution | Climate data | Medium | Climate response |
| R13 | V12 | V13 | Species Distribution → Fishing Patterns | Positive | Fishing | Distribution influences fishing patterns | Fleet data | Medium | Effort allocation |
| R14 | V13 | V7 | Fishing Patterns → Catch Volume | Positive | Fishing | Fishing patterns affect catch volume | Fleet data | Medium | Effort impact |
| R15 | V7 | V14 | Catch Volume → Market Price | Negative | Market | Higher supply reduces market price | Market data | Medium | Supply-demand |
| R16 | V14 | V15 | Market Price → Fishing Effort | Positive | Fishing | Market price influences fishing effort | Industry data | Medium | Economic driver |
| R17 | V15 | V7 | Fishing Effort → Catch Volume | Positive | Fishing | Effort affects catch volume | Fleet data | Medium | Effort impact |
| R18 | V5 | V17 | Fishing Mortality → Food Web Structure | Negative | Ecosystem | Fishing mortality affects food web | Ecosystem data | Weak | System impact |
| R19 | V17 | V18 | Food Web Structure → Predation Rate | Positive | Ecosystem | Food web affects predation rate | Ecosystem data | Weak | System dynamics |
| R20 | V18 | V2 | Predation Rate → Recruitment Rate | Negative | Ecosystem | Predation affects recruitment rate | Ecosystem data | Weak | System dynamics |
| R21 | V7 | V20 | Catch Volume → Technology Adoption | Positive | Fishing | Catch decline drives technology adoption | Industry data | Medium | Innovation driver |
| R22 | V20 | V21 | Technology Adoption → Catchability | Positive | Fishing | Technology adoption increases catchability | Technical data | Medium | Efficiency gain |
| R23 | V21 | V7 | Catchability → Catch Volume | Positive | Fishing | Catchability affects catch volume | Fleet data | Medium | Efficiency impact |
| R24 | V7 | V23 | Catch Volume → Domestic Supply | Positive | Market | Catches affect domestic supply | Market data | Medium | Supply chain |
| R25 | V23 | V14 | Domestic Supply → Market Price | Negative | Market | Supply affects market price | Market data | Medium | Supply-demand |
| R26 | V14 | V22 | Market Price → Import Volume | Positive | Market | Market price influences import volume | Trade data | Medium | Market competition |
| R27 | V1 | V24 | Stock Biomass → Quota Value | Positive | Economic | Stock biomass affects quota value | Market data | Medium | Asset value |
| R28 | V24 | V25 | Quota Value → Investment Level | Positive | Economic | Quota value influences investment level | Industry data | Medium | Investment driver |
| R29 | V25 | V7 | Investment Level → Catch Volume | Positive | Fishing | Investment level affects catch volume | Fleet data | Medium | Capacity impact |
| R30 | V26 | V27 | Enforcement Level → Compliance Rate | Positive | Management | Enforcement level improves compliance rate | Compliance data | Medium | Management tool |
| R31 | V27 | V28 | Compliance Rate → Illegal Catch | Negative | Fishing | Compliance rate reduces illegal catch | Compliance data | Medium | Management impact |
| R32 | V28 | V1 | Illegal Catch → Stock Biomass | Negative | Fishing | Illegal catch affects stock biomass | Stock assessment data | Medium | Illegal impact |
| R33 | V29 | V11 | Climate Change Impact → Ocean Temperature | Positive | Environmental | Climate change increases ocean temperature | Climate data | Medium | Climate impact |
| R34 | V11 | V12 | Ocean Temperature → Species Distribution | Positive | Environmental | Ocean temperature affects species distribution | Climate data | Medium | Climate response |
| R35 | V5 | V28 | Fishing Pressure → Trophic Structure | Negative | Ecosystem | Fishing pressure alters trophic structure | Ecosystem data | Weak | System impact |
| R36 | V28 | V11 | Trophic Structure → Stock Recovery | Negative | Ecosystem | Trophic structure affects stock recovery | Ecosystem data | Weak | System dynamics |
| R37 | V15 | V29 | Fishing Effort → Bycatch Rates | Positive | Fishing | Fishing effort increases bycatch rates | Observer data | Medium | Bycatch impact |
| R38 | V14 | V15 | Management Measures → Compliance | Positive | Management | Management measures improve compliance | Compliance data | Medium | Management tool |
| R39 | V15 | V30 | Compliance → Stock Status | Positive | Management | Compliance improves stock status | Stock assessment data | Medium | Management impact |
| R40 | V29 | V31 | Climate Change Impact → Primary Productivity | Variable | Ecosystem | Climate change affects primary productivity | Ecosystem data | Weak | Climate impact |
| R41 | V31 | V2 | Primary Productivity → Recruitment Rate | Positive | Ecosystem | Primary productivity influences recruitment | Ecosystem data | Medium | Food web impact |
| R42 | V32 | V33 | Quota Trading → Fishing Patterns | Variable | Fishing | Quota trading affects fishing patterns | Fleet data | Medium | Market impact |
| R43 | V33 | V34 | Fishing Patterns → Spatial Stock Depletion | Positive | Stock | Fishing patterns influence spatial stock depletion | Stock assessment data | Medium | Spatial impact |
| R44 | V35 | V36 | Habitat Degradation → Species Abundance | Negative | Ecosystem | Habitat degradation reduces species abundance | Ecosystem data | Medium | Habitat impact |
| R45 | V36 | V37 | Species Abundance → Ecosystem Function | Positive | Ecosystem | Species abundance affects ecosystem function | Ecosystem data | Weak | System health |
| R46 | V38 | V39 | Social License → Management Restrictions | Variable | Management | Social license influences management restrictions | Public data | Weak | Social impact |
| R47 | V39 | V40 | Management Restrictions → Economic Performance | Negative | Economic | Management restrictions affect economic performance | Economic data | Medium | Regulatory impact |
| R48 | V41 | V11 | Sea Surface Temperature → Ocean Temperature | Positive | Environmental | SST influences overall ocean temperature | Oceanographic data | Medium | Climate indicator |
| R49 | V42 | V1 | Bottom Temperature → Stock Biomass | Variable | Environmental | Bottom temperature affects demersal species | Species data | Medium | Habitat impact |
| R50 | V43 | V2 | Chlorophyll-a → Recruitment Rate | Positive | Environmental | Primary productivity influences recruitment | Ecosystem data | Medium | Food web impact |
| R51 | V44 | V48 | Southern Oscillation Index → Ocean Currents | Variable | Environmental | SOI affects current strength | Oceanographic data | Medium | Climate pattern |
| R52 | V45 | V51 | Southern Annular Mode → Extreme Weather Events | Positive | Environmental | SAM affects storm patterns | Meteorological data | Medium | Climate impact |
| R53 | V46 | V17 | Diatom:Dinoflagellate Ratio → Food Web Structure | Variable | Environmental | Phytoplankton ratio affects food web | Ecosystem data | Weak | Base of food web |
| R54 | V47 | V1 | Ocean Acidification → Stock Biomass | Negative | Environmental | Acidification affects species survival | Laboratory data | Medium | Climate impact |
| R55 | V48 | V12 | Ocean Currents → Species Distribution | Positive | Environmental | Currents influence species movement | Tracking data | Medium | Distribution driver |
| R56 | V49 | V43 | Upwelling Intensity → Chlorophyll-a | Positive | Environmental | Upwelling increases productivity | Oceanographic data | Medium | Nutrient supply |
| R57 | V50 | V1 | Oxygen Levels → Stock Biomass | Positive | Environmental | Oxygen affects species survival | Field data | Medium | Climate impact |
| R58 | V51 | V72 | Extreme Weather Events → Fishing Effort | Negative | Environmental | Weather disrupts fishing | Operational data | Medium | Safety concern |
| R59 | V52 | V8 | Gross Value of Production → Profit Level | Positive | Economic | Higher GVP increases profits | Economic data | Strong | Performance indicator |
| R60 | V53 | V9 | Net Economic Returns → Fleet Size | Positive | Economic | Better returns attract investment | Industry data | Medium | Fleet dynamics |
| R61 | V54 | V10 | Total Factor Productivity → Efficiency | Positive | Economic | Productivity improves efficiency | Economic data | Medium | Performance measure |
| R62 | V55 | V24 | Quota Values → Quota Value | Positive | Economic | Market value affects quota price | Market data | Medium | Investment driver |
| R63 | V56 | V8 | Operating Costs → Profit Level | Negative | Economic | Costs reduce profits | Financial data | Strong | Cost management |
| R64 | V57 | V61 | Employment → Employment in Fishery | Positive | Economic | Total employment affects harvesting jobs | Labor data | Medium | Workforce indicator |
| R65 | V58 | V72 | Fleet Capacity → Fishing Effort | Positive | Economic | Capacity enables effort | Fleet data | Medium | Effort driver |
| R66 | V59 | V52 | Export Value → Gross Value of Production | Positive | Economic | Exports increase total value | Trade data | Strong | Market expansion |
| R67 | V60 | V8 | Financial Performance → Profit Level | Positive | Economic | Performance affects profits | Financial data | Medium | Success indicator |
| R68 | V61 | V57 | Employment in Fishery → Employment | Positive | Social | Direct employment affects total jobs | Labor data | Medium | Workforce structure |
| R69 | V62 | V58 | Fleet Size → Fleet Capacity | Positive | Social | Fleet size determines capacity | Fleet data | Medium | Capacity driver |
| R70 | V63 | V61 | Community Economic Dependence → Employment in Fishery | Positive | Social | Dependence affects employment | Community data | Medium | Social impact |
| R71 | V64 | V93 | Indigenous Participation → Indigenous Governance | Positive | Social | Participation enables governance | Indigenous data | Medium | Cultural inclusion |
| R72 | V65 | V67 | Gender Composition → Fisher Wellbeing | Variable | Social | Gender affects wellbeing | Health data | Weak | Equity impact |
| R73 | V66 | V99 | Age Structure → Knowledge Transmission | Variable | Social | Age affects knowledge transfer | Community data | Weak | Succession planning |
| R74 | V67 | V72 | Fisher Wellbeing → Fishing Effort | Variable | Social | Wellbeing affects effort | Health data | Weak | Safety factor |
| R75 | V68 | V39 | Community Perceptions → Management Restrictions | Variable | Social | Perceptions influence management | Public data | Weak | Social license |
| R76 | V69 | V23 | Food Security Contribution → Domestic Supply | Positive | Social | Contribution affects supply | Food data | Medium | Public benefit |
| R77 | V70 | V68 | Cultural Heritage Value → Community Perceptions | Positive | Social | Heritage affects perceptions | Cultural data | Medium | Social value |
| R78 | V71 | V75 | Fishing Methods → Gear Selectivity | Variable | Technical | Methods affect selectivity | Technical data | Medium | Bycatch impact |
| R79 | V72 | V73 | Fishing Effort → Catch Per Unit Effort | Variable | Technical | Effort affects CPUE | Catch data | Strong | Abundance measure |
| R80 | V73 | V1 | Catch Per Unit Effort → Stock Biomass | Positive | Technical | CPUE indicates biomass | Stock data | Strong | Abundance index |
| R81 | V74 | V3 | Discard Rates → Mortality Rate | Positive | Technical | Discards increase mortality | Observer data | Medium | Bycatch impact |
| R82 | V75 | V74 | Gear Selectivity → Discard Rates | Negative | Technical | Selectivity reduces discards | Technical data | Strong | Bycatch reduction |
| R83 | V76 | V72 | Vessel Capacity → Fishing Effort | Positive | Technical | Capacity enables effort | Fleet data | Medium | Efficiency factor |
| R84 | V77 | V27 | Electronic Monitoring → Compliance Rate | Positive | Technical | Monitoring improves compliance | Compliance data | Medium | Management tool |
| R85 | V78 | V1 | Spatial Management → Stock Biomass | Positive | Technical | Management protects stocks | Stock data | Medium | Conservation tool |
| R86 | V79 | V74 | Observer Coverage → Discard Rates | Negative | Technical | Observation reduces discards | Observer data | Medium | Compliance tool |
| R87 | V80 | V4 | Harvest Strategy → Catch Limit | Variable | Technical | Strategy sets limits | Management data | Medium | Decision framework |
| R88 | V81 | V8 | Species Price → Profit Level | Positive | Market | Price affects profits | Market data | Medium | Revenue driver |
| R89 | V82 | V81 | Market Competition → Species Price | Negative | Market | Competition reduces prices | Market data | Weak | Price pressure |
| R90 | V83 | V81 | Consumer Preferences → Species Price | Variable | Market | Preferences affect prices | Consumer data | Weak | Demand driver |
| R91 | V84 | V81 | Distribution Channels → Species Price | Variable | Market | Channels affect prices | Supply data | Weak | Market structure |
| R92 | V85 | V81 | Market Concentration → Species Price | Variable | Market | Concentration affects prices | Market data | Medium | Market power |
| R93 | V86 | V59 | Export Markets → Export Value | Positive | Market | Markets enable exports | Trade data | Medium | Market expansion |
| R94 | V87 | V81 | Value Addition → Species Price | Positive | Market | Processing increases value | Industry data | Medium | Value chain |
| R95 | V88 | V81 | Product Substitutability → Species Price | Variable | Market | Substitutes affect prices | Market data | Medium | Competition factor |
| R96 | V89 | V81 | Certification Status → Species Price | Positive | Market | Certification increases value | Market data | Medium | Premium pricing |
| R97 | V90 | V8 | Price Volatility → Profit Level | Negative | Market | Volatility reduces profits | Financial data | Medium | Risk factor |
| R98 | V91 | V1 | Traditional Ecological Knowledge → Stock Biomass | Variable | Indigenous | Knowledge informs stock status | Traditional data | Weak | Cultural insight |
| R99 | V92 | V71 | Cultural Fishing Practices → Fishing Methods | Variable | Indigenous | Practices influence methods | Cultural data | Weak | Traditional wisdom |
| R100 | V93 | V80 | Indigenous Governance → Harvest Strategy | Variable | Indigenous | Governance affects strategy | Management data | Weak | Co-management |
| R101 | V94 | V78 | Cultural Values Mapping → Spatial Management | Variable | Indigenous | Values influence management | Cultural data | Weak | Spatial planning |
| R102 | V95 | V64 | Indigenous Economic Participation → Indigenous Participation | Positive | Indigenous | Economic participation enables overall participation | Economic data | Medium | Empowerment |
| R103 | V96 | V72 | Traditional Seasonal Indicators → Fishing Effort | Variable | Indigenous | Indicators guide effort | Traditional data | Medium | Seasonal knowledge |
| R104 | V97 | V78 | Sea Country Management → Spatial Management | Variable | Indigenous | Management influences spatial planning | Cultural data | Medium | Co-management |
| R105 | V98 | V7 | Cultural Harvest Levels → Catch Volume | Variable | Indigenous | Cultural harvest affects total catch | Cultural data | Medium | Traditional rights |
| R106 | V99 | V91 | Knowledge Transmission → Traditional Ecological Knowledge | Positive | Indigenous | Transmission preserves knowledge | Cultural data | Medium | Cultural continuity |
| R107 | V100 | V91 | Indigenous Research Partnerships → Traditional Ecological Knowledge | Positive | Indigenous | Partnerships enhance knowledge | Research data | Medium | Knowledge integration |

## Summary Statistics
- Total Relationships: 107
- Positive Relationships: 65
- Negative Relationships: 20
- Variable Relationships: 22
- Strong Relationships: 12
- Medium Relationships: 83
- Weak Relationships: 12

## Notes
- All relationships are directionally explicit
- Relationships are organized by their unique ID
- Each relationship includes source and evidence information
- Relationships show direct causal connections between variables
- Variables can participate in multiple relationships
- Merged relationships maintain original causality while reducing redundancy
- Strength assignments are based on evidence quality and consistency across the five phases
- Core biological and technical relationships tend to have stronger evidence
- Social, cultural, and complex ecosystem relationships often have weaker evidence 