# Sensemaking Lab — Scope & Specification

**Status:** Draft v1 · Aug 2026
**Applies to:** `platform/sensemaking-lab.js` (Orient lab), `sim4action-mcp` (sibling repo), new Concierge service
**Supersedes:** the "Sensemaking Lab Spine" plan referenced in code comments (this document absorbs and extends it)

---

## 1. Purpose

A newcomer facing an unfamiliar complex system needs, in rough order:

1. **What is this?** — identity
2. **What is it made of?** — structure
3. **How does it behave?** — dynamics
4. **What do I care about here?** — relevance
5. **Where do I go next?** — handoff into Diagnostics / Intervention / Monitoring

The platform currently answers none of these before showing everything. The Sensemaking Lab's job is to answer them, in that order, before the full network ("horrendogram") is ever the default view.

### 1.1 Design anchor: legibility (Lynch, *The Image of the City*)

Environments are navigable when they are **legible**: people perceive landmarks, districts, paths, and edges before grasping the whole. This maps onto causal maps directly, and every tool in the lab serves exactly one Lynch primitive — that is the coherence test for scope. If a proposed feature doesn't serve a primitive (or one of the two cross-cutting principles below), it doesn't belong in this lab.

| Lynch primitive | Causal-map equivalent | Lab tool |
|---|---|---|
| Landmarks | Hub & focal factors | **Landmarks** (new) |
| Districts | Communities | **Atlas** (exists, v1 → v2) |
| Paths | Causal chains | **Compass** (exists) + **Pathfinder** (new) |
| Edges | Weak couplings between subsystems | **Bridges** (new) |

Two cross-cutting principles:

- **Narrative is a first-class format, not decoration.** Humans encode causal knowledge natively as story. Every structural artifact (district, landmark, loop, path) ships with a short LLM-written narrative, grounded in map data and cited back to factor/edge IDs.
- **Dialogue is the universal fallback.** When no tool fits the question, the user asks the **Sim4Action Concierge** — a live chat agent that calls the same tools the GUI does, plus the analysis MCP and web search.

### 1.2 The two interaction modes

1. **Structured sensemaking** — precomputed, curated, deterministic-feeling. Artifacts compiled once per map version (LLM-assisted offline), rendered instantly in the browser. This is the default path for the five questions.
2. **Live chat (Concierge)** — an agent loop against a local LLM (Ollama on the 64 GB Mac mini) with tool access to the Sim4Action MCP, UI-control actions, and web search. This is the fallback and the power path.

The two modes share one action layer: everything the Concierge can do to the view, a GUI click can do, and vice versa (already established by `showCone` / `focusCluster` / `applyViewState` in `sensemaking-lab.js`).

---

## 2. Current state (what exists)

- **Frontend:** vanilla JS SPA (`platform/app.html`, ~16k lines, D3 + Pyodide). Four labs: Orient (`sensemaking`), Diagnostics, Intervention, Monitoring. The Orient lab (`platform/sensemaking-lab.js`, ~708 lines) already ships:
  - **Atlas v1** — district hulls + list from `systems/{id}/orientation.json` (artifact not yet compiled for shipped systems).
  - **Compass** — upstream/downstream causal-cone doors with depth chips and a persistent question banner.
  - **Action contract** — `showCone`, `focusCluster`, `clearQuestion`, `applyViewState`, `getViewState` on `window.SIM4ActionSensemaking`; URL-serializable view state (`?view=`).
- **Backend:** stdlib Python HTTP server (`platform/server.py`, port 8000) — static files + small REST API (catalogue, auth, system CRUD). No websockets. Map data lives in **Google Sheets**, fetched by the browser directly.
- **MCP server:** sibling repo `sim4action-mcp` — Python FastMCP, stdio or Streamable HTTP (`:8001/mcp`), **53 tools** (graph queries, loops, centrality, communities, paths, diffusion, atlas comparisons, narrative payloads, renderers). Reads the same Google Sheets with a 5-min TTL cache. Health check at `/healthz`.
- **LLM:** the orientation compiler (`sim4action-mcp/scripts/compile_orientation.py`) uses Anthropic Claude; `OllamaBackend` in `llm_backend.py` is a stub (default host `http://MacMini_AI_Server:11434`). No in-app chat anywhere.

