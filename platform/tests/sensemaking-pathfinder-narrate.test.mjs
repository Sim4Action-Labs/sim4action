// jsdom-based test harness for the Pathfinder widget and the "Explain this
// cone" narrate button added to platform/sensemaking-lab.js (spec §5.6).
//
// Run with: node platform/tests/sensemaking-pathfinder-narrate.test.mjs

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

// A small 4-node causal chain: Rain -> River flow -> Fish stock -> Fisher income
// (all "same" polarity except one "opposite" hop), enough to exercise
// pathfinding, hop narration, and cone narration all at once.
const NODES = [
    { id: '1', name: 'Rain', domain: 'Climate' },
    { id: '2', name: 'River flow', domain: 'Hydrology' },
    { id: '3', name: 'Fish stock', domain: 'Biology' },
    { id: '4', name: 'Fisher income', domain: 'Economics' },
    { id: '5', name: 'Unrelated factor', domain: 'Other' },
];
const LINKS = [
    { source: '1', target: '2', type: 'same', strength: 'strong', delay: 'days', definition: 'More rain raises river flow quickly.' },
    { source: '2', target: '3', type: 'same', strength: 'medium', delay: 'months', definition: '' },
    { source: '3', target: '4', type: 'opposite', strength: 'strong', delay: 'months', definition: 'Scarcer fish reduce fisher income.' },
];

