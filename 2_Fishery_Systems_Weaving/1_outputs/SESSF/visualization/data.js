const systemData = {
    nodes: [
        // Ecological Variables
        { id: "V1", label: "Target Species Biomass", category: "ecological", evidence: "strong", confidence: "high" },
        { id: "V4", label: "Bycatch Levels", category: "ecological", evidence: "moderate", confidence: "high" },
        { id: "V7", label: "Water Temperature", category: "ecological", evidence: "strong", confidence: "high" },
        { id: "V12", label: "Ocean Productivity", category: "ecological", evidence: "moderate", confidence: "moderate" },
        { id: "V19", label: "Stock Recruitment", category: "ecological", evidence: "strong", confidence: "high" },

        // Economic Variables
        { id: "V2", label: "Fishery Revenue", category: "economic", evidence: "strong", confidence: "high" },
        { id: "V6", label: "Product Price", category: "economic", evidence: "strong", confidence: "high" },
        { id: "V11", label: "Operating Costs", category: "economic", evidence: "strong", confidence: "high" },
        { id: "V15", label: "Export Volume", category: "economic", evidence: "strong", confidence: "high" },
        { id: "V16", label: "Carbon Emissions", category: "economic", evidence: "moderate", confidence: "moderate" },
        { id: "V18", label: "Processing Value", category: "economic", evidence: "strong", confidence: "high" },

        // Management Variables
        { id: "V3", label: "Fishing Activity", category: "management", evidence: "strong", confidence: "high" },
        { id: "V5", label: "Quota Allocation", category: "management", evidence: "strong", confidence: "high" },
        { id: "V9", label: "Gear Restrictions", category: "management", evidence: "strong", confidence: "high" },
        { id: "V13", label: "Spatial Closures", category: "management", evidence: "strong", confidence: "high" },
        { id: "V17", label: "Compliance Rate", category: "management", evidence: "strong", confidence: "high" },

        // Social Variables
        { id: "V8", label: "Employment", category: "social", evidence: "strong", confidence: "high" },
        { id: "V14", label: "Community Well-being", category: "social", evidence: "moderate", confidence: "moderate" },
        { id: "V20", label: "Indigenous Rights", category: "social", evidence: "moderate", confidence: "moderate" }
    ],
    links: [
        // Direct Relationships
        { source: "V1", target: "V2", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V3", target: "V4", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V5", target: "V1", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V6", target: "V15", type: "direct", strength: "moderate", evidence: "strong" },
        { source: "V7", target: "V12", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V8", target: "V14", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V9", target: "V4", type: "direct", strength: "moderate", evidence: "strong" },
        { source: "V11", target: "V16", type: "direct", strength: "strong", evidence: "moderate" },
        { source: "V12", target: "V19", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V13", target: "V3", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V14", target: "V8", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V15", target: "V2", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V16", target: "V7", type: "direct", strength: "moderate", evidence: "moderate" },
        { source: "V17", target: "V3", type: "direct", strength: "moderate", evidence: "strong" },
        { source: "V18", target: "V8", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V19", target: "V1", type: "direct", strength: "strong", evidence: "strong" },
        { source: "V20", target: "V3", type: "direct", strength: "moderate", evidence: "moderate" },

        // Indirect Relationships
        { source: "V7", target: "V1", type: "indirect", strength: "moderate", evidence: "moderate" },
        { source: "V12", target: "V2", type: "indirect", strength: "moderate", evidence: "moderate" },
        { source: "V13", target: "V1", type: "indirect", strength: "moderate", evidence: "strong" },
        { source: "V15", target: "V8", type: "indirect", strength: "moderate", evidence: "strong" },
        { source: "V16", target: "V12", type: "indirect", strength: "moderate", evidence: "moderate" },

        // Feedback Loops
        { source: "V1", target: "V3", type: "feedback", strength: "strong", evidence: "strong" },
        { source: "V2", target: "V11", type: "feedback", strength: "strong", evidence: "strong" },
        { source: "V8", target: "V14", type: "feedback", strength: "strong", evidence: "strong" }
    ]
}; 