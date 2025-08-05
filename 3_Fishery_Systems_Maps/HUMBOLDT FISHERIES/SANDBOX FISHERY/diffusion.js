/**
 * Token Diffusion Algorithm for Causal Networks
 * JavaScript implementation based on the Python version
 */

// Enums as simple values for better compatibility
const Polarity = {
    SAME: 1,
    OPPOSITE: -1
};

const Strength = {
    WEAK: 0.3,
    MEDIUM: 0.6,
    HIGH: 1.0
};

const Delay = {
    FAST: 5,     // 1 second (5 steps * 200ms)
    MEDIUM: 10,  // 2 seconds (10 steps * 200ms) 
    SLOW: 20     // 4 seconds (20 steps * 200ms)
};

const TokenState = {
    IN_TRANSIT: "in_transit",
    READY: "ready",
    ACCUMULATED: "accumulated"
};

const NodeType = {
    PASS_THROUGH: "pass_through",
    CONSUME: "consume",
    ACCUMULATE: "accumulate"
};

// Debug helper
function debug(message, ...args) {
    console.log(`[DEBUG] ${message}`, ...args);
}

/**
 * An agent representing a token that diffuses through the causal network.
 */
class TokenAgent {
    /**
     * @param {string|number} uniqueId - Unique identifier for the token
     * @param {CausalTokenModel} model - Reference to the parent model
     * @param {string|number} initialNode - Initial node where token is placed
     * @param {number} initialValue - Initial value of the token (default: 1.0)
     * @param {number} initialCharge - Initial charge of the token (default: 1)
     */
    constructor(uniqueId, model, initialNode, initialValue = 1.0, initialCharge = 1) {
        this.uniqueId = uniqueId;
        this.model = model;
        this.currentNode = initialNode;
        this.value = initialValue;
        this.charge = initialCharge;
        this.state = TokenState.READY;
        this.transitStepsRemaining = 0;
        this.targetNode = null;
        this.active = true;
        
        debug(`Token ${uniqueId} initialized at node ${initialNode}`);
    }

    /**
     * Begin movement to a new node.
     * @param {string|number} targetNode - Target node to move to
     * @param {Object} edgeData - Data associated with the edge
     */
    startMovement(targetNode, edgeData) {
        this.state = TokenState.IN_TRANSIT;
        this.targetNode = targetNode;
        
        // Simple handling of delay value - just use the number
        const delay = typeof edgeData.delay === 'number' ? edgeData.delay : Delay.MEDIUM;
        this.transitStepsRemaining = delay;
        this.transitStepsTotal = delay; // Store total for animation synchronization
        
        // Update charge based on edge polarity
        const originalCharge = this.charge;
        if (edgeData.polarity === Polarity.OPPOSITE || edgeData.polarity === -1) {
            this.charge *= -1; // Flip charge if polarity is OPPOSITE
            debug(`🔄 Token ${this.uniqueId} charge FLIPPED: ${originalCharge} -> ${this.charge} (OPPOSITE polarity: ${edgeData.polarity})`);
        } else {
            debug(`✅ Token ${this.uniqueId} charge KEPT: ${this.charge} (SAME polarity: ${edgeData.polarity})`);
        }
        
        debug(`Token ${this.uniqueId} moving: ${this.currentNode} -> ${targetNode} (delay: ${delay})`);
    }

    /**
     * Complete movement to target node.
     */
    completeMovement() {
        debug(`Token ${this.uniqueId} arrived at ${this.targetNode}`);
        this.currentNode = this.targetNode;
        this.targetNode = null;
        this.transitStepsRemaining = 0;
    }

