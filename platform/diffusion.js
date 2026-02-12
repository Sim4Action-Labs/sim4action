/**
 * Token Diffusion Algorithm for Causal Networks
 * JavaScript implementation based on the Python version
 * 
 * Supports:
 *  - Probabilistic (random-walk) diffusion via CausalTokenModel
 *  - Deterministic (proportional-split) diffusion via DeterministicDiffusionModel
 *  - Forward and Backward propagation directions
 */

// ── Enums ──────────────────────────────────────────────────────────────

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

/** Algorithm mode enum */
const DiffusionMode = {
    PROBABILISTIC: "probabilistic",
    DETERMINISTIC: "deterministic"
};

/** Propagation direction enum */
const DiffusionDirection = {
    FORWARD: "forward",
    BACKWARD: "backward"
};

// Debug helper
function debug(message, ...args) {
    console.log(`[DEBUG] ${message}`, ...args);
}

// ── Graph ──────────────────────────────────────────────────────────────

/**
 * Graph class to represent the causal network.
 * Simplified implementation of NetworkX-like functionality.
 * Maintains both forward and reverse adjacency lists.
 */
class Graph {
    constructor() {
        this.nodes = {};
        this.edges = {};
        this._adjacency = {};         // forward: source -> [targets]
        this._reverseAdjacency = {};  // backward: target -> [sources]
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
        if (!this._reverseAdjacency[node]) {
            this._reverseAdjacency[node] = [];
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

        // Update forward adjacency list
        if (!this._adjacency[source]) {
            this._adjacency[source] = [];
        }
        if (!this._adjacency[source].includes(target)) {
            this._adjacency[source].push(target);
        }

        // Update reverse adjacency list
        if (!this._reverseAdjacency[target]) {
            this._reverseAdjacency[target] = [];
        }
        if (!this._reverseAdjacency[target].includes(source)) {
            this._reverseAdjacency[target].push(source);
        }

        // Print debug info
        console.log(`Added edge ${source} -> ${target} with key ${edgeKey}`);
        console.log(`Updated adjacency for ${source}:`, this._adjacency[source]);
    }

    /**
     * Get all forward neighbors of a node (outgoing edges).
     * @param {string|number} node - Node identifier
     * @returns {Array} Array of neighboring nodes
     */
    neighbors(node) {
        const neighbors = this._adjacency[node] || [];
        console.log(`Neighbors for node ${node}:`, neighbors);
        return neighbors;
    }

    /**
     * Get all predecessors of a node (incoming edges).
     * @param {string|number} node - Node identifier
     * @returns {Array} Array of predecessor nodes
     */
    predecessors(node) {
        return this._reverseAdjacency[node] || [];
    }

    /**
     * Get normalized strengths for outgoing edges of a node.
     * @param {string|number} nodeId - Node identifier
     * @returns {Array} Array of [neighbor, edgeData, normalizedStrength]
     */
    getOutgoingStrengths(nodeId) {
        const nbrs = this._adjacency[nodeId] || [];
        if (nbrs.length === 0) return [];

        const outgoing = [];
        let totalStrength = 0;
        for (const neighbor of nbrs) {
            const edgeKey = `${nodeId},${neighbor}`;
            const edgeData = this.edges[edgeKey];
            if (!edgeData) continue;
            const strength = typeof edgeData.strength === 'number' ? edgeData.strength : Strength.MEDIUM;
            outgoing.push([neighbor, edgeData, strength]);
            totalStrength += strength;
        }
        if (outgoing.length === 0 || totalStrength === 0) return [];
        return outgoing.map(([n, ed, s]) => [n, ed, s / totalStrength]);
    }

    /**
     * Get normalized strengths for incoming edges of a node (used for backward diffusion).
     * @param {string|number} nodeId - Node identifier
     * @returns {Array} Array of [predecessor, edgeData, normalizedStrength]
     */
    getIncomingStrengths(nodeId) {
        const preds = this._reverseAdjacency[nodeId] || [];
        if (preds.length === 0) return [];

        const incoming = [];
        let totalStrength = 0;
        for (const pred of preds) {
            const edgeKey = `${pred},${nodeId}`;
            const edgeData = this.edges[edgeKey];
            if (!edgeData) continue;
            const strength = typeof edgeData.strength === 'number' ? edgeData.strength : Strength.MEDIUM;
            incoming.push([pred, edgeData, strength]);
            totalStrength += strength;
        }
        if (incoming.length === 0 || totalStrength === 0) return [];
        return incoming.map(([n, ed, s]) => [n, ed, s / totalStrength]);
    }

    /**
     * Serialize the graph to a plain object (for Web Worker transfer).
     * @returns {Object} Serializable representation
     */
    serialize() {
        return {
            nodes: JSON.parse(JSON.stringify(this.nodes)),
            edges: JSON.parse(JSON.stringify(this.edges)),
            _adjacency: JSON.parse(JSON.stringify(this._adjacency)),
            _reverseAdjacency: JSON.parse(JSON.stringify(this._reverseAdjacency))
        };
    }

    /**
     * Restore a Graph from a serialized plain object.
     * @param {Object} data - Serialized graph
     * @returns {Graph}
     */
    static deserialize(data) {
        const g = new Graph();
        g.nodes = data.nodes;
        g.edges = data.edges;
        g._adjacency = data._adjacency;
        g._reverseAdjacency = data._reverseAdjacency;
        return g;
    }

    /**
     * Print the entire graph structure for debugging
     */
    printGraph() {
        console.log("Graph structure:");
        console.log("Nodes:", this.nodes);
        console.log("Edges:", this.edges);
        console.log("Adjacency:", this._adjacency);
        console.log("Reverse adjacency:", this._reverseAdjacency);
    }
}

// ── TokenAgent (Probabilistic) ─────────────────────────────────────────

/**
 * An agent representing a token that diffuses through the causal network.
 * Supports both forward and backward propagation.
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
            debug(`Token ${this.uniqueId} charge FLIPPED: ${originalCharge} -> ${this.charge} (OPPOSITE polarity)`);
        } else {
            debug(`Token ${this.uniqueId} charge KEPT: ${this.charge} (SAME polarity)`);
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
     * Get all incoming edges and their normalized strengths (for backward diffusion).
     * @returns {Array} Array of [predecessor, edgeData, normalizedStrength]
     */
    getIncomingStrengths() {
        const preds = this.model.G._reverseAdjacency[this.currentNode] || [];
        debug(`Node ${this.currentNode} has predecessors:`, preds);

        if (preds.length === 0) {
            debug(`Token ${this.uniqueId} has no predecessors from ${this.currentNode}`);
            return [];
        }

        const incomingEdges = [];
        let totalStrength = 0;

        for (const pred of preds) {
            const edgeKey = `${pred},${this.currentNode}`;
            const edgeData = this.model.G.edges[edgeKey];
            if (!edgeData) {
                debug(`Missing edge data for ${edgeKey}`);
                continue;
            }
            const strength = typeof edgeData.strength === 'number' ?
                             edgeData.strength : Strength.MEDIUM;
            incomingEdges.push([pred, edgeData]);
            totalStrength += strength;
        }

        if (incomingEdges.length === 0) return [];

        const edgeStrengths = [];
        for (const [pred, edgeData] of incomingEdges) {
            const strength = typeof edgeData.strength === 'number' ?
                             edgeData.strength : Strength.MEDIUM;
            edgeStrengths.push([pred, edgeData, strength / totalStrength]);
        }

        debug(`Incoming edges to ${this.currentNode}:`,
              edgeStrengths.map(([n, _, s]) => `${n}(${s.toFixed(2)})`));
        return edgeStrengths;
    }

