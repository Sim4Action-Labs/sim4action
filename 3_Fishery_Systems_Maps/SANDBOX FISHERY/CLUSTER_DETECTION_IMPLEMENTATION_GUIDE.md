# Cluster Detection Implementation Guide

This guide provides comprehensive instructions for implementing the interactive cluster detection functionality developed in the sandbox environment into other fishery systems mapping applications.

## Overview

The cluster detection system includes:
- **Two clustering algorithms**: Louvain and Girvan-Newman
- **Interactive cluster boxes**: Clickable filtering with additive selection
- **Visual cluster hulls**: Dynamic convex hulls around cluster nodes
- **Comprehensive cluster information**: Node listings and statistics
- **Smart filtering**: Show/hide nodes and links based on cluster selection

---

## 1. HTML Elements to Add

### 1.1 Cluster Detection Controls
Add these elements to your control panel (typically in a diagnostics or controls section):

```html
<!-- Cluster Detection Section -->
<div class="control-section">
    <h3>Cluster Detection</h3>
    <div class="button-group">
        <button id="detect-clusters-btn" onclick="detectClusters('louvain')">
            Detect Clusters (Louvain)
        </button>
        <button id="detect-clusters-girvan-btn" onclick="detectClusters('girvan_newman')">
            Detect Clusters (Girvan-Newman)
        </button>
        <button id="clear-clusters-btn" onclick="clearClusters()" disabled>
            Clear Clusters
        </button>
    </div>
</div>

<!-- Cluster Information Display -->
<div id="cluster-info" style="display: none;">
    <div id="cluster-stats"></div>
    <div id="cluster-legend"></div>
</div>
```

### 1.2 CSS Styling (Optional Enhancement)
Add these styles for better visual presentation:

```css
.cluster-box {
    transition: all 0.2s ease;
    cursor: pointer;
}

.cluster-box:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.control-section {
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.button-group {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
}

.button-group button {
    padding: 5px 10px;
    font-size: 11px;
    border: 1px solid #ccc;
    background: #f8f9fa;
    border-radius: 3px;
    cursor: pointer;
}

.button-group button:hover {
    background: #e9ecef;
}

.button-group button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
```

---

## 2. JavaScript Variables and Functions

### 2.1 Global Variables
Add these variables at the top of your JavaScript section (after existing global variables):

```javascript
// Cluster Detection Variables
let currentClusters = null;
let clusterColors = [];
let selectedClusters = new Set(); // Track selected clusters for filtering
```

### 2.2 Core Cluster Detection Functions

#### 2.2.1 Color Generation Function
```javascript
// Generate distinct colors for clusters
function generateClusterColors(numClusters) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
        '#A3E4D7', '#F9E79F', '#D5A6BD', '#AED6F1', '#A9DFBF'
    ];
    
    if (numClusters <= colors.length) {
        return colors.slice(0, numClusters);
    }
    
    // Generate additional colors if needed
    const additionalColors = [];
    for (let i = colors.length; i < numClusters; i++) {
        const hue = (i * 137.508) % 360; // Golden angle approximation
        additionalColors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return [...colors, ...additionalColors];
}
```

#### 2.2.2 Main Cluster Detection Function
```javascript
// Main cluster detection function
async function detectClusters(algorithm = 'louvain') {
    try {
        // Disable detect buttons, enable loading state
        document.getElementById('detect-clusters-btn').disabled = true;
        document.getElementById('detect-clusters-girvan-btn').disabled = true;
        
        // Prepare network data for Python
        const networkData = {
            nodes: factors.map(f => ({ id: f.id, name: f.name })),
            edges: relationships.map(r => ({ 
                source: r.source, 
                target: r.target, 
                weight: r.strength || 1 
            }))
        };
        
        // Python clustering code
        const pythonCode = `
import networkx as nx
import json
from networkx.algorithms import community

# Create network from data
network_data = ${JSON.stringify(networkData)}
G = nx.Graph()

# Add nodes
for node in network_data['nodes']:
    G.add_node(node['id'], name=node['name'])

# Add edges
for edge in network_data['edges']:
    G.add_edge(edge['source'], edge['target'], weight=edge['weight'])

# Perform clustering
if "${algorithm}" == "louvain":
    # Louvain clustering
    clusters = community.louvain_communities(G, seed=42)
    algorithm_name = "Louvain"
else:
    # Girvan-Newman clustering
    clusters = list(community.girvan_newman(G))
    if clusters:
        clusters = clusters[0]  # Take first level of division
    else:
        clusters = [set(G.nodes())]  # Fallback to single cluster
    algorithm_name = "Girvan-Newman"

# Convert to list format and create mapping
cluster_list = [list(cluster) for cluster in clusters]
node_to_cluster = {}
for i, cluster in enumerate(cluster_list):
    for node in cluster:
        node_to_cluster[node] = i

