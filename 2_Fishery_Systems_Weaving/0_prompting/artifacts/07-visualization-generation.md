# Visualization Generation Artifact

## Metadata
- **Task**: 07 - Visualization Generation
- **Date**: [YYYY-MM-DD]
- **Version**: 1.0
- **Status**: [Draft/Review/Approved]
- **Author**: [Name]
- **Reviewers**: [Names]
- **Input Artifacts**: 
  - 01-variable-identification.md
  - 02-relationship-extraction.md
  - 03-relationship-matrix.md
  - 04-feedback-loop-identification.md
  - 05-indirect-relationship-analysis.md
  - 06-context-dependent-relationships.md

## Interactive Visualizations

### Force-Directed Graph
```html
<!-- Force-directed graph container -->
<div id="force-directed-graph"></div>

<!-- D3.js implementation -->
<script>
// Setup
const width = 1200;
const height = 800;
const margin = { top: 20, right: 20, bottom: 20, left: 20 };

// Create SVG container
const svg = d3.select("#force-directed-graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create container for zoom
const container = svg.append("g");

// Force simulation parameters
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(30));

// Node styling
const nodeColors = {
    environmental: "#2ecc71",
    economic: "#3498db",
    social: "#e74c3c",
    governance: "#f1c40f"
};

// Edge styling
const edgeColors = {
    positive: "#27ae60",
    negative: "#c0392b",
    neutral: "#95a5a6"
};

// Create nodes
const node = container.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 10)
    .attr("fill", d => nodeColors[d.type])
    .call(drag(simulation));

// Create edges
const link = container.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", d => edgeColors[d.type])
    .attr("stroke-width", d => d.strength);

// Add labels
const label = container.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .text(d => d.name)
    .attr("font-size", "12px")
    .attr("dx", 15)
    .attr("dy", 5);

// Interactive features
function addInteractivity() {
    // Zoom and pan
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            container.attr("transform", event.transform);
        });

    svg.call(zoom);

    // Tooltips
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    node.on("mouseover", (event, d) => {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(d.name + "<br/>" + d.description)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    // Search functionality
    const searchInput = d3.select("body")
        .append("input")
        .attr("type", "text")
        .attr("placeholder", "Search nodes...")
        .on("input", function() {
            const searchTerm = this.value.toLowerCase();
            node.style("opacity", d => 
                d.name.toLowerCase().includes(searchTerm) ? 1 : 0.2
            );
        });
}

// Legend
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(10, 10)");

// Update function
function update() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
}

// Drag behavior
function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}
</script>

### Dendrogram
```html
<!-- Dendrogram container -->
<div id="dendrogram"></div>

<!-- D3.js implementation -->
<script>
// Setup
const width = 1200;
const height = 800;
const margin = { top: 20, right: 120, bottom: 20, left: 160 };

// Create SVG container
const svg = d3.select("#dendrogram")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create container for zoom
const container = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tree layout configuration
const treeLayout = d3.tree()
    .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

// Node styling
const nodeColors = {
    root: "#2c3e50",
    branch: "#34495e",
    leaf: "#7f8c8d"
};

// Edge styling
const edgeColors = {
    strong: "#2ecc71",
    medium: "#f1c40f",
    weak: "#e74c3c"
};

// Create hierarchical data structure
const root = d3.hierarchy(data);

// Compute the tree layout
const treeData = treeLayout(root);

// Create edges
const link = container.selectAll(".link")
    .data(treeData.links())
    .join("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", d => edgeColors[d.data.strength])
    .attr("stroke-width", 2)
    .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));

// Create nodes
const node = container.selectAll(".node")
    .data(treeData.descendants())
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

// Add circles for nodes
node.append("circle")
    .attr("r", 6)
    .attr("fill", d => nodeColors[d.depth === 0 ? "root" : d.children ? "branch" : "leaf"]);

// Add labels
node.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d.children ? -8 : 8)
    .attr("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name);

// Interactive features
function addInteractivity() {
    // Zoom and pan
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            container.attr("transform", event.transform);
        });

    svg.call(zoom);

    // Tooltips
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    node.on("mouseover", (event, d) => {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(d.data.name + "<br/>" + d.data.description)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    // Node collapsing/expanding
    node.on("click", (event, d) => {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    });

    // Search functionality
    const searchInput = d3.select("body")
        .append("input")
        .attr("type", "text")
        .attr("placeholder", "Search nodes...")
        .on("input", function() {
            const searchTerm = this.value.toLowerCase();
            node.style("opacity", d => 
                d.data.name.toLowerCase().includes(searchTerm) ? 1 : 0.2
            );
        });
}

// Update function
function update(source) {
    const duration = 750;
    const nodes = treeData.descendants();
    const links = treeData.links();

    // Update nodes
    const node = container.selectAll(".node")
        .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .on("click", (event, d) => {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        });

    nodeEnter.append("circle")
        .attr("r", 6)
        .attr("fill", d => nodeColors[d.depth === 0 ? "root" : d.children ? "branch" : "leaf"]);

    nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -8 : 8)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
        .duration(duration)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    const nodeExit = node.exit()
        .transition()
        .duration(duration)
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .remove();

    // Update links
    const link = container.selectAll(".link")
        .data(links, d => d.target.id);

    const linkEnter = link.enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", d => edgeColors[d.data.strength])
        .attr("stroke-width", 2)
        .attr("d", d => {
            const o = {x: source.x0, y: source.y0};
            return d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x)
                ({source: o, target: o});
        });

    const linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
        .duration(duration)
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    const linkExit = link.exit()
        .transition()
        .duration(duration)
        .attr("d", d => {
            const o = {x: source.x, y: source.y};
            return d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x)
                ({source: o, target: o});
        })
        .remove();

    // Store the old positions for transition
    nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Legend
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(10, 10)");
</script>

