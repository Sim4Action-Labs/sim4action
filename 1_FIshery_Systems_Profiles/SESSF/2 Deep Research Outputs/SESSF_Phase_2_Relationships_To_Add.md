# SESSF Phase 2 Relationships to Add

This document tracks relationships between new variables from Phase 2 and existing variables in the master files.

## Environmental Relationships
| Relationship ID | From Variable | To Variable | Type | Category | Process Description | Evidence | Notes |
|----------------|---------------|-------------|------|-----------|-------------------|-----------|--------|
| R48 | V41 (Sea Surface Temperature) | V11 (Ocean Temperature) | Positive | Environmental | SST influences overall ocean temperature | Direct measurement correlation | Climate change indicator |
| R49 | V42 (Bottom Temperature) | V1 (Stock Biomass) | Variable | Environmental | Bottom temperature affects demersal species | Species-specific response | Critical for demersal stocks |
| R50 | V43 (Chlorophyll-a) | V2 (Recruitment Rate) | Positive | Environmental | Primary productivity influences recruitment | Food web dynamics | Base of food chain |
| R51 | V44 (Southern Oscillation Index) | V48 (Ocean Currents) | Variable | Environmental | SOI affects current strength | Oceanographic models | Climate pattern influence |
| R52 | V45 (Southern Annular Mode) | V51 (Extreme Weather Events) | Positive | Environmental | SAM affects storm patterns | Meteorological data | Climate change impact |
| R53 | V46 (Diatom:Dinoflagellate Ratio) | V17 (Food Web Structure) | Variable | Environmental | Phytoplankton ratio affects food web | Ecosystem monitoring | Base of food web |
| R54 | V47 (Ocean Acidification) | V1 (Stock Biomass) | Negative | Environmental | Acidification affects species survival | Laboratory studies | Shellfish impact |
| R55 | V48 (Ocean Currents) | V12 (Species Distribution) | Positive | Environmental | Currents influence species movement | Tracking studies | Distribution driver |
| R56 | V49 (Upwelling Intensity) | V43 (Chlorophyll-a) | Positive | Environmental | Upwelling increases productivity | Oceanographic data | Nutrient supply |
| R57 | V50 (Oxygen Levels) | V1 (Stock Biomass) | Positive | Environmental | Oxygen affects species survival | Field measurements | Climate change impact |
| R58 | V51 (Extreme Weather Events) | V72 (Fishing Effort) | Negative | Environmental | Weather disrupts fishing | Operational data | Safety concern |

## Economic Relationships
| Relationship ID | From Variable | To Variable | Type | Category | Process Description | Evidence | Notes |
|----------------|---------------|-------------|------|-----------|-------------------|-----------|--------|
| R59 | V52 (Gross Value of Production) | V8 (Profit Level) | Positive | Economic | Higher GVP increases profits | Economic surveys | Performance indicator |
| R60 | V53 (Net Economic Returns) | V9 (Fleet Size) | Positive | Economic | Better returns attract investment | Industry data | Fleet dynamics |
| R61 | V54 (Total Factor Productivity) | V10 (Efficiency) | Positive | Economic | Productivity improves efficiency | Economic analysis | Performance measure |
| R62 | V55 (Quota Values) | V24 (Quota Value) | Positive | Economic | Market value affects quota price | Market data | Investment driver |
| R63 | V56 (Operating Costs) | V8 (Profit Level) | Negative | Economic | Costs reduce profits | Financial data | Cost management |
| R64 | V57 (Employment) | V61 (Employment in Fishery) | Positive | Economic | Total employment affects harvesting jobs | Labor statistics | Workforce indicator |
| R65 | V58 (Fleet Capacity) | V72 (Fishing Effort) | Positive | Economic | Capacity enables effort | Fleet data | Effort driver |
| R66 | V59 (Export Value) | V52 (Gross Value of Production) | Positive | Economic | Exports increase total value | Trade data | Market expansion |
| R67 | V60 (Financial Performance) | V8 (Profit Level) | Positive | Economic | Performance affects profits | Financial reports | Success indicator |

## Social Relationships
| Relationship ID | From Variable | To Variable | Type | Category | Process Description | Evidence | Evidence | Notes |
|----------------|---------------|-------------|------|-----------|-------------------|-----------|-----------|--------|
| R68 | V61 (Employment in Fishery) | V57 (Employment) | Positive | Social | Direct employment affects total jobs | Labor data | Workforce structure |
| R69 | V62 (Fleet Size) | V58 (Fleet Capacity) | Positive | Social | Fleet size determines capacity | Fleet data | Capacity driver |
| R70 | V63 (Community Economic Dependence) | V61 (Employment in Fishery) | Positive | Social | Dependence affects employment | Community surveys | Social impact |
| R71 | V64 (Indigenous Participation) | V93 (Indigenous Governance) | Positive | Social | Participation enables governance | Indigenous data | Cultural inclusion |
| R72 | V65 (Gender Composition) | V67 (Fisher Wellbeing) | Variable | Social | Gender affects wellbeing | Health surveys | Equity impact |
| R73 | V66 (Age Structure) | V99 (Knowledge Transmission) | Variable | Social | Age affects knowledge transfer | Community data | Succession planning |
| R74 | V67 (Fisher Wellbeing) | V72 (Fishing Effort) | Variable | Social | Wellbeing affects effort | Health studies | Safety factor |
| R75 | V68 (Community Perceptions) | V39 (Management Restrictions) | Variable | Social | Perceptions influence management | Public surveys | Social license |
| R76 | V69 (Food Security Contribution) | V23 (Domestic Supply) | Positive | Social | Contribution affects supply | Food security data | Public benefit |
| R77 | V70 (Cultural Heritage Value) | V68 (Community Perceptions) | Positive | Social | Heritage affects perceptions | Cultural data | Social value |

