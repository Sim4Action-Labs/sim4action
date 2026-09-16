// jsdom-based test harness for the "Start from your angle" relevance widget
// added to platform/sensemaking-lab.js (spec §5.8). Loads the actual
// production source into a simulated DOM with minimal stubs (fetch, a
// chainable no-op d3 stand-in, and app.html's createBasicSection helper).
//
// Run with: node platform/tests/sensemaking-relevance.test.mjs

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

// A single Proxy that answers any property access with a function
// returning itself, so arbitrary d3 method chains (selectAll(...).classed
// (...).style(...)) resolve without needing a real DOM/SVG selection.
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

async function main() {
    const source = fs.readFileSync(SOURCE_PATH, 'utf-8');

    const dom = new JSDOM(
        '<!DOCTYPE html><html><body><div id="sensemaking-lab-root"></div><div id="graph"><svg><g></g></svg></div></body></html>',
        { url: 'https://sim4action.io/app.html?system=octopus_chile', runScripts: 'outside-only' }
    );
    const { window } = dom;

    // app.html normally provides this; sensemaking-lab.js falls back to a
    // plain equivalent when it's missing, which is enough for this test.
    window.createBasicSection = undefined;

    const d3Stub = makeChainableD3Stub();
    window.d3 = d3Stub;

    const fetchCalls = [];
    let nextRelevanceResponse = { ok: true, json: async () => ({ entries: [] }) };

    window.fetch = async (url, options) => {
        fetchCalls.push({ url: String(url), options });
        if (String(url).includes('orientation.json')) {
            return { ok: false }; // exercise the "no artifact" path, same as an uncompiled system
        }
        if (String(url).includes('/api/concierge/relevance')) {
            return nextRelevanceResponse;
        }
        throw new Error(`Unexpected fetch: ${url}`);
    };

    window.eval(source);

    window.SIM4ActionSensemaking.init({
        systemId: 'octopus_chile',
        systemName: 'Octopus Chile',
        nodes: [{ id: '4', name: 'Octopus abundance', domain: 'Biology' }],
        links: [],
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // ---- widget renders ----
    const section = window.document.getElementById('s4a-relevance-section');
    assert(!!section, '"Start from your angle" section is rendered');
    const textarea = window.document.getElementById('s4a-relevance-input');
    const submitBtn = window.document.getElementById('s4a-relevance-submit');
    assert(!!textarea, 'relevance textarea is rendered');
    assert(!!submitBtn, 'relevance submit button is rendered');

    // ---- empty statement is a no-op (no fetch) ----
    submitBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert(!fetchCalls.some((c) => c.url.includes('/api/concierge/relevance')), 'submitting an empty statement does not call the relevance endpoint');

    // ---- submitting a statement posts system_id + statement ----
    nextRelevanceResponse = {
        ok: true,
        json: async () => ({
            system_id: 'octopus_chile',
            entries: [
                { factor_id: '4', name: 'Octopus abundance', district: { id: 0, name: 'Biological Foundations' }, why: 'It anchors the biology domain.' },
            ],
        }),
    };
    textarea.value = 'I care about the octopus population';
    submitBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const relevanceCall = fetchCalls.find((c) => c.url.includes('/api/concierge/relevance'));
    assert(!!relevanceCall, 'submitting a statement calls the relevance endpoint');
    const body = JSON.parse(relevanceCall.options.body);
    assert(body.system_id === 'octopus_chile', 'request body carries the current system_id');
    assert(body.statement === 'I care about the octopus population', 'request body carries the typed statement');

    // ---- results render as buttons with name/district/why ----
    const resultButtons = window.document.querySelectorAll('#s4a-relevance-results .s4a-relevance-result');
    assert(resultButtons.length === 1, 'one result button is rendered for one returned entry');
    assert(resultButtons[0].textContent.includes('Octopus abundance'), 'result button shows the factor name');
    assert(resultButtons[0].textContent.includes('Biological Foundations'), 'result button shows the district name');
    assert(resultButtons[0].textContent.includes('It anchors the biology domain.'), 'result button shows the why sentence');

    // ---- clicking a result seeds Compass (showCone) without throwing,
    // even with d3 fully stubbed out ----
    let clickThrew = false;
    try {
        resultButtons[0].click();
    } catch (e) {
        clickThrew = true;
        console.error(e);
    }
    assert(!clickThrew, 'clicking a result button does not throw');
    const viewState = window.SIM4ActionSensemaking.getViewState();
    assert(!!viewState.q && viewState.q.seedId === '4', 'clicking a result seeds Compass on that entry\'s factor id');
    assert(viewState.q.mode === 'forward', 'the seeded question defaults to a forward ("what if we changed X") cone');

    // ---- a failed/erroring request shows a friendly message, not a crash ----
    nextRelevanceResponse = { ok: false };
    textarea.value = 'anything';
    submitBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    const resultsEl = window.document.getElementById('s4a-relevance-results');
    assert(resultsEl.textContent.toLowerCase().includes('try again'), 'a failed relevance request renders a friendly retry message');

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