### Temporal View
```html
<!-- Temporal view container -->
<div id="temporal-view"></div>

<!-- D3.js implementation -->
<script>
// Setup
const width = 1200;
const height = 400;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

// Create SVG container
const svg = d3.select("#temporal-view")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create scales
const x = d3.scaleTime()
    .domain([new Date(2020, 0, 1), new Date(2030, 11, 31)])
    .range([margin.left, width - margin.right]);

const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

// Create axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

// Add axes to SVG
svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

// Add interactive features
function addInteractivity() {
    // Zoom and pan
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            container.attr("transform", event.transform);
        });

    svg.call(zoom);

    // Tooltips
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}
</script>

### Spatial View
```html
<!-- Spatial view container -->
<div id="spatial-view"></div>

<!-- D3.js implementation -->
<script>
// Setup
const width = 1200;
const height = 800;
const margin = { top: 20, right: 20, bottom: 20, left: 20 };

// Create SVG container
const svg = d3.select("#spatial-view")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Load map data
d3.json("australia-map.json").then(function(mapData) {
    // Create map projection
    const projection = d3.geoMercator()
        .fitSize([width, height], mapData);

    // Create path generator
    const path = d3.geoPath()
        .projection(projection);

    // Draw map
    svg.append("g")
        .selectAll("path")
        .data(mapData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#999");

    // Add fishery locations
    const fisheryLocations = [
        { name: "Tasmanian Salmon", coordinates: [147.3272, -42.8821] },
        { name: "Northern Prawn", coordinates: [142.5314, -12.4634] },
        { name: "Southern Scalefish", coordinates: [138.6007, -34.9285] },
        { name: "Torres Strait Lobster", coordinates: [142.2185, -10.6871] },
        { name: "Eastern Tuna", coordinates: [153.0251, -27.4698] }
    ];

    // Add fishery points
    svg.append("g")
        .selectAll("circle")
        .data(fisheryLocations)
        .join("circle")
        .attr("cx", d => projection(d.coordinates)[0])
        .attr("cy", d => projection(d.coordinates)[1])
        .attr("r", 5)
        .attr("fill", "#e74c3c");

    // Add interactive features
    function addInteractivity() {
        // Zoom and pan
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Tooltips
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
});
</script>

## Context Views
### Temporal Variations
- Short-term effects
- Long-term effects
- Seasonal patterns
- Climate change impacts

### Spatial Patterns
- Regional variations
- Local conditions
- Environmental factors
- Management zones

### Fishery-Specific Aspects
- Species characteristics
- Habitat requirements
- Management approaches
- Stakeholder dynamics

## Stakeholder Perspectives
### Industry Views
- Production focus
- Economic considerations
- Market dynamics
- Operational challenges

### Management Views
- Regulatory framework
- Conservation goals
- Monitoring systems
- Compliance requirements

### Research Views
- Scientific understanding
- Data collection
- Analysis methods
- Knowledge gaps

## Evidence Base
### Strong Evidence
- [List of relationships with strong empirical evidence]

### Moderate Evidence
- [List of relationships with moderate empirical evidence]

### Limited Evidence
- [List of relationships with limited empirical evidence]

## Visualization Limitations
### Technical Constraints
- Browser compatibility
- Performance considerations
- Data size limitations
- Interactive features

### Data Limitations
- Missing information
- Uncertain relationships
- Temporal gaps
- Spatial coverage

### Representation Challenges
- Complex relationships
- Multiple variables
- Dynamic behaviors
- Context dependencies

## Visualization Assumptions
### Key Assumptions
- Relationship linearity
- Temporal stability
- Spatial homogeneity
- Stakeholder alignment

### Simplifications
- Aggregated variables
- Combined effects
- Standardized measures
- Normalized scales

### Generalizations
- Common patterns
- Typical behaviors
- Average conditions
- Representative cases

## Explanatory Notes
### Map Interpretation Guide
- Node meaning
- Edge significance
- Color coding
- Layout principles

### Key Features
- Important relationships
- Critical variables
- Feedback loops
- System boundaries

### Context Considerations
- Environmental factors
- Economic conditions
- Social dynamics
- Management context

## References
1. [Reference 1]
2. [Reference 2]
...

## Notes for Next Task
### Key Considerations
- Gap identification
- Uncertainty assessment
- Evidence quality
- System completeness

### Potential Patterns
- Knowledge gaps
- Data limitations
- Methodological issues
- Stakeholder concerns

### Special Attention
- Critical relationships
- Complex dynamics
- Emerging issues
- Future developments 