# Calculate statistics
num_clusters = len(cluster_list)
avg_cluster_size = sum(len(cluster) for cluster in cluster_list) / num_clusters if num_clusters > 0 else 0

# Calculate modularity
try:
    modularity = community.modularity(G, clusters)
except:
    modularity = 0.0

# Prepare result
result = {
    "algorithm": algorithm_name,
    "clusters": [{"nodes": cluster, "size": len(cluster)} for cluster in cluster_list],
    "node_to_cluster": node_to_cluster,
    "statistics": {
        "num_clusters": num_clusters,
        "avg_cluster_size": round(avg_cluster_size, 2),
        "modularity": round(modularity, 3)
    }
}

json.dumps(result)
        `;
        
        // Execute Python code
        const result = await pyodide.runPython(pythonCode);
        const clusterData = JSON.parse(result);
        
        // Store cluster data
        currentClusters = clusterData;
        clusterColors = generateClusterColors(clusterData.statistics.num_clusters);
        selectedClusters.clear(); // Reset selections
        
        // Visualize clusters
        visualizeClusters(clusterData);
        displayClusterInfo(clusterData);
        
        // Update button states
        document.getElementById('detect-clusters-btn').disabled = false;
        document.getElementById('detect-clusters-girvan-btn').disabled = false;
        document.getElementById('clear-clusters-btn').disabled = false;
        
    } catch (error) {
        console.error('Cluster detection failed:', error);
        alert('Cluster detection failed. Please check the console for details.');
        
        // Re-enable buttons
        document.getElementById('detect-clusters-btn').disabled = false;
        document.getElementById('detect-clusters-girvan-btn').disabled = false;
    }
}
```

#### 2.2.3 Cluster Visualization Functions
```javascript
// Function to update cluster hulls dynamically
function updateClusterHulls() {
    if (!currentClusters) return;
    
    const container = d3.select('#graph svg g'); // Get the transformed container
    
    // Remove existing hulls and labels
    container.selectAll('.cluster-hull').remove();
    container.selectAll('.cluster-label').remove();
    
    // Recreate hulls with current node positions
    currentClusters.clusters.forEach((cluster, index) => {
        // Only show hull if cluster is selected or no clusters are selected
        const showHull = selectedClusters.size === 0 || selectedClusters.has(index);
        if (!showHull) return;
        
        const clusterNodes = cluster.nodes.map(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            return node ? [node.x, node.y] : null;
        }).filter(pos => pos !== null);
        
        if (clusterNodes.length > 2) {
            // Calculate convex hull
            const hull = d3.polygonHull(clusterNodes);
            
            if (hull && hull.length > 2) {
                // Add padding to hull
                const centroid = d3.polygonCentroid(hull);
                const paddedHull = hull.map(point => {
                    const dx = point[0] - centroid[0];
                    const dy = point[1] - centroid[1];
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const padding = 25; // Padding in pixels
                    const factor = (distance + padding) / distance;
                    return [
                        centroid[0] + dx * factor,
                        centroid[1] + dy * factor
                    ];
                });
                
                // Draw hull in the transformed container
                container.append('path')
                    .datum(paddedHull)
                    .attr('class', 'cluster-hull')
                    .attr('d', d3.line().curve(d3.curveCardinalClosed.tension(0.1)))
                    .style('fill', clusterColors[index])
                    .style('fill-opacity', 0.1)
                    .style('stroke', clusterColors[index])
                    .style('stroke-width', 2)
                    .style('stroke-dasharray', '5,5')
                    .style('pointer-events', 'none');
                
                // Add cluster label in the transformed container
                container.append('text')
                    .attr('class', 'cluster-label')
                    .attr('x', centroid[0])
                    .attr('y', centroid[1] - 10)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '18px')
                    .style('font-weight', '900')
                    .style('fill', clusterColors[index])
                    .style('text-shadow', '2px 2px 4px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9)')
                    .style('stroke', 'white')
                    .style('stroke-width', '1px')
                    .style('paint-order', 'stroke fill')
                    .style('pointer-events', 'none')
                    .text(`CLUSTER ${index + 1}`);
            }
        }
    });
}

// Visualize clusters on the network
function visualizeClusters(clusterData) {
    const svg = d3.select('#graph svg');
    
    // Color nodes by cluster
    svg.selectAll('.node circle')
        .style('fill', d => {
            const clusterId = clusterData.node_to_cluster[d.id];
            return clusterId !== undefined ? clusterColors[clusterId] : '#999999';
        })
        .style('stroke', d => {
            const clusterId = clusterData.node_to_cluster[d.id];
            return clusterId !== undefined ? d3.rgb(clusterColors[clusterId]).darker(0.5) : '#666666';
        });
    
    // Initial hull creation
    updateClusterHulls();
}
```

