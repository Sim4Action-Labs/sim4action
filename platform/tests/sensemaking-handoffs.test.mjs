// jsdom-based test harness for the lab handoff doors added to
// platform/sensemaking-lab.js (spec §7: "Where do I go next?" -- Landmark
// panel -> Diagnostics, Loop story -> Intervention, fragile Bridge ->
// Monitoring, forward Compass cone -> Intervention, Tour finale cards).
//
// app.html itself isn't loaded here (too large / DOM-heavy); instead this
// stubs the two hooks app.html provides (window.switchLab,
// window.SIM4ActionLabSeed) and asserts sensemaking-lab.js calls them with
// the right lab + seed contract.
//
// Run with: node platform/tests/sensemaking-handoffs.test.mjs

import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.resolve(__dirname, '..', 'sensemaking-lab.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        passed += 1;
    } else {
        failed += 1;
        console.error(`FAIL: ${message}`);
    }
}

function makeChainableD3Stub() {
    const proxy = new Proxy(function chainable() { return proxy; }, {
        get(target, prop) {
            if (prop === 'nodes') return () => [];
            if (prop === 'node') return () => null;
            if (prop === 'empty') return () => true;
            return () => proxy;
        },
        apply() {
            return proxy;
        },
    });
    return proxy;
}

const NODES = [
    { id: '1', name: 'Rain', domain: 'Climate' },
    { id: '2', name: 'River flow', domain: 'Hydrology' },
    { id: '3', name: 'Fish stock', domain: 'Biology' },
    { id: '4', name: 'Fisher income', domain: 'Economics' },
];
const LINKS = [
    { source: '1', target: '2', type: 'same', strength: 'strong', delay: 'days', definition: '' },
    { source: '2', target: '3', type: 'same', strength: 'medium', delay: 'months', definition: '' },
    { source: '3', target: '4', type: 'opposite', strength: 'strong', delay: 'months', definition: '' },
];

const ORIENTATION = {
    landmarks: [
        { factor_id: '3', name: 'Fish stock', reason: 'A key biological indicator.', metrics: {} },
    ],
    clusters: [
        { id: 0, name: 'Hydrology district', factor_ids: ['1', '2'] },
        { id: 1, name: 'Economics district', factor_ids: ['3', '4'] },
    ],
    bridges: [
        { districts: [0, 1], edges: [['2', '3']], fragile: true, summary: 'The only link between water and economy.' },
        { districts: [0, 1], edges: [['1', '4']], fragile: false, summary: 'A sturdy, non-fragile link.' },
    ],
    stories: {
        headline: 'Test dynamics headline.',
        loops: [
            { id: 'L1', name: 'The scarcity spiral', type: 'reinforcing', factor_ids: ['2', '3', '4'], story: 'A test loop story.' },
        ],
    },
    tour: [
        { step: 0, say: 'Welcome to the tour.', action: { type: 'clearQuestion' } },
    ],
};

