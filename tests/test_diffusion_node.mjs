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
    createCausalDiagram,
    parseSignedTokenCount,
    signedAllocationFromSelections
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

function twoNodeGraph(polarity = Polarity.SAME) {
    const G = new Graph();
    G.addNode('A', { label: 'A', type: 'pass_through' });
    G.addNode('B', { label: 'B', type: 'pass_through' });
    G.addEdge('A', 'B', { polarity, strength: Strength.HIGH, delay: 1 });
    return G;
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

console.log('\n=== Signed / Negative Token Initialization ===');

{
    const parsed = parseSignedTokenCount(-7);
    assert(parsed.tokenCount === 7, 'parseSignedTokenCount(-7) has count 7');
    assert(parsed.charge === -1, 'parseSignedTokenCount(-7) has charge -1');
}

{
    const parsed = parseSignedTokenCount(4);
    assert(parsed.tokenCount === 4, 'parseSignedTokenCount(4) has count 4');
    assert(parsed.charge === 1, 'parseSignedTokenCount(4) has charge +1');
}

{
    const parsed = parseSignedTokenCount(0);
    assert(parsed.tokenCount === 0, 'parseSignedTokenCount(0) has count 0');
}

{
    const allocation = signedAllocationFromSelections({
        A: { tokenCount: 5, charge: -1 },
        B: { tokenCount: 3, charge: 1 },
        C: { tokenCount: 0, charge: -1 }
    });
    assert(allocation.A === -5, 'UI negative charge becomes signed count -5');
    assert(allocation.B === 3, 'UI positive charge stays +3');
    assert(allocation.C === undefined, 'Zero tokenCount is omitted from allocation');
}

{
    const selections = new Map([
        ['X', { tokenCount: 10, charge: -1 }]
    ]);
    const allocation = signedAllocationFromSelections(selections);
    assert(allocation.X === -10, 'Map selections produce signed allocation');
}

{
    const G = twoNodeGraph();
    const model = new CausalTokenModel(G, 5, { A: -5 }, DiffusionDirection.FORWARD);

    assert(model.agents.length === 5, 'Negative allocation creates |n| probabilistic tokens');
    assert(model.agents.every(a => a.charge === -1), 'Negative allocation tokens have charge -1');
    assert(model.agents.every(a => a.currentNode === 'A'), 'Negative tokens start at the injection node');
    assertApprox(model.getNodeFlows()['A'], -5, 0.01, 'Initial node flow is -5 for a negative intervention');
    assertApprox(model.getNodeFlows()['B'], 0, 0.01, 'Downstream node starts at 0');
}

{
    const G = twoNodeGraph();
    const model = new CausalTokenModel(G, 5, { A: 5 }, DiffusionDirection.FORWARD);

    assert(model.agents.length === 5, 'Positive allocation creates n probabilistic tokens');
    assert(model.agents.every(a => a.charge === 1), 'Positive allocation tokens have charge +1');
    assertApprox(model.getNodeFlows()['A'], 5, 0.01, 'Initial node flow is +5 for a positive intervention');
}

{
    const G = twoNodeGraph();
    G.addNode('C', { label: 'C', type: 'pass_through' });
    const model = new CausalTokenModel(G, 7, { A: 4, B: -3 }, DiffusionDirection.FORWARD);

    assert(model.agents.length === 7, 'Mixed allocation creates |pos| + |neg| tokens');
    const atA = model.agents.filter(a => a.currentNode === 'A');
    const atB = model.agents.filter(a => a.currentNode === 'B');
    assert(atA.length === 4 && atA.every(a => a.charge === 1), 'Node A gets 4 positive tokens');
    assert(atB.length === 3 && atB.every(a => a.charge === -1), 'Node B gets 3 negative tokens');
    assertApprox(model.getNodeFlows()['A'], 4, 0.01, 'Mixed init: A flow is +4');
    assertApprox(model.getNodeFlows()['B'], -3, 0.01, 'Mixed init: B flow is -3');
}

console.log('\n=== Negative Tokens Preserve / Flip Charge ===');

{
    const G = twoNodeGraph(Polarity.SAME);
    const model = new CausalTokenModel(G, 5, { A: -5 }, DiffusionDirection.FORWARD);
    model.step(); // start transit (charge applied on departure)
    assert(model.agents.every(a => a.charge === -1), 'SAME polarity keeps negative charge in transit');
    model.step(); // arrive at B
    assertApprox(model.getNodeFlows()['B'], -5, 0.01, 'Negative tokens arrive at B still negative on SAME edge');
}

{
    const G = twoNodeGraph(Polarity.OPPOSITE);
    const model = new CausalTokenModel(G, 5, { A: -5 }, DiffusionDirection.FORWARD);
    model.step(); // start transit — charge flips immediately
    assert(model.agents.every(a => a.charge === 1), 'OPPOSITE polarity flips negative tokens to positive');
    model.step(); // arrive at B
    assertApprox(model.getNodeFlows()['B'], 5, 0.01, 'Flipped negative intervention arrives as +5');
}

{
    const G = twoNodeGraph(Polarity.SAME);
    const model = new DeterministicDiffusionModel(G, { A: -100 }, DiffusionDirection.FORWARD);
    assertApprox(model._snapshotNodeFlows()['A'], -100, 0.01, 'Deterministic negative injection starts at A');
    model.step();
    assertApprox(model.nodeFlowsOverTime[model.nodeFlowsOverTime.length - 1]['B'], -100, 0.01,
        'Deterministic SAME polarity preserves negative flow');
}

{
    const G = twoNodeGraph(Polarity.OPPOSITE);
    const model = new DeterministicDiffusionModel(G, { A: -100 }, DiffusionDirection.FORWARD);
    model.step();
    assertApprox(model.nodeFlowsOverTime[model.nodeFlowsOverTime.length - 1]['B'], 100, 0.01,
        'Deterministic OPPOSITE polarity flips negative flow to positive');
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
