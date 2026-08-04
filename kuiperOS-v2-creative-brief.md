# kuiperOS Website — v2 Creative Brief (for Claude Opus 4.8)

**Work on a new git branch called `v2`, created from the current main branch. Do not touch or overwrite main — it stays as a safe fallback.**

**Read this entire document before writing any code.**

---

## 0. What this document is, and what changed

The original build brief (`kuiperOS-website-brief.md`, still in this folder) contained a mistake: it instructed the previous build to treat Figma reference screenshots as a literal, pixel-exact fidelity target. That produced a technically correct but visually flat result — an exact copy of rough placeholder wireframes. This document **replaces that instruction entirely.**

**Still true from the original brief** (unchanged, carry forward): the brand palette, the two-tier type system, the core narrative concept (one continuous camera pull-back following a single lead's inquiry), the demo data (Rania K., the three listings, the agent names), and the copy rules (banned words, no invented stats, etc.) — all restated below for a self-contained document.

**No longer true — explicitly overridden:**
- The screenshots are **not** a fidelity target of any kind. They may be referenced for historical context only. Ignore their exact layout, spacing, and visual treatment entirely.
- The five "acts" as separate self-contained scenes is wrong. The architecture is now **one continuous chat thread as the spine**, with camera excursions to system internals (see Section 3).

---

## 1. Creative mandate — read this first, it governs everything else

**You have full creative authority over the visual design, layout, and execution of this site.** This brief defines *what happens* (the story, the content, the data) and *what's off-limits* (banned words, no literal WhatsApp branding, brand colors). It does **not** define exact pixel positions, exact component shapes, or exact visual treatment. Where this document is specific about content or behavior, follow it exactly. Where it's silent on visual execution, that's deliberate — make the strongest, most considered design choice you can, the way a senior designer would, not the safest one.

Use the `frontend-design` plugin actively — this project has already hit the generic-AI-design failure mode once; don't repeat it. Push for bold typography choices, real depth, genuine polish, and motion that feels considered rather than default. If two approaches are both reasonable, pick the more distinctive one.

---

## 2. Token and session discipline — read this before starting work

This project has already burned a full token budget once, on a previous model, due to (a) a bad brief that caused large-scale throwaway work, and (b) extended unsupervised debugging of environment/tooling problems unrelated to design. Follow these rules to avoid repeating that:

- **Checkpoint at meaningful milestones**, not after every micro-change. A milestone is: one major section or feature is built and visually verified. Commit with a clear message at each one. Don't batch unrelated work into one giant commit, and don't commit fragments mid-thought.
- **If you hit an environment or tooling problem** (deployment, browser/screenshot access, permissions, git issues) — attempt one direct, sensible fix. If it's still not resolved after that one attempt, **stop and flag it plainly** rather than spending many further tool calls self-debugging. Tooling problems are usually worth less time than they're tempting to spend.
- **Before a large structural change** (anything affecting more than one act/section, or the shared architecture), briefly state your plan and wait for a go-ahead. For straightforward execution within an already-approved direction, proceed without re-confirming every small step.
- **Actually look at your own work** with real rendered screenshots before calling anything done — not just programmatic/geometric verification. This was a repeated, costly failure mode last round.
- The user will periodically run `/usage` to check remaining budget — if you're about to start something large, it's reasonable to suggest they check it first.
- Default to a **moderate effort setting**, escalating only for genuinely hard problems (complex animation timing, the matching-engine sequence). Don't run every step at maximum effort by default — it costs more and most steps don't need it.

---

## 3. Core architecture — the chat thread as spine

There is **one continuous chat thread** — a single column of messages that only ever travels upward, like scrolling through a real conversation. Everything the lead receives (the qualifying form, listings, the calendar, confirmations) arrives **as a message in this thread.** Nothing appears as a detached card floating beside it.

The camera makes **excursions** away from the thread to reveal system internals — the matching engine, the assignment handoff, the agent's desk, the operations board — and then **returns to the thread** each time, continuous and motivated, never a hard cut or fade to a disconnected scene. Motion throughout should be continuous and physical: things travel, scale, and pass the camera. If a transition can be described as "it faded in," redo it — this project has hit that failure mode twice already.

**Add Lenis (smooth-scroll library) paired with GSAP ScrollTrigger**, using GSAP's documented Lenis integration approach. This is the standard pairing for this kind of build and should meaningfully improve scroll feel over raw ScrollTrigger alone.

---

## 4. The laptop-screen framing device

The entire cinematic sequence plays inside a **fixed viewport styled as a laptop screen** — the visitor is watching this happen on someone's laptop, not floating content in empty space.

- **Literalism level: lean toward an abstract bezel** — a dark rounded frame suggesting "a screen," not a photorealistic laptop render with visible hinge/keyboard/desk. This is a strong directional preference, not a rigid spec — use good judgment in execution.
- **A real, animated cursor** should move through the interface with intent — hovering before clicking, drifting toward the next field, with slight overshoot-and-correct on its path rather than a robotic perfectly-smooth glide. This is doing the "someone is really using this" work — not a photographed environment, no hands, no desk.
- **No photographed background environment.** If any atmosphere is added behind the laptop, it should be a soft ambient light/shadow gradient, never a literal photo of a room.
- Depth of field is encouraged: when focus is on one part of the interface, let inactive/background elements go slightly soft, the way a real camera racks focus. This is a high-leverage "does this feel expensive" technique.

**Inside the laptop screen, the product itself is one application with a tab bar** across the top: **Inbox · Matching · Pipeline · Agent Desk · Control Room**. What the visitor watches is never "a screenshot of WhatsApp" — it's kuiperOS's own interface, which happens to show the WhatsApp thread as one of its views. The tab underline should physically slide between tabs, never teleport. Switching tabs is a zoom-through — the new tab's content pushes in from a slight blur/scale as the previous one pulls back and softens, not a cross-fade in place.

---

## 5. Interface conventions — GHL-informed structure, kuiperOS visual identity

kuiperOS is genuinely built on GoHighLevel underneath, so the **information architecture** of the two most operationally-scrutinized tabs should draw on GHL's real, familiar conventions — this makes the demo read as a considered, real product rather than an invented mockup. This is a structural/functional borrowing only. **None of GHL's visual skin carries over** — no GHL colors, button chrome, or iconography. Every pixel stays in kuiperOS's own identity (Paper/Ink/accent blue, Clash Display/General Sans/DM Mono).

- **Pipeline tab** — structure this like a real GHL Opportunities/Pipeline board: cards show a contact name, a value/budget figure, and a stage tag; columns represent pipeline stages (the exact column names are given in Section 7.9); cards are draggable-looking (visual affordance only, doesn't need to be functional) between columns; a card click would conventionally reveal more contact detail — imply this affordance even if not built out.
- **Inbox tab** — structure this like a real GHL Conversations view: a conversation list/context alongside the active thread is a familiar GHL pattern, though for this demo the single active thread (Rania K.'s) can remain the sole focus — the point is the message layout and metadata (timestamps, read state, channel indicator) should feel like a real CRM inbox, not a generic chat app clone.
- **Agent Desk and Control Room** — looser inspiration is fine here; these don't need to mirror a specific GHL view as closely, since they're more about kuiperOS's own added intelligence layer (matching, assignment, aggregate reporting) than standard CRM conventions.

If in doubt on any interface detail not specified here, default toward "how would a real, mature CRM organize this information" rather than inventing a novel pattern — familiarity here builds credibility, not boredom, since the visitor's trust is partly earned by "this looks like software I could actually run my business on."

---

## 6. Narration captions — new treatment, replaces the old side rail

The previous "fixed side rail, snap instantly" caption treatment failed in testing — a real viewer didn't notice it existed until their third time through the site. New treatment:

- Captions live **outside the laptop frame**, in the surrounding page space — like on-screen documentary text describing what's happening on the screen being watched, not part of the in-app UI.
- Each caption **reveals with real animation** as it changes — a line-by-line or word-by-word arrival, like narration or subtitles appearing, not a static block that snaps in. This is a deliberate reversal of the original "never animate, it's peripheral" rule — that rule is what caused the visibility failure, so it's being overridden based on that evidence.
- The animation should read as calm and considered, not flashy — narration-paced, not an attention-grabbing effect.

---

## 7. The matching engine — ledger scan, not a grid

No grid of listing tiles, no map. The engine is visualized as:
- A live **ledger of data rows** (ref code, area, bedrooms, price — text only, no photos) that appears to scan/filter in real time
- **Filter criteria chips** that tick off one at a time (Area ✓ → Bedrooms ✓ → Budget ✓), synced with a **live counter that visibly rolls down** (84 → 41 → 12 → 3), not snapping instantly between numbers
- Only the **3 final winners** get real photos — and they are the exact same three listings that subsequently arrive as messages in the thread. Never repeat the same 3 photos to represent the 81 non-winners; those stay as text-only rows.

---

## 8. Exact copy — every string, beat by beat. Nothing here is a placeholder; use these exact words unless marked otherwise.

**8.1 — Header.** Wordmark: `kuiper.` Button: `Request early access`

**8.2 — Opener (before the thread begins), in order:**
1. *"The Operating System for Modern Real Estate"*
2. *"Every minute of silence is a lead deciding on someone else."* — then, a beat later, smaller: *"Hours pass. Leads go cold. Somewhere in the chaos, you're losing deals you never even saw."*
3. *"Here's the same lead. Handled differently."*

**8.3 — Narration captions (Section 6's reveal-animated text), exact lines, one set per tab/beat — do not paraphrase or shorten these:**
- **Inbox (form beat):** *"A message arrives at 10:41am. In thirty seconds, the lead is qualified — not just logged."*
- **Matching:** *"Eighty-four listings. Only three match this inquiry. The matching engine does the rest."*
- **Agent Desk (assignment):** *"The agent is assigned with a click, and pinged instantly."*
- **Inbox → Agent Desk (booking):** *"The lead picks from the available slots. The agent confirms with a click."*
- **Control Room:** *"This is one thread. Forty-two others are running the same way, right now."*

**8.4 — Demo data (use exactly, do not invent alternates for these specific people/listings):**
- Lead: **Rania K.**, Mobile `+961 3 xxx xxx`, Area **Achrafieh, Beirut**, Bedrooms **2**, Budget **$180,000**, Timeline **Ready now**
- Agent: **Karim** (senior agent, the one assigned to this lead). Other agents referenced on the ops board: **Dana**, **Sami**, plus additional fictional agents as needed for a busy board.
- Listings: **Achrafieh-014** (`Listing_1.jpg`) — 2BR · Achrafieh · 95m² · 2nd floor · balcony · $180,000. **Dbayeh-027** (`Listing_2.jpg`) — 2BR · Dbayeh · 132m² · waterfront · $176,000. **Jounieh-008** (`Listing_3.jpg`) — 2BR · Jounieh · 96m² · top floor · $168,000.

**8.5 — Act 1, Inbox tab. Exact sequence and dialogue:**
1. Lead's message bubble: *"I am looking for a 2 bedroom in Achrafieh, anything available?"*
2. Auto-reply bubble (accent-tinted, marks "the system is speaking"): *"Thanks for reaching out! Just a few quick details and we'll find your match."* *(Note: this replaces an earlier draft that said "a couple of seconds" — that conflicted with the caption's "thirty seconds" claim. Use this version; don't have the bubble text make its own separate time promise.)*
3. **Qualifying form** — a real form the lead visibly fills, not a summary card: labeled fields with visible boundaries, a focus state that moves field to field, values appearing as if typed. Fields in order: **Name, Mobile Number, Area, Bedrooms, Budget, Timeline** (Timeline is a select: Ready now / Within 3 months / Just exploring). Demo values as given in 8.4. Button: `Submit`.
4. Capture confirmation: `CAPTURED · CRM-0417`

**8.6 — Act 2, Matching tab. Exact copy:**
- Scene label: `MATCHING AGAINST 84 ACTIVE LISTINGS`
- Criteria chips, tick on in order: `AREA · ACHRAFIEH + COAST`, `BEDROOMS · 2`, `BUDGET · ≤ $180,000`
- Counter: rolls **84 → 41 → 12 → 3**, label beside it: `/ 84 listings`
- On resolve, camera returns to Inbox thread and the three listings arrive as messages, each with photo, the spec line from 7.4, and button: `I am interested in this Property`
- Later (when the lead is shown choosing), she taps that button specifically on the **Achrafieh-014** message — this is the action that triggers Act 3. No new dialogue needed for this tap; it's a visible interaction on the existing message.

**8.7 — Act 3, Agent Desk tab. This needs real dialogue — write it as an actual exchange, exactly as follows:**
- Admin's message to Karim: *"New lead for you — Rania K. Achrafieh, 2BR, $180K, ready now."*
- Karim's reply: *"On it."*
- A compact info card attached to or following Admin's message (can sit inside the same thread rather than as a separate floating card): `NEW LEAD · RANIA K.` / `Achrafieh · 2BR · $180,000 budget` / `WhatsApp: +961 3 xxx xxx`
- Button on Karim's side: `Confirm Contact`
- If any connecting visual (line, beam) is used between Admin and Karim, it must be horizontal — no tilt.

**8.8 — Act 4, back to Inbox then Agent Desk. Exact copy:**
- Calendar sent to the lead in the thread, header: `AVAILABLE VIEWING SLOTS`
- Slot options: `Thu 10:00`, `Thu 14:30`, `Fri 09:00`, `Fri 11:30`, `Sat 10:00`, `Sat 15:00` — lead picks **Fri 11:30** (this one fills solid accent, others step back)
- Cut to Karim's Agent Desk view — booking request card: `VIEWING REQUEST · Fri 11:30` / `Rania K. wants to view Achrafieh-014`
- Buttons: `Confirm`, `Propose new time`, `Reject`

**8.9 — Act 5, Control Room tab. Exact copy:**
- Tonal inversion: Paper (#FAF9F7) → Ink (#1A1917) background; header and captions switch to their dark/paper-on-ink variant for this tab only
- Kanban columns (use these exact column names): **New, Qualified, Matched, Assigned, Contacted, Confirmed**
- Cards: dozens across all columns, showing **fictional client names** (not bare ref codes) — invent plausible names freely for these background cards (this is the one place in the brief where exact strings are intentionally not prescribed; the goal is volume and variety, not specific memorized names). Rania K.'s card is the one highlighted (accent fill/border) in the **Matched** column, labeled `RANIA K. / THREAD-0417`.
- Weekly Ledger header: `WEEKLY LEDGER`
- Aggregate line, shown prominently: `32 leads assigned · 7 viewings booked · 18 contacted`
- Per-agent rows below it: **Karim** — `6 contacted · 2 confirmed`, **Dana** — `4 contacted · 3 confirmed`, **Sami** — `5 contacted · 1 confirmed`, plus additional fictional agents with plausible numbers if it helps the board feel busier. Do not include any placeholder/inactive row (no "— (quiet)" or equivalent) — every named agent shows real activity.

**8.10 — CTA resolution.** Line above the button: *"Stop losing deals to chaos."* Button (same element the thread/message resolves into): `Request early access`

**8.11 — Form (triggered by the CTA).** Required: **Name, WhatsApp number**. Optional: brokerage name, city, team size. Privacy note: *"We'll only use this to contact you."*

**8.12 — Footer.** Wordmark, `© 2026 kuiperOS`, contact email placeholder (`hello@go-kuiper.com` — swap once domain is fully live), Instagram `@gokuiper`, LinkedIn (placeholder link).

**8.13 — Page meta.** Tab title: `kuiperOS — The Operating System for Modern Real Estate`. Meta description: *"kuiperOS qualifies, matches, and hands off every inquiry through WhatsApp — so no lead waits, and no agent has to open a dashboard."* Open Graph description: reuse the tagline — *"kuiper does everything up to the decision. The decision stays yours."*

**Copy rules (unchanged):** never use streamline, boost productivity, save time, AI-powered, seamless, effortless, unlock, empower. No pricing shown. No invented stats/testimonials beyond what's specified here.

**Brand system (unchanged):** Paper #FAF9F7, Ink #1A1917, Mute #6E6B66, Accent #2C5EFF, Line #E8E5E0. Clash Display for headlines, General Sans for body/UI, DM Mono for ref codes and technical detail. Font files are in `Fonts/` in this project folder.

---

## 9. Definition of done for this round

- No element anywhere reads as a "card floating beside the chat" — everything the lead receives is in the thread
- No transition can be described as a fade — all motion is continuous and physical
- Captions are visible on a first pass, verified by actually watching the reveal animation, not just checking it exists in code
- Matching engine shows real filtering with a rolling counter, real criteria ticking, and photos only on the 3 winners
- Act 3 reads as an actual conversation, not a diagram
- Real, rendered screenshots reviewed at each milestone — not programmatic/geometric checks alone
- Every string of copy on the site matches Section 8 exactly — if something doesn't have exact copy given there and isn't explicitly marked as open (only Section 8.9's background client names are), flag it and ask rather than inventing wording
- Committed incrementally on the `v2` branch, main branch untouched

---

## 10. Mobile, accessibility, and performance — hard requirements, carried forward

These were specified in the original brief and remain true regardless of the architecture change:

- **Mobile gets the full experience**, not a simplified fallback — adapted for touch, but the same laptop-frame/tab-bar/thread concept, not a stripped-down version.
- **`prefers-reduced-motion`** must produce a complete, coherent alternate experience — simple crossfades instead of the full camera/zoom-through motion, same content and order, never a broken or half-missing one.
- **iOS Safari's collapsing address bar is a known failure mode** for pinned-scroll techniques — recalculate pinned-section heights on resize events, don't assume a fixed viewport height.
- **Performance budget:** keep the number of simultaneously-animating elements per beat modest. Test actual scrub smoothness on a real phone before calling any section done, not just desktop devtools.
- **Tablet** behaves closer to desktop than mobile.

## 11. Deployment and review

- **Primary review method: the local dev server, with real rendered screenshots** — this is what actually worked reliably this session. Don't assume any deployment target is working without directly confirming it.
- **If a public link is needed, GitHub Pages proved more reliable than Replit this round** — Replit's deployment was stale and broken multiple times; GitHub Pages, once pushed, rendered correctly when checked directly. Prefer it for sharing progress unless there's a specific reason to use Replit instead.
- Whatever deployment target is used, explicitly confirm it reflects the current commit before telling the user it's ready to review — this was a repeated, costly failure mode last round.

## 12. Recommended first checkpoint

Given how much architecture is changing at once (thread-as-spine, laptop frame, tab bar, new caption treatment), don't build all five acts before the first review. **Build the laptop frame, tab bar mechanics, and Act 1 only first**, get that reviewed and approved, and only then proceed through the rest. This validates the new foundation cheaply before committing the full build to it — building on an unvalidated foundation is exactly what caused the expensive rebuild last round.

## 13. Still out of scope (don't attempt these)

- A real logo/symbol — the wordmark alone (`kuiper.`) is correct for now; this is intentionally still undecided and deferred.
- Live Instagram/LinkedIn content — the links just need to point somewhere reasonable.
- Final production domain/email — placeholders given in Section 8.12 are correct for now.