#### 2.2.4 Cluster Information Display Functions
```javascript
// Display cluster information with interactive boxes
function displayClusterInfo(clusterData) {
    const clusterInfo = document.getElementById('cluster-info');
    const clusterStats = document.getElementById('cluster-stats');
    const clusterLegend = document.getElementById('cluster-legend');
    
    // Show cluster statistics
    clusterStats.innerHTML = `
        <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
            <div><strong>${clusterData.statistics.num_clusters}</strong> clusters found</div>
            <div>Average size: <strong>${clusterData.statistics.avg_cluster_size}</strong> nodes</div>
            <div>Modularity: <strong>${clusterData.statistics.modularity}</strong></div>
            <div style="font-size: 10px; color: #666; margin-top: 4px;">Algorithm: ${clusterData.algorithm}</div>
        </div>
    `;
    
    // Show detailed cluster information with node listings
    const clusterDetails = clusterData.clusters.map((cluster, index) => {
        const color = clusterColors[index];
        const isSelected = selectedClusters.has(index);
        
        // Get node names for this cluster
        const nodeNames = cluster.nodes.map(nodeId => {
            const factor = factors.find(f => f.id === nodeId);
            return factor ? factor.name : nodeId;
        }).sort(); // Sort alphabetically for better readability
        
        const nodeList = nodeNames.map(name => 
            `<div style="font-size: 9px; color: #555; margin-left: 18px; padding: 1px 0;">• ${name}</div>`
        ).join('');
        
        return `
            <div class="cluster-box" data-cluster-id="${index}" style="margin-bottom: 8px; border: 2px solid ${isSelected ? color : '#e0e0e0'}; border-radius: 4px; padding: 6px; background: ${isSelected ? d3.rgb(color).brighter(2.5) : '#fafafa'}; cursor: pointer; transition: all 0.2s ease;" 
                 onmouseover="this.style.borderColor='${color}'; this.style.background='${d3.rgb(color).brighter(2.2)}'" 
                 onmouseout="this.style.borderColor='${isSelected ? color : '#e0e0e0'}'; this.style.background='${isSelected ? d3.rgb(color).brighter(2.5) : '#fafafa'}'" 
                 onclick="toggleClusterSelection(${index})">
                <div style="display: flex; align-items: center; margin-bottom: 4px; font-size: 10px; font-weight: bold;">
                    <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px; margin-right: 6px; border: 1px solid ${d3.rgb(color).darker(0.5)};"></div>
                    <span>Cluster ${index + 1} (${cluster.size} nodes) ${isSelected ? '✓' : ''}</span>
                </div>
                ${nodeList}
            </div>
        `;
    }).join('');
    
    clusterLegend.innerHTML = `
        <div style="font-size: 11px; font-weight: bold; margin-bottom: 6px;">Cluster Details:</div>
        ${clusterDetails}
    `;
    
    clusterInfo.style.display = 'block';
}
```

#### 2.2.5 Interactive Filtering Functions
```javascript
// Toggle cluster selection for filtering
function toggleClusterSelection(clusterIndex) {
    if (selectedClusters.has(clusterIndex)) {
        selectedClusters.delete(clusterIndex);
    } else {
        selectedClusters.add(clusterIndex);
    }
    
    // Update visual feedback
    displayClusterInfo(currentClusters);
    
    // Apply cluster filtering
    applyClusterFilter();
}

// Apply cluster filtering to nodes and links
function applyClusterFilter() {
    if (!currentClusters) return;
    
    const svg = d3.select('#graph svg');
    
    if (selectedClusters.size === 0) {
        // No clusters selected - show all nodes
        svg.selectAll('.node')
            .style('opacity', 1)
            .style('display', 'block');
        svg.selectAll('.link')
            .style('opacity', 1)
            .style('display', 'block');
        return;
    }
    
    // Get all node IDs from selected clusters
    const selectedNodeIds = new Set();
    selectedClusters.forEach(clusterIndex => {
        if (currentClusters.clusters[clusterIndex]) {
            currentClusters.clusters[clusterIndex].nodes.forEach(nodeId => {
                selectedNodeIds.add(nodeId);
            });
        }
    });
    
    // Filter nodes
    svg.selectAll('.node')
        .style('opacity', d => selectedNodeIds.has(d.id) ? 1 : 0.1)
        .style('display', d => selectedNodeIds.has(d.id) ? 'block' : 'none');
    
    // Filter links - only show links between selected nodes
    svg.selectAll('.link')
        .style('opacity', d => {
            const sourceSelected = selectedNodeIds.has(d.source.id);
            const targetSelected = selectedNodeIds.has(d.target.id);
            return (sourceSelected && targetSelected) ? 1 : 0.1;
        })
        .style('display', d => {
            const sourceSelected = selectedNodeIds.has(d.source.id);
            const targetSelected = selectedNodeIds.has(d.target.id);
            return (sourceSelected && targetSelected) ? 'block' : 'none';
        });
    
    // Update cluster hulls to only show selected clusters
    updateClusterHulls();
}

// Clear cluster visualization
function clearClusters() {
    const svg = d3.select('#graph svg');
    
    // Remove cluster visualization
    svg.selectAll('.cluster-hull').remove();
    svg.selectAll('.cluster-label').remove();
    
    // Reset node colors to original domain colors
    svg.selectAll('.node circle')
        .style('fill', d => getDomainColor(d.domain))
        .style('stroke', d => d3.rgb(getDomainColor(d.domain)).darker(0.5));
    
    // Reset node and link visibility
    svg.selectAll('.node')
        .style('opacity', 1)
        .style('display', 'block');
    svg.selectAll('.link')
        .style('opacity', 1)
        .style('display', 'block');
    
    // Hide cluster info
    document.getElementById('cluster-info').style.display = 'none';
    
    // Reset cluster data and selections
    currentClusters = null;
    clusterColors = [];
    selectedClusters.clear();
    
    // Enable detect button, disable clear button
    document.getElementById('detect-clusters-btn').disabled = false;
    document.getElementById('detect-clusters-girvan-btn').disabled = false;
    document.getElementById('clear-clusters-btn').disabled = true;
}
```

