// Set up the visualization dimensions and margins
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 1200 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Create the SVG container
const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Add zoom behavior
const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
        svg.attr("transform", event.transform);
    });

d3.select("#visualization svg").call(zoom);

// Create the force simulation
const simulation = d3.forceSimulation(systemData.nodes)
    .force("link", d3.forceLink(systemData.links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(50));

// Create the links
const link = svg.append("g")
    .selectAll("line")
    .data(systemData.links)
    .enter()
    .append("line")
    .attr("class", d => `link ${d.type} ${d.strength}`)
    .attr("stroke-width", d => d.strength === "strong" ? 2 : 1);

// Create the nodes
const node = svg.append("g")
    .selectAll("g")
    .data(systemData.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

// Add circles to nodes
node.append("circle")
    .attr("r", 20)
    .attr("class", d => `node ${d.category}`);

// Add labels to nodes
node.append("text")
    .attr("dy", 4)
    .attr("text-anchor", "middle")
    .text(d => d.label)
    .attr("class", "node-label");

// Add information panel functionality
node.on("click", (event, d) => {
    updateInfoPanel(d);
});

// Update positions on each tick
simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("transform", d => `translate(${d.x},${d.y})`);
});

// Drag functions
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

// Update information panel
function updateInfoPanel(node) {
    const infoPanel = d3.select("#info-panel");
    infoPanel.html(`
        <h3>${node.label}</h3>
        <p><strong>Category:</strong> ${node.category}</p>
        <p><strong>Evidence:</strong> ${node.evidence}</p>
        <p><strong>Confidence:</strong> ${node.confidence}</p>
        <h4>Connected Variables:</h4>
        <ul>
            ${getConnectedVariables(node.id)}
        </ul>
    `);
}

// Get connected variables for a node
function getConnectedVariables(nodeId) {
    const connectedLinks = systemData.links.filter(link => 
        link.source.id === nodeId || link.target.id === nodeId
    );
    
    return connectedLinks.map(link => {
        const connectedNode = link.source.id === nodeId ? link.target : link.source;
        return `<li>${connectedNode.label} (${link.type}, ${link.strength})</li>`;
    }).join("");
}

// Filter functionality
function updateFilters() {
    const selectedCategory = d3.select("#category-filter").property("value");
    const selectedStrength = d3.select("#strength-filter").property("value");
    const selectedEvidence = d3.select("#evidence-filter").property("value");

    // Update node visibility
    node.style("opacity", d => {
        if (selectedCategory !== "all" && d.category !== selectedCategory) return 0.1;
        if (selectedEvidence !== "all" && d.evidence !== selectedEvidence) return 0.1;
        return 1;
    });

    // Update link visibility
    link.style("opacity", d => {
        if (selectedStrength !== "all" && d.strength !== selectedStrength) return 0.1;
        return 1;
    });
}

// Add event listeners to filters
d3.selectAll(".filter").on("change", updateFilters);

// Reset view button
d3.select("#reset-view").on("click", () => {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
}); 