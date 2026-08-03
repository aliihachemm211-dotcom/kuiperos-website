/* kuiperOS — scroll sequence
   Architecture: ONE pinned stage for the entire act sequence, one master
   scrub timeline, and a shared 3D "camera". Each act's scene sits at a
   z-station (act k at z = -k * STEP); between acts the camera dollies
   forward one station, so the outgoing composition flies past the viewer
   while the incoming one resolves from depth — no dead scroll between acts.
   Scrub-driven only; linear mapping (ease "none") throughout. */

gsap.registerPlugin(ScrollTrigger);

/* iOS Safari's collapsing address bar fires resize mid-scroll and would
   re-measure pinned sections at the worst moment; ignore those, while real
   resizes/orientation changes still trigger ScrollTrigger's auto-refresh. */
ScrollTrigger.config({ ignoreMobileResize: true });

const STEP = 1500;  /* z-distance between act stations (perspective is 1000px) */
const TRANS = 0.35; /* scroll-viewports consumed by each act-to-act transition */

/* Timeline unit = one viewport of scroll. `dist` values are Section 7's table. */
const ACTS = [
  {
    name: 'act1', dist: 1.0, scene: '.scene-1', slot: '#slot-1', slotScale: 1,
    ref: 'THREAD—0417', step: '01 / 05',
    caption: ['A message arrives at 10:41am.', 'In thirty seconds, the lead is qualified — not just logged.'],
    build: buildAct1
  },
  {
    name: 'act2', dist: 1.75, scene: '.scene-2', slot: '#slot-2', slotScale: 0.45,
    ref: 'MATCH—0417', step: '02 / 05',
    caption: ['Eighty-four listings. Only three match this inquiry.', 'The matching engine does the rest.'],
    build: buildAct2
  },
  {
    name: 'act3', dist: 1.5, scene: '.scene-3', slot: '#slot-3', slotScale: 0.45,
    ref: 'HANDOFF—0417', step: '03 / 05',
    caption: ['The agent is assigned with a click, and pinged instantly.'],
    build: buildAct3
  },
  {
    name: 'act4', dist: 0.75, scene: '.scene-4', slot: '#slot-4', slotScale: 0.45,
    ref: 'VIEWING—0417', step: '04 / 05',
    caption: ['The lead picks from the available slots.', 'The agent confirms with a click.'],
    build: buildAct4
  },
  {
    name: 'act5', dist: 1.5, scene: '.scene-5', slot: '#slot-5', slotScale: 1, dark: true,
    ref: 'OPS—0417', step: '05 / 05',
    caption: ['This is one thread.', 'Forty-two others are running the same way, right now.'],
    build: buildAct5,
    /* The anchor bubble BECOMES the highlighted lead card: size, radius and
       color morph while its faces crossfade (message out, RANIA K. in). */
    handoff(tl, at, dur) {
      tl.to(anchor, {
        width: 166, height: 86, borderRadius: 10,
        backgroundColor: '#2C5EFF',
        boxShadow: '0 0 0 1.5px #7E9BFF',
        duration: dur
      }, at)
        .to('.anchor-msg', { autoAlpha: 0, duration: dur * 0.40 }, at)
        .to('.anchor-face', { autoAlpha: 1, duration: dur * 0.50 }, at + dur * 0.40);
    }
  }
];

const camera = document.querySelector('.camera');
const anchor = document.querySelector('#anchor');
const railEl = {
  ref: document.getElementById('rail-ref'),
  step: document.getElementById('rail-step'),
  caption: document.getElementById('rail-caption')
};

/* --- Analytics: one distinct event per act entry, so drop-off between acts
       is visible. Fires once per act per page view. --- */
const trackActEntry = (() => {
  const seen = new Set();
  return (act) => {
    if (seen.has(act)) return;
    seen.add(act);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'act_entry', act: act });
  };
})();

/* --- Side rail: content SNAPS between acts (never fades — deliberate) --- */
const railOn = () => document.body.classList.add('rail-on');
const railOff = () => document.body.classList.remove('rail-on');

