/* ===========================================================================
   kuiperOS v2 — checkpoint 1: laptop frame, tab mechanics, Act 1 (Inbox).

   The chat thread is the spine. Everything the lead receives arrives as a
   message in it. Motion is physical: the screen wakes, the panel pushes in,
   the thread travels, a real cursor drifts and overshoots, text types.
=========================================================================== */

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FRAME = new URLSearchParams(location.search).get('frame');

/* ---------------------------------------------------------------------------
   Lenis, wired to ScrollTrigger the way GSAP documents it: Lenis drives the
   real window scroll, so no scrollerProxy — just an update per scroll event,
   one shared RAF loop owned by gsap.ticker, and lagSmoothing off so a stalled
   frame can't desync the two.
--------------------------------------------------------------------------- */
let lenis = null;
if (typeof Lenis !== 'undefined' && !REDUCED && FRAME === null) {
  lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
}

/* --------------------------------------------------------------------------- */

const screenEl = document.getElementById('screen');
const machine  = document.getElementById('machine');
const thread   = document.getElementById('thread');
const inner    = document.getElementById('thread-inner');
const cursor   = document.getElementById('cursor');
const ring     = document.getElementById('click-ring');
const underline = document.getElementById('tab-underline');
const narrLine = document.getElementById('narration-line');

const SCREEN_W = 1240, SCREEN_H = 780;

/* Section 8.3 — Inbox caption, verbatim */
const CAPTION_INBOX = 'A message arrives at 10:41am. In thirty seconds, the lead is qualified — not just logged.';

/* Section 8.4 — demo data, in the field order given by 8.5 */
const FIELDS = [
  { v: 'Rania K.' },
  { v: '+961 3 xxx xxx' },
  { v: 'Achrafieh, Beirut' },
  { v: '2' },
  { v: '$180,000' },
  { v: 'Ready now', select: true }
];

/* ---------------------------------------------------------------------------
   Fit the machine to the viewport. Transform scale would leave a full-size
   layout box behind, so the box is pulled back in with compensating margins.
--------------------------------------------------------------------------- */
function fitMachine() {
  if (document.body.classList.contains('reduced')) return;
  const W = machine.offsetWidth, H = machine.offsetHeight;
  if (!W || !H) return;
  const availW = window.innerWidth - 2 * 40;
  const chrome = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 88;
  const availH = window.innerHeight - chrome - 150; /* room for the narration */
  const s = Math.min(1, availW / W, availH / H);
  machine.style.transform = 'scale(' + s.toFixed(4) + ')';
  machine.style.margin = (-(1 - s) * H / 2).toFixed(1) + 'px ' + (-(1 - s) * W / 2).toFixed(1) + 'px';
  machine.dataset.scale = s;
}

/* point at the centre of an element, in screen-local coordinates */
function ptIn(el) {
  const s = screenEl.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const k = s.width / SCREEN_W || 1;
  return { x: (r.left - s.left) / k + r.width / (2 * k), y: (r.top - s.top) / k + r.height / (2 * k) };
}

/* thread travel: put `el` just above the thread's lower edge */
function threadY(el, pad) {
  const h = thread.offsetHeight;
  return Math.min(h, -(el.offsetTop + el.offsetHeight - h + (pad === undefined ? 26 : pad)));
}

/* split the caption into word spans so it can arrive word by word */
function buildCaption(text) {
  narrLine.innerHTML = text.split(' ')
    .map(w => '<span class="w">' + w + '</span>').join(' ');
  return gsap.utils.toArray('#narration-line .w');
}

/* ---------------------------------------------------------------------------
   Build
--------------------------------------------------------------------------- */

