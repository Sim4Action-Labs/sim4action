/**
 * Genetic Algorithm Optimization Web Worker
 * 
 * Runs a GA to find optimal token allocation that maximizes cumulative causal
 * effect (AUC of node flow curve) on a target variable.
 * 
 * Uses genetic-js library loaded via importScripts and an inlined copy of
 * the DeterministicDiffusionModel from diffusion.js (since Web Workers cannot
 * use ES6 module imports without a build step).
 */

// Load genetic-js from local copy (patched for Web Worker compatibility)
importScripts('./lib/genetic-0.1.14.js');

// ── Inlined diffusion engine (subset needed for fitness evaluation) ──────

const Polarity = { SAME: 1, OPPOSITE: -1 };
const Strength = { WEAK: 0.3, MEDIUM: 0.6, HIGH: 1.0 };
const Delay = { FAST: 5, MEDIUM: 10, SLOW: 20 };

class Graph {
    constructor() {
        this.nodes = {};
        this.edges = {};
        this._adjacency = {};
        this._reverseAdjacency = {};
    }
    addNode(node, attributes = {}) {
        this.nodes[node] = attributes;
        if (!this._adjacency[node]) this._adjacency[node] = [];
        if (!this._reverseAdjacency[node]) this._reverseAdjacency[node] = [];
    }
    addEdge(source, target, attributes = {}) {
        if (!this.nodes[source]) this.addNode(source);
        if (!this.nodes[target]) this.addNode(target);
        const edgeKey = `${source},${target}`;
        this.edges[edgeKey] = attributes;
        if (!this._adjacency[source]) this._adjacency[source] = [];
        if (!this._adjacency[source].includes(target)) this._adjacency[source].push(target);
        if (!this._reverseAdjacency[target]) this._reverseAdjacency[target] = [];
        if (!this._reverseAdjacency[target].includes(source)) this._reverseAdjacency[target].push(source);
    }
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
    static deserialize(data) {
        const g = new Graph();
        g.nodes = data.nodes;
        g.edges = data.edges;
        g._adjacency = data._adjacency;
        g._reverseAdjacency = data._reverseAdjacency;
        return g;
    }
}

class DeterministicDiffusionModel {
    constructor(G, initialAllocation, direction = 'forward') {
        this.G = G;
        this.direction = direction;
        this.stepCount = 0;
        this.nodeFlowsOverTime = [];
        this.edgeFlowsOverTime = [];
        this.nodeFlows = {};
        this.accumulatedFlows = {};
        for (const nodeId in G.nodes) {
            this.nodeFlows[nodeId] = 0;
            this.accumulatedFlows[nodeId] = 0;
        }
        if (initialAllocation) {
            for (const [nodeId, amount] of Object.entries(initialAllocation)) {
                this.nodeFlows[nodeId] = (this.nodeFlows[nodeId] || 0) + amount;
            }
        }
        this.edgePipelines = {};
        for (const edgeKey in G.edges) {
            const edgeData = G.edges[edgeKey];
            const delay = typeof edgeData.delay === 'number' ? Math.max(edgeData.delay, 1) : Delay.MEDIUM;
            this.edgePipelines[edgeKey] = new Array(delay).fill(0);
        }
        this.nodeFlowsOverTime.push(this._snapshotNodeFlows());
    }
    _snapshotNodeFlows() {
        const snapshot = {};
        for (const nodeId in this.G.nodes) {
            snapshot[nodeId] = (this.nodeFlows[nodeId] || 0) + (this.accumulatedFlows[nodeId] || 0);
        }
        return snapshot;
    }
    step() {
        this.stepCount += 1;
        const isBackward = this.direction === 'backward';
        const nextNodeFlows = {};
        for (const nodeId in this.G.nodes) nextNodeFlows[nodeId] = 0;
        for (const nodeId in this.G.nodes) {
            const flow = this.nodeFlows[nodeId];
            if (Math.abs(flow) < 1e-12) continue;
            const edgeStrengths = isBackward
                ? this.G.getIncomingStrengths(nodeId)
                : this.G.getOutgoingStrengths(nodeId);
            if (edgeStrengths.length === 0) {
                this.accumulatedFlows[nodeId] = (this.accumulatedFlows[nodeId] || 0) + flow;
                continue;
            }
            for (const [neighbor, edgeData, normalizedStrength] of edgeStrengths) {
                let outflow = flow * normalizedStrength;
                if (edgeData.polarity === Polarity.OPPOSITE || edgeData.polarity === -1) {
                    outflow *= -1;
                }
                const edgeKey = isBackward ? `${neighbor},${nodeId}` : `${nodeId},${neighbor}`;
                const pipeline = this.edgePipelines[edgeKey];
                if (pipeline) {
                    pipeline[pipeline.length - 1] += outflow;
                }
            }
        }
        for (const edgeKey in this.edgePipelines) {
            const pipeline = this.edgePipelines[edgeKey];
            const arriving = pipeline.shift();
            pipeline.push(0);
            if (Math.abs(arriving) < 1e-12) continue;
            const parts = edgeKey.split(',');
            const destNode = isBackward ? parts[0] : parts[1];
            nextNodeFlows[destNode] = (nextNodeFlows[destNode] || 0) + arriving;
        }
        this.nodeFlows = nextNodeFlows;
        this.nodeFlowsOverTime.push(this._snapshotNodeFlows());
        return this._snapshotNodeFlows();
    }
    run(numSteps) {
        for (let i = 0; i < numSteps; i++) this.step();
        return { nodeFlows: this.nodeFlowsOverTime };
    }
}

