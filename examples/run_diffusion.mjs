/**
 * Standalone usage of SIM4Action diffusion engine in Node.js.
 *
 * Demonstrates that diffusion.js works as a pure JavaScript library
 * outside the browser, with no DOM or web API dependencies.
 *
 * Usage:
 *     node examples/run_diffusion.mjs
 */

import {
    Graph,
    CausalTokenModel,
    DeterministicDiffusionModel,
    DiffusionDirection,
    Polarity,
    Strength,
    Delay,
    computeAUC,
    createCausalDiagram
} from '../platform/diffusion.js';

// ── Sample fishery system ──────────────────────────────────────────────

const factors = [
    { id: 'V1', label: 'Fish Stock', domain: 'Environmental' },
    { id: 'V2', label: 'Fishing Effort', domain: 'Economic' },
    { id: 'V3', label: 'Market Price', domain: 'Economic' },
    { id: 'V4', label: 'Fisher Income', domain: 'Social' },
    { id: 'V5', label: 'Regulation', domain: 'Management' },
];

const relationships = [
    { source: 'V1', target: 'V2', polarity: 'same', strength: 'HIGH', delay: 'FAST' },
    { source: 'V2', target: 'V1', polarity: 'opposite', strength: 'HIGH', delay: 'MEDIUM' },
    { source: 'V1', target: 'V3', polarity: 'opposite', strength: 'MEDIUM', delay: 'FAST' },
    { source: 'V3', target: 'V2', polarity: 'same', strength: 'MEDIUM', delay: 'FAST' },
    { source: 'V2', target: 'V4', polarity: 'same', strength: 'HIGH', delay: 'FAST' },
    { source: 'V5', target: 'V2', polarity: 'opposite', strength: 'HIGH', delay: 'SLOW' },
];

// ── 1. Build graph using createCausalDiagram ───────────────────────────

const G = createCausalDiagram(factors, relationships);
console.log('=== Graph Construction ===');
console.log(`  Nodes: ${Object.keys(G.nodes).length}`);
console.log(`  Edges: ${Object.keys(G.edges).length}`);
console.log();

// ── 2. Probabilistic diffusion (random-walk tokens) ───────────────────

console.log('=== Probabilistic Diffusion (100 tokens, 50 steps) ===');
const probModel = new CausalTokenModel(G, 100, { 'V1': 100 }, DiffusionDirection.FORWARD);
probModel.run(50);

const lastFlows = probModel.nodeFlowsOverTime[probModel.nodeFlowsOverTime.length - 1];
console.log('  Final token distribution:');
for (const [nodeId, count] of Object.entries(lastFlows)) {
    const name = G.nodes[nodeId]?.label || nodeId;
    console.log(`    ${nodeId} (${name}): ${count}`);
}
console.log();

// ── 3. Deterministic diffusion (proportional split) ───────────────────

console.log('=== Deterministic Diffusion (50 steps) ===');
const detModel = new DeterministicDiffusionModel(G, { 'V1': 100 }, DiffusionDirection.FORWARD);
detModel.run(50);

const detLastFlows = detModel.nodeFlowsOverTime[detModel.nodeFlowsOverTime.length - 1];
console.log('  Final flow distribution:');
for (const [nodeId, flow] of Object.entries(detLastFlows)) {
    const name = G.nodes[nodeId]?.label || nodeId;
    console.log(`    ${nodeId} (${name}): ${flow.toFixed(2)}`);
}
console.log();

// ── 4. AUC computation ────────────────────────────────────────────────

console.log('=== Area Under Curve (AUC) ===');
for (const nodeId of Object.keys(G.nodes)) {
    const auc = computeAUC(detModel.nodeFlowsOverTime, nodeId);
    const name = G.nodes[nodeId]?.label || nodeId;
    console.log(`  ${nodeId} (${name}): AUC = ${auc.toFixed(2)}`);
}

// ── 5. Backward diffusion ─────────────────────────────────────────────

console.log();
console.log('=== Backward Deterministic Diffusion ===');
const backModel = new DeterministicDiffusionModel(G, { 'V4': 100 }, DiffusionDirection.BACKWARD);
backModel.run(50);

const backLastFlows = backModel.nodeFlowsOverTime[backModel.nodeFlowsOverTime.length - 1];
console.log('  Final flow distribution (backward from Fisher Income):');
for (const [nodeId, flow] of Object.entries(backLastFlows)) {
    const name = G.nodes[nodeId]?.label || nodeId;
    if (Math.abs(flow) > 0.01) {
        console.log(`    ${nodeId} (${name}): ${flow.toFixed(2)}`);
    }
}