function setRail(act, index) {
  railEl.ref.textContent = act.ref;
  railEl.step.textContent = act.step;
  railEl.caption.innerHTML = act.caption.map(l => '<p>' + l + '</p>').join('');
  trackActEntry(index + 1);
}

/* --- Anchor slot geometry: transform-independent layout offsets, so they
       stay correct no matter where the scrub currently is. --- */
function slotPos(i) {
  const slot = document.querySelector(ACTS[i].slot);
  const scene = slot.closest('.scene');
  return {
    x: scene.offsetLeft + slot.offsetLeft,
    y: scene.offsetTop + slot.offsetTop
  };
}

function sizeSlots() {
  /* slot-1 reserves the anchor's exact footprint in Act 1's flow */
  const s1 = document.querySelector('#slot-1');
  if (s1 && !document.body.classList.contains('reduced')) {
    s1.style.height = anchor.offsetHeight + 'px';
  }
}

/* Continuously scale the stage so the tallest scene fits the viewport with
   breathing room — stepped media queries left clipping windows on mid-height
   screens (e.g. 1080p laptops). Uses layout offsets, so it is independent of
   whatever transforms the scrub currently has applied. */
function fitStage() {
  const stage = document.querySelector('.act-stage');
  if (!stage || document.body.classList.contains('reduced')) return;
  let maxBottom = 0;
  document.querySelectorAll('.scene').forEach(sc => {
    maxBottom = Math.max(maxBottom, sc.offsetTop + sc.offsetHeight);
  });
  const s = Math.min(1, (window.innerHeight - 24) / maxBottom);
  stage.style.transform = s < 1 ? 'scale(' + s.toFixed(4) + ')' : 'none';
}

const mm = gsap.matchMedia();