---

## 3. Integration Requirements

### 3.1 Prerequisites
Your target application must have:
- **D3.js library** loaded
- **Pyodide** initialized with NetworkX package
- **Global variables**: `factors`, `relationships`, `nodes` arrays
- **SVG graph container** with ID `#graph`
- **Function**: `getDomainColor(domain)` for original node coloring

### 3.2 NetworkX Package Installation
Ensure NetworkX is installed in Pyodide:
```javascript
// Add this to your Pyodide initialization
await pyodide.loadPackage(['networkx']);
```

### 3.3 Force Simulation Integration
If your app uses D3 force simulation, add this to your simulation tick handler:
```javascript
// In your simulation.on('tick', function() { ... })
// Add this line after node position updates:
updateClusterHulls();
```

---

## 4. Step-by-Step Implementation

### Step 1: Add HTML Elements
1. Locate your control panel or diagnostics section
2. Add the cluster detection controls HTML (Section 1.1)
3. Add the cluster information display HTML (Section 1.1)

### Step 2: Add CSS Styling
1. Add the CSS styles (Section 1.2) to your stylesheet or `<style>` section

### Step 3: Add JavaScript Variables
1. Locate your global JavaScript variables section
2. Add the cluster detection variables (Section 2.1)

### Step 4: Add JavaScript Functions
1. Add all functions from Section 2.2 in order:
   - `generateClusterColors()`
   - `detectClusters()`
   - `updateClusterHulls()`
   - `visualizeClusters()`
   - `displayClusterInfo()`
   - `toggleClusterSelection()`
   - `applyClusterFilter()`
   - `clearClusters()`

### Step 5: Verify Integration Points
1. Ensure `factors` array contains objects with `id` and `name` properties
2. Ensure `relationships` array contains objects with `source`, `target`, and optional `strength` properties
3. Ensure `nodes` array contains objects with `id`, `x`, and `y` properties
4. Verify `getDomainColor()` function exists
5. Confirm D3.js and Pyodide are properly loaded

### Step 6: Test Functionality
1. Load the application
2. Click "Detect Clusters (Louvain)" button
3. Verify cluster hulls appear on the graph
4. Verify cluster information panel displays
5. Test clicking cluster boxes for filtering
6. Test "Clear Clusters" functionality

---

## 5. Troubleshooting

### Common Issues:
1. **"factors is not defined"**: Ensure your data arrays are properly named and accessible
2. **"getDomainColor is not defined"**: Implement this function or modify the clearClusters function
3. **Hulls not appearing**: Check that your SVG structure matches `#graph svg g`
4. **NetworkX not found**: Ensure NetworkX package is loaded in Pyodide initialization

### Debug Tips:
- Use browser console to check for JavaScript errors
- Verify data structure with `console.log(factors, relationships, nodes)`
- Check Pyodide initialization status
- Ensure all required libraries are loaded

---

## 6. Customization Options

### Visual Customization:
- Modify `clusterColors` array for different color schemes
- Adjust hull padding in `updateClusterHulls()` function
- Change label font size and styling in cluster label creation
- Modify cluster box styling in `displayClusterInfo()`

### Algorithmic Customization:
- Add more clustering algorithms to the Python code
- Modify clustering parameters (e.g., resolution for Louvain)
- Add custom clustering metrics and statistics

This implementation guide provides everything needed to replicate the cluster detection functionality in other applications. Follow the steps carefully and ensure all prerequisites are met for successful integration.