---

## 3. Target architecture

```
Browser (app.html + sensemaking-lab.js)
 │  static artifacts: systems/{id}/orientation.json  (v2, compiled)
 │  chat: SSE stream  /api/concierge/*
 ▼
nginx (Mac mini) ────────────────────────────────────────────────
 ├── :8000  platform/server.py      static + catalogue/auth API
 ├── :8010  Concierge service (new) agent loop, SSE, session state
 │            │
 │            ├── Ollama            http://127.0.0.1:11434  (local LLM, tool calling)
 │            ├── Sim4Action MCP    http://127.0.0.1:8001/mcp  (Streamable HTTP client)
 │            └── Web search        SearXNG (self-hosted) or Tavily/Brave API
 └── :8001  sim4action-mcp          53 analysis tools (existing)

Offline / per-map-version:
 compile_orientation.py (extended) ──uses──> Ollama (or Anthropic) + MCP analysis
                                   ──emits──> systems/{id}/orientation.json  v2
```

### 3.1 Component decisions

| Decision | Choice | Rationale / alternative |
|---|---|---|
| Where the agent loop lives | **New Concierge service** (Python, FastAPI, port 8010) in the `sim4action-mcp` repo (`sim4action_concierge/` package) | `server.py` is stdlib `http.server` — no async, no SSE ergonomics, and keeping it dumb-static is a virtue. The MCP repo already has Sheets access, graph code, and the LLM backend abstraction to reuse. Alternative (extend `server.py`) rejected: would drag asyncio + MCP client + streaming into a deliberately minimal file server. |
| Browser ↔ Concierge transport | **SSE** (POST message → stream events), session id in cookie/localStorage | No websocket infra exists; SSE is enough for one-directional token/action streams and plays well with nginx. |
| LLM runtime | **Ollama** on the Mac mini (64 GB unified memory), LAN-reachable, OpenAI-compatible `/v1` or native `/api/chat` with `tools` | Already the declared target; `OllamaBackend` stub exists and gets implemented as part of this scope. |
| Default model | **`qwen3:32b`** (Q4, ~20 GB) — strong tool calling, leaves ~40 GB headroom for Ollama KV cache + the rest of the machine's services | Fast option: `gpt-oss:20b` (~14 GB) for snappier chat. Quality option: `llama3.3:70b-q4` (~40 GB) — fits but slower and tighter alongside nginx/postgres/minio already on this host; not the default. Model name is config, not code. |
| Web search | **SearXNG** self-hosted on the mini (JSON API), exposed to the agent as one `web_search` tool + one `fetch_page` tool | Local-first, no API key, no per-query cost. Fallback config option: Tavily or Brave Search API key if SearXNG result quality disappoints. |
| Tool surface for the LLM | **Curated profile of ~15 tools**, not all 53 | 32B-class local models degrade badly with 50+ tool schemas in context. See §6.3. |
| Structured artifacts | **Compiled offline** into `orientation.json` v2, served statically | Keeps the newcomer path instant and deterministic; the LLM's variance is spent at compile time, reviewed before publish, not at page load. |

---

## 4. The five questions → feature map

| # | Question | Feature | Mode |
|---|---|---|---|
| 1 | What is this? | **Map Card** (identity header) | structured |
| 2 | What is it made of? | **Atlas v2** (districts) + **Landmarks** + **Bridges** | structured |
| 3 | How does it behave? | **Dynamics panel** (named loops + stories) | structured |
| 4 | What do I care about? | **"Start from your angle"** relevance matcher | LLM live (cheap) |
| 5 | Where do I go next? | **Guided Tour** + per-tool handoff links into other labs | structured |
| — | Anything else | **Concierge chat** | LLM live (agentic) |

---

## 5. Structured sensemaking — feature specs

All structured features render from `orientation.json` v2 (schema in §5.7) and degrade gracefully when the artifact is missing (current Atlas v1 behavior: a "not compiled yet" note, Compass still works).

### 5.1 Map Card — *identity*