/* ===========================================================================
   Full cinematic experience
=========================================================================== */
mm.add('(prefers-reduced-motion: no-preference)', () => {

  const onRefreshInit = () => { sizeSlots(); fitStage(); };
  onRefreshInit();
  ScrollTrigger.addEventListener('refreshInit', onRefreshInit);

  /* --- Opener: three beats revealed by scroll, pinned --- */
  gsap.set(['.opener-tension-1', '.opener-tension-2', '.opener-pivot'], {
    autoAlpha: 0,
    y: 28
  });

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '#opener',
      start: 'top top',
      end: '+=120%',
      pin: true,
      scrub: true,
      invalidateOnRefresh: true
    }
  })
    .to('.opener-tension-1', { autoAlpha: 1, y: 0, duration: 0.20 }, 0.06)
    .to('.opener-tension-2', { autoAlpha: 1, y: 0, duration: 0.20 }, 0.34)
    .to('.opener-pivot',     { autoAlpha: 1, y: 0, duration: 0.20 }, 0.64)
    .to({}, { duration: 0.16 });

  /* --- Master sequence: all acts in one pin --- */

  /* Scenes parked at their stations; only act 1 visible at the start */
  ACTS.forEach((act, i) => {
    gsap.set(act.scene, { z: -i * STEP, autoAlpha: i === 0 ? 1 : 0 });
  });
  gsap.set(camera, { z: 0 });

  /* Base hidden states — every later tween that reveals an element uses
     immediateRender:false, so the element must start hidden here or it
     would sit visible before the playhead first reaches its tween. */
  gsap.set([anchor, '.auto-reply', '.form-card', '.capture-stamp', '.tick-label',
            '.scene-2 .grid-label', '.match-grid .cell', '.listing-card',
            '.node', '.connector-label', '.notify-card',
            '.scene-4 .grid-label', '.slot-card', '.booking-card',
            '.kcol', '.kcol .kcard', '.ledger'], { autoAlpha: 0 });
  gsap.set('.tick-line', { scaleY: 0, transformOrigin: 'top center' });
  gsap.set('.connector-line', { scaleX: 0, rotation: 6, transformOrigin: 'left center' });
  /* Match cells start dim like the rest; their accent state is the Act 2 moment */
  gsap.set('.match-grid .cell.match', {
    backgroundColor: '#EFEDE9',
    borderColor: 'rgba(44, 94, 255, 0)',
    boxShadow: '0 0 0px rgba(44, 94, 255, 0)'
  });

  /* Compute segment starts and total length first */
  const starts = [];
  let total = 0;
  ACTS.forEach((act, i) => {
    starts[i] = total;
    total += act.dist;
    if (i < ACTS.length - 1) total += TRANS;
  });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'sequence',
      trigger: '#sequence',
      start: 'top top',
      end: () => '+=' + (total * 100) + '%',
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onEnter: railOn,
      onEnterBack: railOn,
      onLeaveBack: railOff,
      onUpdate: (self) => {
        /* Rail (and the act-5 chrome inversion) snap at transition midpoints */
        const u = self.progress * total;
        let idx = 0;
        for (let i = 1; i < ACTS.length; i++) {
          if (u >= starts[i] - TRANS / 2) idx = i;
        }
        if (railEl.ref.textContent !== ACTS[idx].ref) {
          setRail(ACTS[idx], idx);
          document.body.classList.toggle('inverted', !!ACTS[idx].dark);
        }
      }
    }
  });

  ACTS.forEach((act, i) => {
    act.build(tl, starts[i], act.dist);
    if (i < ACTS.length - 1) addTransition(tl, i, starts[i] + act.dist);
  });

  /* Pad the timeline to exactly `total` units — ScrollTrigger maps the pin's
     scroll range onto the timeline's full duration, so without this, hold
     gaps at segment ends would compress and desync every position. */
  if (tl.duration() < total) tl.to({}, { duration: total - tl.duration() });

  setRail(ACTS[0], 0);

  /* DEV ONLY — remove before production deploy: ?frame=0.4 freezes the master
     timeline at that progress with pinning disabled and the opener hidden, so
     any moment can be screenshotted headlessly (no scrolling involved). */
  const frameParam = new URLSearchParams(location.search).get('frame');
  if (frameParam !== null) {
    const p = parseFloat(frameParam);
    const applyFrame = () => {
      document.body.classList.add('framemode', 'rail-on');
      ScrollTrigger.getAll().forEach(t => t.disable(true));
      fitStage();
      tl.pause().progress(0).progress(p); /* progress(0) forces a re-render */
      const u = p * total;
      let idx = 0;
      for (let i = 1; i < ACTS.length; i++) if (u >= starts[i] - TRANS / 2) idx = i;
      setRail(ACTS[idx], idx);
      document.body.classList.toggle('inverted', !!ACTS[idx].dark);
      window.scrollTo(0, 0);
    };
    /* Apply once, after fonts have settled layout (headless included) */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(applyFrame);
    } else {
      window.addEventListener('load', applyFrame);
    }
  }

  return () => ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
});

/* --- Generic act-to-act transition: camera dollies one station forward;
       the outgoing scene fades as it flies past the camera plane, the
       incoming scene resolves from depth, and the anchor counter-dollies
       so it stays on screen, mid-motion, travelling to its next slot. --- */
function addTransition(tl, i, at) {
  const next = i + 1;
  const nx = ACTS[next];
  tl.to(camera, { z: next * STEP, duration: TRANS }, at)
    /* outgoing holds until past mid-transition, gone before the camera-plane
       crossover inverts its projection (z +825 of +1000 at fade end) */
    .to(ACTS[i].scene, { autoAlpha: 0, duration: TRANS * 0.30 }, at + TRANS * 0.25)
    /* incoming has real presence by mid-transition */
    .fromTo(nx.scene, { autoAlpha: 0 },
      { autoAlpha: 1, duration: TRANS * 0.40, immediateRender: false }, at + TRANS * 0.10)
    .to(anchor, {
      x: () => slotPos(next).x,
      y: () => slotPos(next).y,
      z: -next * STEP,
      scale: nx.slotScale,
      duration: TRANS
    }, at);
  /* One of the two sanctioned background-color crossfades: Act 4 -> 5 */
  if (nx.dark) {
    tl.to('body', { backgroundColor: '#1A1917', duration: TRANS }, at)
      .to('.site-header', { backgroundColor: '#1A1917', borderBottomColor: '#3C3A37', duration: TRANS }, at)
      .to('.wordmark', { color: '#FAF9F7', duration: TRANS }, at);
  }
  if (nx.handoff) nx.handoff(tl, at, TRANS);
}