const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {

  fitMachine();
  ScrollTrigger.addEventListener('refreshInit', fitMachine);

  const words = buildCaption(CAPTION_INBOX);

  /* --- opener --- */
  gsap.set(['.opener-tension', '.opener-sub', '.opener-pivot'], { autoAlpha: 0, y: 30 });
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#opener', start: 'top top', end: '+=130%', pin: true, scrub: true, invalidateOnRefresh: true }
  })
    .to('.opener-tension', { autoAlpha: 1, y: 0, duration: .2 }, .06)
    .to('.opener-sub',     { autoAlpha: 1, y: 0, duration: .2 }, .34)
    .to('.opener-pivot',   { autoAlpha: 1, y: 0, duration: .2 }, .64)
    .to({}, { duration: .16 });

  /* --- base state: screen asleep, app pushed back, thread below the fold --- */
  const panel = document.getElementById('panel-inbox');
  const appbar = document.querySelector('.appbar');

  gsap.set(screenEl, { backgroundColor: '#0F0E0D' });
  gsap.set([appbar, panel], { autoAlpha: 0, scale: .965, filter: 'blur(9px)', y: 14 });
  gsap.set(underline, { x: 0, width: 0 });
  gsap.set(inner, { y: () => thread.offsetHeight });
  gsap.set(['#m-ask', '#m-reply', '#m-form', '#m-captured'], { autoAlpha: 1 });
  gsap.set(cursor, { autoAlpha: 1, x: SCREEN_W + 60, y: SCREEN_H - 120 });
  gsap.set(ring, { scale: .4, autoAlpha: 0 });
  gsap.set(words, { autoAlpha: 0, y: 16, filter: 'blur(5px)' });
  FIELDS.forEach((f, i) => {
    const el = document.querySelector('.ff[data-f="' + i + '"] .fval');
    if (el) el.textContent = '';
  });

  const T = { boot: 0, total: 3.40 };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'seq',
      trigger: '#sequence', start: 'top top',
      end: () => '+=' + (T.total * 100) + '%',
      pin: true, scrub: true, invalidateOnRefresh: true,
      onUpdate: (self) => setFocus(self.progress * T.total)
    }
  });

  /* ---- boot: the screen wakes, the app pushes in, the underline slides ---- */
  tl.to(screenEl, { backgroundColor: '#FAF9F7', duration: .22 }, 0)
    .to([appbar, panel], { autoAlpha: 1, duration: .12 }, .06)
    .to([appbar, panel], { scale: 1, filter: 'blur(0px)', y: 0, duration: .34 }, .06)
    /* the underline physically slides onto Inbox, never teleports */
    .to(underline, {
      x: () => { const t = document.querySelector('.tab.is-active'); return t.offsetLeft; },
      width: () => document.querySelector('.tab.is-active').offsetWidth,
      duration: .26
    }, .16);

  /* ---- caption arrives, word by word ---- */
  tl.to(words, {
    autoAlpha: 1, y: 0, filter: 'blur(0px)',
    duration: .16, stagger: { each: .022 }
  }, .46);

  /* ---- the thread ---- */
  const push = (sel, at, dur, pad) => {
    const el = document.querySelector(sel);
    tl.to(inner, { y: () => threadY(el, pad), duration: dur }, at);
    tl.fromTo(sel, { scale: .97 }, { scale: 1, duration: dur * .75, immediateRender: false }, at);
  };

  push('#m-ask',   .50, .26);
  push('#m-reply', .88, .26);
  push('#m-form', 1.22, .30, 20);

  /* ---- the cursor fills the form ---- */
  const moveTo = (el, at, dur, ox, oy) => {
    /* overshoot, then correct — a hand, not a robot */
    tl.to(cursor, { x: () => ptIn(el).x + ox, y: () => ptIn(el).y + oy, duration: dur * .68 }, at)
      .to(cursor, { x: () => ptIn(el).x, y: () => ptIn(el).y, duration: dur * .32 }, at + dur * .68);
  };
  const click = (at) => {
    tl.set(ring, { x: () => gsap.getProperty(cursor, 'x'), y: () => gsap.getProperty(cursor, 'y'), immediateRender: false }, at)
      .fromTo(ring, { scale: .35, autoAlpha: .9 }, { scale: 1.7, autoAlpha: 0, duration: .07, immediateRender: false }, at);
  };

  const F0 = 1.62, STEP = .18;
  FIELDS.forEach((f, i) => {
    const box = document.querySelector('.ff[data-f="' + i + '"] .fbox');
    const val = document.querySelector('.ff[data-f="' + i + '"] .fval');
    const at = F0 + i * STEP;
    const ox = (i % 2 ? 16 : -14), oy = (i % 3 ? 11 : -9);

    moveTo(box, at, .085, ox, oy);
    click(at + .09);

    if (f.select) {
      /* A select is chosen, not typed. Driven by a proxy rather than set(),
         so the value is derived from progress and is correct scrubbing in
         either direction. */
      const p = { n: 0 };
      tl.to(p, {
        n: 1, duration: .05,
        onUpdate: () => { val.textContent = p.n > .35 ? f.v : ''; }
      }, at + .105);
      tl.fromTo(box, { backgroundColor: '#E6ECFF' }, { backgroundColor: '#FFFFFF', duration: .06, immediateRender: false }, at + .105);
    } else {
      const p = { n: 0 };
      tl.to(p, {
        n: f.v.length, duration: .07, snap: { n: 1 },
        onUpdate: () => { val.textContent = f.v.slice(0, Math.round(p.n)); }
      }, at + .105);
    }
  });

  /* ---- submit ---- */
  const submit = document.getElementById('btn-submit');
  const AT_S = F0 + FIELDS.length * STEP + .06;
  moveTo(submit, AT_S, .12, 20, -14);
  tl.to(submit, { y: -2, duration: .05 }, AT_S + .13);           /* hover lift */
  click(AT_S + .19);
  tl.to(submit, { scale: .96, y: 1, duration: .035 }, AT_S + .19)
    .to(submit, { scale: 1, y: 0, duration: .05 }, AT_S + .225);

  /* ---- captured ---- */
  push('#m-captured', AT_S + .34, .22, 22);
  tl.to(cursor, { x: SCREEN_W + 60, y: SCREEN_H - 60, duration: .22 }, AT_S + .34);

  /* pad to the pinned distance */
  if (tl.duration() < T.total) tl.to({}, { duration: T.total - tl.duration() });

  /* focus ring is derived from progress, so it is correct scrubbing either way */
  function setFocus(u) {
    let active = -1;
    for (let i = 0; i < FIELDS.length; i++) {
      const a = F0 + i * STEP;
      if (u >= a + .085 && u < a + STEP + .02) active = i;
    }
    if (u >= AT_S + .1) active = -1;
    document.querySelectorAll('.fbox').forEach((b, i) => b.classList.toggle('is-focus', i === active));
  }

  /* ---- dev frame capture ---- */
  if (FRAME !== null) {
    const apply = () => {
      document.body.classList.add('framemode');
      ScrollTrigger.getAll().forEach(t => t.disable(true));
      fitMachine();
      const p = parseFloat(FRAME);
      tl.pause().progress(0).progress(p);
      setFocus(p * T.total);
      window.scrollTo(0, 0);
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(apply, 80));
  }

  return () => ScrollTrigger.removeEventListener('refreshInit', fitMachine);
});

/* ---------------------------------------------------------------------------
   Reduced motion — same content and order, no camera, nothing hidden
--------------------------------------------------------------------------- */
mm.add('(prefers-reduced-motion: reduce)', () => {
  document.body.classList.add('reduced');
  buildCaption(CAPTION_INBOX);
  FIELDS.forEach((f, i) => {
    const el = document.querySelector('.ff[data-f="' + i + '"] .fval');
    if (el) el.textContent = f.v;
  });
  const t = document.querySelector('.tab.is-active');
  gsap.set(underline, { x: t.offsetLeft, width: t.offsetWidth });
  return () => document.body.classList.remove('reduced');
});

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
