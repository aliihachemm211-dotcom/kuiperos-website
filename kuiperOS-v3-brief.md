# kuiperOS v3 Build Brief

## How to use this document

This file is a **companion to `kuiperOS-v2-creative-brief.md`, not a replacement for it.** Read v2 first for full context — brand system, palette, type, copy rules, the full product workflow, and the content/behavior of screens not touched below. This file only contains what's *changing* for v3.

**Project files, current state:**
- `kuiperOS-v2-creative-brief.md` — kept, still authoritative for everything not addressed below
- `kuiperOS-v3-brief.md` (this file) — v3 changes only
- `archive/kuiperOS-website-brief.md` — v1, superseded, kept for reference only, not to be used for the build

**What v3 changes:** Hero (full replacement), a new Bridge section (didn't exist before), the demo's act structure and caption system (5 acts → 7, side-rail captions → on-screen pill captions), and a new site-wide ambient background.

**What v3 does NOT change — leave as-is from v2:** the Matching, Agent Desk, Pipeline, and Control Room screens themselves (their content and internal behavior), the CTA/request-access form, the footer, and the full brand system (palette, type, copy rules).

**Build instructions:**
1. Work on a new `v3` git branch off the current branch. **Do not start from a blank project** — the existing `index.html`/CSS/JS already contains working, unflagged sections (the four screens above, CTA, footer). Edit in place; rebuilding them from scratch would waste budget on work that isn't needed.
2. Apply the sections below in order, since later ones depend on earlier ones:
   - Replace the hero entirely (**Hero Section**, below)
   - Insert the new Bridge section between hero and the demo (**Bridge Section**, below)
   - Restructure the demo from 5 acts to 7, and replace the old side-rail captions with the new on-screen system (**Demo Sequence**, below)
   - Add the site-wide ambient background layer (**Ambient Background**, below) — replaces the earlier floor-plan direction, which is dropped entirely
3. Fonts and the 3 listing photos already in the project's `Fonts/` and `Assets/` folders carry over unchanged — no new assets needed for anything in this file.

---

## Hero Section

*Supersedes all prior hero specs in v1/v2 briefs, including: "Hours has passed, and your lead is still waiting" as first-shown headline text; the fast 0→156 counter concept; the standalone status-dot-fade + time-readout layout as a final design (its color logic is preserved below, just reassigned to a richer sequence).*

### Narrative role

The hero is Act 0 — the same inquiry the rest of the site follows (Rania K., 2BR, Achrafieh, $180,000, WhatsApp), shown once, cooling off, before the visitor ever sees the product. No headline, no logo-adjacent copy, no product framing until the decay sequence resolves. The hero's only job is to make a visitor feel one specific, familiar thing happen in real time.

This also resolves the original complaint about the old hero: there is no longer a headline that fades and gets replaced by another headline. The tension copy now only ever appears once, after the interaction/decay resolves — it doesn't compete with or overwrite anything.

### Content identity

Reuse the site's existing lead, verbatim, so a visitor who later reaches Act 1 recognizes her:

- Name: **Rania K.**
- Channel: WhatsApp
- Message: *"I am looking for a 2 bedroom in Achrafieh, anything available?"*
- Timestamp origin: 10:41 (matches Act 1's Inbox timestamp)

### Default sequence (no interaction)

Runs automatically if the visitor does nothing. Total budget: ~4–6 seconds for the decay, then ~4–6 seconds for the copy reveal (see below) — roughly 8–12 seconds before the scroll cue appears. Keep this tight; it's a hook, not a film.

**Timestamp progression** (front-loaded, then decelerating — the slowdown itself should feel like time dragging):
`2 seconds ago` → `47 seconds ago` → `3 minutes ago` → `11 minutes ago` → `36 minutes ago`
First two transitions fire quickly (near-instant); the last two hold noticeably longer.

**Status label**, synced to the same beats:
`Interested` → `Waiting…` → `Likely gone.`

**Color arc** (⚠️ exception to the "no authentic WhatsApp UI" rule — confirm or override):
Starts in true WhatsApp green (instant recognition: "that's my app"), fades progressively into kuiper's Paper-palette cold tones as status downgrades. If you'd rather not break the WhatsApp-UI rule even for this one beat, start directly in a warm accent tone instead and skip the green entirely — flag your call and I'll adjust.

**Card behavior** — the card itself should physically recede as it decays, not just change color:
- Elevation/shadow reduces progressively
- Slight desaturation and tightening of the card's proportions
- A faint ambient pulse (a soft glow/shadow breathing, not a UI heartbeat icon) starts at a calm resting rate and slows in sync with the timeline, settling to still — not a flatline, just quiet. This is the one thing worth keeping from the "heartbeat" idea we discussed, without the medical/death imagery.

**One near-miss beat**: early in the sequence (around the 47-second mark), a "…" typing indicator appears for a moment, as if a reply is being drafted — then vanishes, unsent. This should read as an aborted attempt, not a resolved action.

### Interactive layer (click-to-interrupt)

The passive sequence above always plays and always resolves on its own — nothing is gated behind interaction. A click *interrupts and reframes* it; it never *replaces* it.

- **Nudge**: if no interaction after ~1–2 seconds, show a subtle affordance (soft pulse ring or faint "tap" ghost hint) on the card. Disappears the moment the visitor scrolls or the auto-sequence progresses past the "Waiting…" stage.
- **Click 1**: popup — *"Oops — you're on a call. Try again in a sec."*
- **Click 2** (only if they click again): popup — *"Oops — you're scheduling a viewing."*
- **Hard cap at 2 excuse-clicks.** A third click does nothing (or the affordance simply disappears) — this needs to stay light, not become a wall.
- Critically: **clicking never pauses the underlying clock.** The timestamp/status/color decay keeps advancing in the background regardless of clicks — the excuses are flavor on top of an unstoppable timeline, not a delay tactic. Both the clicked and un-clicked paths converge on the identical final state.
- **Tone**: dry, plausible, deadpan — real reasons an agent is actually mid-task, not jokes. Avoid punchline phrasing; this should feel true, not funny.

### Resolution copy — hero ends unresolved (appears only after decay completes, click path or not)

The hero closes on tension, deliberately unresolved. No product mention, no relief, no pivot line here — that all now lives in the new bridge section below.

1. *(punch line)* "Every minute of silence is a lead deciding on someone else."
2. *(quieter unpacking line)* "Hours pass. Leads go cold. Somewhere in the chaos, you're losing deals you never even saw."

Then the hero ends — straight into the bridge section, no scroll cue yet (the scroll cue belongs at the end of the bridge, not here).

**Trade-off worth naming**: this means the visitor sits with unresolved dread slightly longer, through the whole hero, before any relief or product mention arrives. That's intentional — it makes the bridge section's "it's handled" moment land harder, rather than undercutting the hero's tension early.

### Safety rule (non-negotiable given what we saw in v2 testing)

If the visitor scrolls at any point during the decay or copy-reveal sequence — mid-fade, mid-click-branch, doesn't matter — it must **immediately snap to its fully resolved end-state**, never left visually stuck, blank, or mid-transition. This is exactly the failure mode we saw in the current build (stuck blurred mockups, blank sections) and it must be explicitly handled here, not assumed.

---

## Bridge Section (Hero → Demo)

### Narrative role

New section, sitting between the hero (which now ends unresolved, on tension) and Act 1 of the zoom sequence. Carries everything that used to close out the old hero: the reframe, the resolution, the pivot, and the entry point into the demo itself. This is the section's whole job — earn the "it's handled" moment, explain why a 5-act walkthrough is coming, and hand the visitor off into it.

### Copy sequence

1. *(reframe — new line, not previously locked)* "Your problem isn't leads. It's everything between first contact and closing the deal."
2. *(resolution — shortened from the original 16-word version)* "Kuiper qualifies, matches, and hands it off — while it's still warm."
3. *(pivot, unchanged from prior lock)* "Here's the same lead. Handled differently."

Keep this concise — three short lines, not a paragraph. This section exists to add one beat of explanation the hero can't carry alone, not to re-explain the whole product.

### Scroll cue

Sits at the end of the bridge, immediately before Act 1 begins. Must communicate the action (scroll) and what's coming (a live walkthrough), not just a label:

**"SCROLL TO WATCH ↓"** (or "SCROLL — LIVE WALKTHROUGH") — set in the site's existing all-caps mono style (matching "MATCHING", "INBOX", "WEEKLY LEDGER" labels already in use), paired with a down-arrow that has a slow, subtle bob to reinforce the instruction visually.

### Skip demo — persistent bubble (not a pre-demo button)

Corrected from the earlier draft: this is not a button offered before the demo starts. It's a small floating element that appears only *during* the demo itself, so a visitor can bail at any point they start to feel overwhelmed, not just upfront.

- **Appears**: the instant Act 1 begins (i.e., right as the bridge ends and the zoom sequence starts). Not present during the hero or the bridge.
- **Persists**: fixed on screen through all acts of the demo (now seven — see Demo Sequence section below), regardless of scroll position. Bottom-right or bottom-center placement — must never sit over content the visitor is trying to read.
- **Disappears**: once the visitor reaches the end of the final act / the CTA. Nothing left to skip at that point.
- **Style**: small pill, card-white background, hairline border, ink text, no heavy drop shadow — quiet and native to kuiper's visual language, not a generic floating web widget. Small forward-arrow alongside the label.
- **Copy**: static **"Skip demo"** — no progress indicator (e.g. "Act 3 of 5") for now; keep it simple.
- **Behavior on click**: jumps straight to the CTA / request-access section — never dumps the visitor somewhere that still isn't the point.

---

## Demo Sequence (Acts + Captions)

### Structural reframe

Rania's WhatsApp thread is the spine of the demo, not one act among equals — it receives the qualifying form, later the matched listings, later the booking slots. It's one growing conversation. Matching, Agent Desk, Pipeline, and Control Room are brief cutaways to show what's happening behind her chat, before returning to see the consequence land back in her thread. This reframe (spine + cutaways) is what should make the sequence read as one complete story rather than five unrelated screens — it's doing more work toward "feels complete, not confusing" than caption wording alone.

Net change from the prior 5-act plan: 7 acts total. The previously-proposed standalone "Confirmed" act is folded into the tail of Booking instead (reusing the existing CRM badge component, just flipping its state) — no new screen required.

### Act map

| # | Scene | Caption(s) | Tier |
|---|---|---|---|
| 1 | Inbox (first visit) | 1a: "A lead arrives." → 1b: "Kuiper replies, qualifies, and captures." | B (swap within act) |
| 2 | Matching | "The form's filled. Now the engine finds the match." | A |
| 3 | Inbox (matches delivered, lead picks one) | "The lead picks the one she wants." | A |
| 4 | Agent Desk | "The right agent is notified." | A |
| 5 | Inbox (booking → confirmed) | 5a: "Available slots. She books it herself." → 5b: "Confirmed. Her thread is resolved." | A, then B tail |
| 6 | Pipeline | "This is one thread. Forty-two others are running the same way, right now." *(unchanged, existing lock)* | A |
| 7 | Control Room | "This is what running the whole floor looks like." | A |

9 caption lines total across 7 acts.

### Caption appearance & behavior

Reuses the pill language already approved for Skip Demo — one consistent shape system across the demo, not a separate look invented per element.

**Container**
- Rounded-full pill, card-white background, hairline border — same family as the Skip Demo pill.
- A small dot precedes the caption text: accent blue, pulses once on appearance then goes static (no continuous/decorative pulsing). This keeps blue functional — signaling "active transition" — rather than purely decorative, consistent with the locked rule that accent blue is reserved for state/action only.

**Border as state signal**
- On entrance (Tier A): hairline border in accent blue — signals something is actively changing.
- Once settled (small, fixed lower position for the rest of that act): border reverts to neutral hairline gray. Blue is temporarily "on" only while something is genuinely happening, then recedes.

**Typography**
- General Sans (body font) — Clash Display stays reserved for act titles/headlines only.
- Sentence case, not all-caps — keeps captions reading as *voice*, distinct from existing all-caps mono UI labels ("MATCHING", "SCROLL TO WATCH").
- Medium/Semibold weight.

**Motion — Tier A (new act beginning)**
Screen dims/blurs for a beat during the camera transition → pill appears large and centered over the dim, sliding up ~16–20px while fading in, quick snap-out easing, ~200ms → holds briefly → shrinks and settles into the small fixed lower position as the new scene sharpens into focus. The shrink should read as receding in z-space (subtle scale-down + slight blur-out-then-in), matching the camera-dolly language used elsewhere, not a flat resize.

**Motion — Tier B (two captions within one held act, e.g. 1a→1b, 5a→5b)**
Fast crossfade with a much smaller upward micro-slide, ~120ms, no border-color flash, no size change. Should feel like a quick correction, not a new event — this is what distinguishes it from a full act transition.

### Pacing notes

- Scroll-scrub ratio (physical scroll distance per act) is the primary lever for "feels faster" — a tuning parameter independent of content, adjust before cutting anything.
- Not all acts need equal dwell time: Matching (the 84→3 moment) and the Control Room close deserve more room; Agent Desk handoff and Booking can move quicker since they're simpler beats.
- Revised total sequence budget: ~30–40 seconds at normal scroll pace (up from the prior 25–35s, to accommodate 7 acts instead of 5) — but tighter per-act pacing should make it *feel* on par with or faster than the current build, since the flagged problem last round was uneven pacing, not sheer length.

---

## Ambient Background (Routing Engine)

*Supersedes the earlier floor-plan-based background direction, dropped entirely in favor of this concept.*

### Concept

Site-wide ambient background, present from hero through footer: sparse particles continuously enter the scene from random edges and move deliberately toward destinations through an invisible routing graph — paths split, merge, and reroute dynamically, nothing collides, everything arrives somewhere on purpose. Visualizes what kuiper actually does (matching, assignment, routing) rather than a generic "AI is thinking" motif — "order emerging from chaos" echoes the site's own CTA line almost verbatim.

Two alternative directions considered and rejected:
- **"Living Network"** (nodes + connecting lines + propagating pulses) — this is the neural-mesh visual cliché, the direct visual equivalent of banned copy words like "AI-powered." Dropped entirely, not used even as an accent.
- **"Hidden Conversations"** (faint chat-bubble/typing-indicator ghosts) — too close to the demo's actual chat UI; would make the real demo feel like a re-reveal of something already half-seen in the background. Not used.
- **"Data Streams"** (hairline flowing paths) — kept only as a fallback direction if the routing-engine particle system proves too complex to build well within budget; not the primary spec.

### Visual spec

- **Color**: particles and connecting paths in ink/mute tones (not accent blue) at all times, sparse density — this is texture, not content.
- **Blue is reserved for resolution only**: a brief flash of accent blue fires at the exact moment a particle completes its route (arrives or merges) — consistent with the site's existing rule that blue signals state/action, never decoration.
- **Density and behavior**: sparse, continuous, deliberate pathfinding — no random drifting, no collisions, no floating particles without a destination.
- **No decorative motion layered on top**: consistent with the existing rule against continuous/decorative rotation — the particles' own directed movement is content (it's showing routing), not ornament, so it's exempt from that rule; nothing extra (spinning, orbiting) should be added on top of it.

### Behavior across sections

- **Baseline**: present at a consistent low intensity from hero through footer — never absent, never the focal point.
- **Recedes further** (lower opacity, reduced particle count) behind the laptop-frame demo sections specifically — those screens are already dense with real UI detail and shouldn't compete with anything behind them, same logic already applied to captions.
- **Hard rule**: must never compromise text legibility anywhere on the page. If it's ever visible enough to risk that, it's tuned too strong — err toward too subtle rather than too present.

---

## Open items for you to confirm before build

- [ ] WhatsApp-green opening color — keep as an intentional exception, or start in brand palette from frame one?
- [ ] The "lost" state color mentioned earlier (palette currently has won #15803D, pending #B45309, accent #2C5EFF) still needs a hex assigned — suggest a muted, desaturated red/brick tone consistent with Paper's restraint, distinct from pending's amber.
- [ ] Confirm 2-click cap feels right once built, vs. 1 or 3.