function computeAUC(nodeFlowsOverTime, targetNodeId) {
    let auc = 0;
    for (let i = 1; i < nodeFlowsOverTime.length; i++) {
        const prev = nodeFlowsOverTime[i - 1][targetNodeId] || 0;
        const curr = nodeFlowsOverTime[i][targetNodeId] || 0;
        auc += (prev + curr) / 2;
    }
    return auc;
}

// Make classes available on globalThis so they survive genetic-js's
// serialization+eval cycle AND are accessible even when `self` is shadowed.
globalThis.Graph = Graph;
globalThis.DeterministicDiffusionModel = DeterministicDiffusionModel;
globalThis.computeAUC = computeAUC;

// Capture worker's postMessage on the GLOBAL scope so it survives genetic-js
// serialization+eval cycles (genetic-js stringifies all functions and eval's them
// in a new scope, losing closures; but global-scope variables remain accessible).
// We use `globalThis` because genetic-js shadows `self` with `var self = this`
// inside start(). `globalThis` is always the true global object in any context.
globalThis._workerPost = postMessage.bind(globalThis);
globalThis._gaStop = { stopped: false };

// ── GA Configuration & Handler ────────────────────────────────────────

let gaGraph = null;
let gaConfig = null;

self.onmessage = function(e) {
    const msg = e.data;
    
    if (msg.type === 'start') {
        gaConfig = msg.config;
        gaGraph = Graph.deserialize(msg.graphData);
        runGA();
    } else if (msg.type === 'stop') {
        // genetic-js doesn't have a clean stop mechanism, so we use a flag
        globalThis._gaStop.stopped = true;
    }
};

