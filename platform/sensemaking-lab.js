/**
 * SIM4Action — Sensemaking (Orient) Lab
 *
 * Opens as the default lab on launch instead of dropping stakeholders
 * straight into the full causal network (the "horrendogram"). Hosts two
 * tools, both driven by the compiled `systems/{id}/orientation.json` artifact
 * where available, and degrading gracefully when it isn't:
 *
 *   - Atlas v1   — static district hulls + names, rendered directly from the
 *                  compiled artifact (no live re-clustering in the browser).
 *   - Compass    — the causal-cone "doors" (ported from the retired
 *                  entry-modal.js), now living in a permanent sidebar section
 *                  instead of a one-shot modal.
 *
 * Every user-facing action (showCone, focusCluster, switchLab via
 * onLabSwitch, applyViewState) is a named function with a plain data
 * contract, callable identically by a GUI click today and — eventually — by
 * an LLM/MCP bridge (see the "Sensemaking Lab Spine" plan, §3/§7). This
 * module does not build that bridge; it just avoids foreclosing it.
 *
 * Self-contained like its predecessor: injects its own styles/DOM and only
 * talks to app.html through already-global functions (window.resetFilters,
 * window.resetView, window.switchLab) plus plain data passed into init().
 */
(function () {
    'use strict';

    const state = {
        systemId: null,
        systemName: 'this system',
        nodes: [],
        links: [],
        orientation: null, // parsed systems/{id}/orientation.json, or null if unavailable
        staleness: null,   // { stale, compiled, live, generated_at } from /api/concierge/staleness, or null
        question: null,    // { mode: 'backward'|'forward', seedId, seedName, depth: number|'all' }
        // v2 artifact UI state (see docs/sensemaking-lab-spec.md §5.2-5.5). All
        // three are independent "which detail panel is open" flags, distinct
        // from `structuralFocus` (the mutually-exclusive graph spotlight).
        selectedClusterId: null,
        selectedLandmarkId: null,
        // { type: 'district'|'bridge'|'loop', id } | null — the one active
        // "submap" style dim/highlight spotlight; mutually exclusive with a
        // Compass `question` (entering one clears the other).
        structuralFocus: null,
        // Guided Tour (spec §5.7): 0-based index into orientation.tour while
        // touring, null otherwise.
        tourIndex: null,
        // Lab handoff seed (spec §7): the plain-data seed most recently
        // passed to a door (landmark/loop/bridge/cone) into another lab, or
        // null. Cleared on the next plain lab switch unless that switch was
        // itself triggered by handoffTo() below.
        pendingSeed: null,
        _preserveSeedOnNextLabSwitch: false,
    };

    // ============================================
    // Small utilities (ported from entry-modal.js)
    // ============================================
    function escapeHtml(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function isIntervenable(node) {
        return String(node.intervenable || '').trim().toLowerCase() === 'yes';
    }

    function sortFactors(a, b) {
        const aFocal = a.domain === 'FOCAL FACTORS' ? 0 : 1;
        const bFocal = b.domain === 'FOCAL FACTORS' ? 0 : 1;
        if (aFocal !== bFocal) return aFocal - bFocal;
        return String(a.name || '').localeCompare(String(b.name || ''));
    }

    function markChoiceMade() {
        window.__sim4actionEntryChoiceMade = true;
    }

    const DISTRICT_PALETTE = ['#64b5f6', '#81c784', '#ffb74d', '#e57373', '#ba68c8', '#4dd0e1', '#fff176', '#a1887f'];
    function districtColor(i) {
        return DISTRICT_PALETTE[i % DISTRICT_PALETTE.length];
    }

    // ============================================
    // Public entry point
    // ============================================
    function init(options) {
        state.systemId = options.systemId;
        state.systemName = options.systemName || 'this system';
        state.nodes = Array.isArray(options.nodes) ? options.nodes : [];
        state.links = Array.isArray(options.links) ? options.links : [];

        ensureStyles();
        renderRoot();

        fetchOrientation(state.systemId).then((data) => {
            state.orientation = data;
            renderMapCard();
            renderAtlasSection();
            renderLandmarksSection();
            renderBridgesSection();
            renderDynamicsSection();
            renderTourEntry();
            // Second pass: district/highlight/action/tour URL restore needs
            // the artifact loaded (unlike the `q` cone restore, which doesn't).
            applyInitialUrlState();
            // First-visit auto-offer (spec §5.7); skipped if the URL restore
            // above already started the tour, or it's been offered before.
            setTimeout(maybeOfferTour, 1200);
            // Positions settle asynchronously as the force simulation runs;
            // a couple of delayed passes is enough for a v1 static overlay.
            [400, 1200, 3000].forEach((delay) => {
                setTimeout(() => {
                    updateDistrictHulls();
                    updateLandmarkOverlays();
                }, delay);
            });

            // Artifact staleness indicator (spec §4 Phase 4): fire-and-forget,
            // never blocks the rest of the lab on a slow/unavailable Concierge.
            checkStaleness(state.systemId);
        });

        applyInitialUrlState();
    }

    // ============================================
    // orientation.json loading (tolerant of 404 / missing artifact)
    // ============================================
    function fetchOrientation(systemId) {
        return fetch(`systems/${encodeURIComponent(systemId)}/orientation.json`, { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null);
    }

    // ============================================
    // Artifact staleness indicator (spec §4 Phase 4 / §8: "Artifact drift
    // after map edits") -- compares the compiled orientation.json's vitals
    // against a live count via the Concierge; re-renders the Map Card with
    // a "map changed since compile" note when they disagree. Best-effort:
    // any failure (Concierge down, no compiled artifact, etc.) just leaves
    // the banner absent rather than surfacing an error to the visitor.
    // ============================================
    function checkStaleness(systemId) {
        if (!systemId) return;
        fetch(`/api/concierge/staleness?system_id=${encodeURIComponent(systemId)}`, { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data && data.stale) {
                    state.staleness = data;
                    renderMapCard();
                }
            })
            .catch(() => {});
    }

    // ============================================
    // Styles
    // ============================================
    function ensureStyles() {
        if (document.getElementById('s4a-sensemaking-styles')) return;
        const style = document.createElement('style');
        style.id = 's4a-sensemaking-styles';
        style.textContent = `
            .s4a-orient-intro {
                background: rgba(26, 42, 74, 0.5);
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                font-size: 13px;
                border-left: 3px solid #64b5f6;
                color: #b0c4de;
            }
            .s4a-orient-intro strong { color: #e0e6ed; }
            .s4a-atlas-list { max-height: 220px; overflow-y: auto; }
            .s4a-atlas-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 4px;
                cursor: pointer;
                border-radius: 4px;
                font-size: 12.5px;
                color: #e0e6ed;
            }
            .s4a-atlas-item:hover { background: rgba(100, 181, 246, 0.12); }
            .s4a-atlas-swatch { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
            .s4a-atlas-item .s4a-atlas-size { color: #8ab4d8; font-size: 11px; margin-left: auto; }
            .s4a-atlas-summary { font-size: 13px; color: #b0c4de; line-height: 1.5; margin-bottom: 10px; }
            .s4a-atlas-note { font-size: 12px; color: #8ab4d8; font-style: italic; }
            .s4a-atlas-item.s4a-active { background: rgba(100, 181, 246, 0.16); border-radius: 4px; }
            .s4a-atlas-item-summary { font-size: 11.5px; color: #8ab4d8; padding: 0 4px 4px 22px; line-height: 1.4; }
            .s4a-atlas-item-landmarks { font-size: 11px; color: #7a8fa5; padding: 0 4px 8px 22px; font-style: italic; }

            /* Map Card (identity) */
            .s4a-mapcard-headline { font-size: 14px; font-weight: bold; color: #e0e6ed; margin-bottom: 6px; line-height: 1.4; }
            .s4a-vitals-row { display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0; }
            .s4a-vital { display: flex; flex-direction: column; align-items: center; min-width: 52px; }
            .s4a-vital-value { font-size: 15px; font-weight: bold; color: #64b5f6; }
            .s4a-vital-label { font-size: 10px; color: #8ab4d8; text-transform: uppercase; letter-spacing: 0.3px; }
            .s4a-provenance-chip { font-size: 10.5px; color: #7a8fa5; font-style: italic; border-top: 1px solid rgba(100, 181, 246, 0.1); padding-top: 6px; }
            .s4a-staleness-banner {
                background: rgba(255, 183, 77, 0.12); border-left: 3px solid #ffb74d;
                border-radius: 4px; padding: 8px 10px; margin-bottom: 10px;
                font-size: 11.5px; color: #e0c9a0; line-height: 1.5;
            }
            .s4a-staleness-banner strong { color: #ffb74d; display: block; margin-bottom: 2px; }

            /* District detail panel */
            .s4a-district-detail {
                margin-top: 8px; padding: 10px; border-radius: 6px;
                background: rgba(26, 42, 74, 0.5); border: 1px solid rgba(100, 181, 246, 0.15);
            }
            .s4a-district-detail-title { font-weight: bold; color: #e0e6ed; font-size: 13px; margin-bottom: 4px; }
            .s4a-district-detail-summary { font-size: 12px; color: #b0c4de; line-height: 1.5; margin-bottom: 8px; }
            .s4a-enter-district-btn { width: 100%; text-align: center; }

            /* Landmarks */
            .s4a-landmark-list { max-height: 260px; overflow-y: auto; }
            .s4a-landmark-item {
                padding: 8px 6px; cursor: pointer; border-radius: 4px;
                border-bottom: 1px solid rgba(100, 181, 246, 0.08);
            }
            .s4a-landmark-item:hover { background: rgba(100, 181, 246, 0.1); }
            .s4a-landmark-item.s4a-active { background: rgba(100, 181, 246, 0.18); }
            .s4a-landmark-name { font-size: 12.5px; font-weight: bold; color: #e0e6ed; display: flex; justify-content: space-between; gap: 8px; }
            .s4a-landmark-district { font-size: 10.5px; font-weight: normal; color: #7a8fa5; white-space: nowrap; }
            .s4a-landmark-reason { font-size: 11.5px; color: #b0c4de; margin-top: 2px; line-height: 1.4; }
            .s4a-metric-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
            .s4a-metric-chip {
                font-size: 10px; color: #8ab4d8; background: rgba(100, 181, 246, 0.1);
                border-radius: 8px; padding: 1px 7px;
            }
            .s4a-landmark-panel {
                margin-top: 8px; padding: 10px; border-radius: 6px;
                background: rgba(26, 42, 74, 0.5); border: 1px solid rgba(100, 181, 246, 0.15);
            }
            .s4a-landmark-panel-title { font-weight: bold; color: #e0e6ed; font-size: 13px; margin-bottom: 4px; }
            .s4a-landmark-panel-reason { font-size: 12px; color: #b0c4de; line-height: 1.5; margin-bottom: 8px; }
            .s4a-landmark-panel-neighbors { font-size: 11px; color: #8ab4d8; line-height: 1.6; margin-bottom: 8px; }
            .s4a-landmark-panel-doors { display: flex; gap: 6px; flex-wrap: wrap; }
            .s4a-landmark-panel-doors .s4a-compass-clear { flex: 1; min-width: 120px; }

            /* Bridges */
            .s4a-bridge-list { max-height: 240px; overflow-y: auto; }
            .s4a-bridge-item {
                padding: 8px 6px; cursor: pointer; border-radius: 4px;
                border-bottom: 1px solid rgba(100, 181, 246, 0.08);
            }
            .s4a-bridge-item:hover { background: rgba(100, 181, 246, 0.1); }
            .s4a-bridge-item.s4a-active { background: rgba(100, 181, 246, 0.18); }
            .s4a-bridge-title { font-size: 12.5px; font-weight: bold; color: #e0e6ed; }
            .s4a-bridge-summary { font-size: 11.5px; color: #b0c4de; margin-top: 2px; line-height: 1.4; }
            .s4a-fragile-badge { color: #ffb74d; }

            /* Dynamics / loops */
            .s4a-loop-list { max-height: 280px; overflow-y: auto; }
            .s4a-loop-item {
                padding: 8px 6px; cursor: pointer; border-radius: 4px;
                border-bottom: 1px solid rgba(100, 181, 246, 0.08);
            }
            .s4a-loop-item:hover { background: rgba(100, 181, 246, 0.1); }
            .s4a-loop-item.s4a-active { background: rgba(100, 181, 246, 0.18); }
            .s4a-loop-title { font-size: 12.5px; font-weight: bold; color: #e0e6ed; display: flex; align-items: center; gap: 6px; }
            .s4a-loop-badge {
                display: inline-flex; align-items: center; justify-content: center;
                width: 16px; height: 16px; border-radius: 50%; font-size: 10px; font-weight: bold; color: #0d1b2a;
            }
            .s4a-loop-badge-r { background: #e57373; }
            .s4a-loop-badge-b { background: #64b5f6; }
            .s4a-loop-chain { font-size: 11px; color: #8ab4d8; margin-top: 3px; }
            .s4a-loop-story { font-size: 11.5px; color: #b0c4de; margin-top: 3px; line-height: 1.4; }

            .s4a-compass-doors { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
            .s4a-compass-door {
                background: rgba(26, 42, 74, 0.5);
                border: 1px solid rgba(100, 181, 246, 0.15);
                border-radius: 8px;
                padding: 10px 12px;
                cursor: pointer;
                text-align: left;
                color: #e0e6ed;
                font-size: 12.5px;
                transition: background-color 0.15s ease, border-color 0.15s ease;
            }
            .s4a-compass-door:hover { background: rgba(100, 181, 246, 0.12); border-color: #1e88e5; }
            .s4a-compass-door-title { font-weight: bold; margin-bottom: 2px; }
            .s4a-compass-door-desc { font-size: 11.5px; color: #8ab4d8; }
            .s4a-compass-picker { display: none; }
            .s4a-compass-back {
                background: none; border: none; color: #64b5f6; cursor: pointer;
                font-size: 12.5px; padding: 0 0 8px;
            }
            .s4a-compass-back:hover { color: #90caf9; }
            .s4a-compass-search {
                display: block; width: 100%; box-sizing: border-box;
                padding: 7px 9px; margin-bottom: 8px;
                background: rgba(26, 42, 74, 0.5);
                border: 1px solid rgba(100, 181, 246, 0.2);
                border-radius: 6px; color: #e0e6ed; font-size: 12.5px;
            }
            .s4a-compass-search:focus { outline: none; border-color: #64b5f6; }
            .s4a-compass-list { max-height: 220px; overflow-y: auto; border: 1px solid rgba(100, 181, 246, 0.12); border-radius: 6px; }
            .s4a-compass-list-item {
                display: flex; justify-content: space-between; align-items: center; gap: 8px;
                padding: 7px 10px; cursor: pointer;
                border-bottom: 1px solid rgba(100, 181, 246, 0.08);
                font-size: 12.5px; color: #e0e6ed;
            }
            .s4a-compass-list-item:last-child { border-bottom: none; }
            .s4a-compass-list-item:hover { background: rgba(100, 181, 246, 0.12); }
            .s4a-compass-list-item .domain-tag { font-size: 10.5px; color: #7a8fa5; white-space: nowrap; }
            .s4a-compass-empty, .s4a-compass-note { padding: 8px 10px; font-size: 12px; color: #8ab4d8; }
            .s4a-compass-note { font-style: italic; }
            .s4a-compass-clear {
                background: transparent; border: 1px solid rgba(100, 181, 246, 0.3); color: #64b5f6;
                border-radius: 14px; padding: 5px 12px; font-size: 12px; cursor: pointer; margin-top: 4px;
            }
            .s4a-compass-clear:hover { background: rgba(100, 181, 246, 0.12); }

            /* Persistent question banner (sits just below the fixed 50px lab toolbar) */
            .s4a-question-banner {
                position: fixed;
                top: 62px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 2000;
                background: rgba(13, 27, 42, 0.95);
                border: 1px solid rgba(100, 181, 246, 0.3);
                border-radius: 30px;
                padding: 8px 10px 8px 18px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: #e0e6ed;
                font-size: 13px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
                font-family: Arial, sans-serif;
                max-width: 92vw;
                flex-wrap: wrap;
            }
            .s4a-question-banner strong { color: #64b5f6; }
            .s4a-question-depth-label { color: #8ab4d8; font-size: 12px; white-space: nowrap; }
            .s4a-depth-chips { display: flex; gap: 4px; }
            .s4a-depth-chips .depth-chip {
                background: rgba(26, 42, 74, 0.6);
                border: 1px solid rgba(100, 181, 246, 0.2);
                color: #b0c4de;
                border-radius: 12px;
                padding: 3px 9px;
                font-size: 12px;
                cursor: pointer;
            }
            .s4a-depth-chips .depth-chip:hover { border-color: #64b5f6; }
            .s4a-depth-chips .depth-chip.active {
                background: #1e88e5;
                color: #fff;
                border-color: #1565c0;
            }
            .s4a-show-full-map {
                background: transparent;
                border: 1px solid rgba(100, 181, 246, 0.3);
                color: #64b5f6;
                border-radius: 14px;
                padding: 4px 12px;
                font-size: 12px;
                cursor: pointer;
                white-space: nowrap;
            }
            .s4a-show-full-map:hover { background: rgba(100, 181, 246, 0.12); }
            .s4a-explain-cone {
                background: rgba(30, 136, 229, 0.18); border: 1px solid rgba(100, 181, 246, 0.4); color: #90caf9;
                border-radius: 14px; padding: 4px 12px; font-size: 12px; cursor: pointer; white-space: nowrap;
            }
            .s4a-explain-cone:hover { background: rgba(30, 136, 229, 0.3); }

            /* Lab handoff doors (spec §7) -- "where do I go next" buttons
               that switchLab + seed Diagnostics/Intervention/Monitoring. */
            .s4a-handoff-btn {
                display: block; margin-top: 6px;
                background: rgba(40, 167, 69, 0.15); border: 1px solid rgba(40, 167, 69, 0.4); color: #7fd996;
                border-radius: 14px; padding: 4px 12px; font-size: 11.5px; cursor: pointer; white-space: nowrap;
            }
            .s4a-handoff-btn:hover { background: rgba(40, 167, 69, 0.28); }

            .s4a-tour-finale-cards { display: flex; gap: 8px; margin: 10px 0; flex-wrap: wrap; }
            .s4a-tour-finale-card {
                flex: 1; min-width: 130px; text-align: left; cursor: pointer;
                background: rgba(100, 181, 246, 0.1); border: 1px solid rgba(100, 181, 246, 0.3);
                border-radius: 8px; padding: 8px 10px; color: #e0e6ed;
            }
            .s4a-tour-finale-card:hover { background: rgba(100, 181, 246, 0.2); }
            .s4a-tour-finale-title { font-size: 12.5px; font-weight: bold; margin-bottom: 2px; }
            .s4a-tour-finale-pitch { font-size: 11px; color: #b0c4de; line-height: 1.3; }

            .s4a-narrate-panel {
                position: fixed; top: 112px; left: 50%; transform: translateX(-50%); z-index: 1999;
                background: rgba(13, 27, 42, 0.97); border: 1px solid rgba(100, 181, 246, 0.3);
                border-radius: 12px; padding: 14px 18px; color: #e0e6ed; font-family: Arial, sans-serif;
                font-size: 13px; line-height: 1.6; max-width: 460px; width: 90vw;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
            }
            .s4a-narrate-close { float: right; background: none; border: none; color: #8ab4d8; cursor: pointer; font-size: 18px; line-height: 1; padding: 0 0 6px 8px; }
            .s4a-narrate-text { clear: both; }

            @media (max-width: 640px) {
                .s4a-question-banner { flex-direction: column; align-items: stretch; text-align: center; border-radius: 14px; }
            }

            /* Guided Tour */
            .s4a-tour-entry-btn {
                display: block; width: 100%; margin: 0 0 15px; padding: 9px 12px; text-align: center;
                background: rgba(30, 136, 229, 0.15); border: 1px solid rgba(100, 181, 246, 0.35); color: #90caf9;
                border-radius: 8px; font-size: 12.5px; cursor: pointer;
            }
            .s4a-tour-entry-btn:hover { background: rgba(30, 136, 229, 0.25); }
            .s4a-tour-offer {
                position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 2100;
                background: rgba(13, 27, 42, 0.95); border: 1px solid rgba(100, 181, 246, 0.3);
                border-radius: 30px; padding: 10px 10px 10px 18px; display: flex; align-items: center; gap: 12px;
                color: #e0e6ed; font-size: 13px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
                font-family: Arial, sans-serif; max-width: 92vw;
            }
            .s4a-tour-offer-start {
                background: #1e88e5; color: #fff; border: none; border-radius: 16px;
                padding: 6px 14px; font-size: 12.5px; cursor: pointer; white-space: nowrap;
            }
            .s4a-tour-offer-dismiss { background: none; border: none; color: #8ab4d8; font-size: 18px; cursor: pointer; line-height: 1; padding: 0 4px; }
            .s4a-tour-overlay {
                position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 2100;
                background: rgba(13, 27, 42, 0.97); border: 1px solid rgba(100, 181, 246, 0.3);
                border-radius: 14px; padding: 14px 18px; color: #e0e6ed; font-family: Arial, sans-serif;
                max-width: 480px; width: 90vw; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
            }
            .s4a-tour-progress { font-size: 11px; color: #64b5f6; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
            .s4a-tour-say { font-size: 14px; line-height: 1.5; margin-bottom: 12px; }
            .s4a-tour-controls { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
            .s4a-tour-controls .s4a-tour-back[disabled] { opacity: 0.4; cursor: default; pointer-events: none; }
            .s4a-tour-skip { background: none; border: none; color: #8ab4d8; font-size: 12px; cursor: pointer; text-decoration: underline; }
            .s4a-tour-next { background: #1e88e5; color: #fff; border: none; border-radius: 16px; padding: 6px 14px; font-size: 12.5px; cursor: pointer; }

            /* "Start from your angle" (relevance matcher) */
            .s4a-relevance-hint { font-size: 12px; color: #8ab4d8; margin: 0 0 8px; line-height: 1.4; }
            .s4a-relevance-textarea {
                width: 100%; box-sizing: border-box; resize: vertical; min-height: 44px;
                background: rgba(13, 27, 42, 0.6); border: 1px solid rgba(100, 181, 246, 0.25); color: #e0e6ed;
                border-radius: 6px; padding: 7px 9px; font-size: 12.5px; font-family: Arial, sans-serif; margin-bottom: 8px;
            }
            .s4a-relevance-textarea:focus { outline: none; border-color: rgba(100, 181, 246, 0.6); }
            .s4a-relevance-results { margin-top: 10px; }
            .s4a-relevance-result {
                display: block; width: 100%; text-align: left; background: rgba(26, 42, 74, 0.5);
                border: 1px solid rgba(100, 181, 246, 0.15); border-radius: 6px; padding: 8px 10px;
                margin-bottom: 6px; cursor: pointer; font-family: Arial, sans-serif;
            }
            .s4a-relevance-result:hover { background: rgba(100, 181, 246, 0.12); border-color: rgba(100, 181, 246, 0.35); }
            .s4a-relevance-result-name { font-size: 12.5px; font-weight: bold; color: #e0e6ed; }
            .s4a-relevance-result-district { font-weight: normal; color: #8ab4d8; font-size: 11.5px; }
            .s4a-relevance-result-why { font-size: 11.5px; color: #b0c4de; margin-top: 3px; line-height: 1.4; }

            /* Pathfinder */
            .s4a-pathfinder-hint { font-size: 12px; color: #8ab4d8; margin: 0 0 8px; line-height: 1.4; }
            .s4a-pathfinder-input { min-height: 0; height: 30px; resize: none; margin-bottom: 6px; }
            .s4a-pathfinder-result { margin-top: 10px; }
            .s4a-pathfinder-story { margin-bottom: 8px; }
            .s4a-pathfinder-hop {
                padding: 7px 9px; margin-bottom: 5px; border-radius: 6px;
                background: rgba(26, 42, 74, 0.5); border: 1px solid rgba(100, 181, 246, 0.15);
                border-left: 3px solid #64b5f6; font-size: 12.5px; color: #e0e6ed; line-height: 1.4;
            }
            .s4a-pathfinder-hop-meta { color: #8ab4d8; font-size: 11px; }
            .s4a-pathfinder-hop-def { font-size: 11px; color: #8ab4d8; font-style: italic; margin-top: 3px; }

            @media (max-width: 640px) {
                .s4a-tour-offer { flex-direction: column; align-items: stretch; text-align: center; border-radius: 14px; }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // Sidebar root (Orient lab section content)
    // ============================================
    function makeSection(title) {
        if (typeof window.createBasicSection === 'function') {
            return window.createBasicSection(title);
        }
        // Fallback if app.html's helper isn't available for some reason.
        const section = document.createElement('div');
        section.className = 'filter-section';
        section.innerHTML = `<div class="filter-section-header"><h4>${escapeHtml(title)}</h4></div><div class="filter-section-content expanded"></div>`;
        return section;
    }

    // Orient's sections start open (unlike other labs' collapsed-by-default
    // sections) since there's little content and it's the very first thing
    // a new viewer sees; also flips the header's +/- affordance to match.
    function expandSection(section) {
        const content = section.querySelector('.filter-section-content');
        content.classList.add('expanded');
        const toggle = section.querySelector('.filter-section-toggle');
        if (toggle) toggle.innerHTML = '&minus;';
        return content;
    }

    function renderRoot() {
        const root = document.getElementById('sensemaking-lab-root');
        if (!root) return;
        root.innerHTML = '';

        const intro = document.createElement('div');
        intro.className = 's4a-orient-intro';
        intro.innerHTML = `
            <p style="margin: 0 0 5px 0;"><strong>Sensemaking</strong> helps you get your bearings in ${escapeHtml(state.systemName)} before diving into analysis.</p>
            <p style="margin: 0; font-size: 12px;">Use Atlas to see the map's districts, or Compass to ask a focused question instead of viewing the full network at once.</p>
        `;
        root.appendChild(intro);

        // Guided Tour entry point (spec §5.7) — hidden until orientation.tour
        // is confirmed to exist; the auto-offer toast covers the first visit,
        // this button covers "available afterwards from the sidebar".
        const tourEntry = document.createElement('div');
        tourEntry.id = 's4a-tour-entry';
        tourEntry.style.display = 'none';
        root.appendChild(tourEntry);

        // Map Card (identity, spec §5.1) — hidden until the artifact loads and
        // only shown at all when a `passport` block exists (v2 compiles only).
        const mapCardSection = makeSection('Map Card');
        mapCardSection.id = 's4a-mapcard-section';
        mapCardSection.style.display = 'none';
        expandSection(mapCardSection).innerHTML = '<div class="s4a-atlas-note">Loading...</div>';
        root.appendChild(mapCardSection);

        const atlasSection = makeSection('Atlas — Districts');
        atlasSection.id = 's4a-atlas-section';
        const atlasContent = expandSection(atlasSection);
        atlasContent.innerHTML = '<div class="s4a-atlas-note">Loading...</div>';
        root.appendChild(atlasSection);

        const landmarksSection = makeSection('Landmarks');
        landmarksSection.id = 's4a-landmarks-section';
        expandSection(landmarksSection).innerHTML = '<div class="s4a-atlas-note">Loading...</div>';
        root.appendChild(landmarksSection);

        const bridgesSection = makeSection('Bridges');
        bridgesSection.id = 's4a-bridges-section';
        expandSection(bridgesSection).innerHTML = '<div class="s4a-atlas-note">Loading...</div>';
        root.appendChild(bridgesSection);

        const dynamicsSection = makeSection('Dynamics');
        dynamicsSection.id = 's4a-dynamics-section';
        expandSection(dynamicsSection).innerHTML = '<div class="s4a-atlas-note">Loading...</div>';
        root.appendChild(dynamicsSection);

        // "Start from your angle" (spec §5.8) — the one structured feature
        // backed by a live LLM call (Concierge's /api/concierge/relevance).
        // Independent of the orientation.json fetch below: it only needs
        // state.systemId, so it's usable immediately.
        const relevanceSection = makeSection('Start from your angle');
        relevanceSection.id = 's4a-relevance-section';
        expandSection(relevanceSection).appendChild(buildRelevanceWidget());
        root.appendChild(relevanceSection);

        const compassSection = makeSection('Compass — Ask a question');
        compassSection.id = 's4a-compass-section';
        const compassContent = expandSection(compassSection);
        compassContent.appendChild(buildCompassWidget());
        root.appendChild(compassSection);

        // Pathfinder (spec §5.6) — a second, complementary way to ask about
        // paths: "from X to Y" rather than Compass's single-seed cone.
        const pathfinderSection = makeSection('Pathfinder — trace a path');
        pathfinderSection.id = 's4a-pathfinder-section';
        expandSection(pathfinderSection).appendChild(buildPathfinderWidget());
        root.appendChild(pathfinderSection);
    }

    // ============================================
    // Map Card — identity header (spec §5.1). Renders only when the v2
    // `passport` block is present; v1/uncompiled maps just keep it hidden and
    // Atlas falls back to showing the plain top-level `summary` instead.
    // ============================================
    function renderMapCard() {
        const section = document.getElementById('s4a-mapcard-section');
        if (!section) return;
        const content = section.querySelector('.filter-section-content');
        const passport = state.orientation && state.orientation.passport;
        if (!passport) {
            section.style.display = 'none';
            return;
        }
        section.style.display = '';

        const meta = state.orientation.meta || {};
        const vitals = passport.vitals || {};
        const vitalItems = [
            ['Factors', vitals.factors],
            ['Edges', vitals.edges],
            ['Districts', vitals.districts],
            ['Loops', vitals.loops],
            ['Typical delay', vitals.dominant_delay],
        ].filter(([, v]) => v !== undefined && v !== null && v !== '');

        const compiledDate = meta.generated_at
            ? new Date(meta.generated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
            : '';
        const provenanceBits = [
            compiledDate ? `Compiled ${compiledDate}` : 'Compiled',
            meta.model || '',
            (vitals.factors != null && vitals.edges != null) ? `from ${vitals.factors} factors / ${vitals.edges} edges` : '',
        ].filter(Boolean);

        const staleness = state.staleness;
        const stalenessBanner = (staleness && staleness.stale) ? `
            <div class="s4a-staleness-banner">
                <strong>This map may have changed since it was last compiled.</strong>
                Was ${escapeHtml(staleness.compiled.factors)} factors / ${escapeHtml(staleness.compiled.edges)} edges,
                now ${escapeHtml(staleness.live.factors)} / ${escapeHtml(staleness.live.edges)}. Some structured views
                below may be out of date until it's recompiled.
            </div>
        ` : '';

        content.innerHTML = `
            ${stalenessBanner}
            ${passport.headline ? `<div class="s4a-mapcard-headline">${escapeHtml(passport.headline)}</div>` : ''}
            ${state.orientation.summary ? `<div class="s4a-atlas-summary">${escapeHtml(state.orientation.summary)}</div>` : ''}
            ${vitalItems.length ? `<div class="s4a-vitals-row">${vitalItems.map(([label, v]) => `
                <div class="s4a-vital"><span class="s4a-vital-value">${escapeHtml(v)}</span><span class="s4a-vital-label">${escapeHtml(label)}</span></div>
            `).join('')}</div>` : ''}
            <div class="s4a-provenance-chip">${escapeHtml(provenanceBits.join(' · '))}</div>
        `;
    }

    // ============================================
    // Atlas v2 — static, artifact-driven district list + map hulls.
    // v1 documents (no `summary` field on clusters, no `passport`) still
    // render fine here — the v2-only bits (per-district summary, landmark
    // flags) simply don't appear when their source data is empty.
    // ============================================
    function landmarkClusterId(factorId) {
        const clusters = (state.orientation && state.orientation.clusters) || [];
        const found = clusters.find((c) => Array.isArray(c.factor_ids) && c.factor_ids.includes(factorId));
        return found ? found.id : null;
    }

    function renderAtlasSection() {
        const content = document.querySelector('#s4a-atlas-section .filter-section-content');
        if (!content) return;
        content.innerHTML = '';

        if (!state.orientation || !Array.isArray(state.orientation.clusters) || !state.orientation.clusters.length) {
            content.innerHTML = '<div class="s4a-atlas-note">This map hasn\'t been compiled yet — districts aren\'t available. You can still explore via Compass or the full map.</div>';
            return;
        }

        // v1 documents (no passport/Map Card) show the summary here instead.
        if (!state.orientation.passport && state.orientation.summary) {
            const summary = document.createElement('div');
            summary.className = 's4a-atlas-summary';
            summary.textContent = state.orientation.summary;
            content.appendChild(summary);
        }

        const landmarksByCluster = {};
        (state.orientation.landmarks || []).forEach((lm) => {
            const cid = landmarkClusterId(lm.factor_id);
            if (cid == null) return;
            (landmarksByCluster[cid] = landmarksByCluster[cid] || []).push(lm);
        });

        // Ordered by size, largest first (spec §5.2), not raw community index.
        const originalOrder = state.orientation.clusters;
        const ordered = originalOrder.slice().sort((a, b) => (b.size || 0) - (a.size || 0));

        const list = document.createElement('div');
        list.className = 's4a-atlas-list';
        ordered.forEach((cluster) => {
            const paletteIndex = originalOrder.indexOf(cluster); // stable color regardless of sort
            const landmarkNames = (landmarksByCluster[cluster.id] || []).map((lm) => {
                const n = state.nodes.find((nn) => nn.id === lm.factor_id);
                return n ? n.name : lm.factor_id;
            });

            const wrap = document.createElement('div');
            wrap.className = 's4a-atlas-item-wrap';
            wrap.innerHTML = `
                <div class="s4a-atlas-item${state.selectedClusterId === cluster.id ? ' s4a-active' : ''}">
                    <span class="s4a-atlas-swatch" style="background:${districtColor(paletteIndex)}"></span>
                    <span>${escapeHtml(cluster.name || `Cluster ${cluster.id}`)}</span>
                    <span class="s4a-atlas-size">${cluster.size} factor${cluster.size === 1 ? '' : 's'}</span>
                </div>
                ${cluster.summary ? `<div class="s4a-atlas-item-summary">${escapeHtml(cluster.summary)}</div>` : ''}
                ${landmarkNames.length ? `<div class="s4a-atlas-item-landmarks">Landmarks: ${escapeHtml(landmarkNames.join(', '))}</div>` : ''}
            `;
            wrap.querySelector('.s4a-atlas-item').addEventListener('click', () => focusCluster(cluster.id));
            list.appendChild(wrap);
        });
        content.appendChild(list);

        if (state.selectedClusterId != null) {
            const detail = buildDistrictDetailPanel(state.selectedClusterId);
            if (detail) content.appendChild(detail);
        }
    }

    function buildDistrictDetailPanel(clusterId) {
        const cluster = (state.orientation.clusters || []).find((c) => c.id === clusterId);
        if (!cluster) return null;
        const panel = document.createElement('div');
        panel.className = 's4a-district-detail';
        panel.innerHTML = `
            <div class="s4a-district-detail-title">${escapeHtml(cluster.name || `Cluster ${cluster.id}`)}</div>
            ${cluster.summary ? `<div class="s4a-district-detail-summary">${escapeHtml(cluster.summary)}</div>` : ''}
            <button type="button" class="s4a-compass-clear s4a-enter-district-btn">Enter this district &rarr;</button>
        `;
        panel.querySelector('.s4a-enter-district-btn').addEventListener('click', () => enterDistrict(clusterId));
        return panel;
    }

    function updateDistrictHulls() {
        const container = d3.select('#graph svg g');
        container.selectAll('.s4a-district-hull').remove();
        container.selectAll('.s4a-district-label').remove();

        const isOrientActive = document.body.dataset.activeLab === 'sensemaking';
        if (!isOrientActive || !state.orientation || !Array.isArray(state.orientation.clusters)) return;

        state.orientation.clusters.forEach((cluster, i) => {
            const points = cluster.factor_ids
                .map((fid) => {
                    const n = state.nodes.find((node) => node.id === fid);
                    return n && isFinite(n.x) && isFinite(n.y) ? [n.x, n.y] : null;
                })
                .filter((p) => p !== null);

            if (points.length < 3) return;
            const hull = d3.polygonHull(points);
            if (!hull || hull.length < 3) return;

            const centroid = d3.polygonCentroid(hull);
            const padded = hull.map((point) => {
                const dx = point[0] - centroid[0];
                const dy = point[1] - centroid[1];
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                const factor = (distance + 30) / distance;
                return [centroid[0] + dx * factor, centroid[1] + dy * factor];
            });

            container.append('path')
                .datum(padded)
                .attr('class', 's4a-district-hull')
                .attr('d', d3.line().curve(d3.curveCardinalClosed.tension(0.1)))
                .style('fill', districtColor(i))
                .style('fill-opacity', 0.08)
                .style('stroke', districtColor(i))
                .style('stroke-width', 2)
                .style('stroke-dasharray', '5,5')
                .style('pointer-events', 'none');

            container.append('text')
                .attr('class', 's4a-district-label')
                .attr('x', centroid[0])
                .attr('y', centroid[1])
                .attr('text-anchor', 'middle')
                .style('fill', districtColor(i))
                .style('font-size', '13px')
                .style('font-weight', 'bold')
                .style('pointer-events', 'none')
                .style('text-shadow', '0 1px 4px rgba(0,0,0,0.8)')
                .text(cluster.name || `Cluster ${cluster.id}`);
        });
    }

    /**
     * Weak focus: zoom/filter to a district (existing v1 behavior) and show
     * its summary + "enter this district" affordance. Does not dim the rest
     * of the graph — that's what enterDistrict() is for.
     */
    function focusCluster(clusterId) {
        if (!state.orientation) return;
        const cluster = state.orientation.clusters.find((c) => c.id === clusterId);
        if (!cluster) return;
        state.selectedClusterId = clusterId;
        const idSet = new Set(cluster.factor_ids);
        if (typeof window.resetView === 'function') window.resetView((d) => idSet.has(d.id));
        renderAtlasSection();
        updateUrlState();
    }

    /**
     * Strong focus ("enter this district", spec §5.2): filters the graph to
     * the district and its boundary edges, dimming everything else — the
     * same submap-style spotlight used by showBridge/showLoop.
     */
    function enterDistrict(clusterId) {
        if (!state.orientation) return;
        const cluster = state.orientation.clusters.find((c) => c.id === clusterId);
        if (!cluster) return;
        state.selectedClusterId = clusterId;

        const idSet = new Set(cluster.factor_ids || []);
        const nodeIds = new Set(idSet);
        const linkSet = new Set();
        state.links.forEach((link) => {
            const sourceId = link.source && link.source.id !== undefined ? link.source.id : link.source;
            const targetId = link.target && link.target.id !== undefined ? link.target.id : link.target;
            if (idSet.has(sourceId) || idSet.has(targetId)) {
                linkSet.add(link);
                nodeIds.add(sourceId);
                nodeIds.add(targetId);
            }
        });

        setStructuralFocus('district', clusterId, nodeIds, linkSet);
        renderAtlasSection();
    }

    // ============================================
    // Structural focus — the shared dim/highlight "submap" spotlight used by
    // enterDistrict/showBridge/showLoop. Mutually exclusive with a Compass
    // question (entering one clears the other); landmark halos (below) are
    // a separate, non-exclusive persistent overlay.
    // ============================================
    function setStructuralFocus(type, id, nodeIds, linkSet) {
        if (state.question) {
            state.question = null;
            hideBanner();
            updateCompassClearButton();
        }
        state.structuralFocus = { type, id };

        d3.selectAll('.node')
            .classed('highlighted', (d) => nodeIds.has(d.id))
            .classed('dimmed', (d) => !nodeIds.has(d.id))
            .style('opacity', (d) => (nodeIds.has(d.id) ? 1 : 0.2));

        d3.selectAll('.link')
            .classed('highlighted', (l) => linkSet.has(l))
            .classed('dimmed', (l) => !linkSet.has(l))
            .style('opacity', null)
            .style('stroke-opacity', (l) => (linkSet.has(l) ? 1 : 0.08))
            .style('marker-end', (l) => (linkSet.has(l)
                ? `url(#arrow-${l.type}-${l.strength})`
                : 'none'))
            .style('pointer-events', (l) => (linkSet.has(l) ? 'auto' : 'none'));

        if (typeof window.resetView === 'function') window.resetView((d) => nodeIds.has(d.id));
        updateUrlState();
    }

    function clearStructuralFocus() {
        if (!state.structuralFocus) return;
        state.structuralFocus = null;
        d3.selectAll('.node').classed('highlighted', false).classed('dimmed', false).style('opacity', null);
        d3.selectAll('.link')
            .classed('highlighted', false).classed('dimmed', false)
            .style('stroke-opacity', null).style('marker-end', null).style('pointer-events', null);
    }

    // Re-renders the sections whose list items show an "active" state driven
    // by state.structuralFocus, so switching focus un-bolds the old selection.
    function refreshFocusSections() {
        if (!state.orientation) return;
        renderAtlasSection();
        renderBridgesSection();
        renderDynamicsSection();
    }

    // ============================================
    // Landmarks — hubs and focal factors (Lynch: landmarks, spec §5.3).
    // Persistent halos on the map (updateLandmarkOverlays) so they stay
    // fixed reference points regardless of any other active focus.
    // ============================================
    function renderLandmarksSection() {
        const content = document.querySelector('#s4a-landmarks-section .filter-section-content');
        if (!content) return;
        content.innerHTML = '';

        const landmarks = (state.orientation && state.orientation.landmarks) || [];
        if (!landmarks.length) {
            content.innerHTML = '<div class="s4a-atlas-note">No landmarks compiled for this map yet.</div>';
            return;
        }

        const list = document.createElement('div');
        list.className = 's4a-landmark-list';
        landmarks.forEach((lm) => {
            const node = state.nodes.find((n) => n.id === lm.factor_id);
            const name = lm.name || (node ? node.name : lm.factor_id);
            const clusterId = landmarkClusterId(lm.factor_id);
            const cluster = clusterId != null ? (state.orientation.clusters || []).find((c) => c.id === clusterId) : null;
            const metricChips = Object.entries(lm.metrics || {})
                .slice(0, 3)
                .map(([k, v]) => `<span class="s4a-metric-chip">${escapeHtml(k)}: ${typeof v === 'number' ? v.toFixed(2) : escapeHtml(v)}</span>`)
                .join('');

            const item = document.createElement('div');
            item.className = 's4a-landmark-item' + (state.selectedLandmarkId === lm.factor_id ? ' s4a-active' : '');
            item.innerHTML = `
                <div class="s4a-landmark-name">${escapeHtml(name)}${cluster ? `<span class="s4a-landmark-district">${escapeHtml(cluster.name)}</span>` : ''}</div>
                ${lm.reason ? `<div class="s4a-landmark-reason">${escapeHtml(lm.reason)}</div>` : ''}
                ${metricChips ? `<div class="s4a-metric-chips">${metricChips}</div>` : ''}
            `;
            item.addEventListener('click', () => highlightLandmark(lm.factor_id));
            list.appendChild(item);
        });
        content.appendChild(list);

        if (state.selectedLandmarkId) {
            const panel = buildLandmarkDetailPanel(state.selectedLandmarkId);
            if (panel) content.appendChild(panel);
        }
    }

    function buildLandmarkDetailPanel(factorId) {
        const landmarks = (state.orientation && state.orientation.landmarks) || [];
        const lm = landmarks.find((l) => l.factor_id === factorId);
        if (!lm) return null;
        const node = state.nodes.find((n) => n.id === factorId);
        const name = lm.name || (node ? node.name : factorId);

        const neighbors = [];
        state.links.forEach((link) => {
            const sourceId = link.source && link.source.id !== undefined ? link.source.id : link.source;
            const targetId = link.target && link.target.id !== undefined ? link.target.id : link.target;
            if (sourceId === factorId) neighbors.push({ id: targetId, dir: 'to' });
            if (targetId === factorId) neighbors.push({ id: sourceId, dir: 'from' });
        });
        const neighborLines = neighbors.slice(0, 8).map((n) => {
            const nn = state.nodes.find((x) => x.id === n.id);
            return `${n.dir === 'to' ? '&rarr; ' : '&larr; '}${escapeHtml(nn ? nn.name : n.id)}`;
        });

        const panel = document.createElement('div');
        panel.className = 's4a-landmark-panel';
        panel.innerHTML = `
            <div class="s4a-landmark-panel-title">${escapeHtml(name)}</div>
            ${lm.reason ? `<div class="s4a-landmark-panel-reason">${escapeHtml(lm.reason)}</div>` : ''}
            ${neighborLines.length ? `<div class="s4a-landmark-panel-neighbors">${neighborLines.join('<br>')}</div>` : ''}
            <div class="s4a-landmark-panel-doors">
                <button type="button" class="s4a-compass-clear" data-door-dir="backward">What drives this?</button>
                <button type="button" class="s4a-compass-clear" data-door-dir="forward">What does this affect?</button>
                <button type="button" class="s4a-handoff-btn s4a-landmark-analyze">Analyze this factor &rarr;</button>
            </div>
        `;
        panel.querySelectorAll('[data-door-dir]').forEach((btn) => {
            btn.addEventListener('click', () => {
                showCone({ seedId: factorId, seedName: name, direction: btn.dataset.doorDir, depth: 2 });
            });
        });
        panel.querySelector('.s4a-landmark-analyze').addEventListener('click', () => {
            handoffToDiagnostics(factorId, name);
        });
        return panel;
    }

    /**
     * Action-layer entry point: select/highlight a landmark. Non-exclusive
     * with structuralFocus/question — landmarks are always-visible reference
     * points (Lynch), not a competing spotlight.
     */
    function highlightLandmark(factorId) {
        state.selectedLandmarkId = state.selectedLandmarkId === factorId ? null : factorId;
        renderLandmarksSection();
        updateLandmarkOverlays();
        updateUrlState();
    }

    function updateLandmarkOverlays() {
        const container = d3.select('#graph svg g');
        container.selectAll('.s4a-landmark-halo').remove();

        const isOrientActive = document.body.dataset.activeLab === 'sensemaking';
        const landmarks = (state.orientation && state.orientation.landmarks) || [];
        if (!isOrientActive || !landmarks.length) return;

        landmarks.forEach((lm) => {
            const node = state.nodes.find((n) => n.id === lm.factor_id);
            if (!node || !isFinite(node.x) || !isFinite(node.y)) return;
            const selected = state.selectedLandmarkId === lm.factor_id;
            container.insert('circle', ':first-child')
                .attr('class', 's4a-landmark-halo')
                .attr('cx', node.x)
                .attr('cy', node.y)
                .attr('r', selected ? 22 : 16)
                .style('fill', 'none')
                .style('stroke', selected ? '#ffd54f' : '#64b5f6')
                .style('stroke-width', selected ? 3 : 1.5)
                .style('stroke-dasharray', selected ? 'none' : '2,3')
                .style('opacity', selected ? 0.9 : 0.5)
                .style('pointer-events', 'none');
        });
    }

    // ============================================
    // Bridges — weak couplings between districts (Lynch: edges, spec §5.4).
    // ============================================
    function renderBridgesSection() {
        const content = document.querySelector('#s4a-bridges-section .filter-section-content');
        if (!content) return;
        content.innerHTML = '';

        const bridges = (state.orientation && state.orientation.bridges) || [];
        if (!bridges.length) {
            content.innerHTML = '<div class="s4a-atlas-note">No bridges compiled for this map yet.</div>';
            return;
        }

        const clusters = state.orientation.clusters || [];
        const list = document.createElement('div');
        list.className = 's4a-bridge-list';
        bridges.forEach((bridge, i) => {
            const names = (bridge.districts || []).map((id) => {
                const c = clusters.find((cc) => cc.id === id);
                return c ? c.name : `District ${id}`;
            });
            const isActive = state.structuralFocus && state.structuralFocus.type === 'bridge' && state.structuralFocus.id === i;

            const item = document.createElement('div');
            item.className = 's4a-bridge-item' + (isActive ? ' s4a-active' : '');
            item.innerHTML = `
                <div class="s4a-bridge-title">${escapeHtml(names.join(' \u2194 '))}${bridge.fragile ? ' <span class="s4a-fragile-badge" title="Fragile coupling">&#9888;</span>' : ''}</div>
                ${bridge.summary ? `<div class="s4a-bridge-summary">${escapeHtml(bridge.summary)}</div>` : ''}
                ${bridge.fragile ? '<button type="button" class="s4a-handoff-btn s4a-bridge-watch">Watch this coupling &rarr;</button>' : ''}
            `;
            item.addEventListener('click', (e) => {
                if (e.target.closest('.s4a-bridge-watch')) return;
                showBridge(i);
            });
            const watchBtn = item.querySelector('.s4a-bridge-watch');
            if (watchBtn) {
                watchBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handoffToMonitoring(bridge);
                });
            }
            list.appendChild(item);
        });
        content.appendChild(list);
    }

    /** Action-layer entry point: submap view of one inter-district bridge. */
    function showBridge(bridgeIndex) {
        const bridges = (state.orientation && state.orientation.bridges) || [];
        const bridge = bridges[bridgeIndex];
        if (!bridge) return;

        const clusters = state.orientation.clusters || [];
        const districtIdSet = new Set(bridge.districts || []);
        const nodeIds = new Set();
        clusters.forEach((c) => {
            if (districtIdSet.has(c.id)) (c.factor_ids || []).forEach((fid) => nodeIds.add(fid));
        });

        const edgeKeys = new Set((bridge.edges || []).map(([s, t]) => `${s}::${t}`));
        const linkSet = new Set();
        state.links.forEach((link) => {
            const sourceId = link.source && link.source.id !== undefined ? link.source.id : link.source;
            const targetId = link.target && link.target.id !== undefined ? link.target.id : link.target;
            if (edgeKeys.has(`${sourceId}::${targetId}`) || edgeKeys.has(`${targetId}::${sourceId}`)) {
                linkSet.add(link);
                nodeIds.add(sourceId);
                nodeIds.add(targetId);
            }
        });

        setStructuralFocus('bridge', bridgeIndex, nodeIds, linkSet);
        refreshFocusSections();
    }

    // ============================================
    // Dynamics — named feedback loops (spec §5.5).
    // ============================================
    function renderDynamicsSection() {
        const content = document.querySelector('#s4a-dynamics-section .filter-section-content');
        if (!content) return;
        content.innerHTML = '';

        const dynamics = state.orientation && state.orientation.stories;
        const loops = (dynamics && dynamics.loops) || [];
        if (!loops.length) {
            content.innerHTML = '<div class="s4a-atlas-note">No feedback loops compiled for this map yet.</div>';
            return;
        }

        if (dynamics.headline) {
            const headline = document.createElement('div');
            headline.className = 's4a-atlas-summary';
            headline.textContent = dynamics.headline;
            content.appendChild(headline);
        }

        const list = document.createElement('div');
        list.className = 's4a-loop-list';
        loops.forEach((loop) => {
            const chain = (loop.factor_ids || []).map((fid) => {
                const n = state.nodes.find((nn) => nn.id === fid);
                return n ? n.name : fid;
            }).join(' \u2192 ');
            const isReinforcing = String(loop.type || '').toLowerCase().startsWith('r');
            const isActive = state.structuralFocus && state.structuralFocus.type === 'loop' && state.structuralFocus.id === loop.id;

            const entryFactorId = (loop.factor_ids || [])[0];
            const entryNode = entryFactorId != null ? state.nodes.find((n) => n.id === entryFactorId) : null;
            const entryName = entryNode ? entryNode.name : entryFactorId;

            const item = document.createElement('div');
            item.className = 's4a-loop-item' + (isActive ? ' s4a-active' : '');
            item.innerHTML = `
                <div class="s4a-loop-title">
                    <span class="s4a-loop-badge ${isReinforcing ? 's4a-loop-badge-r' : 's4a-loop-badge-b'}">${isReinforcing ? 'R' : 'B'}</span>
                    ${escapeHtml(loop.name || loop.id)}
                </div>
                ${chain ? `<div class="s4a-loop-chain">${escapeHtml(chain)}</div>` : ''}
                ${loop.story ? `<div class="s4a-loop-story">${escapeHtml(loop.story)}</div>` : ''}
                ${entryFactorId != null ? '<button type="button" class="s4a-handoff-btn s4a-loop-test">Test this loop &rarr;</button>' : ''}
            `;
            item.addEventListener('click', (e) => {
                if (e.target.closest('.s4a-loop-test')) return;
                showLoop(loop.id);
            });
            const testBtn = item.querySelector('.s4a-loop-test');
            if (testBtn) {
                testBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handoffToIntervention(entryFactorId, entryName, { loopId: loop.id, loopName: loop.name });
                });
            }
            list.appendChild(item);
        });
        content.appendChild(list);
    }

    /** Action-layer entry point: animate/highlight one named feedback loop. */
    function showLoop(loopId) {
        const dynamics = state.orientation && state.orientation.stories;
        const loops = (dynamics && dynamics.loops) || [];
        const loop = loops.find((l) => l.id === loopId);
        if (!loop) return;

        const factorIds = loop.factor_ids || [];
        const nodeIds = new Set(factorIds);
        const linkSet = new Set();
        for (let i = 0; i < factorIds.length - 1; i++) {
            const a = factorIds[i];
            const b = factorIds[i + 1];
            state.links.forEach((link) => {
                const sourceId = link.source && link.source.id !== undefined ? link.source.id : link.source;
                const targetId = link.target && link.target.id !== undefined ? link.target.id : link.target;
                if (sourceId === a && targetId === b) linkSet.add(link);
            });
        }

        setStructuralFocus('loop', loopId, nodeIds, linkSet);
        refreshFocusSections();
    }

    // ============================================
    // Guided Tour — a compiled, replayable sequence of steps (spec §5.7).
    // Each step is `{ step, say, action }`; `action` is dispatched through
    // the same ACTIONS table (defined below, near the view-state code) that
    // the Concierge's future ui_apply_view tool will use, so touring is just
    // "GUI clicks a human could also make, played back in order."
    // ============================================
    const TOUR_SEEN_PREFIX = 's4a_tour_seen_';

    function tourSteps() {
        return (state.orientation && Array.isArray(state.orientation.tour)) ? state.orientation.tour : [];
    }

    function markTourSeen() {
        try { window.localStorage.setItem(TOUR_SEEN_PREFIX + state.systemId, '1'); } catch (e) { /* private mode etc — best effort */ }
    }

    function hasTourBeenOffered() {
        try { return window.localStorage.getItem(TOUR_SEEN_PREFIX + state.systemId) === '1'; } catch (e) { return true; }
    }

    /** Auto-offered once per system on first visit (spec §5.7); silent no-op thereafter. */
    function maybeOfferTour() {
        if (state.tourIndex != null || !tourSteps().length || hasTourBeenOffered()) return;
        markTourSeen();
        showTourOfferToast();
    }

    function showTourOfferToast() {
        const toast = document.createElement('div');
        toast.id = 's4a-tour-offer';
        toast.className = 's4a-tour-offer';
        toast.innerHTML = `
            <span>New here? Take a guided tour of this map.</span>
            <button type="button" class="s4a-tour-offer-start">Start tour</button>
            <button type="button" class="s4a-tour-offer-dismiss" aria-label="Dismiss">&times;</button>
        `;
        document.body.appendChild(toast);
        toast.querySelector('.s4a-tour-offer-start').addEventListener('click', () => {
            toast.remove();
            startTour(0);
        });
        toast.querySelector('.s4a-tour-offer-dismiss').addEventListener('click', () => toast.remove());
    }

    function renderTourEntry() {
        const container = document.getElementById('s4a-tour-entry');
        if (!container) return;
        const steps = tourSteps();
        if (!steps.length) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'block';
        container.innerHTML = `<button type="button" class="s4a-tour-entry-btn">&#9654; Take the guided tour (${steps.length} steps)</button>`;
        container.querySelector('.s4a-tour-entry-btn').addEventListener('click', () => startTour(0));
    }

    /** Action-layer entry point: (re)start the tour at a given step index. */
    function startTour(startIndex) {
        const steps = tourSteps();
        if (!steps.length) return;
        state.tourIndex = Math.max(0, Math.min(startIndex || 0, steps.length - 1));
        markTourSeen();
        const offer = document.getElementById('s4a-tour-offer');
        if (offer) offer.remove();
        renderTourStep();
    }

    function nextTourStep() {
        const steps = tourSteps();
        if (state.tourIndex == null) return;
        if (state.tourIndex >= steps.length - 1) {
            endTour();
            return;
        }
        state.tourIndex += 1;
        renderTourStep();
    }

    function prevTourStep() {
        if (state.tourIndex == null) return;
        state.tourIndex = Math.max(0, state.tourIndex - 1);
        renderTourStep();
    }

    function endTour() {
        state.tourIndex = null;
        hideTourOverlay();
        updateUrlState();
    }

    function renderTourStep() {
        const steps = tourSteps();
        const step = steps[state.tourIndex];
        if (!step) return;
        applyAction(step.action);
        showTourOverlay(step, state.tourIndex, steps.length);
        updateUrlState();
    }

    function showTourOverlay(step, index, total) {
        hideTourOverlay();
        const overlay = document.createElement('div');
        overlay.id = 's4a-tour-overlay';
        overlay.className = 's4a-tour-overlay';
        const isLast = index === total - 1;
        // Tour finale handoff cards (spec §7, "Tour final step" row): plain
        // switchLab() cards, no factor seed -- the tour itself isn't about
        // one factor, it's the "where do I go next" moment.
        const finaleCards = isLast ? `
            <div class="s4a-tour-finale-cards">
                <button type="button" class="s4a-tour-finale-card" data-lab="diagnostics">
                    <div class="s4a-tour-finale-title">Diagnostics</div>
                    <div class="s4a-tour-finale-pitch">Dig into centrality, clusters, and structure.</div>
                </button>
                <button type="button" class="s4a-tour-finale-card" data-lab="intervention">
                    <div class="s4a-tour-finale-title">Intervention</div>
                    <div class="s4a-tour-finale-pitch">Simulate a change and see how it propagates.</div>
                </button>
                <button type="button" class="s4a-tour-finale-card" data-lab="monitoring">
                    <div class="s4a-tour-finale-title">Monitoring</div>
                    <div class="s4a-tour-finale-pitch">Watch the factors that matter most.</div>
                </button>
            </div>
        ` : '';
        overlay.innerHTML = `
            <div class="s4a-tour-progress">Guided Tour &middot; ${index + 1} of ${total}</div>
            <div class="s4a-tour-say">${escapeHtml(step.say || '')}</div>
            ${finaleCards}
            <div class="s4a-tour-controls">
                <button type="button" class="s4a-compass-clear s4a-tour-back"${index === 0 ? ' disabled' : ''}>&larr; Back</button>
                <button type="button" class="s4a-tour-skip">Skip tour</button>
                <button type="button" class="s4a-tour-next">${isLast ? 'Finish' : 'Next \u2192'}</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.s4a-tour-back').addEventListener('click', prevTourStep);
        overlay.querySelector('.s4a-tour-skip').addEventListener('click', endTour);
        overlay.querySelector('.s4a-tour-next').addEventListener('click', nextTourStep);
        overlay.querySelectorAll('.s4a-tour-finale-card').forEach((card) => {
            card.addEventListener('click', () => {
                endTour();
                if (typeof window.switchLab === 'function') window.switchLab(card.dataset.lab);
            });
        });
    }

    function hideTourOverlay() {
        const existing = document.getElementById('s4a-tour-overlay');
        if (existing) existing.remove();
    }

    // ============================================
    // "Start from your angle" — relevance matcher (spec §5.8). A free-text
    // statement goes to the Concierge's single-call matcher (embeddings +
    // one LLM re-rank, no agent loop); each returned entry factor is a
    // button that seeds Compass on that factor, same contract as every
    // other action here.
    // ============================================
    function buildRelevanceWidget() {
        const wrap = document.createElement('div');
        wrap.className = 's4a-relevance-widget';
        wrap.innerHTML = `
            <p class="s4a-relevance-hint">Tell us what you care about, and we'll point you to where it connects in this map.</p>
            <textarea id="s4a-relevance-input" class="s4a-relevance-textarea" rows="2"
                placeholder="e.g. I work in emergency housing"></textarea>
            <button type="button" id="s4a-relevance-submit" class="s4a-compass-clear">Find my angle</button>
            <div id="s4a-relevance-results" class="s4a-relevance-results"></div>
        `;
        wrap.querySelector('#s4a-relevance-submit').addEventListener('click', submitRelevance);
        wrap.querySelector('#s4a-relevance-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitRelevance();
            }
        });
        return wrap;
    }

    function submitRelevance() {
        const input = document.getElementById('s4a-relevance-input');
        const resultsEl = document.getElementById('s4a-relevance-results');
        const statement = input ? input.value.trim() : '';
        if (!statement || !resultsEl || !state.systemId) return;

        resultsEl.innerHTML = '<div class="s4a-atlas-note">Looking for your angle...</div>';
        fetch('/api/concierge/relevance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ system_id: state.systemId, statement }),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`relevance request failed: ${res.status}`);
                return res.json();
            })
            .then((data) => renderRelevanceResults(data.entries || []))
            .catch(() => {
                resultsEl.innerHTML = '<div class="s4a-atlas-note">Could not find your angle right now — try again in a moment, or browse Atlas above.</div>';
            });
    }

    function renderRelevanceResults(entries) {
        const resultsEl = document.getElementById('s4a-relevance-results');
        if (!resultsEl) return;
        if (!entries.length) {
            resultsEl.innerHTML = '<div class="s4a-atlas-note">No strong matches found — try rephrasing, or browse Atlas above.</div>';
            return;
        }
        resultsEl.innerHTML = entries.map((entry, i) => `
            <button type="button" class="s4a-relevance-result" data-relevance-idx="${i}">
                <div class="s4a-relevance-result-name">
                    ${escapeHtml(entry.name || entry.factor_id)}${entry.district && entry.district.name
                        ? ` <span class="s4a-relevance-result-district">— ${escapeHtml(entry.district.name)}</span>`
                        : ''}
                </div>
                ${entry.why ? `<div class="s4a-relevance-result-why">${escapeHtml(entry.why)}</div>` : ''}
            </button>
        `).join('');
        resultsEl.querySelectorAll('[data-relevance-idx]').forEach((btn) => {
            const entry = entries[Number(btn.dataset.relevanceIdx)];
            btn.addEventListener('click', () => {
                showCone({ seedId: entry.factor_id, seedName: entry.name, direction: 'forward', depth: 2 });
            });
        });
    }

    // ============================================
    // Pathfinder — "from X to Y" (spec §5.6). Fully deterministic and
    // client-side: state.nodes/state.links already carry everything needed
    // (polarity, strength, delay, definition) to compute the induced path
    // and narrate each hop with a plain template, same "structured path
    // stays instant because it's precomputed" principle as Atlas/Landmarks.
    // ============================================
    function linkEndId(end) {
        return (end && typeof end === 'object' && end.id !== undefined) ? end.id : end;
    }

    /** Shortest directed hop-chain from fromId to targetId, following edge
     * direction (source -> target) only -- a causal "path" runs with the
     * arrows, not against them. Returns an ordered array of link objects,
     * or null if no such path exists. */
    function findDirectedPath(fromId, toId) {
        if (fromId === toId) return null;
        const adjacency = new Map();
        state.links.forEach((link) => {
            const s = linkEndId(link.source);
            if (!adjacency.has(s)) adjacency.set(s, []);
            adjacency.get(s).push(link);
        });

        const cameFrom = new Map();
        const visited = new Set([fromId]);
        const queue = [fromId];
        while (queue.length) {
            const current = queue.shift();
            if (current === toId) break;
            (adjacency.get(current) || []).forEach((link) => {
                const nextId = linkEndId(link.target);
                if (visited.has(nextId)) return;
                visited.add(nextId);
                cameFrom.set(nextId, { prevId: current, link });
                queue.push(nextId);
            });
        }
        if (!visited.has(toId)) return null;

        const path = [];
        let cur = toId;
        while (cur !== fromId) {
            const step = cameFrom.get(cur);
            path.unshift(step.link);
            cur = step.prevId;
        }
        return path;
    }

    function hopSentence(link) {
        const s = (typeof link.source === 'object' && link.source) || state.nodes.find((n) => n.id === link.source) || { name: String(link.source) };
        const t = (typeof link.target === 'object' && link.target) || state.nodes.find((n) => n.id === link.target) || { name: String(link.target) };
        const verb = String(link.type || '').toLowerCase() === 'opposite' ? 'less' : 'more';
        const tail = [link.strength, link.delay].filter(Boolean).join(', ');
        return {
            headline: `${s.name} &rarr; ${verb} ${t.name}${tail ? ` <span class="s4a-pathfinder-hop-meta">(${escapeHtml(tail)})</span>` : ''}`,
            definition: link.definition || '',
        };
    }

    function findFactorByName(query) {
        const q = String(query || '').trim().toLowerCase();
        if (!q) return null;
        return state.nodes.find((n) => String(n.name || '').toLowerCase() === q)
            || state.nodes.find((n) => String(n.name || '').toLowerCase().includes(q))
            || null;
    }

    function buildPathfinderWidget() {
        const wrap = document.createElement('div');
        wrap.className = 's4a-pathfinder-widget';
        const options = state.nodes.slice().sort(sortFactors)
            .map((n) => `<option value="${escapeHtml(n.name)}"></option>`).join('');
        wrap.innerHTML = `
            <p class="s4a-pathfinder-hint">Pick two factors to trace the causal path between them.</p>
            <datalist id="s4a-pathfinder-factors">${options}</datalist>
            <input type="text" id="s4a-pathfinder-from" class="s4a-relevance-textarea s4a-pathfinder-input"
                list="s4a-pathfinder-factors" placeholder="From factor...">
            <input type="text" id="s4a-pathfinder-to" class="s4a-relevance-textarea s4a-pathfinder-input"
                list="s4a-pathfinder-factors" placeholder="To factor...">
            <button type="button" id="s4a-pathfinder-find" class="s4a-compass-clear">Find path</button>
            <div id="s4a-pathfinder-result" class="s4a-pathfinder-result"></div>
        `;
        wrap.querySelector('#s4a-pathfinder-find').addEventListener('click', submitPathfinder);
        return wrap;
    }

    function submitPathfinder() {
        const fromInput = document.getElementById('s4a-pathfinder-from');
        const toInput = document.getElementById('s4a-pathfinder-to');
        const resultEl = document.getElementById('s4a-pathfinder-result');
        if (!fromInput || !toInput || !resultEl) return;

        const fromNode = findFactorByName(fromInput.value);
        const toNode = findFactorByName(toInput.value);
        if (!fromNode || !toNode) {
            resultEl.innerHTML = '<div class="s4a-atlas-note">Pick two factors from the list first.</div>';
            return;
        }
        if (fromNode.id === toNode.id) {
            resultEl.innerHTML = '<div class="s4a-atlas-note">Pick two different factors.</div>';
            return;
        }

        const path = findDirectedPath(fromNode.id, toNode.id);
        if (!path) {
            resultEl.innerHTML = `<div class="s4a-atlas-note">No causal path found from ${escapeHtml(fromNode.name)} to ${escapeHtml(toNode.name)} in this map.</div>`;
            return;
        }

        const hops = path.map(hopSentence);
        resultEl.innerHTML = `
            <div class="s4a-pathfinder-story">
                ${hops.map((hop) => `
                    <div class="s4a-pathfinder-hop">
                        <div class="s4a-pathfinder-hop-text">${hop.headline}</div>
                        ${hop.definition ? `<div class="s4a-pathfinder-hop-def">${escapeHtml(hop.definition)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            <button type="button" id="s4a-pathfinder-show" class="s4a-compass-clear">Show on map</button>
        `;
        resultEl.querySelector('#s4a-pathfinder-show').addEventListener('click', () => {
            const nodeIds = new Set([fromNode.id, toNode.id]);
            const linkSet = new Set(path);
            path.forEach((link) => {
                nodeIds.add(linkEndId(link.source));
                nodeIds.add(linkEndId(link.target));
            });
            setStructuralFocus('path', `${fromNode.id}::${toNode.id}`, nodeIds, linkSet);
            refreshFocusSections();
        });
    }

    // ============================================
    // Compass — causal-cone doors, ported from entry-modal.js, now inline
    // ============================================
    function buildCompassWidget() {
        const wrap = document.createElement('div');
        wrap.innerHTML = `
            <div class="s4a-compass-doors">
                <button type="button" class="s4a-compass-door" data-door="backward">
                    <div class="s4a-compass-door-title">🔎 What drives an outcome?</div>
                    <div class="s4a-compass-door-desc">Pick a factor and trace what causes it, upstream.</div>
                </button>
                <button type="button" class="s4a-compass-door" data-door="forward">
                    <div class="s4a-compass-door-title">🎯 What if we changed something?</div>
                    <div class="s4a-compass-door-desc">Pick a lever and trace where its effects spread, downstream.</div>
                </button>
            </div>
            <div class="s4a-compass-picker">
                <button type="button" class="s4a-compass-back">&larr; Back</button>
                <input type="text" class="s4a-compass-search" placeholder="Search factors...">
                <div class="s4a-compass-list"></div>
            </div>
            <button type="button" class="s4a-compass-clear" style="display:none;">Show full map</button>
        `;

        const doorsEl = wrap.querySelector('.s4a-compass-doors');
        const pickerEl = wrap.querySelector('.s4a-compass-picker');
        const listEl = wrap.querySelector('.s4a-compass-list');
        const searchEl = wrap.querySelector('.s4a-compass-search');
        const clearBtn = wrap.querySelector('.s4a-compass-clear');

        wrap.querySelectorAll('[data-door]').forEach((btn) => {
            btn.addEventListener('click', () => openPicker(btn.dataset.door));
        });
        wrap.querySelector('.s4a-compass-back').addEventListener('click', () => {
            pickerEl.style.display = 'none';
            doorsEl.style.display = 'flex';
        });
        clearBtn.addEventListener('click', clearQuestion);

        function openPicker(mode) {
            doorsEl.style.display = 'none';
            pickerEl.style.display = 'block';

            let candidates = state.nodes.slice();
            let usingFallback = false;
            if (mode === 'forward') {
                const intervenable = candidates.filter(isIntervenable);
                if (intervenable.length) {
                    candidates = intervenable;
                } else {
                    usingFallback = true;
                }
            }
            candidates.sort(sortFactors);

            const existingNote = pickerEl.querySelector('.s4a-compass-note');
            if (existingNote) existingNote.remove();
            if (usingFallback) {
                const note = document.createElement('div');
                note.className = 's4a-compass-note';
                note.textContent = 'No factors are marked intervenable in this map — showing all factors.';
                listEl.parentNode.insertBefore(note, listEl);
            }
            renderList(candidates, mode);

            searchEl.value = '';
            searchEl.oninput = () => {
                const query = searchEl.value.trim().toLowerCase();
                const filtered = query
                    ? candidates.filter((n) => String(n.name || '').toLowerCase().includes(query)
                        || String(n.domain || '').toLowerCase().includes(query))
                    : candidates;
                renderList(filtered, mode);
            };
        }

        function renderList(items, mode) {
            listEl.innerHTML = '';
            if (!items.length) {
                listEl.innerHTML = '<div class="s4a-compass-empty">No matching factors.</div>';
                return;
            }
            items.forEach((node) => {
                const item = document.createElement('div');
                item.className = 's4a-compass-list-item';
                item.innerHTML = `<span>${escapeHtml(node.name)}</span><span class="domain-tag">${escapeHtml(node.domain || '')}</span>`;
                item.addEventListener('click', () => {
                    showCone({ seedId: node.id, seedName: node.name, direction: mode, depth: 2 });
                    pickerEl.style.display = 'none';
                    doorsEl.style.display = 'flex';
                });
                listEl.appendChild(item);
            });
        }

        wrap._setClearVisible = (visible) => { clearBtn.style.display = visible ? 'inline-block' : 'none'; };
        return wrap;
    }

    function updateCompassClearButton() {
        const wrap = document.querySelector('#s4a-compass-section .filter-section-content > div');
        if (wrap && wrap._setClearVisible) wrap._setClearVisible(!!state.question);
    }

    // ============================================
    // Causal cone: depth-limited BFS over the already-rendered links
    // (ported unchanged from entry-modal.js)
    // ============================================
    function computeCone(seedId, links, mode, maxDepth) {
        const visited = new Map([[seedId, 0]]);
        const coneLinks = new Set();
        let frontier = [seedId];
        let depth = 0;

        while (frontier.length && depth < maxDepth) {
            const next = [];
            frontier.forEach((nodeId) => {
                links.forEach((link) => {
                    const sourceId = link.source && link.source.id !== undefined ? link.source.id : link.source;
                    const targetId = link.target && link.target.id !== undefined ? link.target.id : link.target;
                    if (mode === 'backward' && targetId === nodeId) {
                        coneLinks.add(link);
                        if (!visited.has(sourceId)) {
                            visited.set(sourceId, depth + 1);
                            next.push(sourceId);
                        }
                    } else if (mode === 'forward' && sourceId === nodeId) {
                        coneLinks.add(link);
                        if (!visited.has(targetId)) {
                            visited.set(targetId, depth + 1);
                            next.push(targetId);
                        }
                    }
                });
            });
            frontier = next;
            depth++;
        }

        return { nodeIds: new Set(visited.keys()), coneLinks };
    }

    /**
     * Action-layer entry point: show a causal cone. Callable from the Compass
     * picker (GUI) today, from applyViewState()/URL restore, and — eventually —
     * from an LLM/MCP bridge, all through this same plain data contract.
     */
    function showCone(opts) {
        const seedId = opts.seedId;
        if (seedId == null || typeof d3 === 'undefined') return;
        clearStructuralFocus();
        const direction = opts.direction || opts.mode || 'forward';
        const depth = opts.depth != null ? opts.depth : 2;
        const seedNode = state.nodes.find((n) => n.id === seedId);
        const seedName = opts.seedName || (seedNode ? seedNode.name : String(seedId));

        state.question = { mode: direction, seedId, seedName, depth };
        markChoiceMade();
        renderCone();
        showBanner();
        updateCompassClearButton();
        updateUrlState();
        refreshFocusSections();
    }

    function renderCone() {
        const q = state.question;
        if (!q) return;
        const maxDepth = q.depth === 'all' ? Infinity : q.depth;
        const { nodeIds, coneLinks } = computeCone(q.seedId, state.links, q.mode, maxDepth);

        d3.selectAll('.node')
            .classed('highlighted', (d) => nodeIds.has(d.id) && d.id !== q.seedId)
            .classed('dimmed', (d) => !nodeIds.has(d.id))
            .style('opacity', (d) => (nodeIds.has(d.id) ? 1 : 0.2));

        d3.selectAll('.node circle')
            .attr('r', (d) => (d.id === q.seedId ? 15 : (nodeIds.has(d.id) ? 12 : 10)));

        d3.selectAll('.node text')
            .style('font-size', (d) => (d.id === q.seedId ? '18px' : (nodeIds.has(d.id) ? '14px' : '12px')))
            .style('font-weight', (d) => (nodeIds.has(d.id) ? 'bold' : 'normal'));

        // stroke-opacity (not element opacity — that hides SVG markers) + explicit
        // marker-end, matching updateVisibility()'s reference pattern in app.html.
        d3.selectAll('.link')
            .classed('highlighted', (l) => coneLinks.has(l))
            .classed('dimmed', (l) => !coneLinks.has(l))
            .style('opacity', null)
            .style('stroke-opacity', (l) => (coneLinks.has(l) ? 1 : 0.08))
            .style('marker-end', (l) => (coneLinks.has(l)
                ? `url(#arrow-${l.type}-${l.strength})`
                : 'none'))
            .style('pointer-events', (l) => (coneLinks.has(l) ? 'auto' : 'none'));

        if (typeof window.resetView === 'function') {
            window.resetView((d) => nodeIds.has(d.id));
        }
    }

    function clearQuestion() {
        state.question = null;
        clearStructuralFocus();
        hideBanner();
        updateCompassClearButton();
        if (typeof window.resetFilters === 'function') window.resetFilters();
        if (typeof window.resetView === 'function') window.resetView();
        updateUrlState();
        refreshFocusSections();
    }

    // ============================================
    // Question banner (persists regardless of active lab)
    // ============================================
    function showBanner() {
        hideBanner();
        const q = state.question;
        if (!q) return;

        const banner = document.createElement('div');
        banner.id = 's4a-question-banner';
        banner.className = 's4a-question-banner';

        const dirLabel = q.mode === 'backward' ? 'upstream' : 'downstream';
        const questionText = q.mode === 'backward'
            ? `What drives <strong>${escapeHtml(q.seedName)}</strong>?`
            : `What if we changed <strong>${escapeHtml(q.seedName)}</strong>?`;
        const depthLabel = q.depth === 'all'
            ? `all reachable ${dirLabel}`
            : `${q.depth} step${q.depth === 1 ? '' : 's'} ${dirLabel}`;

        banner.innerHTML = `
            <span class="s4a-question-text">${questionText}</span>
            <span class="s4a-question-depth-label">${depthLabel}</span>
            <span class="s4a-depth-chips">
                ${[1, 2, 3, 'all'].map((d) => `<button type="button" class="depth-chip${q.depth === d ? ' active' : ''}" data-depth="${d}">${d === 'all' ? 'All' : d}</button>`).join('')}
            </span>
            <button type="button" class="s4a-explain-cone">Explain this</button>
            ${q.mode === 'forward' ? '<button type="button" class="s4a-handoff-btn s4a-simulate-change">Simulate this change &rarr;</button>' : ''}
            <button type="button" class="s4a-show-full-map">Show full map &times;</button>
        `;
        document.body.appendChild(banner);

        banner.querySelectorAll('.depth-chip').forEach((btn) => {
            btn.addEventListener('click', () => {
                const raw = btn.getAttribute('data-depth');
                state.question.depth = raw === 'all' ? 'all' : parseInt(raw, 10);
                renderCone();
                showBanner();
                updateUrlState();
            });
        });
        banner.querySelector('.s4a-explain-cone').addEventListener('click', explainCone);
        const simulateBtn = banner.querySelector('.s4a-simulate-change');
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => {
                handoffToIntervention(q.seedId, q.seedName, { fromCone: true });
            });
        }
        banner.querySelector('.s4a-show-full-map').addEventListener('click', clearQuestion);
    }

    function hideBanner() {
        const existing = document.getElementById('s4a-question-banner');
        if (existing) existing.remove();
        hideNarratePanel();
    }

    // ============================================
    // "Narrate this cone" (spec §5.6) — one Concierge call over the exact
    // edges this cone already highlights on screen. The first
    // structured→chat bridge users meet: everything up to this point is
    // precompiled/deterministic, this one button hands a real (but tightly
    // scoped) LLM call the same edges a human sees.
    // ============================================
    function coneEdgesForNarration(q) {
        const maxDepth = q.depth === 'all' ? Infinity : q.depth;
        const { coneLinks } = computeCone(q.seedId, state.links, q.mode, maxDepth);
        return Array.from(coneLinks).map((l) => {
            const resolve = (end) => (typeof end === 'object' && end
                ? end
                : (state.nodes.find((n) => n.id === end) || { id: end, name: String(end) }));
            const s = resolve(l.source);
            const t = resolve(l.target);
            return {
                source_id: String(s.id), source_name: s.name || String(s.id),
                target_id: String(t.id), target_name: t.name || String(t.id),
                polarity: l.type || '', strength: l.strength || '', delay: l.delay || '', definition: l.definition || '',
            };
        });
    }

    function explainCone() {
        const q = state.question;
        if (!q) return;
        const edges = coneEdgesForNarration(q);
        renderNarratePanel('<div class="s4a-atlas-note">Writing an explanation...</div>');
        if (!edges.length) {
            renderNarratePanel('<div class="s4a-atlas-note">Nothing to explain yet — widen the depth first.</div>');
            return;
        }
        fetch('/api/concierge/narrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seed_name: q.seedName, direction: q.mode, edges }),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`narrate request failed: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                const text = escapeHtml(data.narrative || '').replace(/\n/g, '<br>');
                renderNarratePanel(`<button type="button" class="s4a-narrate-close">&times;</button><div class="s4a-narrate-text">${text}</div>`);
            })
            .catch(() => {
                renderNarratePanel('<div class="s4a-atlas-note">Could not write an explanation right now — try again in a moment.</div>');
            });
    }

    function renderNarratePanel(html) {
        let panel = document.getElementById('s4a-narrate-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 's4a-narrate-panel';
            panel.className = 's4a-narrate-panel';
            document.body.appendChild(panel);
        }
        panel.innerHTML = html;
        const closeBtn = panel.querySelector('.s4a-narrate-close');
        if (closeBtn) closeBtn.addEventListener('click', hideNarratePanel);
    }

    function hideNarratePanel() {
        const existing = document.getElementById('s4a-narrate-panel');
        if (existing) existing.remove();
    }

    // ============================================
    // Lab-switch hook (called by app.html's global switchLab())
    // ============================================
    function onLabSwitch(labMode) {
        if (!state._preserveSeedOnNextLabSwitch) state.pendingSeed = null;
        updateDistrictHulls();
        updateLandmarkOverlays();
        updateUrlState();
    }

    // ============================================
    // Lab handoff doors (spec §7): "Where do I go next?" -- every structured
    // tool ends in a door into Diagnostics/Intervention/Monitoring, using
    // the existing switchLab + ?view= plumbing plus one small seed object
    // that lab reads on activation (see app.html's SIM4ActionLabSeed).
    // Deliberately minimal: Orient hands off, it doesn't reach into those
    // labs' internals.
    // ============================================
    function handoffTo(lab, seed) {
        state._preserveSeedOnNextLabSwitch = true;
        if (typeof window.switchLab === 'function') window.switchLab(lab);
        state._preserveSeedOnNextLabSwitch = false;
        state.pendingSeed = seed || null;
        if (typeof window.SIM4ActionLabSeed === 'function') window.SIM4ActionLabSeed(lab, seed || null);
        updateUrlState();
    }

    /** "Analyze this factor" (landmark panel) -> Diagnostics, centrality view seeded. */
    function handoffToDiagnostics(factorId, name) {
        handoffTo('diagnostics', { factorId, name, kind: 'centrality' });
    }

    /** "Test this loop" (loop story) / "Simulate this change" (forward cone)
     * -> Intervention, entry factor pre-selected as the scenario source. */
    function handoffToIntervention(factorId, name, context) {
        handoffTo('intervention', { factorId, name, kind: 'scenario', context: context || null });
    }

    /** "Watch this coupling" (fragile bridge) -> Monitoring, sentinel recommendation seeded. */
    function handoffToMonitoring(bridge) {
        const clusters = (state.orientation && state.orientation.clusters) || [];
        const districtNames = (bridge.districts || []).map((id) => {
            const c = clusters.find((cc) => cc.id === id);
            return c ? c.name : `District ${id}`;
        });
        const firstEdge = (bridge.edges || [])[0] || [];
        handoffTo('monitoring', {
            factorId: firstEdge[0], secondFactorId: firstEdge[1], districts: districtNames, kind: 'sentinel',
        });
    }

    // ============================================
    // Action-layer dispatch table — the same named actions the compiled
    // Guided Tour emits (see sim4action-mcp/compiler.py `_build_tour_plan`)
    // and, eventually, the Concierge's `ui_apply_view` tool (spec §6.4).
    // Every entry is a GUI-clickable, URL-serializable, replayable action —
    // "the LLM has no privileged UI powers" is enforced by this being the
    // *only* way any of them get invoked.
    // ============================================
    const ACTIONS = {
        focusCluster: (params) => focusCluster(params.clusterId),
        focusDistrict: (params) => enterDistrict(params.clusterId),
        highlightLandmark: (params) => highlightLandmark(params.factorId),
        showLoop: (params) => showLoop(params.loopId),
        showBridge: (params) => showBridge(params.bridgeIndex),
        showCone: (params) => showCone(params),
        clearQuestion: () => clearQuestion(),
    };

    function applyAction(action) {
        if (!action || !action.type) return;
        const fn = ACTIONS[action.type];
        if (fn) fn(action.params || {});
    }

    function structuralFocusToAction(focus) {
        if (!focus) return null;
        if (focus.type === 'district') return { type: 'focusDistrict', params: { clusterId: focus.id } };
        if (focus.type === 'bridge') return { type: 'showBridge', params: { bridgeIndex: focus.id } };
        if (focus.type === 'loop') return { type: 'showLoop', params: { loopId: focus.id } };
        return null;
    }

    // ============================================
    // URL-serializable view state
    // ============================================
    function serializeViewState() {
        const view = {
            lab: document.body.dataset.activeLab || 'sensemaking',
            q: state.question
                ? { mode: state.question.mode, seedId: state.question.seedId, depth: state.question.depth }
                : null,
        };
        // Touring is self-sufficient (the step's action is re-applied on
        // restore) — skip serializing the other, now-redundant focus keys.
        if (state.tourIndex != null) {
            view.tour = state.tourIndex;
            return view;
        }
        if (state.selectedClusterId != null) view.district = state.selectedClusterId;
        if (state.selectedLandmarkId != null) view.highlight = state.selectedLandmarkId;
        const action = structuralFocusToAction(state.structuralFocus);
        if (action) view.action = action;
        if (state.pendingSeed) view.seed = state.pendingSeed;
        return view;
    }

    function updateUrlState() {
        try {
            const params = new URLSearchParams(window.location.search);
            params.set('view', JSON.stringify(serializeViewState()));
            const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
            window.history.replaceState(null, '', newUrl);
        } catch (e) { /* URL update is best-effort */ }
    }

    /**
     * Action-layer entry point: reproduce a view from a plain state object,
     * whether it came from the initial URL, a shared link, or — eventually —
     * a tool call.
     */
    function applyViewState(viewState) {
        if (!viewState) return;
        if (viewState.lab && typeof window.switchLab === 'function') {
            window.switchLab(viewState.lab);
        }
        if (viewState.seed) {
            state.pendingSeed = viewState.seed;
            if (typeof window.SIM4ActionLabSeed === 'function') {
                window.SIM4ActionLabSeed(viewState.lab || document.body.dataset.activeLab, viewState.seed);
            }
        }
        if (viewState.tour != null) {
            startTour(viewState.tour);
            return;
        }
        if (viewState.q && viewState.q.seedId != null) {
            showCone({ seedId: viewState.q.seedId, direction: viewState.q.mode, depth: viewState.q.depth });
            return;
        }
        if (viewState.action) {
            applyAction(viewState.action);
            return;
        }
        if (viewState.district != null) focusCluster(viewState.district);
        if (viewState.highlight != null) highlightLandmark(viewState.highlight);
    }

    function applyInitialUrlState() {
        try {
            const raw = new URLSearchParams(window.location.search).get('view');
            if (!raw) return;
            applyViewState(JSON.parse(raw));
        } catch (e) { /* malformed/ignored — falls back to default declutter behavior */ }
    }

    function getViewState() {
        return serializeViewState();
    }

    window.SIM4ActionSensemaking = {
        init,
        onLabSwitch,
        showCone,
        clearQuestion,
        focusCluster,
        focusDistrict: enterDistrict,
        enterDistrict,
        highlightLandmark,
        showBridge,
        showLoop,
        startTour,
        nextTourStep,
        prevTourStep,
        endTour,
        applyAction,
        applyViewState,
        getViewState,
        handoffToDiagnostics,
        handoffToIntervention,
        handoffToMonitoring,
    };
})();