First thing rendered in the Orient sidebar, above Atlas.

- **Headline** (≤ 15 words): what system this map describes, e.g. "How housing insecurity, service access and health outcomes interact in regional NSW".
- **Body** (≤ 60 words): scope, provenance (workshop / gen-AI / literature), what the focal factors are and why.
- **Vitals row:** factor count, edge count, district count, loop count, dominant delay scale — each a plain number with a label, no jargon.
- **Provenance chip:** compiled date + model + "compiled from N factors / M edges" so users know it's a generated summary.

*Acceptance:* a first-time viewer can say what the map is about within 15 seconds without opening the graph.

### 5.2 Atlas v2 — *districts* (Lynch: districts)

Extends Atlas v1 (hulls + list) with per-district meaning:

- Each district gets an LLM-written **name** (2–4 words, already in v1 schema) and **one-sentence summary** (new), plus its 1–3 **landmark factors** flagged in the list.
- Clicking a district focuses it (exists) **and** shows its summary + "enter this district" affordance that filters the graph to the district and its boundary edges.
- District list is ordered by size or by a compiled "start here" ordering (tour order), not arbitrary community index.

### 5.3 Landmarks — *hubs and focal factors* (Lynch: landmarks)

New sidebar section listing 5–8 factors chosen at compile time by blending: focal-factor domain membership, degree/betweenness centrality, and diffusion influence (AUC ranking tool already exists in MCP).

- Each landmark: name, **why it matters** (one LLM sentence citing its structure — "touches 4 of 5 districts", "most upstream driver of X"), district membership, and metric chips (degree, betweenness).
- Clicking a landmark: highlights it on the map with a halo, opens a mini panel with its definition + neighbors, and offers the two Compass doors pre-seeded ("What drives this?" / "What does this affect?").
- Landmarks are always visible on the map in Orient (larger node + label persists even when zoomed out) — they are the fixed reference points for navigation, exactly Lynch's role for them.

### 5.4 Bridges — *weak couplings between subsystems* (Lynch: edges)

New sidebar section surfacing the inter-district structure:

- Lists district pairs with their connecting edges (usually few — that's the point), each with an LLM sentence: "Housing pressure reaches the health district only through *Chronic stress* (V23)".
- Clicking a bridge shows just the two districts + connecting edges (submap view), dimming everything else.
- Flags **cut vertices / fragile couplings** (from the existing `get_vulnerability_analysis` MCP tool at compile time) with a subtle warning marker — these are natural handoffs to the Monitoring lab.

### 5.5 Dynamics panel — *how it behaves*

- Shows 3–5 **named feedback loops** selected at compile time (shortest + highest-betweenness loops, mix of reinforcing/balancing), each with: a name ("The burnout spiral"), type badge (R/B), the factor chain, and a 2–3 sentence **story** written from the edge `definition` fields.
- Clicking a loop animates it on the map (highlight edges in sequence) and offers "test this loop" → deep link into Intervention lab with the loop's entry factor pre-selected.
- One headline sentence above the loops: the compiled overall dynamic character ("This system is dominated by reinforcing housing–health spirals, checked by two slow balancing loops through service capacity").

### 5.6 Pathfinder & Compass v2 — *paths*

Compass (doors + cones) stays as-is. Additions:

- **Pathfinder:** pick two factors ("from X to Y") → renders the induced path subgraph (existing `get_submap_between` logic, ported or precomputed client-side) with a step-by-step **path story**: each hop narrated with polarity and delay ("More X → less Y (strong, months)…"). Paths are the unit of causal narrative — this is where "stories are first-class" bites hardest.
- **Narrate this cone:** any active Compass cone gets a "explain this" button → one Concierge call (§6) that writes a grounded paragraph from the cone's edges. This is the first structured→chat bridge users meet.

### 5.7 Guided Tour — *handoff, and the first five minutes*

A compiled, replayable sequence of 5–8 steps, each `{ say, action }` where `action` is a call into the existing action layer (`focusCluster`, `showCone`, highlight landmark, …).

- Canonical arc: identity → biggest district → a landmark → one reinforcing loop → a bridge → "where to go next" (the three other labs, each with a one-line pitch and a deep link carrying view state via the existing `?view=` mechanism).
- Rendered as a stepper overlay ("1 of 7 · Next"), skippable, resumable, URL-addressable (`?view={"tour":3}`).
- Auto-offered on first visit to a system (localStorage flag), available afterwards from the sidebar.

*Acceptance:* a newcomer who takes the tour can, unprompted, name the map's topic, two districts, one landmark, and one loop.

### 5.8 "Start from your angle" — *relevance*

The one structured feature that runs a live LLM call (single, cheap, no agent loop):

- Free-text input: "I work in emergency housing" / "I care about youth mental health".
- Concierge endpoint matches the statement against factor names/definitions + district summaries (embedding similarity via Ollama embeddings, LLM re-rank of top candidates) and returns: 2–3 **entry factors**, their districts, and a sentence each on why they're relevant.
- Each result is a button that seeds Compass or focuses the district.

### 5.9 `orientation.json` v2 schema

```jsonc
{
  "version": 2,
  "system_id": "…",
  "generated_at": "2026-08-25T…",
  "compiler": { "model": "qwen3:32b", "mcp_rev": "…" },

  "identity": {
    "headline": "…", "summary": "…",
    "provenance": "workshop|gen_ai|literature",
    "focal_factor_ids": ["V1"]
  },

  "districts": [{
    "id": 0, "name": "…", "summary": "…",
    "size": 12, "factor_ids": ["V1", "…"],
    "landmark_ids": ["V3"]
  }],

  "landmarks": [{
    "factor_id": "V3", "why": "…",
    "metrics": { "degree": 14, "betweenness": 0.31, "diffusion_auc_rank": 2 }
  }],

  "bridges": [{
    "districts": [0, 2],
    "edge_ids": [["V3","V17"]],
    "summary": "…", "fragile": true
  }],

  "dynamics": {
    "headline": "…",
    "loops": [{
      "id": "L1", "name": "…", "type": "reinforcing",
      "factor_ids": ["V3","V7","V3"], "story": "…"
    }]
  },

  "tour": [{ "step": 1, "say": "…", "action": { "type": "focusCluster", "params": { "clusterId": 0 } } }],

  "vitals": { "factors": 62, "edges": 141, "districts": 5, "loops": 23, "dominant_delay": "months" }
}
```

Backward compatibility: v1 files (only `summary` + `clusters`) keep working — Atlas v1 rendering path stays; new sections render only when their keys exist.

### 5.10 Compiler changes (`sim4action-mcp`)

- Implement **`OllamaBackend`** in `llm_backend.py` (native `/api/chat` with forced tool call for structured output; same interface as the Anthropic backend). Anthropic stays available via env for higher-quality compiles.
- Extend `compile_orientation.py` to emit the v2 schema: reuse existing MCP internals (`get_clusters`, `get_centrality`, `get_feedback_loops`, `get_vulnerability_analysis`, `get_diffusion_influence_ranking`) as Python calls, then one LLM pass per artifact section with the numbers already computed — the LLM names and narrates, it never invents structure.
- Add `--publish` flag that writes into `systems/{id}/orientation.json` in the platform tree, plus a `compiled_from` hash of the sheet rows so staleness is detectable (`get_system_info` counts vs. artifact hash → UI shows "map changed since compile" note).

---

## 6. Sim4Action Concierge — live chat spec

### 6.1 Product behavior

- Chat panel in the Orient sidebar (collapsible section, like Atlas/Compass), expandable to a wider docked drawer. Available from all four labs (persistent, like the question banner), but introduced in Orient.
- Scope of a session: the current system. The system id, map vitals, and the `orientation.json` identity block are injected into the system prompt — the Concierge never has to "discover" which map it's on.
- **It can drive the view.** When the Concierge answers "what drives housing stress?", it also *shows* it — emits a UI action that runs `showCone` — with a one-line caption of what changed. Talk and show, always both.
- **Grounding contract:** every causal claim must cite factor/edge IDs from tool results, rendered as chips (`Chronic stress · V23`) that highlight the node on hover and focus on click. If the model asserts something it didn't retrieve, the service's post-check strips/flags the sentence (see 6.5). Web results are cited with linked domains.
- Suggested prompts seeded from the artifact ("Tell me the story of the burnout spiral", "What connects housing and health here?", "What's changed in the evidence on X since this map was built?" → web search).
- Honest fallback: if the tool loop fails or the model can't answer, say so and offer the structured tools instead. Never fabricate a map fact.

### 6.2 Service design (`sim4action_concierge`, port 8010)

- **FastAPI + `mcp` Python client SDK** (Streamable HTTP to `:8001/mcp`) + Ollama client. Sessions in memory (dict, TTL) — same durability posture as the platform's auth sessions; no DB.
- Endpoints:
  - `POST /api/concierge/session` → `{ session_id }` (body: `system_id`, optional user role from platform auth)
  - `POST /api/concierge/message` → SSE stream of events:
    - `token` (assistant text delta)
    - `tool_call` / `tool_result` (name + compact summary for the activity indicator, "Checked feedback loops…")
    - `ui_action` (see 6.4)
    - `citation` (factor/edge/url references for chip rendering)
    - `done` / `error`
  - `POST /api/concierge/relevance` — the single-call matcher behind §5.8
  - `POST /api/concierge/narrate` — the single-call "narrate this cone/path" behind §5.6
  - `GET /healthz`
- Agent loop: standard tool-calling loop, hard caps (max 6 tool rounds, 60 s wall clock, 20k-token context budget with oldest-turn eviction). Tool results are compacted (the MCP already paginates at 10 items) before re-entering context.
- nginx routes `/api/concierge/` → `:8010`; auth enforced by forwarding the platform session cookie to `server.py`'s `/api/auth/status` once per session.

### 6.3 Tool profile (the ~15 the model actually sees)

Local 32B-class models degrade with 50+ tool schemas; the Concierge exposes a curated profile, with the MCP's remaining tools reachable only through compile-time workflows:

| Group | Tools |
|---|---|
| Orientation | `get_system_info`, `get_graph_summary`, `get_factors` (search-by-name variant), `get_factor_neighbors` |
| Structure | `get_centrality`, `get_community_analysis` |
| Paths | `get_shortest_path`, `get_all_paths`, `get_upstream_paths`, `get_downstream_paths` |
| Dynamics | `get_feedback_loops_for_factor`, `run_diffusion_scenario` |
| World | `web_search`, `fetch_page` |
| View control | `ui_apply_view` (§6.4) |

Two profiles ship: **orient** (the above) and **analyst** (adds vulnerability, motifs, atlas comparisons) selectable in the drawer for power users. Profile definitions live in Concierge config, not in the MCP server.

### 6.4 UI action bridge

One tool, `ui_apply_view(view_state, caption)`, whose `view_state` is exactly the existing serializable format (`{lab, q}` today; extended with `district`, `highlight`, `tour` keys as §5 features land). The service validates it against a JSON Schema, streams it as a `ui_action` event, and the frontend routes it through `SIM4ActionSensemaking.applyViewState` — the same function the URL restore uses. New frontend actions added for §5 (focus district with summary, highlight landmark, animate loop) register in the same contract.

This keeps the invariant: **the LLM has no privileged UI powers** — anything it does is a named, replayable, URL-serializable action a human could click.

### 6.5 Grounding post-check

Cheap, deterministic guard between model output and the stream: extract factor names/IDs mentioned in the reply; any factor-like claim whose ID doesn't appear in this turn's tool results or the injected artifact gets flagged inline ("⚠ not verified against the map"). No second LLM pass in v1 — string/ID matching only. Revisit if flag noise is high.

### 6.6 Web search

- SearXNG in Docker on the mini (it already runs a Docker bring-up via launchd); Concierge calls its JSON API. `web_search(query, recency?)` returns title/url/snippet ×5; `fetch_page(url)` returns readable-text extraction, truncated to ~4k tokens.
- Search exists to connect map to world: "what does recent evidence say about this factor", "find policies targeting this lever". The system prompt instructs: map questions → MCP tools first; world questions → search; never substitute search for map structure.

---

## 7. Handoff into the other labs (question 5)

Every structured tool ends in a door, using existing `switchLab` + `?view=` deep links:

| From | Handoff |
|---|---|
| Landmark panel | "Analyze this factor" → Diagnostics (centrality view seeded) |
| Loop story | "Test this loop" → Intervention (entry factor pre-selected for a scenario) |
| Bridge (fragile) | "Watch this coupling" → Monitoring (sentinel recommendation seeded) |
| Compass cone (forward) | "Simulate this change" → Intervention with the seed as the scenario source |
| Tour final step | Cards for all three labs with one-line pitches |

Requires small receiving-side additions in each lab (read seed from view state on activation) — kept minimal, one seed parameter per lab in this scope.

---

## 8. Delivery phases

Each phase is independently shippable; structured features never block on the Concierge.

**Phase 0 — Substrate (infra, ~1 wk)**
Ollama installed on the mini with `qwen3:32b` + an embedding model, launchd-managed like the other services; MCP server running in HTTP mode as a service; implement `OllamaBackend`; Concierge service skeleton (session, SSE echo, healthz); nginx routes.
*Done when:* `curl` round-trip browser→concierge→ollama→MCP tool→SSE works on the LAN.

**Phase 1 — Legibility artifact + structured UI (~2–3 wks)**
Compiler v2 (§5.10) run against 2–3 flagship systems; Map Card, Atlas v2, Landmarks, Bridges, Dynamics panel in `sensemaking-lab.js`; graceful v1/missing-artifact degradation.
*Done when:* the §5.1 and §5.7 acceptance tests pass with a real newcomer on a flagship map.

**Phase 2 — Concierge MVP (~2–3 wks)**
Chat drawer; agent loop with the orient tool profile; UI action bridge; grounding post-check; citation chips; suggested prompts.
*Done when:* "what drives X?", "tell me the story of loop L1", and "show me the housing district" each produce a correct grounded answer **and** the right view change, ≥ 8/10 attempts on the flagship maps.

**Phase 3 — Tour, relevance, world (~2 wks)**
Guided Tour stepper (compiled steps + overlay); "Start from your angle" matcher; SearXNG + web tools; lab handoff seeds (§7); Pathfinder + "narrate this cone".

**Phase 4 — Hardening (ongoing)**
Small eval set (20 canned questions per flagship map with expected tool calls/factors, run on model or prompt changes); latency budget (first token < 3 s, tool round < 10 s — else swap to `gpt-oss:20b` for chat and keep 32B for compiles); artifact staleness indicator; analyst tool profile.

---

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Local model tool-calling reliability (wrong args, skipped calls) | Curated 15-tool profile; JSON-schema validation with one retry-with-error; forced tool choice for `relevance`/`narrate` endpoints; eval set in Phase 4; model is config — can swap up to 70B or out to Anthropic per-deployment. |
| Hallucinated map facts | Grounding contract + post-check (§6.5); compile-time LLM only names/narrates precomputed structure, never invents it. |
| Latency on 32B (multi-round loops) | Hard caps; streaming with tool-activity indicators; fast-model option; structured path stays instant because it's precompiled. |
| 64 GB contention (Ollama beside nginx/postgres/minio/docker on the same mini) | `OLLAMA_MAX_LOADED_MODELS=1`, keep-alive tuning, Q4 quant, memory headroom check in Phase 0; embedding model is tiny. |
| Sheets rate limits under chat load | MCP's existing 5-min TTL cache absorbs it; Concierge never hits Sheets directly. |
| Artifact drift after map edits | `compiled_from` hash + staleness note in UI; recompile is a single CLI command. |
| Scope creep in the lab | Lynch test (§1.1): every feature must serve one primitive or one of the two principles. |

## 10. Non-goals (this scope)

- Editing the map from chat or from any Orient tool (read-only lab).
- Replacing Diagnostics/Intervention/Monitoring functionality — Orient hands off, it doesn't absorb.
- Cloud LLMs in the default path (Anthropic remains an opt-in compiler backend only).
- Multi-map chat sessions, chat history persistence across visits, multi-user shared sessions.
- Voice, mobile-specific layouts, offline mode.
