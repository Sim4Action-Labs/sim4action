console.log("Dropdown fix script loaded");

// Function to populate the dropdown from the visualization nodes
function populateDropdown() {
  console.log("Attempting to populate dropdown");
  
  // Find the node selector dropdown
  const nodeSelector = document.getElementById('node-selector');
  if (!nodeSelector) {
    console.log("Node selector not found, will retry");
    return false;
  }
  
  console.log("Node selector found, clearing existing options");
  
  // Clear existing options
  while (nodeSelector.firstChild) {
    nodeSelector.removeChild(nodeSelector.firstChild);
  }
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select a variable --';
  nodeSelector.appendChild(defaultOption);
  
  // Try different methods to get nodes
  let nodesByCategory = {};
  let nodesProcessed = 0;
  
  // Method 1: Check global data object first
  if (window.data && window.data.nodes && Array.isArray(window.data.nodes) && window.data.nodes.length > 0) {
    console.log(`Using global data.nodes with ${window.data.nodes.length} nodes`);
    processNodesArray(window.data.nodes);
  } 
  // Method 2: Check global simulation object
  else if (window.simulation && typeof window.simulation.nodes === 'function' && window.simulation.nodes().length > 0) {
    console.log(`Using global simulation nodes with ${window.simulation.nodes().length} nodes`);
    processNodesArray(window.simulation.nodes());
  }
  // Method 3: Query D3 nodes from DOM
  else if (typeof d3 !== 'undefined') {
    const nodes = d3.selectAll('.node');
    console.log(`Found ${nodes.size()} nodes via D3 selection`);
    
    if (nodes.size() > 0) {
      // Extract data from D3 nodes
      nodes.each(function(d) {
        // Get data either from d parameter or __data__ property
        const nodeData = d || this.__data__;
        if (!nodeData) {
          return;
        }
        
        processNodeData(nodeData);
      });
    } else {
      console.log("No nodes found via D3, trying JSON file");
      // Method 4: Load data from JSON file
      return loadFromJSONFile();
    }
  } else {
    console.log("D3 not available, trying JSON file");
    return loadFromJSONFile();
  }
  
  return finalizeDropdown();
  
  // Helper function to process a node data object
  function processNodeData(nodeData) {
    nodesProcessed++;
    
    // Handle both string and object references for ID
    const nodeId = typeof nodeData.id === 'string' ? nodeData.id : (nodeData.id ? nodeData.id.toString() : 'unknown');
    const nodeName = nodeData.name || nodeData.id || 'Unnamed Node';
    const nodeCategory = nodeData.category || 'Uncategorized';
    
    if (!nodesByCategory[nodeCategory]) {
      nodesByCategory[nodeCategory] = [];
    }
    
    nodesByCategory[nodeCategory].push({
      id: nodeId,
      name: nodeName
    });
  }
  
  // Helper function to process an array of nodes
  function processNodesArray(nodesArray) {
    nodesArray.forEach(nodeData => {
      if (nodeData) {
        processNodeData(nodeData);
      }
    });
  }
  
  // Helper function to load data from the JSON file
  function loadFromJSONFile() {
    console.log("Attempting to load data from systems_map_data.json");
    
    // Use fetch to get the data
    fetch('systems_map_data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("JSON data loaded successfully:", data);
        if (data && data.nodes && Array.isArray(data.nodes)) {
          processNodesArray(data.nodes);
          finalizeDropdown();
        } else {
          console.error("JSON file does not contain valid nodes data");
        }
      })
      .catch(error => {
        console.error("Error loading JSON file:", error);
      });
    
    // Return false to indicate we're handling this asynchronously
    return false;
  }
  
  // Helper function to finalize the dropdown population
  function finalizeDropdown() {
    // If no nodes were processed with any method, return failure
    if (nodesProcessed === 0) {
      console.log("No nodes could be processed with any method");
      return false;
    }
    
    console.log(`Processed ${nodesProcessed} nodes into ${Object.keys(nodesByCategory).length} categories`);
    
    // Add nodes to the dropdown, organized by category
    Object.keys(nodesByCategory).sort().forEach(category => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = category;
      nodeSelector.appendChild(optgroup);
      
      nodesByCategory[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = `${node.name} (${node.id})`;
        optgroup.appendChild(option);
      });
    });
    
    // Visual indicator that the dropdown has been populated
    const refreshButton = document.getElementById('refresh-dropdown');
    if (refreshButton) {
      refreshButton.style.backgroundColor = '#4CAF50';
      refreshButton.style.color = 'white';
      refreshButton.textContent = 'Loaded';
      
      // Reset after 3 seconds
      setTimeout(() => {
        refreshButton.style.backgroundColor = '';
        refreshButton.style.color = '';
        refreshButton.textContent = 'Refresh';
      }, 3000);
    }
    
    console.log(`Successfully populated dropdown with ${nodesProcessed} nodes across ${Object.keys(nodesByCategory).length} categories`);
    return true;
  }
}

// Try multiple times to populate the dropdown
let attempts = 0;
const maxAttempts = 10;
const interval = setInterval(() => {
  attempts++;
  console.log(`Dropdown population attempt ${attempts}/${maxAttempts}`);
  
  if (populateDropdown() || attempts >= maxAttempts) {
    clearInterval(interval);
    console.log(`Dropdown population ${attempts < maxAttempts ? 'succeeded' : 'failed after maximum attempts'}`);
  }
}, 2000);

// Also hook into the onload event
window.addEventListener('load', () => {
  console.log("Window loaded, waiting for visualization to initialize");
  setTimeout(populateDropdown, 1000);
  setTimeout(populateDropdown, 3000);
  setTimeout(populateDropdown, 5000);
});

// Hook into any visualization events if available
if (typeof d3 !== 'undefined') {
  console.log("D3 detected, watching for visualization events");
  // Listen for potential data loading or visualization update events
  document.addEventListener('DOMNodeInserted', function(e) {
    if (e.target && e.target.classList && e.target.classList.contains('node')) {
      console.log("New node detected in DOM, trying to populate dropdown");
      setTimeout(populateDropdown, 500);
    }
  });
}

// Add event listener for refresh button
window.addEventListener('load', () => {
  const refreshButton = document.getElementById('refresh-dropdown');
  if (refreshButton) {
    console.log("Refresh button found, adding event listener");
    refreshButton.addEventListener('click', function() {
      console.log("Refresh button clicked, manually populating dropdown");
      populateDropdown();
    });
  } else {
    console.log("Refresh button not found");
  }
}); 