    /**
     * Get all outgoing edges and their normalized strengths.
     * @returns {Array} Array of [neighbor, edgeData, normalizedStrength]
     */
    getOutgoingStrengths() {
        // Get neighbors directly from adjacency list
        const neighbors = this.model.G._adjacency[this.currentNode] || [];
        debug(`Node ${this.currentNode} has neighbors:`, neighbors);
        
        if (neighbors.length === 0) {
            debug(`Token ${this.uniqueId} has no neighbors from ${this.currentNode}`);
            return [];
        }
        
        const outgoingEdges = [];
        let totalStrength = 0;
        
        // Process each neighbor
        for (const neighbor of neighbors) {
            const edgeKey = `${this.currentNode},${neighbor}`;
            const edgeData = this.model.G.edges[edgeKey];
            
            if (!edgeData) {
                debug(`Missing edge data for ${edgeKey}`);
                continue;
            }
            
            // Get strength as a simple number
            const strength = typeof edgeData.strength === 'number' ? 
                             edgeData.strength : 
                             Strength.MEDIUM;
            
            outgoingEdges.push([neighbor, edgeData]);
            totalStrength += strength;
        }
        
        if (outgoingEdges.length === 0) {
            debug(`Token ${this.uniqueId} has no valid edges from ${this.currentNode}`);
            return [];
        }
        
        // Calculate normalized strengths
        const edgeStrengths = [];
        for (const [neighbor, edgeData] of outgoingEdges) {
            const strength = typeof edgeData.strength === 'number' ? 
                             edgeData.strength : 
                             Strength.MEDIUM;
            
            const normalizedStrength = strength / totalStrength;
            edgeStrengths.push([neighbor, edgeData, normalizedStrength]);
        }
        
        debug(`Outgoing edges from ${this.currentNode}:`, 
              edgeStrengths.map(([n, _, s]) => `${n}(${s.toFixed(2)})`));
        return edgeStrengths;
    }

    /**
     * Step function for token movement and decision making.
     */
    step() {
        if (this.state === TokenState.IN_TRANSIT) {
            this.transitStepsRemaining -= 1;
            debug(`Token ${this.uniqueId} transit: ${this.transitStepsRemaining} steps left`);
            
            if (this.transitStepsRemaining <= 0) {
                this.completeMovement();
                this.state = TokenState.READY;
            }
        } else if (this.state === TokenState.READY) {
            // For now, all nodes are PASS_THROUGH type
            // Skip accumulation logic for simplicity
            
            const edgeStrengths = this.getOutgoingStrengths();
            if (edgeStrengths.length > 0) {  // Only move if there are outgoing edges
                // Choose destination based on strengths
                const weights = edgeStrengths.map(([_, __, strength]) => strength);
                const targetIndex = this.weightedRandomChoice(weights);
                const [targetNode, edgeData] = [edgeStrengths[targetIndex][0], edgeStrengths[targetIndex][1]];
                
                this.startMovement(targetNode, edgeData);
            } else {
                debug(`Token ${this.uniqueId} is stuck at ${this.currentNode}`);
            }
        }
    }

    /**
     * Helper function for weighted random choice
     * @param {Array} weights - Array of weights
     * @returns {number} Index chosen
     */
    weightedRandomChoice(weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return i;
            }
        }
        
        // Fallback to last item if rounding errors occur
        return weights.length - 1;
    }
}

/**
 * A simplified model for token diffusion in a causal loop diagram.
 */
class CausalTokenModel {
    /**
     * @param {Object} G - Graph representing the causal network
     * @param {number} numTokens - Number of tokens to create (default: 10)
     * @param {Object} initialAllocation - Initial allocation of tokens to nodes
     */
    constructor(G, numTokens = 10, initialAllocation = null) {
        this.G = G;
        this.numTokens = numTokens;
        this.agents = [];
        this.edgeFlowsOverTime = [];
        this.nodeFlowsOverTime = [];
        this.stepCount = 0;
        this.simulationId = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
        
        // Make sure the graph is properly set up
        G.printGraph();
        
        debug(`Initializing simulation with ${numTokens} tokens`);
        
        // Initialize tokens according to initial_allocation or default to node '0'
        if (initialAllocation === null) {
            initialAllocation = {'0': numTokens};
        }
        
        let tokenId = 0;
        for (const [node, count] of Object.entries(initialAllocation)) {
            debug(`🎨 Creating ${count} tokens at node ${node}`);
            for (let i = 0; i < count; i++) {
                const token = new TokenAgent(tokenId, this, node);
                debug(`  Token ${tokenId}: charge=${token.charge}, node=${token.currentNode}`);
                this.agents.push(token);
                tokenId++;
            }
        }
        
        // Record initial node flows
        this.nodeFlowsOverTime.push(this.getNodeFlows());
        
        // Print initial state for debugging
        debug("Initial token distribution:", this.getNodeFlows());
        debug("Graph has nodes:", Object.keys(G.nodes));
        debug("Graph has edges:", Object.keys(G.edges));
        debug("Adjacency lists:", G._adjacency);
    }

