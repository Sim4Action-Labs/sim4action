/**
 * Node.js tests for diffusion.js — the SIM4Action token diffusion engine.
 *
 * Validates that the core diffusion library works outside the browser
 * as a standalone JavaScript module.
 *
 * Usage:
 *     node tests/test_diffusion_node.mjs
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

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`  FAIL: ${message}`);
        failed++;
    } else {
        console.log(`  PASS: ${message}`);
        passed++;
    }
}

function assertApprox(actual, expected, tolerance, message) {
    const diff = Math.abs(actual - expected);
    assert(diff <= tolerance, `${message} (got ${actual}, expected ~${expected}, tol=${tolerance})`);
}

// ── Test helpers ───────────────────────────────────────────────────────

function buildTestGraph() {
    const factors = [
        { id: 'V1', label: 'Fish Stock', domain: 'Env' },
        { id: 'V2', label: 'Fishing Effort', domain: 'Econ' },
        { id: 'V3', label: 'Market Price', domain: 'Econ' },
    ];
    const relationships = [
        { source: 'V1', target: 'V2', polarity: 'same', strength: 'HIGH', delay: 'FAST' },
        { source: 'V2', target: 'V3', polarity: 'same', strength: 'MEDIUM', delay: 'FAST' },
        { source: 'V3', target: 'V1', polarity: 'opposite', strength: 'MEDIUM', delay: 'FAST' },
    ];
    return createCausalDiagram(factors, relationships);
}

// ── Tests ──────────────────────────────────────────────────────────────

console.log('\n=== Graph Construction ===');

{
    const G = buildTestGraph();
    assert(Object.keys(G.nodes).length === 3, 'Graph has 3 nodes');
    assert(Object.keys(G.edges).length === 3, 'Graph has 3 edges');
    assert(G.nodes['V1'] !== undefined, 'Node V1 exists');
    assert(G.edges['V1,V2'] !== undefined, 'Edge V1->V2 exists');
}

{
    const G = new Graph();
    assert(Object.keys(G.nodes).length === 0, 'Empty graph has 0 nodes');
    assert(Object.keys(G.edges).length === 0, 'Empty graph has 0 edges');
}

console.log('\n=== Probabilistic Diffusion (CausalTokenModel) ===');

{
    const G = buildTestGraph();
    const model = new CausalTokenModel(G, 50, { 'V1': 50 }, DiffusionDirection.FORWARD);
    model.run(20);

    assert(model.nodeFlowsOverTime.length === 21, 'Recorded 21 snapshots (initial + 20 steps)');
    assert(model.stepCount === 20, 'Step count is 20');

    const finalFlows = model.nodeFlowsOverTime[model.nodeFlowsOverTime.length - 1];
    const totalTokens = Object.values(finalFlows).reduce((a, b) => a + Math.abs(b), 0);
    assert(totalTokens <= 50, 'Total tokens <= initial allocation (some may be inactive)');
}

{
    const G = buildTestGraph();
    const model = new CausalTokenModel(G, 10, { 'V1': 10 }, DiffusionDirection.BACKWARD);
    model.run(10);
    assert(model.nodeFlowsOverTime.length === 11, 'Backward diffusion records correct snapshots');
}

console.log('\n=== Deterministic Diffusion ===');

{
    const G = buildTestGraph();
    const model = new DeterministicDiffusionModel(G, { 'V1': 100 }, DiffusionDirection.FORWARD);
    model.run(30);

    assert(model.nodeFlowsOverTime.length === 31, 'Recorded 31 snapshots');
    const finalFlows = model.nodeFlowsOverTime[model.nodeFlowsOverTime.length - 1];
    assert(finalFlows['V2'] !== undefined, 'V2 has flow after deterministic diffusion');
    assert(finalFlows['V3'] !== undefined, 'V3 has flow after deterministic diffusion');
}

{
    const G = new Graph();
    G.addNode('A', { label: 'A', type: 'pass_through' });
    G.addNode('B', { label: 'B', type: 'pass_through' });
    G.addEdge('A', 'B', { polarity: Polarity.SAME, strength: Strength.HIGH, delay: 1 });

    const model = new DeterministicDiffusionModel(G, { 'A': 100 }, DiffusionDirection.FORWARD);
    model.step();

    const flows = model.nodeFlowsOverTime[model.nodeFlowsOverTime.length - 1];
    assertApprox(flows['B'], 100, 0.01, 'All flow reaches B after 1 step with delay=1');
}

console.log('\n=== Polarity Flipping ===');

{
    const G = new Graph();
    G.addNode('A', { label: 'A', type: 'pass_through' });
    G.addNode('B', { label: 'B', type: 'pass_through' });
    G.addEdge('A', 'B', { polarity: Polarity.OPPOSITE, strength: Strength.HIGH, delay: 1 });

    const model = new DeterministicDiffusionModel(G, { 'A': 100 }, DiffusionDirection.FORWARD);
    model.step();

    const flows = model.nodeFlowsOverTime[model.nodeFlowsOverTime.length - 1];
    assertApprox(flows['B'], -100, 0.01, 'OPPOSITE polarity flips flow sign');
}

console.log('\n=== computeAUC ===');

{
    const snapshots = [
        { 'V1': 0 },
        { 'V1': 10 },
        { 'V1': 10 },
        { 'V1': 0 },
    ];
    const auc = computeAUC(snapshots, 'V1');
    assertApprox(auc, 20, 0.01, 'AUC for trapezoidal [0,10,10,0] = 20');
}

{
    const snapshots = [{ 'V1': 5 }, { 'V1': 5 }, { 'V1': 5 }];
    const auc = computeAUC(snapshots, 'V1');
    assertApprox(auc, 10, 0.01, 'AUC for constant 5 over 2 intervals = 10');
}

{
    const auc = computeAUC([{ 'V1': 0 }], 'V1');
    assertApprox(auc, 0, 0.01, 'AUC for single snapshot is 0');
}

// ── Summary ────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}\n`);

if (failed > 0) {
    process.exit(1);
}