function runGA() {
    var config = gaConfig;
    var targetNodeId = config.targetNodeId;
    var eligibleNodes = config.eligibleNodes;
    var totalBudget = config.totalBudget || 100;
    var numSteps = config.timeSteps || 200;
    var optimizationGoal = config.optimizationGoal || 'maximize_positive';
    var direction = config.direction || 'forward';
    
    globalThis._gaStop.stopped = false;
    globalThis._gaStartTime = Date.now();
    
    var genetic = Genetic.create();
    
    // ─────────────────────────────────────────────────────────────────
    // IMPORTANT: genetic-js serialises (toString) all genetic.* functions
    // and eval's them in a fresh scope, so closures are LOST.
    // We pass all needed data through `this.userData` which genetic-js
    // properly serializes and restores inside every callback.
    // Inside each callback, `this.userData` holds our custom data.
    // ─────────────────────────────────────────────────────────────────
    
    // ── seed: create random allocation ──
    genetic.seed = function() {
        var ud = this.userData;
        var alloc = {};
        var weights = ud.eligibleNodes.map(function() { return Math.random(); });
        var weightSum = weights.reduce(function(a, b) { return a + b; }, 0);
        
        var remaining = ud.totalBudget;
        for (var i = 0; i < ud.eligibleNodes.length; i++) {
            if (i === ud.eligibleNodes.length - 1) {
                alloc[ud.eligibleNodes[i]] = Math.max(0, remaining);
            } else {
                var amount = Math.round((weights[i] / weightSum) * ud.totalBudget);
                alloc[ud.eligibleNodes[i]] = Math.max(0, amount);
                remaining -= alloc[ud.eligibleNodes[i]];
            }
        }
        return alloc;
    };
    
    // ── fitness: run deterministic diffusion, compute AUC ──
    genetic.fitness = function(allocation) {
        var ud = this.userData;
        // Reconstruct graph from serialized data
        var g = new Graph();
        g.nodes = ud.graphNodes;
        g.edges = ud.graphEdges;
        g._adjacency = ud.graphAdj;
        g._reverseAdjacency = ud.graphRevAdj;
        
        var model = new DeterministicDiffusionModel(g, allocation, ud.direction);
        model.run(ud.numSteps);
        var auc = computeAUC(model.nodeFlowsOverTime, ud.targetNodeId);
        
        if (ud.optimizationGoal === 'maximize_positive') {
            return auc;
        } else if (ud.optimizationGoal === 'maximize_absolute') {
            return Math.abs(auc);
        } else if (ud.optimizationGoal === 'minimize_negative') {
            return -auc;
        }
        return auc;
    };
    
    // ── mutate: shift tokens between two random nodes ──
    genetic.mutate = function(allocation) {
        var mutated = {};
        var keys = Object.keys(allocation);
        for (var k = 0; k < keys.length; k++) mutated[keys[k]] = allocation[keys[k]];
        
        if (keys.length < 2) return mutated;
        
        var i = Math.floor(Math.random() * keys.length);
        var j = Math.floor(Math.random() * keys.length);
        while (j === i && keys.length > 1) j = Math.floor(Math.random() * keys.length);
        
        var nodeA = keys[i];
        var nodeB = keys[j];
        
        var transferAmount = Math.max(1, Math.round(Math.random() * (mutated[nodeA] || 0) * 0.5));
        mutated[nodeA] = Math.max(0, (mutated[nodeA] || 0) - transferAmount);
        mutated[nodeB] = (mutated[nodeB] || 0) + transferAmount;
        
        return mutated;
    };
    
    // ── crossover: blend two allocations ──
    genetic.crossover = function(mother, father) {
        var ud = this.userData;
        var son = {};
        var daughter = {};
        var keySet = {};
        var mk = Object.keys(mother);
        var fk = Object.keys(father);
        var ki;
        for (ki = 0; ki < mk.length; ki++) keySet[mk[ki]] = true;
        for (ki = 0; ki < fk.length; ki++) keySet[fk[ki]] = true;
        var keys = Object.keys(keySet);
        
        var alpha = 0.3 + Math.random() * 0.4;
        
        var sonTotal = 0, daughterTotal = 0;
        for (ki = 0; ki < keys.length; ki++) {
            var key = keys[ki];
            var m = mother[key] || 0;
            var f = father[key] || 0;
            son[key] = Math.round(alpha * m + (1 - alpha) * f);
            daughter[key] = Math.round((1 - alpha) * m + alpha * f);
            sonTotal += son[key];
            daughterTotal += daughter[key];
        }
        
        var budget = ud.totalBudget;
        if (sonTotal > 0) {
            for (ki = 0; ki < keys.length; ki++) {
                son[keys[ki]] = Math.round((son[keys[ki]] / sonTotal) * budget);
            }
        }
        if (daughterTotal > 0) {
            for (ki = 0; ki < keys.length; ki++) {
                daughter[keys[ki]] = Math.round((daughter[keys[ki]] / daughterTotal) * budget);
            }
        }
        
        // Fix rounding errors
        var fixBudget = function(alloc) {
            var total = 0;
            var allKeys = Object.keys(alloc);
            for (var x = 0; x < allKeys.length; x++) total += alloc[allKeys[x]];
            if (total !== budget && allKeys.length > 0) {
                var maxKey = allKeys[0];
                for (var x = 1; x < allKeys.length; x++) {
                    if ((alloc[allKeys[x]] || 0) > (alloc[maxKey] || 0)) maxKey = allKeys[x];
                }
                alloc[maxKey] = (alloc[maxKey] || 0) + (budget - total);
            }
        };
        fixBudget(son);
        fixBudget(daughter);
        
        return [son, daughter];
    };
    
    genetic.optimize = Genetic.Optimize.Maximize;
    genetic.select1 = Genetic.Select1.Tournament3;
    genetic.select2 = Genetic.Select2.Tournament3;
    
    // CRITICAL: genetic-js serialises ALL functions (including generation & notification)
    // to strings and eval's them in a new scope. All closures are LOST.
    // We use globalThis._workerPost and globalThis._gaStop which are always accessible.
    // For notification, we need targetNodeId/numSteps/direction — pass via this.userData.
    genetic.generation = function(pop, generation, stats) {
        if (globalThis._gaStop.stopped) return false;
        
        globalThis._workerPost({
            type: 'progress',
            generation: generation,
            bestFitness: stats.maximum,
            meanFitness: stats.mean,
            bestAllocation: pop[0].entity,
            stats: {
                maximum: stats.maximum,
                minimum: stats.minimum,
                mean: stats.mean,
                stdev: stats.stdev
            }
        });
        
        return true;
    };
    
    genetic.notification = function(pop, generation, stats, isFinished) {
        if (isFinished) {
            var ud = this.userData;
            var bestAlloc = pop[0].entity;
            
            // Reconstruct graph from serialized data for final run
            var g = new Graph();
            g.nodes = ud.graphNodes;
            g.edges = ud.graphEdges;
            g._adjacency = ud.graphAdj;
            g._reverseAdjacency = ud.graphRevAdj;
            
            var finalModel = new DeterministicDiffusionModel(g, bestAlloc, ud.direction);
            finalModel.run(ud.numSteps);
            
            globalThis._workerPost({
                type: 'complete',
                bestAllocation: bestAlloc,
                bestFitness: stats.maximum,
                targetNodeFlows: finalModel.nodeFlowsOverTime.map(function(f) { return f[ud.targetNodeId] || 0; }),
                allNodeFlows: finalModel.nodeFlowsOverTime,
                elapsedMs: Date.now() - globalThis._gaStartTime,
                generations: generation,
                stats: {
                    maximum: stats.maximum,
                    minimum: stats.minimum,
                    mean: stats.mean,
                    stdev: stats.stdev
                }
            });
        }
    };
    
    // Configure and run — pass all needed data through userData
    // so that eval'd functions (seed, fitness, mutate, crossover) can access it
    genetic.evolve({
        size: config.populationSize || 50,
        crossover: config.crossoverRate || 0.8,
        mutation: config.mutationRate || 0.3,
        iterations: config.generations || 100,
        fittestAlwaysSurvives: true,
        maxResults: 1,
        webWorkers: false,
        skip: 0
    }, {
        // userData — available as this.userData inside seed/fitness/mutate/crossover
        eligibleNodes: eligibleNodes,
        totalBudget: totalBudget,
        targetNodeId: targetNodeId,
        numSteps: numSteps,
        optimizationGoal: optimizationGoal,
        direction: direction,
        // Serialize graph data as plain objects (not class instances)
        graphNodes: JSON.parse(JSON.stringify(gaGraph.nodes)),
        graphEdges: JSON.parse(JSON.stringify(gaGraph.edges)),
        graphAdj: JSON.parse(JSON.stringify(gaGraph._adjacency)),
        graphRevAdj: JSON.parse(JSON.stringify(gaGraph._reverseAdjacency))
    });
}