/* --- Act 1 — Contact (dist 1.0, fast) --- */
function buildAct1(tl, at) {
    const s1 = () => slotPos(0);
    tl.fromTo(anchor, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05, immediateRender: false }, at)
      .fromTo(anchor,
        { x: () => s1().x, y: () => s1().y + 150, z: -850, scale: 1 },
        { x: () => s1().x, y: () => s1().y, z: 0, duration: 0.16 }, at)
      .fromTo('.tick-1 .tick-line', { scaleY: 0, transformOrigin: 'top center' },
        { scaleY: 1, duration: 0.05, immediateRender: false }, at + 0.14)
      .fromTo('.tick-1 .tick-label', { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.04, immediateRender: false }, at + 0.16)
      .fromTo('.auto-reply', { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.05, immediateRender: false }, at + 0.20)
      .fromTo('.auto-reply', { y: 130, z: -780 },
        { y: 0, z: 0, duration: 0.16 }, at + 0.20)
      .to(anchor, { z: -70, duration: 0.16 }, at + 0.20)
      .fromTo('.tick-2 .tick-line', { scaleY: 0, transformOrigin: 'top center' },
        { scaleY: 1, duration: 0.05, immediateRender: false }, at + 0.34)
      .fromTo('.tick-2 .tick-label', { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.04, immediateRender: false }, at + 0.36)
      .fromTo('.form-card', { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.05, immediateRender: false }, at + 0.40)
      .fromTo('.form-card', { y: 140, z: -820 },
        { y: 0, z: 0, duration: 0.18 }, at + 0.40)
      .to(anchor, { z: -130, duration: 0.18 }, at + 0.40)
      .to('.auto-reply', { z: -70, duration: 0.18 }, at + 0.40)
      .fromTo('.capture-stamp', { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.04, immediateRender: false }, at + 0.64)
      .fromTo('.capture-stamp', { z: 330 },
        { z: 0, duration: 0.12 }, at + 0.64);
  /* remaining ~0.24 of the segment holds the completed frame */
}

/* --- Act 2 — Matching (dist 1.75, the lingered signature moment).
       Opening beats START inside the preceding transition (negative offsets)
       so the scene arrives already composing. Then: the three matches light
       up one by one (popping toward the camera), and the ACHRAFIEH-014
       listing card rises from depth. --- */
function buildAct2(tl, at) {
  tl.fromTo('.scene-2 .grid-label', { autoAlpha: 0, y: 26 },
    { autoAlpha: 1, y: 0, duration: 0.10, immediateRender: false }, at - TRANS * 0.70)
    .fromTo('.match-grid .cell', { autoAlpha: 0, y: 30, z: -140 },
      { autoAlpha: 1, y: 0, z: 0, duration: 0.16, stagger: { each: 0.02 }, immediateRender: false }, at - TRANS * 0.50)
    /* the signature moment: three matches resolve, one by one */
    .to('.match-grid .cell.match', {
      backgroundColor: '#FFFFFF',
      borderColor: '#2C5EFF',
      boxShadow: '0 0 18px rgba(44, 94, 255, 0.22)',
      z: 70,
      duration: 0.11,
      stagger: 0.12
    }, at + 0.65)
    .to('.match-grid .cell.match', { z: 0, duration: 0.09, stagger: 0.12 }, at + 0.76)
    /* the matched listing rises */
    .fromTo('.listing-card', { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.05, immediateRender: false }, at + 0.98)
    .fromTo('.listing-card', { y: 130, z: -780 },
      { y: 0, z: 0, duration: 0.24 }, at + 0.98);
}