async function main() {
    const source = fs.readFileSync(SOURCE_PATH, 'utf-8');

    const dom = new JSDOM(
        '<!DOCTYPE html><html><body><div id="sensemaking-lab-root"></div><div id="graph"><svg><g></g></svg></div></body></html>',
        { url: 'https://sim4action.io/app.html?system=octopus_chile', runScripts: 'outside-only' }
    );
    const { window } = dom;
    window.createBasicSection = undefined;
    window.d3 = makeChainableD3Stub();

    const fetchCalls = [];
    let nextNarrateResponse = { ok: true, json: async () => ({ narrative: 'ok.', citations: [], unverified: [] }) };

    window.fetch = async (url, options) => {
        fetchCalls.push({ url: String(url), options });
        if (String(url).includes('orientation.json')) return { ok: false };
        if (String(url).includes('/api/concierge/narrate')) return nextNarrateResponse;
        throw new Error(`Unexpected fetch: ${url}`);
    };

    window.eval(source);
    window.SIM4ActionSensemaking.init({
        systemId: 'octopus_chile', systemName: 'Test System', nodes: NODES, links: LINKS,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // ==================== Pathfinder ====================
    const pathfinderSection = window.document.getElementById('s4a-pathfinder-section');
    assert(!!pathfinderSection, 'Pathfinder section is rendered');

    const fromInput = window.document.getElementById('s4a-pathfinder-from');
    const toInput = window.document.getElementById('s4a-pathfinder-to');
    const findBtn = window.document.getElementById('s4a-pathfinder-find');
    assert(!!fromInput && !!toInput && !!findBtn, 'Pathfinder from/to inputs and find button are rendered');

    const datalistOptions = window.document.querySelectorAll('#s4a-pathfinder-factors option');
    assert(datalistOptions.length === NODES.length, 'Pathfinder datalist has one option per factor');

    // No path exists in the wrong direction (income doesn't cause rain).
    fromInput.value = 'Fisher income';
    toInput.value = 'Rain';
    findBtn.click();
    let resultEl = window.document.getElementById('s4a-pathfinder-result');
    assert(resultEl.textContent.includes('No causal path found'), 'reports no path when none exists in that direction');

    // A real 3-hop directed path: Rain -> River flow -> Fish stock -> Fisher income.
    fromInput.value = 'Rain';
    toInput.value = 'Fisher income';
    findBtn.click();
    resultEl = window.document.getElementById('s4a-pathfinder-result');
    const hops = resultEl.querySelectorAll('.s4a-pathfinder-hop');
    assert(hops.length === 3, 'renders one hop per edge on the path (3 hops for a 3-edge chain)');
    assert(hops[0].textContent.includes('Rain') && hops[0].textContent.includes('River flow'), 'first hop names Rain and River flow');
    assert(hops[0].textContent.includes('more River flow'), 'same-polarity hop reads "more"');
    assert(hops[2].textContent.includes('less Fisher income'), 'opposite-polarity hop reads "less"');
    assert(hops[0].textContent.includes('strong, days'), 'hop shows strength and delay');
    assert(resultEl.textContent.includes('More rain raises river flow quickly'), 'hop shows the edge definition when present');

    const showOnMapBtn = window.document.getElementById('s4a-pathfinder-show');
    assert(!!showOnMapBtn, '"Show on map" button appears once a path is found');
    let showOnMapThrew = false;
    try {
        showOnMapBtn.click();
    } catch (e) {
        showOnMapThrew = true;
        console.error(e);
    }
    assert(!showOnMapThrew, 'clicking "Show on map" does not throw even with d3 fully stubbed');

    // Picking an unknown factor name is a friendly no-op, not a crash.
    fromInput.value = 'Nonexistent Factor Name';
    toInput.value = 'Rain';
    findBtn.click();
    resultEl = window.document.getElementById('s4a-pathfinder-result');
    assert(resultEl.textContent.includes('Pick two factors from the list'), 'unresolvable factor name shows a friendly message');

    // ==================== "Explain this cone" ====================
    // Seed a Compass cone the same way clicking a door + list item would.
    window.SIM4ActionSensemaking.showCone({ seedId: '2', seedName: 'River flow', direction: 'forward', depth: 2 });
    await new Promise((resolve) => setTimeout(resolve, 0));

    const banner = window.document.getElementById('s4a-question-banner');
    assert(!!banner, 'question banner is rendered once a cone is active');
    const explainBtn = banner.querySelector('.s4a-explain-cone');
    assert(!!explainBtn, '"Explain this" button is rendered on the question banner');

    nextNarrateResponse = {
        ok: true,
        json: async () => ({ narrative: 'River flow (2) drives fish stock (3), which in turn affects fisher income (4).', citations: [], unverified: [] }),
    };
    explainBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const narrateCall = fetchCalls.find((c) => c.url.includes('/api/concierge/narrate'));
    assert(!!narrateCall, 'clicking "Explain this" calls the narrate endpoint');
    const narrateBody = JSON.parse(narrateCall.options.body);
    assert(narrateBody.seed_name === 'River flow', 'narrate request carries the cone\'s seed name');
    assert(narrateBody.direction === 'forward', 'narrate request carries the cone\'s direction');
    assert(narrateBody.edges.length >= 1, 'narrate request carries at least one edge from the cone');
    assert(narrateBody.edges[0].source_name && narrateBody.edges[0].target_name, 'narrate request edges carry resolved factor names');

    const narratePanel = window.document.getElementById('s4a-narrate-panel');
    assert(!!narratePanel, 'a narrate panel is rendered after a successful call');
    assert(narratePanel.textContent.includes('fish stock (3)'), 'narrate panel shows the returned narrative text');

    const narrateClose = narratePanel.querySelector('.s4a-narrate-close');
    assert(!!narrateClose, 'narrate panel has a close button');
    narrateClose.click();
    assert(!window.document.getElementById('s4a-narrate-panel'), 'closing the narrate panel removes it from the DOM');

    // A failed narrate call shows a friendly retry message.
    nextNarrateResponse = { ok: false };
    explainBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    const failedPanel = window.document.getElementById('s4a-narrate-panel');
    assert(!!failedPanel && failedPanel.textContent.toLowerCase().includes('try again'), 'a failed narrate call renders a friendly retry message');

    // Clearing the question also removes the narrate panel.
    window.SIM4ActionSensemaking.clearQuestion();
    assert(!window.document.getElementById('s4a-question-banner'), 'clearing the question removes the banner');
    assert(!window.document.getElementById('s4a-narrate-panel'), 'clearing the question also removes any open narrate panel');

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
