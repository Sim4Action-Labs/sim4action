/**
 * Sim4Action Concierge -- chat drawer for the Sensemaking Lab (spec §6).
 *
 * Self-contained module (same pattern as sensemaking-lab.js): a floating
 * docked drawer, available from any lab, that talks to the Concierge
 * service (`/api/concierge/*`) over SSE. Renders streamed tool-activity
 * indicators, the final grounded answer, citation chips that focus factors
 * on the map, and suggested prompts seeded from the compiled orientation
 * artifact.
 *
 * Deliberately loosely coupled to sensemaking-lab.js: the only touchpoint
 * is calling `window.SIM4ActionSensemaking.applyViewState`/`highlightLandmark`
 * when a `ui_action`/citation is clicked -- exactly the same entrypoints a
 * human click already uses, per the "LLM has no privileged UI powers"
 * invariant (spec §6.4).
 */
(function () {
    'use strict';

    const state = {
        systemId: null,
        sessionId: null,
        orientation: null,
        open: false,
        sending: false,
        messages: [], // {role: 'user'|'assistant', text, citations, activity, unverified, error, pending}
        // Tool profile (spec §6.3): 'orient' (default) or 'analyst' (adds
        // vulnerability/motifs/atlas-comparison tools) -- power-user opt-in,
        // persisted per-browser so it doesn't reset every visit.
        profile: 'orient',
    };

    const PROFILE_STORAGE_KEY = 's4a_concierge_profile';

    function loadStoredProfile() {
        try {
            const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
            return stored === 'analyst' ? 'analyst' : 'orient';
        } catch (e) {
            return 'orient';
        }
    }

    function storeProfile(profile) {
        try { window.localStorage.setItem(PROFILE_STORAGE_KEY, profile); } catch (e) { /* best-effort */ }
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ============================================
    // Init
    // ============================================
    function init(options) {
        options = options || {};
        state.systemId = options.systemId || new URLSearchParams(window.location.search).get('system');
        state.profile = loadStoredProfile();
        ensureStyles();
        renderDock();
        if (state.systemId) {
            fetchOrientation(state.systemId).then((data) => {
                state.orientation = data;
                if (state.open && !state.messages.length) renderMessages();
            });
        }
    }

    function fetchOrientation(systemId) {
        return fetch(`systems/${encodeURIComponent(systemId)}/orientation.json`, { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null);
    }

    function buildSuggestedPrompts() {
        const data = state.orientation;
        const prompts = [];
        if (data) {
            const landmarks = data.landmarks || [];
            if (landmarks[0]) prompts.push(`What drives ${landmarks[0].name}?`);
            if (landmarks[1]) prompts.push(`What does ${landmarks[1].name} affect?`);
            const loops = (data.stories && data.stories.loops) || [];
            if (loops[0]) prompts.push(`Tell me the story of "${loops[0].name}."`);
            const clusters = data.clusters || [];
            if (clusters[0]) prompts.push(`Show me the ${clusters[0].name} district.`);
        }
        if (!prompts.length) {
            prompts.push('What is this map about?', 'What should I look at first?');
        }
        return prompts.slice(0, 4);
    }

    // ============================================
    // Session + SSE transport
    // ============================================
    async function ensureSession() {
        if (state.sessionId) return state.sessionId;
        const res = await fetch('/api/concierge/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ system_id: state.systemId }),
        });
        if (!res.ok) throw new Error('Could not start a Concierge session.');
        const data = await res.json();
        state.sessionId = data.session_id;
        return state.sessionId;
    }

    function parseSSEEvent(rawEvent) {
        let eventName = 'message';
        const dataLines = [];
        for (const line of rawEvent.split('\n')) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
        }
        let data = {};
        try {
            data = JSON.parse(dataLines.join('\n'));
        } catch (e) {
            /* malformed/partial chunk -- ignore */
        }
        return { eventName, data };
    }

    function applySSEEvent(eventName, data, msg) {
        switch (eventName) {
            case 'tool_call':
                msg.activity.push({ kind: 'call', text: data.summary || data.name || 'Working…' });
                break;
            case 'ui_action':
                if (window.SIM4ActionSensemaking && data.view_state) {
                    try {
                        window.SIM4ActionSensemaking.applyViewState(data.view_state);
                    } catch (e) { /* best-effort -- never let a UI action break the chat */ }
                }
                msg.activity.push({ kind: 'view', text: data.caption || 'Updated the view' });
                break;
            case 'citation':
                msg.citations.push(data);
                break;
            case 'token':
                msg.text = data.text || '';
                msg.unverified = data.unverified || [];
                break;
            case 'error':
                msg.error = data.message || 'Something went wrong.';
                break;
            case 'tool_result':
            case 'done':
            default:
                break;
        }
    }

    async function sendMessage(text) {
        text = (text || '').trim();
        if (state.sending || !text) return;
        state.sending = true;

        state.messages.push({ role: 'user', text });
        const assistantMsg = { role: 'assistant', text: '', citations: [], activity: [], unverified: [], pending: true };
        state.messages.push(assistantMsg);
        renderMessages();

        try {
            const sessionId = await ensureSession();
            const res = await fetch('/api/concierge/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, text, profile: state.profile }),
            });
            if (!res.ok || !res.body) throw new Error('The Concierge is unavailable right now.');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                let sep;
                while ((sep = buffer.indexOf('\n\n')) !== -1) {
                    const rawEvent = buffer.slice(0, sep);
                    buffer = buffer.slice(sep + 2);
                    if (!rawEvent.trim()) continue;
                    const { eventName, data } = parseSSEEvent(rawEvent);
                    applySSEEvent(eventName, data, assistantMsg);
                    renderMessages();
                }
            }
        } catch (e) {
            assistantMsg.error = (e && e.message) || 'Something went wrong.';
        } finally {
            assistantMsg.pending = false;
            state.sending = false;
            renderMessages();
        }
    }

    // ============================================
    // Rendering
    // ============================================
    function renderDock() {
        if (document.getElementById('s4a-concierge-dock')) return;
        const dock = document.createElement('div');
        dock.id = 's4a-concierge-dock';
        dock.innerHTML = `
            <button id="s4a-concierge-toggle" class="s4a-concierge-toggle" title="Ask the Concierge">
                &#x1F4AC;
            </button>
            <div id="s4a-concierge-drawer" class="s4a-concierge-drawer" style="display: none;">
                <div class="s4a-concierge-header">
                    <span>Concierge</span>
                    <span class="s4a-concierge-header-right">
                        <select id="s4a-concierge-profile" class="s4a-concierge-profile-select" title="Tool profile">
                            <option value="orient">Orient</option>
                            <option value="analyst">Analyst</option>
                        </select>
                        <button id="s4a-concierge-close" class="s4a-concierge-close" title="Close">&times;</button>
                    </span>
                </div>
                <div id="s4a-concierge-messages" class="s4a-concierge-messages"></div>
                <div id="s4a-concierge-prompts" class="s4a-concierge-prompts"></div>
                <div class="s4a-concierge-input-row">
                    <textarea id="s4a-concierge-input" class="s4a-concierge-input" rows="1"
                        placeholder="Ask about this map…"></textarea>
                    <button id="s4a-concierge-send" class="s4a-concierge-send" title="Send">&#x27A4;</button>
                </div>
            </div>
        `;
        document.body.appendChild(dock);

        dock.querySelector('#s4a-concierge-toggle').addEventListener('click', toggleDrawer);
        dock.querySelector('#s4a-concierge-close').addEventListener('click', toggleDrawer);

        const profileSelect = dock.querySelector('#s4a-concierge-profile');
        profileSelect.value = state.profile;
        profileSelect.addEventListener('change', () => {
            state.profile = profileSelect.value === 'analyst' ? 'analyst' : 'orient';
            storeProfile(state.profile);
        });

        const input = dock.querySelector('#s4a-concierge-input');
        const send = () => {
            const text = input.value;
            input.value = '';
            sendMessage(text);
        };
        dock.querySelector('#s4a-concierge-send').addEventListener('click', send);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
            }
        });

        renderMessages();
    }

    function toggleDrawer() {
        state.open = !state.open;
        const drawer = document.getElementById('s4a-concierge-drawer');
        if (drawer) drawer.style.display = state.open ? 'flex' : 'none';
        if (state.open) {
            renderMessages();
            const input = document.getElementById('s4a-concierge-input');
            if (input) input.focus();
        }
    }

    function activityIcon(kind) {
        return kind === 'view' ? '\u{1F441}\uFE0F' : '\u{1F50D}';
    }

    function renderMessageHtml(msg) {
        if (msg.role === 'user') {
            return `<div class="s4a-concierge-msg s4a-concierge-msg-user">${escapeHtml(msg.text)}</div>`;
        }

        const activityHtml = (msg.activity || [])
            .map((a) => `<div class="s4a-concierge-activity">${activityIcon(a.kind)} ${escapeHtml(a.text)}</div>`)
            .join('');

        let bodyHtml = '';
        if (msg.error) {
            bodyHtml = `<div class="s4a-concierge-error">${escapeHtml(msg.error)}</div>`;
        } else if (msg.text) {
            const [main, warning] = msg.text.split('\n\n\u26a0 ');
            bodyHtml = `<div class="s4a-concierge-text">${escapeHtml(main)}</div>`;
            if (warning) {
                bodyHtml += `<div class="s4a-concierge-warning">\u26a0 ${escapeHtml(warning)}</div>`;
            }
        } else if (msg.pending) {
            bodyHtml = `<div class="s4a-concierge-thinking">Thinking&hellip;</div>`;
        }

        const citationsHtml = (msg.citations || []).length
            ? `<div class="s4a-concierge-citations">${msg.citations
                  .map(
                      (c, i) =>
                          `<button class="s4a-concierge-chip" data-msg-citation="${i}">${escapeHtml(c.name || c.id)}</button>`
                  )
                  .join('')}</div>`
            : '';

        return `
            <div class="s4a-concierge-msg s4a-concierge-msg-assistant">
                ${activityHtml}
                ${bodyHtml}
                ${citationsHtml}
            </div>
        `;
    }

    function renderMessages() {
        const container = document.getElementById('s4a-concierge-messages');
        if (!container) return;
        if (!state.messages.length) {
            container.innerHTML = `<div class="s4a-concierge-empty">Ask me anything about this map -- what drives a factor, the story of a loop, or which district to look at.</div>`;
        } else {
            container.innerHTML = state.messages.map(renderMessageHtml).join('');
        }
        wireCitationChips(container);
        container.scrollTop = container.scrollHeight;
        renderPrompts();
    }

    // Citation chips are rendered in per-message, per-citation order, so we
    // can wire them up by walking messages/citations in that same order
    // rather than parsing anything back out of the DOM.
    function wireCitationChips(container) {
        const assistantMsgs = state.messages.filter((m) => m.role === 'assistant');
        const chipButtons = container.querySelectorAll('[data-msg-citation]');
        let chipCursor = 0;
        assistantMsgs.forEach((msg) => {
            (msg.citations || []).forEach((citation) => {
                const btn = chipButtons[chipCursor];
                chipCursor += 1;
                if (!btn) return;
                btn.addEventListener('click', () => {
                    if (window.SIM4ActionSensemaking && citation.id != null) {
                        try {
                            window.SIM4ActionSensemaking.highlightLandmark(citation.id);
                        } catch (e) { /* best-effort */ }
                    }
                });
            });
        });
    }

    function renderPrompts() {
        const container = document.getElementById('s4a-concierge-prompts');
        if (!container) return;
        if (state.messages.length || state.sending) {
            container.innerHTML = '';
            return;
        }
        const prompts = buildSuggestedPrompts();
        container.innerHTML = prompts
            .map((p, i) => `<button class="s4a-concierge-prompt-chip" data-prompt="${i}">${escapeHtml(p)}</button>`)
            .join('');
        container.querySelectorAll('[data-prompt]').forEach((btn, i) => {
            btn.addEventListener('click', () => sendMessage(prompts[i]));
        });
    }

    function ensureStyles() {
        if (document.getElementById('s4a-concierge-styles')) return;
        const style = document.createElement('style');
        style.id = 's4a-concierge-styles';
        style.textContent = `
            #s4a-concierge-dock { font-family: Arial, sans-serif; }
            .s4a-concierge-toggle {
                position: fixed; bottom: 20px; right: 20px; z-index: 2200;
                width: 52px; height: 52px; border-radius: 50%; border: none;
                background: #1e88e5; color: #fff; font-size: 22px; cursor: pointer;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
            }
            .s4a-concierge-toggle:hover { background: #1565c0; }
            .s4a-concierge-drawer {
                position: fixed; bottom: 84px; right: 20px; z-index: 2200;
                width: 340px; max-width: 90vw; height: 480px; max-height: 70vh;
                background: rgba(13, 27, 42, 0.97); border: 1px solid rgba(100, 181, 246, 0.3);
                border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
                display: flex; flex-direction: column; overflow: hidden;
            }
            .s4a-concierge-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 14px; background: rgba(26, 42, 74, 0.7);
                color: #e0e6ed; font-weight: bold; font-size: 13.5px;
                border-bottom: 1px solid rgba(100, 181, 246, 0.15);
            }
            .s4a-concierge-close { background: none; border: none; color: #8ab4d8; font-size: 20px; cursor: pointer; line-height: 1; }
            .s4a-concierge-header-right { display: flex; align-items: center; gap: 8px; }
            .s4a-concierge-profile-select {
                background: rgba(26, 42, 74, 0.6); border: 1px solid rgba(100, 181, 246, 0.25);
                color: #b0c4de; font-size: 11px; border-radius: 6px; padding: 2px 4px; font-family: Arial, sans-serif;
            }
            .s4a-concierge-profile-select:focus { outline: none; border-color: #64b5f6; }
            .s4a-concierge-messages { flex: 1; overflow-y: auto; padding: 10px 12px; }
            .s4a-concierge-empty { color: #7a8fa5; font-size: 12.5px; font-style: italic; line-height: 1.5; }
            .s4a-concierge-msg { margin-bottom: 12px; font-size: 12.5px; line-height: 1.5; }
            .s4a-concierge-msg-user {
                background: rgba(30, 136, 229, 0.2); color: #e0e6ed; border-radius: 10px 10px 2px 10px;
                padding: 7px 10px; margin-left: 24px; text-align: right;
            }
            .s4a-concierge-msg-assistant { color: #e0e6ed; }
            .s4a-concierge-text { white-space: pre-wrap; }
            .s4a-concierge-thinking { color: #8ab4d8; font-style: italic; }
            .s4a-concierge-error { color: #e57373; }
            .s4a-concierge-warning { color: #ffb74d; font-size: 11.5px; margin-top: 4px; }
            .s4a-concierge-activity { color: #7a8fa5; font-size: 11px; font-style: italic; margin-bottom: 3px; }
            .s4a-concierge-citations { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
            .s4a-concierge-chip {
                background: rgba(100, 181, 246, 0.15); border: 1px solid rgba(100, 181, 246, 0.3);
                color: #90caf9; border-radius: 10px; padding: 2px 9px; font-size: 11px; cursor: pointer;
            }
            .s4a-concierge-chip:hover { background: rgba(100, 181, 246, 0.28); }
            .s4a-concierge-prompts { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 12px 8px; }
            .s4a-concierge-prompt-chip {
                background: rgba(26, 42, 74, 0.6); border: 1px solid rgba(100, 181, 246, 0.2);
                color: #b0c4de; border-radius: 12px; padding: 4px 10px; font-size: 11.5px; cursor: pointer;
                text-align: left;
            }
            .s4a-concierge-prompt-chip:hover { border-color: #64b5f6; color: #e0e6ed; }
            .s4a-concierge-input-row {
                display: flex; gap: 6px; padding: 10px 12px; border-top: 1px solid rgba(100, 181, 246, 0.15);
            }
            .s4a-concierge-input {
                flex: 1; resize: none; background: rgba(26, 42, 74, 0.5); border: 1px solid rgba(100, 181, 246, 0.2);
                border-radius: 8px; color: #e0e6ed; font-size: 12.5px; padding: 7px 9px; font-family: Arial, sans-serif;
            }
            .s4a-concierge-input:focus { outline: none; border-color: #64b5f6; }
            .s4a-concierge-send {
                background: #1e88e5; color: #fff; border: none; border-radius: 8px; width: 36px; cursor: pointer; font-size: 16px;
            }
            .s4a-concierge-send:hover { background: #1565c0; }
            @media (max-width: 480px) {
                .s4a-concierge-drawer { right: 10px; bottom: 78px; width: calc(100vw - 20px); }
                .s4a-concierge-toggle { right: 12px; bottom: 12px; }
            }
        `;
        document.head.appendChild(style);
    }

    window.SIM4ActionConcierge = {
        init,
        open: () => {
            if (!state.open) toggleDrawer();
        },
        sendMessage,
    };
})();
