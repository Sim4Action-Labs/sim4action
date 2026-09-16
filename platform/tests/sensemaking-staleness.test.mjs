// jsdom-based test harness for the artifact staleness indicator (spec §4
// Phase 4) added to platform/sensemaking-lab.js's Map Card. Loads the real
// production source + a real compiled orientation.json, stubs fetch for
// /api/concierge/staleness, and asserts on the rendered banner.
//
// Run with: node platform/tests/sensemaking-staleness.test.mjs

import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.resolve(__dirname, '..', 'sensemaking-lab.js');
const ORIENTATION_PATH = path.resolve(
    __dirname, '..', '..', 'systems', 'octopus_chile', 'orientation.json'
);

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

function setupDom(orientation, stalenessResponse) {
    const dom = new JSDOM(
        '<!DOCTYPE html><html><body><div id="sensemaking-lab-root"></div><div id="graph"><svg><g></g></svg></div></body></html>',
        { url: 'https://sim4action.io/app.html?system=octopus_chile', runScripts: 'outside-only' }
    );
    const { window } = dom;
    window.createBasicSection = undefined;
    window.d3 = makeChainableD3Stub();

    const fetchCalls = [];
    window.fetch = async (url) => {
        fetchCalls.push(String(url));
        if (String(url).includes('orientation.json')) {
            return { ok: true, json: async () => orientation };
        }
        if (String(url).includes('/api/concierge/staleness')) {
            if (stalenessResponse === null) return { ok: false };
            return { ok: true, json: async () => stalenessResponse };
        }
        throw new Error(`Unexpected fetch: ${url}`);
    };

    const source = fs.readFileSync(SOURCE_PATH, 'utf-8');
    window.eval(source);
    return { window, fetchCalls };
}

async function main() {
    const orientation = JSON.parse(fs.readFileSync(ORIENTATION_PATH, 'utf-8'));

    // ---- stale response renders the banner in the Map Card ----
    {
        const stalenessResponse = {
            system_id: 'octopus_chile',
            stale: true,
            compiled: { factors: 49, edges: 77 },
            live: { factors: 52, edges: 80 },
            generated_at: orientation.meta.generated_at,
        };
        const { window, fetchCalls } = setupDom(orientation, stalenessResponse);
        window.SIM4ActionSensemaking.init({ systemId: 'octopus_chile', systemName: 'Octopus Chile', nodes: [], links: [] });
        for (let i = 0; i < 5; i += 1) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }

        assert(
            fetchCalls.some((u) => u.includes('/api/concierge/staleness?system_id=octopus_chile')),
            'init() calls the staleness endpoint with the current system_id'
        );

        const banner = window.document.querySelector('.s4a-staleness-banner');
        assert(!!banner, 'a staleness banner is rendered in the Map Card when the endpoint reports stale=true');
        assert(banner.textContent.includes('49'), 'banner shows the compiled factor count');
        assert(banner.textContent.includes('52'), 'banner shows the live factor count');
        assert(banner.textContent.includes('77'), 'banner shows the compiled edge count');
        assert(banner.textContent.includes('80'), 'banner shows the live edge count');
    }

    // ---- not-stale response renders no banner ----
    {
        const stalenessResponse = {
            system_id: 'octopus_chile',
            stale: false,
            compiled: { factors: 49, edges: 77 },
            live: { factors: 49, edges: 77 },
            generated_at: orientation.meta.generated_at,
        };
        const { window } = setupDom(orientation, stalenessResponse);
        window.SIM4ActionSensemaking.init({ systemId: 'octopus_chile', systemName: 'Octopus Chile', nodes: [], links: [] });
        for (let i = 0; i < 5; i += 1) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        assert(!window.document.querySelector('.s4a-staleness-banner'), 'no banner is rendered when the endpoint reports stale=false');
    }

    // ---- a failed/unavailable staleness endpoint degrades silently ----
    {
        const { window } = setupDom(orientation, null);
        let initThrew = false;
        try {
            window.SIM4ActionSensemaking.init({ systemId: 'octopus_chile', systemName: 'Octopus Chile', nodes: [], links: [] });
            for (let i = 0; i < 5; i += 1) {
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        } catch (e) {
            initThrew = true;
            console.error(e);
        }
        assert(!initThrew, 'a failed staleness check does not throw or block the rest of init()');
        assert(!window.document.querySelector('.s4a-staleness-banner'), 'no banner is rendered when the staleness endpoint is unavailable');
        assert(!!window.document.getElementById('s4a-mapcard-section'), 'the Map Card itself still renders normally');
    }

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