    /**
     * Step function for token movement and decision making.
     * Respects the model's propagation direction.
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
            // Choose edge set based on propagation direction
            const isBackward = this.model.direction === DiffusionDirection.BACKWARD;
            const edgeStrengths = isBackward ? this.getIncomingStrengths() : this.getOutgoingStrengths();

            if (edgeStrengths.length > 0) {
                // Choose destination based on strengths
                const weights = edgeStrengths.map(([_, __, strength]) => strength);
                const targetIndex = this.weightedRandomChoice(weights);
                const [targetNode, edgeData] = [edgeStrengths[targetIndex][0], edgeStrengths[targetIndex][1]];

                this.startMovement(targetNode, edgeData);
            } else {
                // Token has reached a dead end - inactivate it
                debug(`Token ${this.uniqueId} reached dead end at ${this.currentNode} - INACTIVATING`);
                this.active = false;
                this.state = TokenState.ACCUMULATED;
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

// ── CausalTokenModel (Probabilistic) ──────────────────────────────────

/**
 * Probabilistic token diffusion model (random-walk).
 * Each token independently follows one edge per step, chosen by weighted random sampling.
 */
class CausalTokenModel {
    /**
     * @param {Object} G - Graph representing the causal network
     * @param {number} numTokens - Number of tokens to create (default: 10)
     * @param {Object} initialAllocation - Initial allocation of tokens to nodes
     * @param {string} direction - 'forward' or 'backward' (default: 'forward')
     */
    constructor(G, numTokens = 10, initialAllocation = null, direction = DiffusionDirection.FORWARD) {
        this.G = G;
        this.numTokens = numTokens;
        this.direction = direction;
        this.mode = DiffusionMode.PROBABILISTIC;
        this.agents = [];
        this.edgeFlowsOverTime = [];
        this.nodeFlowsOverTime = [];
        this.stepCount = 0;
        this.simulationId = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];