## Technical Relationships
| Relationship ID | From Variable | To Variable | Type | Category | Process Description | Evidence | Notes |
|----------------|---------------|-------------|------|-----------|-------------------|-----------|--------|
| R78 | V71 (Fishing Methods) | V75 (Gear Selectivity) | Variable | Technical | Methods affect selectivity | Technical studies | Bycatch impact |
| R79 | V72 (Fishing Effort) | V73 (Catch Per Unit Effort) | Variable | Technical | Effort affects CPUE | Catch data | Abundance measure |
| R80 | V73 (Catch Per Unit Effort) | V1 (Stock Biomass) | Positive | Technical | CPUE indicates biomass | Stock assessment | Abundance index |
| R81 | V74 (Discard Rates) | V3 (Mortality Rate) | Positive | Technical | Discards increase mortality | Observer data | Bycatch impact |
| R82 | V75 (Gear Selectivity) | V74 (Discard Rates) | Negative | Technical | Selectivity reduces discards | Technical trials | Bycatch reduction |
| R83 | V76 (Vessel Capacity) | V72 (Fishing Effort) | Positive | Technical | Capacity enables effort | Fleet data | Efficiency factor |
| R84 | V77 (Electronic Monitoring) | V27 (Compliance Rate) | Positive | Technical | Monitoring improves compliance | Compliance data | Management tool |
| R85 | V78 (Spatial Management) | V1 (Stock Biomass) | Positive | Technical | Management protects stocks | Stock data | Conservation tool |
| R86 | V79 (Observer Coverage) | V74 (Discard Rates) | Negative | Technical | Observation reduces discards | Observer data | Compliance tool |
| R87 | V80 (Harvest Strategy) | V4 (Catch Limit) | Variable | Technical | Strategy sets limits | Management data | Decision framework |

## Market Relationships
| Relationship ID | From Variable | To Variable | Type | Category | Process Description | Evidence | Notes |
|----------------|---------------|-------------|------|-----------|-------------------|-----------|--------|
| R88 | V81 (Species Price) | V8 (Profit Level) | Positive | Market | Price affects profits | Market data | Revenue driver |
| R89 | V82 (Market Competition) | V81 (Species Price) | Negative | Market | Competition reduces prices | Market analysis | Price pressure |
| R90 | V83 (Consumer Preferences) | V81 (Species Price) | Variable | Market | Preferences affect prices | Consumer data | Demand driver |
| R91 | V84 (Distribution Channels) | V81 (Species Price) | Variable | Market | Channels affect prices | Supply chain data | Market structure |
| R92 | V85 (Market Concentration) | V81 (Species Price) | Variable | Market | Concentration affects prices | Market analysis | Market power |
| R93 | V86 (Export Markets) | V59 (Export Value) | Positive | Market | Markets enable exports | Trade data | Market expansion |
| R94 | V87 (Value Addition) | V81 (Species Price) | Positive | Market | Processing increases value | Industry data | Value chain |
| R95 | V88 (Product Substitutability) | V81 (Species Price) | Variable | Market | Substitutes affect prices | Market data | Competition factor |
| R96 | V89 (Certification Status) | V81 (Species Price) | Positive | Market | Certification increases value | Market data | Premium pricing |
| R97 | V90 (Price Volatility) | V8 (Profit Level) | Negative | Market | Volatility reduces profits | Financial data | Risk factor |

## Indigenous Knowledge Relationships
| Relationship ID | From Variable | To Variable | Type | Category | Process Description | Evidence | Notes |
|----------------|---------------|-------------|------|-----------|-------------------|-----------|--------|
| R98 | V91 (Traditional Ecological Knowledge) | V1 (Stock Biomass) | Variable | Indigenous | Knowledge informs stock status | Traditional data | Cultural insight |
| R99 | V92 (Cultural Fishing Practices) | V71 (Fishing Methods) | Variable | Indigenous | Practices influence methods | Cultural data | Traditional wisdom |
| R100 | V93 (Indigenous Governance) | V80 (Harvest Strategy) | Variable | Indigenous | Governance affects strategy | Management data | Co-management |
| R101 | V94 (Cultural Values Mapping) | V78 (Spatial Management) | Variable | Indigenous | Values influence management | Cultural data | Spatial planning |
| R102 | V95 (Indigenous Economic Participation) | V64 (Indigenous Participation) | Positive | Indigenous | Economic participation enables overall participation | Economic data | Empowerment |
| R103 | V96 (Traditional Seasonal Indicators) | V72 (Fishing Effort) | Variable | Indigenous | Indicators guide effort | Traditional data | Seasonal knowledge |
| R104 | V97 (Sea Country Management) | V78 (Spatial Management) | Variable | Indigenous | Management influences spatial planning | Cultural data | Co-management |
| R105 | V98 (Cultural Harvest Levels) | V7 (Catch Volume) | Variable | Indigenous | Cultural harvest affects total catch | Cultural data | Traditional rights |
| R106 | V99 (Knowledge Transmission) | V91 (Traditional Ecological Knowledge) | Positive | Indigenous | Transmission preserves knowledge | Cultural data | Cultural continuity |
| R107 | V100 (Indigenous Research Partnerships) | V91 (Traditional Ecological Knowledge) | Positive | Indigenous | Partnerships enhance knowledge | Research data | Knowledge integration |

## Summary Statistics
- Total New Relationships: 60
- Environmental Relationships: 11
- Economic Relationships: 9
- Social Relationships: 10
- Technical Relationships: 10
- Market Relationships: 10
- Indigenous Knowledge Relationships: 10

## Next Steps
1. Review for duplicates with existing relationships
2. Verify relationship logic and evidence
3. Update master relationships file
4. Verify system integrity
5. Create relationship diagrams 