# kuiperOS Website — Build Brief for Fable 5

**Project folder:** `Kuiper Website Project/`
```
Kuiper Website Project/
├── assets/
│   ├── Act_1___Contact__v3_.png       (reference screenshot — Act 1 layout)
│   ├── Act_2___Matching__v2_.png      (reference screenshot — Act 2 layout)
│   ├── Act_3___Assignment.png         (reference screenshot — Act 3 layout)
│   ├── Act_4___Booking.png            (reference screenshot — Act 4 layout)
│   ├── Act_5___Operation__Control_Room_.png (reference screenshot — Act 5 layout)
│   ├── Listing_1.jpg   → Achrafieh two-bed interior (arched green-framed windows)
│   ├── Listing_2.jpg   → Dbayeh penthouse (waterfront, floor-to-ceiling glass)
│   └── Listing_3.jpg   → Jounieh family apartment (retro furniture, sheer curtains)
└── Fonts/
    ├── ClashDisplay-Semibold.otf
    ├── GeneralSans-Regular.otf
    ├── GeneralSans-Bold.otf
    └── DMMono-Regular.ttf
```

**Asset note:** the three listing photos are 480px wide. The listing card they appear in (Act 2) is designed at roughly 480-500px wide, which means these source images have no headroom for retina/high-DPI screens — they'll look correct on standard displays but slightly soft on retina ones. This is a known, accepted limitation for this build, not something to solve by upscaling (upscaling a 480px source won't add real sharpness) — if it matters later, the fix is re-exporting larger originals, not a code fix.

**Read this whole document before writing any code.** Where a reference screenshot exists for a section, treat it as the literal source of truth for layout, spacing, and color — do not approximate or redesign it. Where this document gives an exact number (px, seconds, hex code), use that number exactly. Nothing in this brief is a suggestion open to reinterpretation — if something feels ambiguous, it's a gap in this document, not a place to improvise; flag it instead of guessing.

---

## 1. What this is

kuiperOS is a real estate brokerage operating system. It qualifies inbound leads (from Instagram/WhatsApp), matches them to listings, routes them to the right agent, and handles booking — almost entirely through WhatsApp-style interactive messages. Its core differentiator: **an agent who doesn't want to use a dashboard never has to** — everything can be confirmed through automated interactive messages instead.

This is a single-page marketing/pre-launch site. Goal: get early-access signups from brokerage owners before public launch. There are currently zero live customers — the site's job is to look established and technically credible, not to oversell traction that doesn't exist yet.

**Positioning line:** "The Operating System for Modern Real Estate"
**Tagline (use sparingly, e.g. footer or about context):** "kuiper does everything up to the decision. The decision stays yours."

---

## 2. The core concept — read this before anything else

This is **not** a sectioned feature-tour landing page. It is **one continuous cinematic scroll sequence** following a single lead's inquiry as it moves through the system, with the visitor's perspective gradually pulling back — starting tight on one phone conversation, ending on the whole brokerage's operations. Same story throughout, at increasingly wider zoom levels. No section ever "resets" to an unrelated visual — everything on screen exists because the same inquiry has reached its next stage.

**One object — the anchor — persists visually across the entire sequence.** The anchor is a message bubble (chat-shaped, no phone/device chrome, floats directly in the scene). It appears in Act 1 as the lead's first message, and by the end of the sequence it is the literal element that morphs into the "Request early access" button. The visitor should be able to track this one shape through the whole experience.

---

## 3. Page structure, top to bottom

1. **Header** (persistent, not part of the scroll sequence)
2. **Opener** (static-feeling, three-beat progression, scroll begins here)
3. **The 5-act cinematic sequence** (scroll-scrubbed, ~25-35 seconds at a normal scroll pace)
4. **CTA resolution** (the anchor object becomes the button — part of the same continuous motion, not a separate static section)
5. **Footer**

---

## 4. Brand system