/* --- Act 3 — Assignment (dist 1.5, weighted) --- */
function buildAct3(tl, at) {
  tl.fromTo('.node-admin', { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.05, immediateRender: false }, at - TRANS * 0.60)
    .fromTo('.node-admin', { y: 90, z: -700 },
      { y: 0, z: 0, duration: 0.16 }, at - TRANS * 0.60)
    .fromTo('.node-karim', { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.05, immediateRender: false }, at - TRANS * 0.40)
    .fromTo('.node-karim', { y: 90, z: -700 },
      { y: 0, z: 0, duration: 0.16 }, at - TRANS * 0.40)
    /* the handoff line draws left-to-right along its (static) 6-degree tilt */
    .fromTo('.connector-line', { scaleX: 0, rotation: 6 },
      { scaleX: 1, rotation: 6, duration: 0.16, immediateRender: false }, at + 0.10)
    .fromTo('.connector-label', { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.06, immediateRender: false }, at + 0.24)
    .fromTo('.notify-card', { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.05, immediateRender: false }, at + 0.36)
    .fromTo('.notify-card', { y: 110, z: -700 },
      { y: 0, z: 0, duration: 0.20 }, at + 0.36);
}

/* --- Act 4 — Booking (dist 0.75, fast) --- */
function buildAct4(tl, at) {
  tl.fromTo('.scene-4 .grid-label', { autoAlpha: 0, y: 26 },
    { autoAlpha: 1, y: 0, duration: 0.08, immediateRender: false }, at - TRANS * 0.60)
    .fromTo('.slot-card', { autoAlpha: 0, y: 40, z: -320 },
      { autoAlpha: 1, y: 0, z: 0, duration: 0.10, stagger: 0.03, immediateRender: false }, at - TRANS * 0.45)
    /* the lead picks Fri 11:30 */
    .to('.slot-picked', { backgroundColor: '#2C5EFF', color: '#FAF9F7', duration: 0.07 }, at + 0.10)
    .fromTo('.booking-card', { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.04, immediateRender: false }, at + 0.24)
    .fromTo('.booking-card', { y: 110, z: -650 },
      { y: 0, z: 0, duration: 0.16 }, at + 0.24);
}

/* --- Act 5 — Operation / Control Room (dist 1.5, slow finish) --- */
function buildAct5(tl, at) {
  tl.fromTo('.kcol', { autoAlpha: 0, y: 60, z: -500 },
    { autoAlpha: 1, y: 0, z: 0, duration: 0.14, stagger: 0.035, immediateRender: false }, at - TRANS * 0.55)
    .fromTo('.kcol .kcard', { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.10, stagger: 0.03, immediateRender: false }, at + 0.06)
    .fromTo('.ledger', { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.05, immediateRender: false }, at + 0.34)
    .fromTo('.ledger', { y: 90, z: -450 },
      { y: 0, z: 0, duration: 0.18 }, at + 0.34);
  /* the remainder of the segment is the deliberate slow hold before the CTA */
}

/* ===========================================================================
   prefers-reduced-motion: complete static experience — same content, same
   order, no pinning, no scroll-tied transforms. Only the rail snaps in.
=========================================================================== */
mm.add('(prefers-reduced-motion: reduce)', () => {
  document.body.classList.add('reduced');

  /* Anchor rejoins Act 1's flow */
  const slot1 = document.querySelector('#slot-1');
  slot1.appendChild(anchor);

  ScrollTrigger.create({
    trigger: '#sequence',
    start: 'top 60%',
    end: 'bottom bottom',
    onEnter: railOn,
    onEnterBack: railOn,
    onLeaveBack: railOff
  });

  ACTS.forEach((act, i) => {
    ScrollTrigger.create({
      trigger: act.scene,
      start: 'top 55%',
      onEnter: () => setRail(act, i),
      onEnterBack: () => setRail(act, i)
    });
  });
  setRail(ACTS[0], 0);

  return () => {
    document.body.classList.remove('reduced');
    camera.insertBefore(anchor, camera.firstElementChild);
  };
});

/* Re-measure pin distances once the self-hosted fonts have loaded (they
   change layout heights). */
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* DEV ONLY — remove before production deploy: ?scrub=0.4 jumps to that
   progress within the master sequence pin for frame review. */
const scrubParam = new URLSearchParams(location.search).get('scrub');
if (scrubParam !== null) {
  window.addEventListener('load', () => setTimeout(() => {
    const st = ScrollTrigger.getById('sequence');
    if (st) window.scrollTo(0, st.start + parseFloat(scrubParam) * (st.end - st.start));
  }, 300));
}