        // Make sure the graph is properly set up
        G.printGraph();

        debug(`Initializing ${direction} probabilistic simulation with ${numTokens} tokens`);

        // Initialize tokens according to initial_allocation or default to node '0'
        if (initialAllocation === null) {
            initialAllocation = {'0': numTokens};
        }

        let tokenId = 0;
        for (const [node, count] of Object.entries(initialAllocation)) {
            debug(`Creating ${count} tokens at node ${node}`);
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
            if (agent.state !== TokenState.IN_TRANSIT && agent.active) {
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
        let inactiveTokens = 0;
        for (const agent of this.agents) {
            if (agent.active) {
                agent.step();
                tokensUpdated++;
            } else {
                inactiveTokens++;
            }
        }

        debug(`Updated ${tokensUpdated} tokens, ${inactiveTokens} inactive tokens`);

        // Record flows
        const nodeFlows = this.getNodeFlows();
        this.nodeFlowsOverTime.push(nodeFlows);
        this.edgeFlowsOverTime.push(this.getEdgeFlows());

        debug("Current token distribution:", nodeFlows);
        return nodeFlows;
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

// ── DeterministicDiffusionModel ────────────────────────────────────────

/**
 * Deterministic proportional-split diffusion model.
 * 
 * Instead of discrete tokens performing random walks, this model treats flow
 * as a continuous quantity that splits proportionally across outgoing (or incoming)
 * edges weighted by relationship strength.
 * 
 * Each edge has a FIFO delay pipeline — flow enters one end and exits after
 * `delay` steps, modelling temporal lag.
 * 
 * Output format is identical to CausalTokenModel (arrays of { nodeId: value })
 * so all chart/results code works unchanged.
 */
class DeterministicDiffusionModel {
    /**
     * @param {Object} G - Graph representing the causal network
     * @param {Object} initialAllocation - { nodeId: flowAmount } initial injection
     * @param {string} direction - 'forward' or 'backward'
     */
    constructor(G, initialAllocation = null, direction = DiffusionDirection.FORWARD) {
        this.G = G;
        this.direction = direction;
        this.mode = DiffusionMode.DETERMINISTIC;
        this.stepCount = 0;
        this.nodeFlowsOverTime = [];
        this.edgeFlowsOverTime = [];
        this.simulationId = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];

        // Current node flow buffer — flow available for routing this step
        this.nodeFlows = {};
        // Accumulated flow at dead-end nodes (permanently stored, not re-routed)
        this.accumulatedFlows = {};

        // Initialize all nodes to zero
        for (const nodeId in G.nodes) {
            this.nodeFlows[nodeId] = 0;
            this.accumulatedFlows[nodeId] = 0;
        }

        // Apply initial allocation
        if (initialAllocation) {
            for (const [nodeId, amount] of Object.entries(initialAllocation)) {
                this.nodeFlows[nodeId] = (this.nodeFlows[nodeId] || 0) + amount;
            }
        }

        // Initialize edge delay pipelines
        // Each pipeline is an array of length = edge delay.
        // Index 0 = front (exits next), last index = back (just entered).
        this.edgePipelines = {};
        for (const edgeKey in G.edges) {
            const edgeData = G.edges[edgeKey];
            const delay = typeof edgeData.delay === 'number' ? Math.max(edgeData.delay, 1) : Delay.MEDIUM;
            this.edgePipelines[edgeKey] = new Array(delay).fill(0);
        }

        // Record initial state — combine live flow + accumulated
        this.nodeFlowsOverTime.push(this._snapshotNodeFlows());

        debug(`Initialized ${direction} deterministic diffusion model`);
    }

    /**
     * Snapshot current node flows (live + accumulated) for recording.
     * @returns {Object} { nodeId: totalFlow }
     */
    _snapshotNodeFlows() {
        const snapshot = {};
        for (const nodeId in this.G.nodes) {
            snapshot[nodeId] = (this.nodeFlows[nodeId] || 0) + (this.accumulatedFlows[nodeId] || 0);
        }
        return snapshot;
    }

    /**
     * Snapshot current edge flows (sum of all flow in each pipeline).
     * @returns {Object} { edgeKey: totalFlowInTransit }
     */
    _snapshotEdgeFlows() {
        const snapshot = {};
        for (const edgeKey in this.edgePipelines) {
            snapshot[edgeKey] = this.edgePipelines[edgeKey].reduce((a, b) => a + b, 0);
        }
        return snapshot;
    }

    /**
     * Advance the simulation by one step.
     * 
     * 1. For each node with live flow, split proportionally across edges and
     *    push into the back of each edge pipeline. Dead-end flow accumulates.
     * 2. Pop from the front of each edge pipeline — arriving flow goes into
     *    a "next step" node buffer.
     * 3. Swap buffers: the arrivals become the new live node flows.
     */
    step() {
        this.stepCount += 1;
        const isBackward = this.direction === DiffusionDirection.BACKWARD;
        const nextNodeFlows = {};
        for (const nodeId in this.G.nodes) {
            nextNodeFlows[nodeId] = 0;
        }

        // ── Phase 1: Route live flow into edge pipelines ──
        for (const nodeId in this.G.nodes) {
            const flow = this.nodeFlows[nodeId];
            if (Math.abs(flow) < 1e-12) continue; // skip negligible flow

            // Get edge strengths based on direction
            const edgeStrengths = isBackward
                ? this.G.getIncomingStrengths(nodeId)
                : this.G.getOutgoingStrengths(nodeId);

            if (edgeStrengths.length === 0) {
                // Dead end — accumulate the flow permanently
                this.accumulatedFlows[nodeId] = (this.accumulatedFlows[nodeId] || 0) + flow;
                continue;
            }

            // Split flow proportionally
            for (const [neighbor, edgeData, normalizedStrength] of edgeStrengths) {
                let outflow = flow * normalizedStrength;

                // Apply polarity: OPPOSITE flips the sign
                if (edgeData.polarity === Polarity.OPPOSITE || edgeData.polarity === -1) {
                    outflow *= -1;
                }

                // Determine the correct edge key (edges are always stored source,target)
                const edgeKey = isBackward ? `${neighbor},${nodeId}` : `${nodeId},${neighbor}`;
                const pipeline = this.edgePipelines[edgeKey];
                if (pipeline) {
                    // Push into the back of the pipeline
                    pipeline[pipeline.length - 1] += outflow;
                }
            }
        }

        // ── Phase 2: Advance all pipelines — pop from front, shift, push 0 at back ──
        for (const edgeKey in this.edgePipelines) {
            const pipeline = this.edgePipelines[edgeKey];
            const arriving = pipeline.shift();  // pop from front
            pipeline.push(0);                   // new empty slot at back

            if (Math.abs(arriving) < 1e-12) continue;

            // Determine destination node
            const parts = edgeKey.split(',');
            const destNode = isBackward ? parts[0] : parts[1];
            nextNodeFlows[destNode] = (nextNodeFlows[destNode] || 0) + arriving;
        }

        // ── Phase 3: Swap buffers ──
        this.nodeFlows = nextNodeFlows;

        // Record snapshots
        this.nodeFlowsOverTime.push(this._snapshotNodeFlows());
        this.edgeFlowsOverTime.push(this._snapshotEdgeFlows());

        return this._snapshotNodeFlows();
    }

    /**
     * Run the simulation for a specified number of steps.
     * @param {number} numSteps - Number of steps to run
     * @returns {Object} { nodeFlows, edgeFlows }
     */
    run(numSteps) {
        for (let i = 0; i < numSteps; i++) {
            this.step();
        }
        debug(`Deterministic simulation completed after ${numSteps} steps`);
        return {
            nodeFlows: this.nodeFlowsOverTime,
            edgeFlows: this.edgeFlowsOverTime
        };
    }
}

// ── Convenience Functions ──────────────────────────────────────────────

/**
 * Run a token diffusion simulation (probabilistic).
 * @param {Object} G - Graph representing the causal network
 * @param {number} numTokens - Number of tokens to use
 * @param {number} numSteps - Number of steps to run
 * @param {Object} initialAllocation - Initial allocation of tokens
 * @param {string} direction - 'forward' or 'backward'
 * @returns {CausalTokenModel} The simulation model with results
 */
function runSimulation(G, numTokens = 10, numSteps = 30, initialAllocation = null, direction = DiffusionDirection.FORWARD) {
    const model = new CausalTokenModel(G, numTokens, initialAllocation, direction);
    model.run(numSteps);
    return model;
}

/**
 * Run a deterministic diffusion simulation.
 * @param {Object} G - Graph representing the causal network
 * @param {Object} initialAllocation - { nodeId: flowAmount }
 * @param {number} numSteps - Number of steps to run
 * @param {string} direction - 'forward' or 'backward'
 * @returns {DeterministicDiffusionModel} The simulation model with results
 */
function runDeterministicSimulation(G, initialAllocation, numSteps = 30, direction = DiffusionDirection.FORWARD) {
    const model = new DeterministicDiffusionModel(G, initialAllocation, direction);
    model.run(numSteps);
    return model;
}

/**
 * Compute the Area Under Curve (AUC) for a specific node from simulation results.
 * Uses trapezoidal integration on the node's flow time series.
 * @param {Array} nodeFlowsOverTime - Array of { nodeId: value } snapshots
 * @param {string} targetNodeId - The node to compute AUC for
 * @returns {number} AUC value (signed)
 */
function computeAUC(nodeFlowsOverTime, targetNodeId) {
    let auc = 0;
    for (let i = 1; i < nodeFlowsOverTime.length; i++) {
        const prev = nodeFlowsOverTime[i - 1][targetNodeId] || 0;
        const curr = nodeFlowsOverTime[i][targetNodeId] || 0;
        auc += (prev + curr) / 2;  // trapezoidal rule
    }
    return auc;
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
            type: NodeType.PASS_THROUGH,
            domain: factor.domain || "Unknown"
        };

        G.addNode(factor.id, nodeAttributes);
        debug(`Added node ${factor.id} (${factor.label})`);
    }

    // Add edges with simplified attributes
    for (const rel of relationshipsData) {
        // Set default values
        let strength = Strength.MEDIUM;
        let delay = 1;
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

// ── Exports ────────────────────────────────────────────────────────────

export {
    Polarity,
    Strength,
    Delay,
    TokenState,
    NodeType,
    DiffusionMode,
    DiffusionDirection,
    TokenAgent,
    CausalTokenModel,
    DeterministicDiffusionModel,
    Graph,
    runSimulation,
    runDeterministicSimulation,
    computeAUC,
    createCausalDiagram
};