### Colors
```
--paper:   #FAF9F7   (default background)
--ink:     #1A1917   (primary text, dark-section background)
--mute:    #6E6B66   (secondary text, captions)
--card:    #FFFFFF   (card backgrounds on Paper)
--card-dark: #262523 (card backgrounds on Ink, e.g. Act 5)
--accent:  #2C5EFF   (the ONLY color used for state, action, and the brand accent — never decorative)
--line:    #E8E5E0   (hairline borders on Paper)
--line-dark: #3C3A37 (hairline borders on Ink)
```
Accent blue is reserved for: buttons, active/matched states, the anchor object's key moments, ref codes, timestamps. Never use it decoratively.

### Typography — two-tier system
- **Clash Display** (`ClashDisplay-Semibold.otf`) — headlines only: opener lines, the wordmark, any large section titles. This is the only weight available for this face; use it for all headline-scale text.
- **General Sans** — body copy and UI text: form labels, descriptions, button labels, dialogue bubbles. Use `GeneralSans-Regular.otf` for body text, `GeneralSans-Bold.otf` for emphasis/buttons/UI labels.
- **DM Mono** (`DMMono-Regular.ttf`) — ref codes, timestamps, tick labels, the side-rail captions, step counters (e.g. "01 / 05"). This is the "listing-sheet vernacular" typeface — always small (11-14px), often letter-spaced (+2 to +6%).

Self-host all four font files from the `Fonts/` folder — do not substitute Google Fonts equivalents, and do not use system fonts (Inter, Roboto, Arial, etc.) anywhere on this site.

### Visual language: "listing-sheet vernacular"
Recurring motifs used throughout: mono ref codes (e.g. `THREAD—0417`), hairline dimension-tick lines with small elapsed-time labels (e.g. `+00:03s`), crop-mark corner brackets on each act's frame (see reference screenshots — small L-shaped marks in the four corners), status stamps (bordered pill/rect with mono label). These recur across every act — keep them visually consistent.

### Copy rules — hard constraints
- **Never use these words anywhere on the site:** streamline, boost productivity, save time, AI-powered, seamless, effortless, unlock, empower.
- No invented statistics, testimonials, customer logos, or customer counts.
- No pricing shown anywhere.
- Nothing implies an agent failed or a deal was lost due to an agent's fault — the opener's tension is about chaos/speed generally, not agent blame.
- All demo/sample data uses **real Lebanese neighborhoods and ref-code formatting, but fictional names** (see Section 8 for the exact demo dataset — use it exactly as given, do not invent additional names or numbers).

---

## 5. Header

Persistent, not part of the scroll sequence (see Act 1-5 screenshots for exact position/sizing — identical header appears in every reference frame).
- Left: wordmark "kuiper." in Clash Display Semibold, ~26px, ink color (paper background) or paper color (on the Act 5 dark background)
- Right: single button, "Request early access", filled accent blue background, paper-colored text, General Sans Bold, ~220×52px, 4px corner radius
- Thin hairline divider below the header (`--line` color), full width

---

## 6. Opener (before the scroll sequence begins)

Three-beat progression, appears before the visitor starts scrolling into the cinematic sequence:

1. **Positioning line:** "The Operating System for Modern Real Estate" (Clash Display Semibold, large — 56-72px desktop / 32-40px mobile)
2. **Tension beat — two lines, in sequence:**
   - "Every minute of silence is a lead deciding on someone else."
   - *(quieter, smaller, appears after a beat)* "Hours pass. Leads go cold. Somewhere in the chaos, you're losing deals you never even saw."
3. **Pivot line:** "Here's the same lead. Handled differently." — this is the transition into the scroll sequence; after this line, scrolling begins driving the Act 1 scene.

No imagery in the opener — text only, on the Paper background.

---

## 7. The 5-act cinematic sequence — overview

**Total scroll duration target: 25-35 seconds at a normal scroll pace.** Pacing is uneven by design — not five equal-length acts:

| Act | Name | Relative pacing | Scroll distance (approx) |
|---|---|---|---|
| 1 | Contact | fast | ~1× viewport height |
| 2 | Matching | lingered (signature moment) | ~1.75× viewport height |
| 3 | Assignment | weighted | ~1.5× viewport height |
| 4 | Booking | fast | ~0.75× viewport height |
| 5 | Operation (Control Room) | slow finish | ~1.5× viewport height, plus a deliberate pause before the CTA |

**Fixed side rail:** throughout all 5 acts, a persistent caption panel sits at a fixed position on the left edge of the viewport (see reference screenshots — it does not move or resize between acts). It shows: a mono ref code (top, accent color, changes per act — see Section 8 for exact codes), a step counter ("01 / 05" through "05 / 05"), and 2-4 lines of narrative caption text (DM Mono, ~16px). **Caption text snaps instantly between acts — it does not fade or animate in** (this is deliberate: it's peripheral information, and animating it competes with the main scene).

---

## 8. Act-by-act exact content

### Act 1 — Contact
*Reference: `Act_1___Contact__v3_.png`*

- Ref code: `THREAD—0417` · Step: `01 / 05`
- Rail caption: *"A message arrives at 10:41am. In thirty seconds, the lead is qualified — not just logged."*
- Sequence, top to bottom, each beat separated by a dimension-tick line with an elapsed-time label:
  1. **Anchor object** (message bubble, plain white/card background, no chrome): *"I am looking for a 2 bedroom in Achrafieh, anything available?"* — timestamp `10:41:00`
  2. *(tick: `+00:03s`)*
  3. **Auto-reply bubble** (accent-tinted background — this is the one visual cue that marks "the system is speaking"): *"Thanks for reaching out! To find you the best match, please fill the form below — it'll take a couple of seconds."* — timestamp `10:41:03 · AUTO`
  4. *(tick: `+00:30s`)*
  5. **Qualifying form card:** title `QUALIFYING FORM — 04`. Fields, in order: **Name, Mobile Number, Area, Bedrooms, Budget, Timeline** (Timeline is a select: Ready now / Within 3 months / Just exploring). Demo values: Name — Rania K., Mobile Number — +961 3 xxx xxx, Area — Achrafieh, Beirut, Bedrooms — 2, Budget — $180,000, Timeline — Ready now. Filled-accent "Submit" button, full card width.
  6. **Capture stamp** (bordered pill, accent color, subtle accent glow): `CAPTURED · CRM-0417`

### Act 2 — Matching
*Reference: `Act_2___Matching__v2_.png`*

- Ref code: `MATCH—0417` · Step: `02 / 05`
- Rail caption: *"Eighty-four listings. Only three match this inquiry. The matching engine does the rest."*
- **Matching grid:** label above it, `MATCHING AGAINST ACTIVE LISTINGS`. An 8-column × 4-row grid of small square cells. All cells dimmed/low-opacity except exactly 3, which are full-opacity with an accent-blue border and a subtle accent glow — these 3 represent the matches.
- **Listing card** (appears below/after the grid resolves): photo (`Listing_1.jpg` — Achrafieh two-bed) + ref label `ACHRAFIEH-014` overlaid on the photo's lower-left + description below: `2BR · Achrafieh` / `95m² · 2nd floor · balcony` + button, outlined accent border (not filled), text: **"I am interested in this Property"**.
- **Decision, not a judgment call:** only Listing_1/Achrafieh gets the full listing card. `Listing_2.jpg` and `Listing_3.jpg` are NOT shown as separate cards anywhere in Act 2 — they exist only conceptually, represented by 2 of the 3 highlighted grid cells (no description, ref code, or photo needed for those 2 in this act). The reason Achrafieh is the one built out fully: it's the listing every subsequent act (3, 4, 5) refers back to — do not build cards for the other two, since no copy or ref code has been written for them and inventing some would violate the "don't improvise" rule.

### Act 3 — Assignment
*Reference: `Act_3___Assignment.png`*

- Ref code: `HANDOFF—0417` · Step: `03 / 05`
- Rail caption: *"The agent is assigned with a click, and pinged instantly."*
- **Two circular nodes:** left node labeled "Admin" (plain white/card fill), right node labeled "Karim" (accent-tinted fill, accent border) — this is the one named agent in the demo data.
- **Connector between them:** a straight accent-colored line, tilted at a slight angle (~6°) — this is the one deliberate, meaningful rotation in the whole site (signifies "changing hands"; no other element in the site should rotate decoratively). Small mono label above the line: `ASSIGNED · 0.4s`.
- **Notification card** (appears near the agent node): header `NEW LEAD · RANIA K.`, body `Achrafieh · 2BR · $180,000 budget` / `WhatsApp: +961 3 xxx xxx`, filled-accent button: **"Confirm Contact"**.

### Act 4 — Booking
*Reference: `Act_4___Booking.png`*

- Ref code: `VIEWING—0417` · Step: `04 / 05`
- Rail caption: *"The lead picks from the available slots. The agent confirms with a click."*
- **Slot grid:** label `AVAILABLE VIEWING SLOTS`. 6 slot cards in a 3×2 grid: Thu 10:00, Thu 14:30, Fri 09:00, Fri 11:30, Sat 10:00, Sat 15:00. All plain white/card style except **Fri 11:30**, which is filled solid accent blue with paper-colored text — this is the picked slot.
- **Booking request card:** header `VIEWING REQUEST · Fri 11:30`, body `Rania K. wants to view Achrafieh-014`, three buttons side by side: **Confirm** (filled accent), **Propose new time** (outlined), **Reject** (outlined).

### Act 5 — Operation (Control Room)
*Reference: `Act_5___Operation__Control_Room_.png`*

- Ref code: `OPS—0417` · Step: `05 / 05`
- Rail caption: *"This is one thread. Forty-two others are running the same way, right now."*
- **This is the one deliberate tonal inversion in the entire site.** Background switches from Paper (#FAF9F7) to Ink (#1A1917) — header and side rail also switch to their dark variants (paper-colored text on ink background) for this act only. This inversion is the visual signal that the perspective has zoomed out to "the whole operation."
- **Kanban board:** 5 visible columns — New, Qualified, Matched, Assigned, Contacted — each a dark card-on-ink column with 1-2 small ref-code cards inside (`REF-1000`, `REF-1037`, `REF-1075`, `REF-1111`, `REF-1148`, etc. — invented-looking but plausible ref numbers are fine here since they're explicitly background noise, not claims). **One card is highlighted** in the "Matched" column: filled accent background, bordered, showing `RANIA K.` / `THREAD-0417` — this is our lead's card, now visibly one of many.
- **Weekly ledger panel** below the board: header `WEEKLY LEDGER`, then agent rows exactly as follows (do not alter these numbers or add/remove agents):
  - Karim — 6 contacted · 2 confirmed
  - Dana — 4 contacted · 3 confirmed
  - **— (quiet)** — 0 contacted · 0 confirmed *(this dash-name row is intentional — it represents an agent who isn't engaging, and is a deliberate detail, not a bug)*
  - Sami — 5 contacted · 1 confirmed

---

## 9. CTA resolution — the anchor becomes the button

This is not a new section — it's the final beat of the same continuous motion. As Act 5 finishes:
- The whole Control Room composition recedes/fades
- The anchor object (the original message bubble shape, same rounded-rectangle silhouette used since Act 1) is the element that remains, and it **transforms directly into the "Request early access" button** — same shape, scaling and recoloring from its Act-1 appearance (white/card, ink text) into its final state (filled accent blue, paper-colored text)
- Once resolved: above the button, the line **"Stop losing deals to chaos."** appears (this deliberately echoes the opener's tension line — it bookends the whole sequence)
- Background returns from Ink back to Paper as this resolves

---

## 10. Form (early-access signup, triggered by the CTA button)

- Required fields: **Name, WhatsApp number**
- Optional fields: brokerage name, city, team size
- Privacy note below the form: *"We'll only use this to contact you."*
- Submission destination: a simple hosted form/email notification service (not a custom backend) — use a straightforward solution (e.g. Formspree-style endpoint or a basic serverless email send) rather than building custom infrastructure for this.

---

## 11. Footer

- kuiperOS wordmark
- Copyright line: `© 2026 kuiperOS`
- Contact email: placeholder for now (e.g. `hello@go-kuiper.com` — domain not fully live yet, this is a placeholder to be swapped later, do not treat as final)
- Social links: Instagram (`@gokuiper`), LinkedIn (placeholder URL) — both shown even though the accounts are new/minimal

---

## 12. Page meta

- Browser tab title: `kuiperOS — The Operating System for Modern Real Estate`
- Meta description: `kuiperOS qualifies, matches, and hands off every inquiry through WhatsApp — so no lead waits, and no agent has to open a dashboard.`
- Open Graph description: reuse the tagline — `kuiper does everything up to the decision. The decision stays yours.`
- Favicon: simple placeholder — a lowercase "k" in Clash Display, ink on paper. (A real logo/symbol is still pending — do not attempt to design a symbol/icon; wordmark-only is correct for now.)

---

## 13. Technical stack

Plain HTML, CSS, and vanilla JavaScript — no framework, no bundler, no build step required. Load GSAP (core + ScrollTrigger) via CDN. This matches the scale of the project (a single page) and keeps the Replit preview loop fast. If Fable 5 has a strong reason to prefer a lightweight framework instead, that's acceptable, but plain HTML/CSS/JS is the default expectation and should not be overridden without a clear reason stated back to the user.

Self-host the four fonts from `Fonts/` via `@font-face` declarations pointing at those files directly — do not substitute CDN-hosted versions of these typefaces.

**Breakpoints:**
- Mobile: below 768px — full cinematic experience, touch-adapted (see Section 13 animation notes on mobile handling)
- Tablet: 768px–1024px — treat as closer to desktop behavior, not mobile
- Desktop: above 1024px

**Before writing any code, confirm these three things are installed/available in the session** (the user has been instructed to do this beforehand, but verify):
1. Anthropic's official `frontend-design` plugin — this is the primary defense against generic/flat AI-generated design output, which is exactly what went wrong in a previous attempt at this same site
2. The `greensock/gsap-skills` plugin — correct GSAP/ScrollTrigger patterns
3. The `/webapp-testing` skill (usually built-in) — for the screenshot review loop described in Section 17

If any of these are missing, flag it back to the user rather than proceeding without them.

## 14. Animation and scroll mechanics — read carefully, this is the part that must not be improvised

**Mechanism:** GSAP + ScrollTrigger, with `scrub: true` on every act's animation timeline. This is **scroll-scrubbed, not autoplay** — every animated property must be tied directly to scroll position, fully reversible, correct at any scroll position including mid-transition. Nothing should "play" on its own; the visitor's scroll position is the only driver of animation progress. Install and use the official GSAP Claude Code skill (`greensock/gsap-skills`) for correct ScrollTrigger patterns rather than improvising the setup.

**Pinning:** each act's section is pinned (fixed on screen) for its scroll-distance range (see the table in Section 7) while an internal scroll-progress value drives that act's transforms. The page only continues scrolling normally once an act's transform sequence completes.

**What actually animates, per act transition:**
- Scale (the anchor object growing/shrinking as context expands or contracts)
- Translate (elements entering from off-canvas as new context appears)
- Opacity (new context fading in — never abruptly popping in)
- Perspective/z-axis depth (`perspective` + `translateZ`) is **encouraged, not just allowed** — real depth (objects moving toward/away from the camera, not just flat 2D scaling) is what will make this feel genuinely cinematic rather than a fade-based slideshow. This was an explicit lesson from a prior attempt at this site that came out feeling flat.
- Background-color crossfade — used only twice: the Act 4→5 transition (Paper→Ink) and the CTA resolution (Ink→Paper back)
- **Rotation is banned as decoration everywhere except the single Act 3 handoff connector line** (the ~6° tilt described in Section 8). No spinning, no tumbling, no rotate-on-scroll anywhere else on the site.

**Side rail text:** snaps instantly at scroll-progress thresholds between acts — do not fade or animate the caption text itself.

**Easing:** linear mapping to scroll progress within each pinned section (since it's scrub-driven, eased timing curves would fight against the visitor's actual scroll speed and feel laggy/rubbery). The felt "pacing" comes from the scroll-distance-to-content ratio per act (Section 7's table), not from eased curves.

**`prefers-reduced-motion`:** detect this media query and swap the `scrub` behavior for simple opacity-only crossfades between acts — same content, same order, no scroll-tied transforms, no camera movement. This must produce a complete, still-coherent experience, not a broken/stripped one.

**Mobile:** same full cinematic experience as desktop, adapted for touch — this was an explicit decision, not a fallback to a simplified version. Practical requirement: recalculate pinned-section heights on `resize` events, since iOS Safari's collapsing address bar changes the effective viewport height mid-scroll and is a known failure mode for exactly this pinning technique if not handled.

**Tablet:** treat as closer to desktop behavior, not as mobile.

**Performance budget:** since scroll-scrubbing recalculates every frame, keep the number of simultaneously animated elements per act modest (rough target: fewer than 15 actively-animating properties at once). Test the actual scrub smoothness on a real phone, not just desktop devtools — this is a hard requirement, not a nice-to-have, given the whole premise of the site depends on the motion feeling smooth.

---

## 15. Analytics

Add basic scroll-depth tracking — specifically, instrument each act's entry point as a distinct trackable event, so drop-off between specific acts is visible (not just a single page-view event).

---

## 16. Deployment

Two-stage: use **Replit** for live preview/testing while building (instant preview URL, testable on a real phone as the build progresses) — the Replit MCP connector should already be set up for this. Final production deployment target is **Cloudflare Pages** — not required during the build/iteration phase, but keep the output framework-agnostic enough (plain HTML/CSS/JS, or a simple static build) that it deploys cleanly there later.

---

## 17. Explicit non-goals / things NOT to add

- No literal WhatsApp branding, colors, or chrome anywhere — every messaging moment is reinterpreted in kuiper's own Paper/Clash Display/accent-blue visual language.
- No phone/device frames around any message bubble.
- No pricing shown anywhere on the page.
- No customer logos, testimonials, or invented statistics beyond the specific demo data given in Section 8.
- No logo/symbol beyond the wordmark — this is intentionally deferred.
- No additional pages (pricing, about, docs) — this is a single scrolling page for now.
- Don't invent additional listings, agents, or ref codes beyond what's specified above.

---

## 18. Build process — how to actually work through this

1. **Build one act at a time**, in order, not the whole sequence in one pass. After each act, stop and produce a way to review it (a live Replit preview link) before moving to the next.
2. After each act is built, take an actual screenshot of the live result and compare it directly against that act's reference PNG in `assets/` — check spacing, type scale, and color match, not just "does it look okay."
3. Commit progress to version control after each approved act, so nothing is lost between sessions.
4. **Definition of done, checked against every act before moving on:**
   - Matches its reference screenshot's layout, spacing, and color — not just "similar"
   - Scrubs smoothly on an actual phone test, not just desktop devtools
   - `prefers-reduced-motion` produces a complete alternate experience for that act
   - No banned words appear in any copy
   - The anchor object is visually traceable and consistent in shape across acts
   - Side rail correctly reflects the current act with no desync or lag

---

## 19. Still-pending items (do not attempt to solve these — they're intentionally out of scope for this build)

- Real logo/symbol (wordmark-only is correct for now)
- Final production domain/email (use the placeholders given in Section 11)
- Live Instagram/LinkedIn content (the links just need to point somewhere reasonable)