async function main() {
    const source = fs.readFileSync(SOURCE_PATH, 'utf-8');

    const dom = new JSDOM(
        '<!DOCTYPE html><html><body><div id="sensemaking-lab-root"></div><div id="graph"><svg><g></g></svg></div></body></html>',
        { url: 'https://sim4action.io/app.html?system=octopus_chile', runScripts: 'outside-only' }
    );
    const { window } = dom;
    window.createBasicSection = undefined;
    window.d3 = makeChainableD3Stub();

    const switchLabCalls = [];
    window.switchLab = (lab) => { switchLabCalls.push(lab); };

    const labSeedCalls = [];
    window.SIM4ActionLabSeed = (lab, seed) => { labSeedCalls.push({ lab, seed }); };

    window.fetch = async (url) => {
        if (String(url).includes('orientation.json')) {
            return { ok: true, json: async () => ORIENTATION };
        }
        throw new Error(`Unexpected fetch: ${url}`);
    };

    window.eval(source);
    window.SIM4ActionSensemaking.init({
        systemId: 'octopus_chile', systemName: 'Test System', nodes: NODES, links: LINKS,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // ==================== Landmark panel -> Diagnostics ====================
    const landmarkItem = window.document.querySelector('.s4a-landmark-item');
    assert(!!landmarkItem, 'a landmark list item is rendered');
    landmarkItem.click();

    const analyzeBtn = window.document.querySelector('.s4a-landmark-analyze');
    assert(!!analyzeBtn, '"Analyze this factor" button is rendered in the landmark detail panel');
    analyzeBtn.click();

    assert(switchLabCalls.at(-1) === 'diagnostics', 'clicking "Analyze this factor" switches to the diagnostics lab');
    let lastSeed = labSeedCalls.at(-1);
    assert(lastSeed.lab === 'diagnostics', 'seed dispatch targets the diagnostics lab');
    assert(lastSeed.seed.factorId === '3', 'seed carries the landmark\'s factor id');
    assert(lastSeed.seed.kind === 'centrality', 'diagnostics seed is tagged "centrality"');

    let viewState = window.SIM4ActionSensemaking.getViewState();
    assert(!!viewState.seed && viewState.seed.factorId === '3', 'the pending seed is serialized into the view state');

    // ==================== Fragile bridge -> Monitoring ====================
    const bridgeItems = window.document.querySelectorAll('.s4a-bridge-item');
    assert(bridgeItems.length === 2, 'both bridges are rendered');
    const fragileWatchBtn = bridgeItems[0].querySelector('.s4a-bridge-watch');
    const sturdyWatchBtn = bridgeItems[1].querySelector('.s4a-bridge-watch');
    assert(!!fragileWatchBtn, '"Watch this coupling" is rendered for the fragile bridge');
    assert(!sturdyWatchBtn, '"Watch this coupling" is NOT rendered for the non-fragile bridge');

    fragileWatchBtn.click();
    assert(switchLabCalls.at(-1) === 'monitoring', 'clicking "Watch this coupling" switches to the monitoring lab');
    lastSeed = labSeedCalls.at(-1);
    assert(lastSeed.lab === 'monitoring', 'seed dispatch targets the monitoring lab');
    assert(lastSeed.seed.kind === 'sentinel', 'monitoring seed is tagged "sentinel"');
    assert(lastSeed.seed.factorId === '2' && lastSeed.seed.secondFactorId === '3', 'monitoring seed carries the bridge\'s connecting edge endpoints');
    assert(
        Array.isArray(lastSeed.seed.districts) && lastSeed.seed.districts.includes('Hydrology district') && lastSeed.seed.districts.includes('Economics district'),
        'monitoring seed carries both district names'
    );
    assert(
        !(window.SIM4ActionSensemaking.getViewState().action && window.SIM4ActionSensemaking.getViewState().action.type === 'showBridge'),
        'clicking the watch button does not also trigger the bridge\'s own submap click handler'
    );

    // ==================== Loop story -> Intervention ====================
    const loopItem = window.document.querySelector('.s4a-loop-item');
    assert(!!loopItem, 'a loop list item is rendered');
    const testLoopBtn = loopItem.querySelector('.s4a-loop-test');
    assert(!!testLoopBtn, '"Test this loop" button is rendered on the loop item');
    testLoopBtn.click();

    assert(switchLabCalls.at(-1) === 'intervention', 'clicking "Test this loop" switches to the intervention lab');
    lastSeed = labSeedCalls.at(-1);
    assert(lastSeed.lab === 'intervention', 'seed dispatch targets the intervention lab');
    assert(lastSeed.seed.factorId === '2', 'intervention seed uses the loop\'s first factor as the entry point');
    assert(lastSeed.seed.kind === 'scenario', 'intervention seed is tagged "scenario"');
    assert(lastSeed.seed.context && lastSeed.seed.context.loopId === 'L1', 'intervention seed context carries the loop id');
    assert(
        !(window.SIM4ActionSensemaking.getViewState().action && window.SIM4ActionSensemaking.getViewState().action.type === 'showLoop'),
        'clicking "Test this loop" does not also trigger the loop\'s own highlight click handler'
    );

    // ==================== Forward cone -> "Simulate this change" ====================
    window.SIM4ActionSensemaking.showCone({ seedId: '2', seedName: 'River flow', direction: 'backward', depth: 2 });
    let banner = window.document.getElementById('s4a-question-banner');
    assert(!!banner, 'question banner renders for a backward cone');
    assert(!banner.querySelector('.s4a-simulate-change'), '"Simulate this change" is NOT rendered for a backward (what drives this) cone');

    window.SIM4ActionSensemaking.showCone({ seedId: '2', seedName: 'River flow', direction: 'forward', depth: 2 });
    banner = window.document.getElementById('s4a-question-banner');
    const simulateBtn = banner.querySelector('.s4a-simulate-change');
    assert(!!simulateBtn, '"Simulate this change" IS rendered for a forward (what if we changed X) cone');

    simulateBtn.click();
    assert(switchLabCalls.at(-1) === 'intervention', 'clicking "Simulate this change" switches to the intervention lab');
    lastSeed = labSeedCalls.at(-1);
    assert(lastSeed.seed.factorId === '2' && lastSeed.seed.name === 'River flow', 'intervention seed carries the cone\'s seed factor');
    assert(lastSeed.seed.context && lastSeed.seed.context.fromCone === true, 'intervention seed context marks it as coming from a cone');

    // ==================== pendingSeed clears on a plain lab switch ====================
    viewState = window.SIM4ActionSensemaking.getViewState();
    assert(!!viewState.seed, 'a pending seed is present in the view state right after a handoff');
    window.SIM4ActionSensemaking.onLabSwitch('sensemaking');
    viewState = window.SIM4ActionSensemaking.getViewState();
    assert(!viewState.seed, 'a plain (non-handoff) lab switch clears the pending seed from the view state');

    // ==================== View-state restore re-dispatches the seed ====================
    labSeedCalls.length = 0;
    window.SIM4ActionSensemaking.applyViewState({ lab: 'diagnostics', seed: { factorId: '3', name: 'Fish stock', kind: 'centrality' } });
    assert(switchLabCalls.at(-1) === 'diagnostics', 'restoring a view state with a seed switches to the right lab');
    assert(labSeedCalls.length === 1 && labSeedCalls[0].lab === 'diagnostics', 'restoring a view state with a seed re-dispatches it to the lab');

    // ==================== Tour finale cards ====================
    window.SIM4ActionSensemaking.startTour(0);
    const overlay = window.document.getElementById('s4a-tour-overlay');
    assert(!!overlay, 'tour overlay renders');
    const finaleCards = overlay.querySelectorAll('.s4a-tour-finale-card');
    assert(finaleCards.length === 3, 'the (only, hence last) tour step shows all three lab finale cards');

    const diagnosticsCard = Array.from(finaleCards).find((c) => c.dataset.lab === 'diagnostics');
    assert(!!diagnosticsCard, 'a diagnostics finale card is present');
    diagnosticsCard.click();
    assert(switchLabCalls.at(-1) === 'diagnostics', 'clicking a finale card switches to that lab');
    assert(!window.document.getElementById('s4a-tour-overlay'), 'clicking a finale card ends the tour');

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