    /**
     * Get the current distribution of tokens across nodes, accounting for token charge.
     * @returns {Object} Map of node IDs to signed token counts
     */
    getNodeFlows() {
        const nodeFlows = {};
        
        // Initialize all nodes with zero tokens
        for (const node in this.G.nodes) {
            nodeFlows[node] = 0;
        }
        
        // Count tokens at each node, accounting for charge
        for (const agent of this.agents) {
            if (agent.state !== TokenState.IN_TRANSIT) {
                // Add or subtract based on token charge
                nodeFlows[agent.currentNode] = (nodeFlows[agent.currentNode] || 0) + agent.charge;
            }
        }
        
        return nodeFlows;
    }

    /**
     * Get the current distribution of tokens across edges, accounting for token charge.
     * @returns {Object} Map of edge IDs to signed token counts
     */
    getEdgeFlows() {
        const edgeFlows = {};
        
        // Initialize all edges with zero tokens
        for (const edge in this.G.edges) {
            edgeFlows[edge] = 0;
        }
        
        // Count tokens on each edge, accounting for charge
        for (const agent of this.agents) {
            if (agent.state === TokenState.IN_TRANSIT) {
                const edgeKey = `${agent.currentNode},${agent.targetNode}`;
                // Add or subtract based on token charge
                edgeFlows[edgeKey] = (edgeFlows[edgeKey] || 0) + agent.charge;
            }
        }
        
        return edgeFlows;
    }

    /**
     * Advance the simulation by one step.
     */
    step() {
        this.stepCount += 1;
        debug(`Step ${this.stepCount}`);
        
        // Update all agents
        let tokensUpdated = 0;
        for (const agent of this.agents) {
            if (agent.active) {
                agent.step();
                tokensUpdated++;
            }
        }
        
        debug(`Updated ${tokensUpdated} tokens`);
        
        // Record flows
        const nodeFlows = this.getNodeFlows();
        this.nodeFlowsOverTime.push(nodeFlows);
        this.edgeFlowsOverTime.push(this.getEdgeFlows());
        
        debug("Current token distribution:", nodeFlows);
        return nodeFlows; // Return current distribution for easier debugging
    }

    /**
     * Run the simulation for a specified number of steps.
     * @param {number} numSteps - Number of steps to run
     */
    run(numSteps) {
        for (let i = 0; i < numSteps; i++) {
            this.step();
        }
        
        debug(`Simulation completed after ${numSteps} steps`);
        return {
            nodeFlows: this.nodeFlowsOverTime,
            edgeFlows: this.edgeFlowsOverTime
        };
    }
}

/**
 * Graph class to represent the causal network.
 * Simplified implementation of NetworkX-like functionality.
 */
class Graph {
    constructor() {
        this.nodes = {};
        this.edges = {};
        this._adjacency = {};
    }

    /**
     * Add a node to the graph.
     * @param {string|number} node - Node identifier
     * @param {Object} attributes - Node attributes
     */
    addNode(node, attributes = {}) {
        this.nodes[node] = attributes;
        if (!this._adjacency[node]) {
            this._adjacency[node] = [];
        }
    }

