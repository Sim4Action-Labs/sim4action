// jsdom-based test harness for platform/concierge.js.
//
// Loads the actual production source into a simulated DOM with minimal
// stubs (fetch, window.SIM4ActionSensemaking) and asserts on rendered DOM
// content + interaction behavior against the real compiled artifact --
// same approach used for sensemaking-lab.js's own test harness.
//
// Run with: node platform/tests/concierge.test.mjs

import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.resolve(__dirname, '..', 'concierge.js');
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

function assertEqual(actual, expected, message) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    assert(ok, `${message} -- expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function encode(str) {
    return new TextEncoder().encode(str);
}

// Builds a fake streaming Response whose body is chunked SSE text --
// concierge.js only ever touches res.ok/res.body.getReader(), so a plain
// object stand-in is enough (no real Fetch API / undici needed).
function fakeSSEResponse(events) {
    const body = events.map(({ event, data }) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join('');
    const chunks = [encode(body)];
    let i = 0;
    return {
        ok: true,
        body: {
            getReader() {
                return {
                    async read() {
                        if (i < chunks.length) {
                            const value = chunks[i];
                            i += 1;
                            return { done: false, value };
                        }
                        return { done: true, value: undefined };
                    },
                };
            },
        },
    };
}

async function main() {
    const orientation = JSON.parse(fs.readFileSync(ORIENTATION_PATH, 'utf-8'));
    const source = fs.readFileSync(SOURCE_PATH, 'utf-8');

    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'https://sim4action.io/app.html?system=octopus_chile',
        runScripts: 'outside-only',
    });
    const { window } = dom;

    const fetchCalls = [];
    let nextMessageResponse = null;

    window.fetch = async (url, options) => {
        fetchCalls.push({ url, options });
        if (String(url).includes('orientation.json')) {
            return { ok: true, json: async () => orientation };
        }
        if (String(url).includes('/api/concierge/session')) {
            return { ok: true, json: async () => ({ session_id: 'sess-123' }) };
        }
        if (String(url).includes('/api/concierge/message')) {
            return nextMessageResponse;
        }
        throw new Error(`Unexpected fetch: ${url}`);
    };

    const sensemakingCalls = { applyViewState: [], highlightLandmark: [] };
    window.SIM4ActionSensemaking = {
        applyViewState: (viewState) => sensemakingCalls.applyViewState.push(viewState),
        highlightLandmark: (id) => sensemakingCalls.highlightLandmark.push(id),
    };

    window.eval(source);

    // ---- init() renders the dock + toggle button ----
    window.SIM4ActionConcierge.init({ systemId: 'octopus_chile' });
    await new Promise((resolve) => setTimeout(resolve, 0)); // let the orientation fetch's .then() run

    assert(!!window.document.getElementById('s4a-concierge-toggle'), 'toggle button is rendered after init');
    assert(!!window.document.getElementById('s4a-concierge-drawer'), 'drawer is rendered after init');
    assertEqual(
        window.document.getElementById('s4a-concierge-drawer').style.display,
        'none',
        'drawer starts closed'
    );

    // ---- toggling opens the drawer + shows suggested prompts ----
    window.document.getElementById('s4a-concierge-toggle').click();
    assertEqual(window.document.getElementById('s4a-concierge-drawer').style.display, 'flex', 'drawer opens on toggle click');

    const promptButtons = window.document.querySelectorAll('#s4a-concierge-prompts [data-prompt]');
    assert(promptButtons.length > 0, 'suggested prompts are rendered from orientation data');
    const firstLandmarkName = orientation.landmarks[0].name;
    assert(
        promptButtons[0].textContent.includes(firstLandmarkName),
        'first suggested prompt references the first landmark name'
    );

    assert(!!window.document.querySelector('.s4a-concierge-empty'), 'empty-state message shown before first message');

    // ---- sending a message drives the full SSE event lifecycle ----
    nextMessageResponse = fakeSSEResponse([
        { event: 'tool_call', data: { name: 'get_factor_neighbors', summary: 'Checked factor neighbors (6)' } },
        {
            event: 'ui_action',
            data: { view_state: { highlight: '6' }, caption: 'Highlighting Fisher effort (6).' },
        },
        { event: 'citation', data: { kind: 'factor', id: '6', name: 'Fisher effort' } },
        { event: 'token', data: { text: 'Fisher effort (6) is a key driver.', unverified: [] } },
        { event: 'done', data: {} },
    ]);

    const input = window.document.getElementById('s4a-concierge-input');
    input.value = 'What drives fisher effort?';
    window.document.getElementById('s4a-concierge-send').click();

    // Drain microtasks/timers so the async sendMessage() body completes.
    for (let i = 0; i < 10; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const sessionCall = fetchCalls.find((c) => String(c.url).includes('/api/concierge/session'));
    assert(!!sessionCall, 'a session is created before the first message send');
    assertEqual(JSON.parse(sessionCall.options.body).system_id, 'octopus_chile', 'session request carries the system id');

    const messageCall = fetchCalls.find((c) => String(c.url).includes('/api/concierge/message'));
    assert(!!messageCall, 'the message endpoint is called');
    assertEqual(JSON.parse(messageCall.options.body).session_id, 'sess-123', 'message request carries the session id');
    assertEqual(JSON.parse(messageCall.options.body).text, 'What drives fisher effort?', 'message request carries the user text');
    assertEqual(JSON.parse(messageCall.options.body).profile, 'orient', 'message request defaults to the orient tool profile');

    assertEqual(input.value, '', 'input is cleared after sending');

    const userMsgEl = window.document.querySelector('.s4a-concierge-msg-user');
    assert(!!userMsgEl && userMsgEl.textContent.includes('What drives fisher effort?'), 'user message is rendered');

    assertEqual(sensemakingCalls.applyViewState, [{ highlight: '6' }], 'ui_action event calls applyViewState with the given view_state');

    const assistantTextEl = window.document.querySelector('.s4a-concierge-text');
    assert(!!assistantTextEl && assistantTextEl.textContent.includes('Fisher effort (6)'), 'assistant final text is rendered');

    const activityEls = window.document.querySelectorAll('.s4a-concierge-activity');
    assert(activityEls.length >= 2, 'tool_call and ui_action activity lines are both rendered');

    const chipEls = window.document.querySelectorAll('.s4a-concierge-chip');
    assert(chipEls.length === 1 && chipEls[0].textContent.includes('Fisher effort'), 'citation chip is rendered with factor name');

    chipEls[0].click();
    assertEqual(sensemakingCalls.highlightLandmark, ['6'], 'clicking a citation chip calls highlightLandmark with the factor id');

    assert(!window.document.querySelector('.s4a-concierge-warning'), 'no warning rendered when unverified list is empty');

    // ---- a second turn with an unverified claim renders the warning ----
    nextMessageResponse = fakeSSEResponse([
        {
            event: 'token',
            data: {
                text: 'Some factor (999) matters too.\n\n\u26a0 Not verified against this turn\'s map data: 999',
                unverified: ['999'],
            },
        },
        { event: 'done', data: {} },
    ]);
    input.value = 'tell me more';
    window.document.getElementById('s4a-concierge-send').click();
    for (let i = 0; i < 10; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const warningEl = window.document.querySelector('.s4a-concierge-warning');
    assert(!!warningEl && warningEl.textContent.includes('999'), 'unverified claim renders a distinct warning element');

    // ---- suggested prompts disappear once a conversation has started ----
    assertEqual(
        window.document.querySelectorAll('#s4a-concierge-prompts [data-prompt]').length,
        0,
        'suggested prompts are cleared once messages exist'
    );

    // ---- switching the tool profile persists it and sends it on the next message (spec §6.3) ----
    const profileSelect = window.document.getElementById('s4a-concierge-profile');
    assert(!!profileSelect, 'profile selector is rendered in the drawer header');
    assertEqual(profileSelect.value, 'orient', 'profile selector defaults to orient');

    profileSelect.value = 'analyst';
    profileSelect.dispatchEvent(new window.Event('change'));
    assertEqual(window.localStorage.getItem('s4a_concierge_profile'), 'analyst', 'profile choice is persisted to localStorage');

    nextMessageResponse = fakeSSEResponse([
        { event: 'token', data: { text: 'Analyst-level answer.', unverified: [] } },
        { event: 'done', data: {} },
    ]);
    input.value = 'do a deep vulnerability analysis';
    window.document.getElementById('s4a-concierge-send').click();
    for (let i = 0; i < 10; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const analystMessageCall = fetchCalls
        .filter((c) => String(c.url).includes('/api/concierge/message'))
        .pop();
    assertEqual(JSON.parse(analystMessageCall.options.body).profile, 'analyst', 'message request carries the switched analyst profile');

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