    /**
     * Add an edge to the graph.
     * @param {string|number} source - Source node
     * @param {string|number} target - Target node
     * @param {Object} attributes - Edge attributes
     */
    addEdge(source, target, attributes = {}) {
        // Ensure nodes exist
        if (!this.nodes[source]) this.addNode(source);
        if (!this.nodes[target]) this.addNode(target);
        
        // Add edge
        const edgeKey = `${source},${target}`;
        this.edges[edgeKey] = attributes;
        
        // Update adjacency list
        if (!this._adjacency[source]) {
            this._adjacency[source] = [];
        }
        if (!this._adjacency[source].includes(target)) {
            this._adjacency[source].push(target);
        }
        
        // Print debug info
        console.log(`Added edge ${source} -> ${target} with key ${edgeKey}`);
        console.log(`Updated adjacency for ${source}:`, this._adjacency[source]);
    }

    /**
     * Get all neighbors of a node.
     * @param {string|number} node - Node identifier
     * @returns {Array} Array of neighboring nodes
     */
    neighbors(node) {
        const neighbors = this._adjacency[node] || [];
        console.log(`Neighbors for node ${node}:`, neighbors);
        return neighbors;
    }
    
    /**
     * Print the entire graph structure for debugging
     */
    printGraph() {
        console.log("Graph structure:");
        console.log("Nodes:", this.nodes);
        console.log("Edges:", this.edges);
        console.log("Adjacency:", this._adjacency);
    }
}

/**
 * Run a token diffusion simulation.
 * @param {Object} G - Graph representing the causal network
 * @param {number} numTokens - Number of tokens to use
 * @param {number} numSteps - Number of steps to run
 * @param {Object} initialAllocation - Initial allocation of tokens
 * @returns {CausalTokenModel} The simulation model with results
 */
function runSimulation(G, numTokens = 10, numSteps = 30, initialAllocation = null) {
    const model = new CausalTokenModel(G, numTokens, initialAllocation);
    model.run(numSteps);
    return model;
}

/**
 * Create a causal diagram from factors and relationships data.
 * @param {Array} factorsData - Array of factor objects
 * @param {Array} relationshipsData - Array of relationship objects
 * @returns {Graph} The constructed graph
 */
function createCausalDiagram(factorsData, relationshipsData) {
    debug("Creating causal diagram with:", { 
        factors: factorsData.length, 
        relationships: relationshipsData.length 
    });
    
    const G = new Graph();
    
    // Add nodes - all as PASS_THROUGH for simplicity
    for (const factor of factorsData) {
        const nodeAttributes = {
            label: factor.label || factor.id,
            type: NodeType.PASS_THROUGH,  // Force all nodes to be pass-through
            domain: factor.domain || "Unknown"
        };
        
        G.addNode(factor.id, nodeAttributes);
        debug(`Added node ${factor.id} (${factor.label})`);
    }
    
    // Add edges with simplified attributes
    for (const rel of relationshipsData) {
        // Set default values
        let strength = Strength.MEDIUM;
        let delay = 1; // Use simple number - FAST delay
        let polarity = Polarity.SAME;
        
        // Handle polarity
        if (rel.polarity === "opposite") {
            polarity = Polarity.OPPOSITE;
        }
        
        // Handle strength (simplified)
        if (rel.strength) {
            if (rel.strength.toUpperCase() === "HIGH") strength = Strength.HIGH;
            else if (rel.strength.toUpperCase() === "WEAK") strength = Strength.WEAK;
        }
        
        // Handle delay (simplified)
        if (rel.delay) {
            if (rel.delay.toUpperCase() === "MEDIUM") delay = 2;
            else if (rel.delay.toUpperCase() === "SLOW") delay = 3;
        }
        
        const edgeAttributes = {
            polarity: polarity,
            strength: strength,
            delay: delay
        };
        
        debug(`Adding edge ${rel.source}->${rel.target}:`, edgeAttributes);
        G.addEdge(rel.source, rel.target, edgeAttributes);
    }
    
    // Verify the graph setup
    for (const nodeId in G.nodes) {
        const neighbors = G._adjacency[nodeId] || [];
        debug(`Node ${nodeId} has ${neighbors.length} outgoing connections`);
    }
    
    return G;
}

// Export functions and classes for use in the main application
export {
    Polarity,
    Strength,
    Delay,
    TokenState,
    NodeType,
    TokenAgent,
    CausalTokenModel,
    Graph,
    runSimulation,
    createCausalDiagram
};
