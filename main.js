/* ===========================================================================
   kuiperOS v2 — Acts 1–3.
   The chat thread is the spine; the camera leaves it for system internals
   (the matching engine, the agent's desk) and returns. Motion is physical.
=========================================================================== */

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FRAME = new URLSearchParams(location.search).get('frame');

/* --- Lenis, wired to ScrollTrigger the way GSAP documents it --------------- */
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
const cursor   = document.getElementById('cursor');
const ring     = document.getElementById('click-ring');
const underline = document.getElementById('tab-underline');

const thInbox = document.getElementById('thread');
const inInbox = document.getElementById('thread-inner');
const thAgent = document.getElementById('thread-agent');
const inAgent = document.getElementById('thread-agent-inner');

const PANEL = {
  inbox: document.getElementById('panel-inbox'),
  matching: document.getElementById('panel-matching'),
  agent: document.getElementById('panel-agent'),
  pipeline: document.getElementById('panel-pipeline'),
  control: document.getElementById('panel-control')
};
const TABEL = {};
document.querySelectorAll('.tab').forEach(t => TABEL[t.dataset.tab] = t);
const TAB_LABEL = {
  inbox: 'INBOX', matching: 'MATCHING', agent: 'AGENT DESK',
  pipeline: 'PIPELINE', control: 'CONTROL ROOM'
};

const SCREEN_W = 1240, SCREEN_H = 780;

/* Captions — nine lines across seven acts. Tier A opens a new act; tier B is
   a second line inside an act already on screen. Supersedes v2 8.3's five
   side-rail lines, which the v3 act map replaces. */
const CAPTIONS = [
  'A lead arrives.',                                                          /* 1a */
  'Kuiper replies, qualifies, and captures.',                                 /* 1b */
  'The form’s filled. Now the engine finds the match.',                       /* 2  */
  'The lead picks the one she wants.',                                        /* 3  */
  'The right agent is notified.',                                             /* 4  */
  'Available slots. She books it herself.',                                   /* 5a */
  'Confirmed. Her thread is resolved.',                                       /* 5b */
  'This is one thread. Forty-two others are running the same way, right now.',/* 6  */
  'This is what running the whole floor looks like.'                          /* 7  */
];

/* How much larger the centred state is than the settled one. Responsive:
   at 1.5 a wrapped caption on a phone is wider than the viewport and spills
   straight off the laptop frame it's supposed to be sitting over. */
const capBig = () => {
  const w = window.innerWidth;
  if (w < 768) return 1.22;
  if (w < 1100) return 1.36;
  return 1.5;
};

/* Section 8.4 — demo data, in the field order given by 8.5 */
const FIELDS = [
  { v: 'Rania K.' }, { v: '+961 3 xxx xxx' }, { v: 'Achrafieh, Beirut' },
  { v: '2' }, { v: '$180,000' }, { v: 'Ready now', select: true }
];

/* ---------------------------------------------------------------------------
   The ledger. Section 7: text-only rows, photos only on the three winners.
   The three winners are exactly the listings that then arrive in the thread.
--------------------------------------------------------------------------- */
const WINNERS = [
  { i: 4,  ref: 'Achrafieh-014', area: 'Achrafieh', br: 2, price: '$180,000', photo: 'Assets/Listing 1.jpg', spec: '95m² · 2nd floor · balcony' },
  { i: 16, ref: 'Dbayeh-027',    area: 'Dbayeh',    br: 2, price: '$176,000', photo: 'Assets/Listing 2.jpg', spec: '132m² · waterfront' },
  { i: 27, ref: 'Jounieh-008',   area: 'Jounieh',   br: 2, price: '$168,000', photo: 'Assets/Listing 3.jpg', spec: '96m² · top floor' }
];
const AREAS = ['Hamra', 'Badaro', 'Mar Mikhael', 'Verdun', 'Rabieh', 'Antelias',
               'Gemmayze', 'Zalka', 'Baabda', 'Achrafieh', 'Jounieh', 'Dbayeh'];
const ROWS = 34;
/* eliminated in three waves so the visible list narrows with the counter */
const WAVE_SIZE = [17, 11, 3];

function buildLedger() {
  const body = document.getElementById('ledger-body');
  if (!body || body.childElementCount) return;

  const others = [];
  for (let i = 0; i < ROWS; i++) if (!WINNERS.some(w => w.i === i)) others.push(i);
  others.sort((a, b) => ((a * 17) % ROWS) - ((b * 17) % ROWS));
  const wave = {};
  let k = 0;
  WAVE_SIZE.forEach((n, w) => { for (let j = 0; j < n; j++) wave[others[k++]] = w; });

  const frag = document.createDocumentFragment();
  for (let i = 0; i < ROWS; i++) {
    const win = WINNERS.find(w => w.i === i);
    const row = document.createElement('div');
    row.className = 'lrow' + (win ? ' win' : '');
    if (!win) row.dataset.wave = wave[i];
    const area = win ? win.area : AREAS[i % AREAS.length];
    const ref = win ? win.ref : area.slice(0, 3).toUpperCase() + '-' + (100 + ((i * 29) % 800));
    const br = win ? win.br : (i % 4) + 1;
    const price = win ? win.price : '$' + (95 + ((i * 41) % 250)) + ',000';
    row.innerHTML =
      '<span class="lr">' + ref + '</span><span>' + area + '</span><span>' + br + '</span>' +
      '<span class="lp">' + price + '</span>' +
      (win ? '<div class="lrow-win-inner"><div class="lrow-thumb"><img src="' + win.photo +
             '" alt=""></div><div class="lrow-spec"><b>' + win.ref + '</b>' + win.br +
             'BR · ' + win.area + ' · ' + win.spec + ' · ' + win.price + '</div></div>' : '');
    frag.appendChild(row);
  }
  body.appendChild(frag);
}
buildLedger();

/* ---------------------------------------------------------------------------
   The Pipeline board. Section 5: GHL Opportunities structure — contact name,
   value figure, stage tag, drag affordance. Section 8.9 licenses invented
   client names for these background cards, and only for these.
--------------------------------------------------------------------------- */
const PIPE_COLS = [
  { name: 'New',       n: 7 },
  { name: 'Qualified', n: 6 },
  { name: 'Matched',   n: 6, lead: true },
  { name: 'Assigned',  n: 6 },
  { name: 'Contacted', n: 6 },
  { name: 'Confirmed', n: 5 }
];
const CLIENTS = [
  'Nadia H.', 'Marc B.', 'Layla S.', 'Tarek A.', 'Joelle N.', 'Ziad M.', 'Maya F.',
  'Rami T.', 'Carine D.', 'Elie G.', 'Nour S.', 'Hadi Z.', 'Yara C.', 'Fadi R.',
  'Lea P.', 'Omar J.', 'Rita B.', 'Sarah W.', 'Georges A.', 'Mona K.', 'Bilal H.',
  'Tala R.', 'Nabil S.', 'Perla M.', 'Wissam D.', 'Aline T.', 'Jad F.', 'Reem A.',
  'Kamal N.', 'Sandra L.', 'Hiba Y.', 'Michel C.', 'Dalia E.', 'Samir O.', 'Rana B.',
  'Charbel K.', 'Amal D.', 'Nizar F.', 'Salma A.', 'Roy H.', 'Farah T.'
];

function buildKanban() {
  const board = document.getElementById('kanban');
  if (!board || board.childElementCount) return;
  let c = 0;
  PIPE_COLS.forEach(col => {
    const el = document.createElement('div');
    el.className = 'kcol';
    el.innerHTML = '<div class="kcol-head"><span>' + col.name.toUpperCase() +
      '</span><span class="kcol-n">' + col.n + '</span></div>';
    if (col.lead) {
      const lead = document.createElement('div');
      lead.className = 'kcard is-lead';
      lead.id = 'lead-card';
      lead.innerHTML = '<span class="kcard-grip"></span><span class="kcard-name">RANIA K.</span>' +
        '<span class="kcard-val">THREAD-0417 · $180,000</span>' +
        '<span class="kcard-tag">' + col.name.toUpperCase() + '</span>';
      el.appendChild(lead);
    }
    for (let i = 0; i < col.n; i++) {
      const card = document.createElement('div');
      card.className = 'kcard';
      const v = 95 + ((c * 37) % 240);
      card.innerHTML = '<span class="kcard-grip"></span><span class="kcard-name">' +
        CLIENTS[c % CLIENTS.length] + '</span><span class="kcard-val">$' + v + ',000</span>' +
        '<span class="kcard-tag">' + col.name.toUpperCase() + '</span>';
      el.appendChild(card);
      c++;
    }
    board.appendChild(el);
  });
}
buildKanban();

/* --------------------------------------------------------------------------- */

function fitMachine() {
  if (document.body.classList.contains('reduced')) return;
  const W = machine.offsetWidth, H = machine.offsetHeight;
  if (!W || !H) return;
  const chrome = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 88;
  const s = Math.min(1, (window.innerWidth - 80) / W, (window.innerHeight - chrome - 150) / H);
  machine.style.transform = 'scale(' + s.toFixed(4) + ')';
  machine.style.margin = (-(1 - s) * H / 2).toFixed(1) + 'px ' + (-(1 - s) * W / 2).toFixed(1) + 'px';
  machine.dataset.scale = s;
}

function ptIn(el) {
  const s = screenEl.getBoundingClientRect(), r = el.getBoundingClientRect();
  const k = s.width / SCREEN_W || 1;
  return { x: (r.left - s.left) / k + r.width / (2 * k), y: (r.top - s.top) / k + r.height / (2 * k) };
}

function threadY(threadEl, el, pad) {
  const h = threadEl.offsetHeight;
  return Math.min(h, -(el.offsetTop + el.offsetHeight - h + (pad === undefined ? 26 : pad)));
}

function buildCaps() {
  const wrap = document.getElementById('caps');
  wrap.innerHTML = CAPTIONS.map(c =>
    '<p class="cap"><span class="cap-dot"></span><span class="cap-text">' + c + '</span></p>'
  ).join('');
  return gsap.utils.toArray('.cap');
}

const mm = gsap.matchMedia();

/* ===========================================================================
   Cinematic — seven acts.

   Rania's thread is the spine: it receives the form, then the listings, then
   the slots, then the confirmation. Matching, Agent Desk, Pipeline and
   Control Room are cutaways that show what happened behind her chat before
   returning to see the consequence land in it.
=========================================================================== */
mm.add('(prefers-reduced-motion: no-preference)', () => {

  fitMachine();
  ScrollTrigger.addEventListener('refreshInit', fitMachine);

  const CAP = buildCaps();
  const capsWrap = document.getElementById('caps');
  const dim = document.getElementById('stage-dim');
  const appbar = document.querySelector('.appbar');

  /* --- base state --- */
  gsap.set(screenEl, { backgroundColor: '#0F0E0D' });
  gsap.set([appbar, PANEL.inbox], { autoAlpha: 0, scale: .965, filter: 'blur(9px)', y: 14 });
  gsap.set([PANEL.matching, PANEL.agent, PANEL.pipeline, PANEL.control],
    { autoAlpha: 0, scale: 1.07, filter: 'blur(9px)' });
  gsap.set('.kcard', { autoAlpha: 0, y: -12 });
  gsap.set(['.ctrl-head', '.ctrl-aggregate', '.ctrl-row'], { autoAlpha: 0, y: 20 });
  gsap.set(underline, { x: 0, width: 0 });
  gsap.set(inInbox, { y: () => thInbox.offsetHeight });
  gsap.set(inAgent, { y: () => thAgent.offsetHeight });
  gsap.set(cursor, { autoAlpha: 1, x: SCREEN_W + 60, y: SCREEN_H - 120 });
  gsap.set(ring, { scale: .4, autoAlpha: 0 });
  /* base size is the settled size. A property named only in a fromTo's
     from-vars animates toward the element's CURRENT value, so basing these
     at CAP_BIG made tier-B captions inflate to the centred size. */
  gsap.set(CAP, { xPercent: -50, autoAlpha: 0, scale: 1 });
  gsap.set(dim, { opacity: 0 });
  gsap.set('.lrow', { autoAlpha: 0, x: -14 });
  gsap.set('.scanline', { autoAlpha: 0, y: 0 });
  gsap.set('.lrow-win-inner', { autoAlpha: 0 });
  document.querySelectorAll('.fval').forEach(e => e.textContent = '');

  /* -------------------------------------------------------------------------
     Pacing. Act starts are derived from one dwell table, so "feels uneven"
     is fixed here rather than by hunting absolute times through the file.
     Matching and the Control Room close get room; the Agent Desk handoff and
     the booking cutaway move quicker, since they're simpler beats.
  ------------------------------------------------------------------------- */
  const DWELL = { 1: 3.30, 2: 3.10, 3: 2.05, 4: 1.75, 5: 2.95, 6: 1.55, 7: 1.85 };
  const A = {};
  (() => { let t = 0; for (let i = 1; i <= 7; i++) { A[i] = t; t += DWELL[i]; } })();
  const END = A[7] + DWELL[7];

  /* Scroll distance per timeline unit — the primary "feels faster" lever,
     independent of content. Lower means the same acts need less scrolling. */
  const SCRUB = 90;

  let DUR = END + 1.4;
  const SWITCHES = [{ t: 0, tab: 'inbox' }];
  let curTab = 'inbox', zTop = 4;

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'seq', trigger: '#sequence', start: 'top top',
      end: () => '+=' + (DUR * SCRUB) + '%',
      pin: true, scrub: true, invalidateOnRefresh: true,
      onUpdate: (self) => { const u = self.progress * DUR; setFocus(u); setTab(u); }
    }
  });

  /* ---- reusable mechanics ---------------------------------------------- */

  const pushIn = (threadEl, innerEl, sel, at, dur, pad) => {
    const el = document.querySelector(sel);
    tl.to(innerEl, { y: () => threadY(threadEl, el, pad), duration: dur }, at);
    tl.fromTo(sel, { scale: .97 }, { scale: 1, duration: dur * .75, immediateRender: false }, at);
  };

  const moveTo = (el, at, dur, ox, oy) => {
    tl.to(cursor, { x: () => ptIn(el).x + ox, y: () => ptIn(el).y + oy, duration: dur * .68 }, at)
      .to(cursor, { x: () => ptIn(el).x, y: () => ptIn(el).y, duration: dur * .32 }, at + dur * .68);
  };
  const click = (at) => {
    tl.set(ring, { x: () => gsap.getProperty(cursor, 'x'), y: () => gsap.getProperty(cursor, 'y'), immediateRender: false }, at)
      .fromTo(ring, { scale: .35, autoAlpha: .9 }, { scale: 1.7, autoAlpha: 0, duration: .07, immediateRender: false }, at);
  };

  /* A tab change is a zoom-through: the outgoing view pulls back and softens
     while the incoming one rushes toward the camera and settles. Never a
     cross-fade in place; the underline slides, never teleports. */
  const switchTab = (to, at, dur) => {
    const from = PANEL[curTab], toEl = PANEL[to];
    if (from === toEl) return;
    tl.set(toEl, { zIndex: ++zTop, immediateRender: false }, at)
      .to(from, { scale: .92, filter: 'blur(11px)', duration: dur * .62 }, at)
      .to(from, { autoAlpha: 0, duration: dur * .22 }, at + dur * .44)
      .fromTo(toEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur * .18, immediateRender: false }, at + dur * .26)
      .fromTo(toEl, { scale: 1.07, filter: 'blur(9px)' },
        { scale: 1, filter: 'blur(0px)', duration: dur * .72, immediateRender: false }, at + dur * .26)
      .to(underline, {
        x: () => TABEL[to].offsetLeft, width: () => TABEL[to].offsetWidth, duration: dur * .8
      }, at + dur * .1);
    SWITCHES.push({ t: at + dur * .5, tab: to });
    curTab = to;
  };

  /* -------------------------------------------------------------------------
     Captions.

     Tier A (a new act): the screen dims for a beat, the pill arrives large
     and centred over it, holds, then recedes in z into a small fixed lower
     position as the scene sharpens. Its border is accent blue only while
     something is genuinely changing, then reverts to neutral.

     Tier B (a second line inside one held act): a fast crossfade and a micro
     slide. No size change, no border flash — a correction, not an event.
  ------------------------------------------------------------------------- */
  const LINE = '#E8E5E0', ACC = '#2C5EFF';

  /* how far above the settled position the centred state sits — measured, so
     it stays over the screen's middle at any viewport */
  const capLift = () => {
    const m = machine.getBoundingClientRect(), c = capsWrap.getBoundingClientRect();
    if (!m.height || !c.height) return -240;
    return (m.top + m.height / 2) - (c.top + 23);
  };

  const capGo = (i, at) =>
    tl.to(CAP[i], { autoAlpha: 0, y: '-=12', scale: '*=.96', duration: .09 }, at);

  const capA = (i, at) => {
    const el = CAP[i];
    const IN = .11, HOLD = .19, SET = .24;

    tl.to(dim, { opacity: 1, duration: .09 }, at)
      .to(dim, { opacity: 0, duration: .2 }, at + IN + HOLD);

    /* arrives large and centred, sliding up, snapping out. borderColor is
       named on both sides so the accent holds until the settle reverts it —
       named only on the from side it would decay straight back to neutral. */
    tl.fromTo(el,
      { autoAlpha: 0, scale: () => capBig(), borderColor: ACC, y: () => capLift() + 19 },
      { autoAlpha: 1, scale: () => capBig(), borderColor: ACC, y: () => capLift(),
        duration: IN, ease: 'power3.out', immediateRender: false }, at);

    /* the dot pulses once on appearance, then goes static */
    tl.fromTo(el.querySelector('.cap-dot'),
      { boxShadow: '0 0 0 0 rgba(44,94,255,.55)' },
      { boxShadow: '0 0 0 8px rgba(44,94,255,0)', duration: .17, immediateRender: false }, at + IN * .45);

    /* recedes in z rather than flatly resizing */
    tl.to(el, { y: 0, scale: 1, duration: SET, ease: 'power2.inOut' }, at + IN + HOLD)
      .to(el, { borderColor: LINE, duration: SET * .75 }, at + IN + HOLD)
      .to(el, { filter: 'blur(2.4px)', duration: SET * .38 }, at + IN + HOLD)
      .to(el, { filter: 'blur(0px)', duration: SET * .62 }, at + IN + HOLD + SET * .38);
  };

  /* no size change and no border flash — a correction, not a new event */
  const capB = (from, to, at) => {
    tl.to(CAP[from], { autoAlpha: 0, y: -9, duration: .05 }, at);
    tl.fromTo(CAP[to],
      { autoAlpha: 0, y: 9, scale: 1, borderColor: LINE },
      { autoAlpha: 1, y: 0, scale: 1, borderColor: LINE,
        duration: .06, ease: 'power2.out', immediateRender: false }, at + .03);
  };

  /* =====================================================================
     ACT 1 — Inbox. A lead arrives, and is qualified and captured.
  ===================================================================== */
  tl.to(screenEl, { backgroundColor: '#FAF9F7', duration: .22 }, 0)
    .to([appbar, PANEL.inbox], { autoAlpha: 1, duration: .12 }, .06)
    .to([appbar, PANEL.inbox], { scale: 1, filter: 'blur(0px)', y: 0, duration: .34 }, .06)
    .to(underline, {
      x: () => TABEL.inbox.offsetLeft, width: () => TABEL.inbox.offsetWidth, duration: .26
    }, .16);

  capA(0, A[1] + .30);
  pushIn(thInbox, inInbox, '#m-ask', A[1] + .54, .26);

  /* the swap is the moment the system speaks, not a new scene */
  capB(0, 1, A[1] + .88);
  pushIn(thInbox, inInbox, '#m-reply', A[1] + .94, .26);
  pushIn(thInbox, inInbox, '#m-form', A[1] + 1.26, .30, 20);

  const F0 = A[1] + 1.62, STEP = .18;
  FIELDS.forEach((f, i) => {
    const box = document.querySelector('.ff[data-f="' + i + '"] .fbox');
    const val = document.querySelector('.ff[data-f="' + i + '"] .fval');
    const at = F0 + i * STEP;
    moveTo(box, at, .085, (i % 2 ? 16 : -14), (i % 3 ? 11 : -9));
    click(at + .09);
    if (f.select) {
      const p = { n: 0 };
      tl.to(p, { n: 1, duration: .05, onUpdate: () => { val.textContent = p.n > .35 ? f.v : ''; } }, at + .105);
      tl.fromTo(box, { backgroundColor: '#E6ECFF' }, { backgroundColor: '#FFFFFF', duration: .06, immediateRender: false }, at + .105);
    } else {
      const p = { n: 0 };
      tl.to(p, { n: f.v.length, duration: .07, snap: { n: 1 },
        onUpdate: () => { val.textContent = f.v.slice(0, Math.round(p.n)); } }, at + .105);
    }
  });

  const submit = document.getElementById('btn-submit');
  const AT_S = F0 + FIELDS.length * STEP + .04;
  moveTo(submit, AT_S, .12, 20, -14);
  tl.to(submit, { y: -2, duration: .05 }, AT_S + .13);
  click(AT_S + .19);
  tl.to(submit, { scale: .96, y: 1, duration: .035 }, AT_S + .19)
    .to(submit, { scale: 1, y: 0, duration: .05 }, AT_S + .225);
  pushIn(thInbox, inInbox, '#m-captured', AT_S + .32, .22, 22);
  tl.to(cursor, { x: SCREEN_W + 60, y: SCREEN_H - 60, duration: .22 }, AT_S + .32);

  /* =====================================================================
     ACT 2 — Matching. Out of the thread, into the engine.
  ===================================================================== */
  capGo(1, A[2]);
  switchTab('matching', A[2], .45);
  capA(2, A[2] + .16);

  tl.to('.lrow', { autoAlpha: 1, x: 0, duration: .16, stagger: { each: .009 } }, A[2] + .56);
  tl.fromTo('.scanline', { y: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: .06, immediateRender: false }, A[2] + .66)
    .to('.scanline', { y: () => document.getElementById('ledger-body').offsetHeight - 33, duration: .42 }, A[2] + .72)
    .to('.scanline', { autoAlpha: 0, duration: .06 }, A[2] + 1.10);

  /* each criterion ticks on, its listings collapse out, the counter rolls */
  const numEl = document.getElementById('match-num');
  const COUNT = [84, 41, 12, 3];
  [0, 1, 2].forEach(w => {
    const at = A[2] + 1.16 + w * .52;
    tl.to('.chip[data-c="' + w + '"]', { duration: .001,
      onStart: () => document.querySelector('.chip[data-c="' + w + '"]').classList.add('is-on'),
      onReverseComplete: () => document.querySelector('.chip[data-c="' + w + '"]').classList.remove('is-on')
    }, at);
    tl.to('.lrow[data-wave="' + w + '"]', {
      height: 0, opacity: 0, x: -22, borderBottomWidth: 0,
      duration: .3, stagger: { each: .01 }
    }, at + .06);
    const p = { n: COUNT[w] };
    tl.to(p, { n: COUNT[w + 1], duration: .34, snap: { n: 1 },
      onUpdate: () => { numEl.textContent = Math.round(p.n); } }, at + .06);
  });

  /* only the three winners carry photos */
  tl.to('.lrow.win', { height: 108, duration: .26, stagger: .06 }, A[2] + 2.80)
    .to('.lrow-win-inner', { autoAlpha: 1, duration: .14, stagger: .06 }, A[2] + 2.88);

  /* =====================================================================
     ACT 3 — back in the thread: the three arrive, and she picks one.
  ===================================================================== */
  capGo(2, A[3]);
  switchTab('inbox', A[3], .45);
  capA(3, A[3] + .16);

  pushIn(thInbox, inInbox, '#m-l1', A[3] + .48, .30, 24);
  pushIn(thInbox, inInbox, '#m-l2', A[3] + .78, .30, 24);
  pushIn(thInbox, inInbox, '#m-l3', A[3] + 1.08, .30, 24);

  const interest = document.getElementById('btn-interest');
  tl.to(inInbox, { y: () => threadY(thInbox, document.getElementById('m-l1'), 24), duration: .28 }, A[3] + 1.40);
  moveTo(interest, A[3] + 1.60, .16, 18, -12);
  click(A[3] + 1.78);
  tl.to(interest, { scale: .955, duration: .035 }, A[3] + 1.78)
    .to(interest, { scale: 1, duration: .05 }, A[3] + 1.815)
    .to(interest, { backgroundColor: '#2C5EFF', borderColor: '#2C5EFF', color: '#FAF9F7', duration: .07 }, A[3] + 1.79)
    .to(cursor, { x: SCREEN_W + 60, y: SCREEN_H - 60, duration: .2 }, A[3] + 1.90);

  /* =====================================================================
     ACT 4 — Agent Desk. The right agent is notified.
  ===================================================================== */
  capGo(3, A[4]);
  switchTab('agent', A[4], .42);
  capA(4, A[4] + .14);

  pushIn(thAgent, inAgent, '#a-admin',   A[4] + .49, .30, 24);
  pushIn(thAgent, inAgent, '#a-karim',   A[4] + .83, .26, 24);
  pushIn(thAgent, inAgent, '#a-confirm', A[4] + 1.09, .22, 24);

  const confirm = document.getElementById('btn-confirm');
  moveTo(confirm, A[4] + 1.31, .14, 16, -12);
  click(A[4] + 1.45);
  tl.to(confirm, { scale: .955, duration: .035 }, A[4] + 1.45)
    .to(confirm, { scale: 1, duration: .05 }, A[4] + 1.485);

  /* =====================================================================
     ACT 5 — Booking, in her thread. She picks a slot; a quick cutaway shows
     Karim accepting it (8.8); the confirmation lands back in her thread and
     the CRM badge flips state. The act opens and closes in the Inbox.
  ===================================================================== */
  capGo(4, A[5]);
  switchTab('inbox', A[5], .42);
  capA(5, A[5] + .13);

  pushIn(thInbox, inInbox, '#m-cal', A[5] + .48, .30, 24);

  const slot = document.getElementById('slot-pick');
  moveTo(slot, A[5] + .82, .14, 15, -11);
  click(A[5] + .98);
  tl.to(slot, { scale: .94, duration: .035 }, A[5] + .98)
    .to(slot, { scale: 1, duration: .05 }, A[5] + 1.015)
    .to(slot, { backgroundColor: '#2C5EFF', borderColor: '#2C5EFF', color: '#FAF9F7', duration: .07 }, A[5] + .99)
    .to('.cal-slot:not(#slot-pick)', { opacity: .32, scale: .975, duration: .12, stagger: .015 }, A[5] + 1.06)
    .to(cursor, { x: SCREEN_W + 60, y: SCREEN_H - 60, duration: .2 }, A[5] + 1.20);

  /* the cutaway — brief, because it's a simple beat */
  switchTab('agent', A[5] + 1.36, .40);
  pushIn(thAgent, inAgent, '#a-book', A[5] + 1.78, .28, 24);

  const book = document.getElementById('btn-book');
  moveTo(book, A[5] + 2.06, .14, 15, -11);
  click(A[5] + 2.20);
  tl.to(book, { scale: .955, duration: .035 }, A[5] + 2.20)
    .to(book, { scale: 1, duration: .05 }, A[5] + 2.235)
    .to('.book-actions .btn-ghost', { opacity: .32, duration: .08 }, A[5] + 2.22)
    .to(cursor, { x: SCREEN_W + 60, y: SCREEN_H - 60, duration: .2 }, A[5] + 2.32);

  /* and back to her thread, where it resolves */
  switchTab('inbox', A[5] + 2.44, .40);
  capB(5, 6, A[5] + 2.70);
  pushIn(thInbox, inInbox, '#m-confirmed', A[5] + 2.74, .26, 22);

  /* =====================================================================
     ACT 6 — Pipeline. One thread among forty-two.
  ===================================================================== */
  capGo(6, A[6]);
  switchTab('pipeline', A[6], .42);
  capA(7, A[6] + .14);

  tl.to('.kcard:not(.is-lead)', { autoAlpha: 1, y: 0, duration: .16, stagger: { each: .008 } }, A[6] + .46);
  tl.fromTo('#lead-card', { autoAlpha: 0, y: -12, scale: .9 },
    { autoAlpha: 1, y: 0, scale: 1, duration: .2, immediateRender: false }, A[6] + .82)
    .fromTo('#lead-card', { boxShadow: '0 0 0 1px rgba(126,155,255,.55), 0 8px 22px -6px rgba(44,94,255,.55)' },
      { boxShadow: '0 0 0 4px rgba(44,94,255,.28), 0 14px 34px -6px rgba(44,94,255,.7)', duration: .16, immediateRender: false }, A[6] + .98);

  /* =====================================================================
     ACT 7 — Control Room. The one deliberate tonal inversion.
  ===================================================================== */
  capGo(7, A[7]);
  const INV = A[7], INV_D = .5;
  switchTab('control', INV, INV_D);
  capA(8, INV + .16);

  tl.to('body', { backgroundColor: '#1A1917', duration: INV_D * .8 }, INV)
    .to('#pagelight', { opacity: 0, duration: INV_D * .6 }, INV)
    .to(screenEl, { backgroundColor: '#1A1917', duration: INV_D * .8 }, INV)
    .to('.site-header', { backgroundColor: 'rgba(26,25,23,.78)', borderBottomColor: '#3C3A37', duration: INV_D * .8 }, INV)
    .to('.wordmark', { color: '#FAF9F7', duration: INV_D * .8 }, INV)
    /* the app chrome inverts with the room, tab colours included */
    .to('.appbar', {
      backgroundColor: '#211F1E', borderBottomColor: '#3C3A37',
      '--tab-idle': '#8A867F', '--tab-active': '#F7F5F2', '--mark': '#F7F5F2',
      duration: INV_D * .8
    }, INV)
    .to('.app-user', { backgroundColor: 'rgba(44,94,255,.22)', color: '#C9D6FF', duration: INV_D * .8 }, INV)
    /* the skip pill rides the inversion too, or it goes blind on ink */
    .to('.skip-demo', {
      backgroundColor: '#211F1E', color: '#F2F0ED', borderColor: '#3C3A37',
      duration: INV_D * .8
    }, INV)
    /* the dim veil has to darken with the room it sits over */
    .to(dim, { backgroundColor: 'rgba(26,25,23,.55)', duration: INV_D * .8 }, INV)
    /* keep the machine readable once the page is as dark as its bezel */
    .to('.ambient', { opacity: 1.6, duration: INV_D * .8 }, INV);

  /* captions take their paper-on-ink variant for this tab only */
  tl.to(CAP[8], { backgroundColor: '#211F1E', color: '#F2F0ED', duration: INV_D * .8 }, INV);

  tl.to('.ctrl-head', { autoAlpha: 1, y: 0, duration: .12 }, A[7] + .74)
    .to('.ctrl-aggregate', { autoAlpha: 1, y: 0, duration: .22 }, A[7] + .82)
    .to('.ctrl-row', { autoAlpha: 1, y: 0, duration: .16, stagger: { each: .045 } }, A[7] + 1.04);

  /* =====================================================================
     CTA resolution (8.10) — the room comes back to Paper, the machine
     recedes, and the message the sequence opened with becomes the button.
  ===================================================================== */
  const OUT = END;
  capGo(8, OUT);

  /* back out of the inversion */
  tl.to('body', { backgroundColor: '#FAF9F7', duration: .48 }, OUT)
    .to('#pagelight', { opacity: 1, duration: .48 }, OUT)
    .to('.site-header', { backgroundColor: 'rgba(250,249,247,.78)', borderBottomColor: '#E8E5E0', duration: .48 }, OUT)
    .to('.wordmark', { color: '#1A1917', duration: .48 }, OUT)
    .to('.skip-demo', {
      backgroundColor: '#FFFFFF', color: '#1A1917', borderColor: '#E8E5E0', duration: .48
    }, OUT)
    .to('.ambient', { opacity: 1, duration: .48 }, OUT);

  /* the machine travels away from the camera */
  tl.to(machine, {
    scale: () => parseFloat(machine.dataset.scale || 1) * .46,
    y: -30, filter: 'blur(6px)', duration: .62
  }, OUT + .04)
    .to(machine, { autoAlpha: 0, duration: .2 }, OUT + .46);

  /* the message emerges from it and comes forward */
  tl.fromTo('#resolve-wrap', { autoAlpha: 0 }, { autoAlpha: 1, duration: .14, immediateRender: false }, OUT + .22)
    .fromTo('#resolve', { scale: .42, y: 26 }, { scale: 1, y: 0, duration: .5, immediateRender: false }, OUT + .22);

  /* and becomes the button: one element, morphed */
  const MORPH = OUT + .78;
  tl.to('#resolve', {
    width: 268, height: 60, borderRadius: 8,
    backgroundColor: '#2C5EFF', borderColor: '#2C5EFF',
    boxShadow: '0 2px 6px rgba(44,94,255,.18), 0 18px 40px -12px rgba(44,94,255,.45)',
    duration: .42
  }, MORPH)
    .to('#resolve-msg', { autoAlpha: 0, duration: .16 }, MORPH)
    .to('#resolve-cta', { autoAlpha: 1, duration: .18 }, MORPH + .2);

  /* the line that bookends the opener */
  tl.fromTo('#cta-line', { autoAlpha: 0, y: 26, filter: 'blur(6px)' },
    { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .32, immediateRender: false }, MORPH + .16);

  tl.to({}, { duration: .34 });   /* a beat of rest on the finished frame */
  DUR = tl.duration();
  ScrollTrigger.getById('seq').refresh();

  /* ---- progress-derived state, so scrubbing works in both directions ---- */
  function setFocus(u) {
    let active = -1;
    for (let i = 0; i < FIELDS.length; i++) {
      const a = F0 + i * STEP;
      if (u >= a + .085 && u < a + STEP + .02) active = i;
    }
    if (u >= AT_S + .1) active = -1;
    document.querySelectorAll('.fbox').forEach((b, i) => b.classList.toggle('is-focus', i === active));
  }
  function setTab(u) {
    let cur = 'inbox';
    SWITCHES.forEach(s => { if (u >= s.t) cur = s.tab; });
    Object.keys(TABEL).forEach(k => TABEL[k].classList.toggle('is-active', k === cur));
  }

  /* ---- dev frame capture ---- */
  if (FRAME !== null) {
    const apply = () => {
      document.body.classList.add('framemode');
      ScrollTrigger.getAll().forEach(t => t.disable(true));
      fitMachine();
      const p = parseFloat(FRAME);
      tl.pause().progress(0).progress(p);
      setFocus(p * DUR); setTab(p * DUR);
      window.scrollTo(0, 0);
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(apply, 90));
  }

  return () => ScrollTrigger.removeEventListener('refreshInit', fitMachine);
});

/* ===========================================================================
   Reduced motion — same content and order, stacked and still
=========================================================================== */
mm.add('(prefers-reduced-motion: reduce)', () => {
  document.body.classList.add('reduced');
  buildCaps();
  document.querySelectorAll('.fval').forEach((e, i) => e.textContent = FIELDS[i] ? FIELDS[i].v : '');
  document.querySelectorAll('.chip').forEach(c => c.classList.add('is-on'));
  document.getElementById('match-num').textContent = '3';
  /* the eliminated rows simply aren't shown in the still version */
  document.querySelectorAll('.lrow[data-wave]').forEach(r => r.style.display = 'none');
  document.getElementById('slot-pick').classList.add('is-picked');
  const t = TABEL.inbox;
  gsap.set(underline, { x: t.offsetLeft, width: t.offsetWidth });
  return () => document.body.classList.remove('reduced');
});

/* ---------------------------------------------------------------------------
   Word masks — copy travels in, it never fades in. Shared by the hero's
   resolution lines and the bridge. Preserves one level of inline markup, so
   the bridge's reframe line can mark its two clauses differently.
--------------------------------------------------------------------------- */
function splitWords(el) {
  const parts = [];
  el.childNodes.forEach(node => {
    const cls = node.nodeType === 3 ? null : node.className;
    node.textContent.split(/\s+/).filter(Boolean).forEach(w => parts.push({ w, cls }));
  });
  el.textContent = '';
  return parts.map((p, i) => {
    const mask = document.createElement('span');
    mask.className = 'wm' + (p.cls ? ' ' + p.cls : '');
    const inner = document.createElement('span');
    inner.textContent = p.w;
    mask.appendChild(inner);
    el.appendChild(mask);
    if (i < parts.length - 1) el.appendChild(document.createTextNode(' '));
    return inner;
  });
}

/* ===========================================================================
   HERO — Act 0. Rania's inquiry, cooling off in real time.

   Three timelines, deliberately separate:
     decay   — the unstoppable clock (timestamp, status, colour, recession)
     copy    — the resolution lines, which only run once decay finishes
     excuse  — click flavour, layered on top, never touching either of the above

   The decay arc reuses the CRM's own status language (won → pending → lost)
   rather than WhatsApp green: the hero foreshadows the state vocabulary the
   Pipeline and Control Room use later, instead of borrowing another product's.

   Safety rule: any scroll at any point hard-snaps everything to the resolved
   end state. Never left mid-transition — that was v2's failure mode.
=========================================================================== */
(function hero() {
  const card   = document.getElementById('decay-card');
  const wrap   = document.getElementById('decay-wrap');
  const col    = document.getElementById('decay-col');
  const stage  = document.getElementById('hero-stage');
  const glow   = document.getElementById('decay-glow');
  const reply  = document.getElementById('dc-reply');
  const replyLabel = document.getElementById('dc-reply-label');
  const dot    = document.getElementById('dc-dot');
  const chan   = document.querySelector('.dc-chan');
  const ago    = document.getElementById('dc-ago');
  const status = document.getElementById('dc-status');
  const typing = document.getElementById('dc-typing');
  const excuse = document.getElementById('dc-excuse');
  const punch  = document.getElementById('hr-punch');
  const quiet  = document.getElementById('hr-quiet');
  if (!card || !stage) return;

  const WON = '#15803D', PENDING = '#B45309', LOST = '#9A3B32';
  const tint = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  };

  const PW = splitWords(punch);
  const QW = splitWords(quiet);

  /* The card is alone and centred while it decays, then travels into the
     left column as the copy arrives. Measured, not hard-coded, so it stays
     centred at any width — and recomputed on resize. */
  const centreX = () => {
    if (window.matchMedia('(max-width:1024px)').matches) return 0;
    return (stage.offsetWidth / 2) - (col.offsetLeft - stage.offsetLeft + col.offsetWidth / 2);
  };

  /* --- resting state (also the reduced-motion state) ---------------------- */
  const setResolved = () => {
    gsap.set(wrap, { x: 0, scale: 1, clearProps: 'filter' });
    gsap.set(card, { boxShadow: 'var(--lift-1)', filter: 'saturate(.72)', scale: 1, y: 0 });
    gsap.set(glow, { autoAlpha: 0 });
    gsap.set(reply, { autoAlpha: 0 });
    gsap.set(typing, { autoAlpha: 0 });
    gsap.set(excuse, { autoAlpha: 0 });
    gsap.set([PW, QW], { y: '0%' });
    gsap.set([punch, quiet], { autoAlpha: 1 });
    ago.textContent = '36 minutes ago';
    status.textContent = 'Likely gone.';
    dot.style.backgroundColor = LOST;
    chan.style.color = LOST;
    status.style.color = LOST;
    status.style.backgroundColor = tint(LOST, .09);
  };

  if (REDUCED) { setResolved(); return; }

  /* Measured after layout, not at parse time — at parse time the custom faces
     haven't loaded and every offset reads 0, which silently left the card
     pinned to the left column instead of centred. */
  const recentre = () => {
    if (done || copy.progress() > 0) return;
    gsap.set(wrap, { x: centreX() });
  };

  gsap.set(wrap, { x: centreX() });
  gsap.set([punch, quiet], { autoAlpha: 1 });
  gsap.set([PW, QW], { y: '105%' });
  gsap.set(card, { autoAlpha: 0, y: 22, scale: .96, filter: 'blur(7px) saturate(1)' });
  gsap.set(glow, { autoAlpha: 0, scale: .96 });

  /* --- the breath: a slow ambient pulse that decelerates to still --------- */
  const breath = gsap.to(glow, {
    scale: 1.055, opacity: .74, duration: 1.5,
    ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true
  });

  /* =========================== the clock ================================= */
  /* Front-loaded then decelerating — the slowdown is the point. */
  const decay = gsap.timeline({ paused: true, onComplete: () => copy.play() });

  const beat = (at, label, statusText, colour) => {
    decay.call(() => {
      ago.textContent = label;
      if (!statusText) return;
      status.textContent = statusText;
      dot.style.backgroundColor = colour;
      chan.style.color = colour;
      status.style.color = colour;
      status.style.backgroundColor = tint(colour, .09);
      gsap.fromTo(glow,
        { background: glow.style.background || '' },
        { duration: 0 });
      glow.style.background =
        'radial-gradient(58% 54% at 50% 52%, ' + tint(colour, .20) + ', ' + tint(colour, 0) + ' 72%)';
    }, null, at);
    /* the readout itself ticks over physically, not as a text swap */
    decay.fromTo(ago, { y: 5 }, { y: 0, duration: .22, ease: 'power2.out' }, at);
  };

  /* card arrives */
  decay.to(card, { autoAlpha: 1, duration: .28 }, 0)
    .to(card, { y: 0, scale: 1, filter: 'blur(0px) saturate(1)', duration: .72, ease: 'power3.out' }, 0)
    .to(glow, { autoAlpha: 1, scale: 1, duration: .6, ease: 'power2.out' }, .1)
    .call(() => breath.play(), null, .5);

  beat(0.00, '2 seconds ago',  'Interested', WON);
  beat(0.75, '47 seconds ago', null, null);

  /* the near-miss: a reply gets drafted, then abandoned unsent */
  decay.fromTo(typing, { autoAlpha: 0, scale: .8, y: -6 },
    { autoAlpha: 1, scale: 1, y: 0, duration: .3, ease: 'back.out(2)' }, 1.0);
  decay.to(typing.querySelectorAll('i'), {
    y: -3, duration: .3, ease: 'sine.inOut', repeat: 2, yoyo: true, stagger: .09
  }, 1.15);
  /* it collapses back rather than fading — an aborted attempt, not a sent one */
  decay.to(typing, { scale: .72, y: 8, autoAlpha: 0, duration: .26, ease: 'power2.in' }, 2.0);

  beat(2.20, '3 minutes ago',  'Waiting…', PENDING);
  beat(3.30, '11 minutes ago', null, null);
  beat(4.75, '36 minutes ago', 'Likely gone.', LOST);

  /* the card physically recedes as it cools: elevation drops, colour drains,
     proportions tighten. The breath slows in step and settles to still. */
  decay.to(card, { boxShadow: 'var(--lift-2)', duration: 1.6 }, 1.0)
    .to(card, { boxShadow: 'var(--lift-1)', filter: 'saturate(.72)', scale: .984, duration: 2.4 }, 2.6)
    .to(breath, { timeScale: .34, duration: 3.4, ease: 'power1.in' }, 1.4)
    .to(glow, { autoAlpha: 0, duration: 1.4 }, 3.9)
    .call(() => breath.pause(), null, 5.3)
    .to({}, { duration: .25 });   /* a beat of stillness before the copy */

  /* ======================== the resolution copy ========================== */
  const copy = gsap.timeline({ paused: true });
  copy.to(wrap, { x: 0, duration: 1.05, ease: 'power3.inOut' }, 0)
    .to(PW, { y: '0%', duration: .8, ease: 'power3.out', stagger: .035 }, .25)
    .to(QW, { y: '0%', duration: .62, ease: 'power3.out', stagger: .014 }, 1.35);

  /* =================== the reply affordance and excuses ================== */
  /* Clicking never pauses the clock. Both paths land on the same end state. */
  const EXCUSES = [
    'Oops — you’re on a call. Try again in a sec.',
    'Oops — you’re scheduling a viewing.'
  ];
  const CLICK_CAP = EXCUSES.length;   /* 2 — one reads as a glitch, three as a bit */
  let clicks = 0, done = false;

  if (window.matchMedia('(pointer: coarse)').matches) replyLabel.textContent = 'Tap to reply';

  let retired = false;

  /* The pill travels up into place — it never fades in. The CSS sonar ping
     does the signalling; this only handles arrival, retirement and press. */
  const showReply = () => {
    if (done || retired) return;
    gsap.fromTo(reply, { autoAlpha: 0, y: 16, scale: .9 },
      { autoAlpha: 1, y: 0, scale: 1, duration: .42, ease: 'back.out(1.9)' });
  };

  const retireReply = () => {
    if (retired) return;
    retired = true;
    gsap.killTweensOf(reply);
    gsap.to(reply, { autoAlpha: 0, y: 10, scale: .92, duration: .28, ease: 'power2.in' });
  };

  /* a popup still hanging around as "Likely gone." lands muddies the beat */
  const clearExcuse = () => {
    if (gsap.getProperty(excuse, 'opacity') === 0) return;
    gsap.killTweensOf(excuse);
    gsap.to(excuse, { autoAlpha: 0, y: -10, scale: .94, duration: .26, ease: 'power2.in' });
  };

  gsap.delayedCall(1.5, showReply);
  /* it retires exactly when the lead is declared gone — past that there is
     nothing left to reply to, which is the point the hero is making */
  decay.call(retireReply, null, 4.75);
  decay.call(clearExcuse, null, 5.05);

  function excuseOnce() {
    if (done || retired || clicks >= CLICK_CAP) return;  /* a third click does nothing */
    const text = EXCUSES[clicks];
    clicks += 1;
    excuse.textContent = text;
    gsap.killTweensOf(excuse);
    gsap.timeline()
      .set(excuse, { xPercent: -50 })
      .fromTo(excuse, { autoAlpha: 0, y: 14, scale: .88 },
        { autoAlpha: 1, y: 0, scale: 1, duration: .34, ease: 'back.out(2.2)' })
      .to(excuse, { autoAlpha: 0, y: -10, scale: .94, duration: .3, ease: 'power2.in' }, '+=2.0');
    /* once both excuses are spent the affordance simply disappears */
    if (clicks >= CLICK_CAP) gsap.delayedCall(.5, retireReply);
  }

  reply.addEventListener('click', excuseOnce);
  card.addEventListener('click', excuseOnce);   /* the card stays clickable too */

  /* ============================ safety rule ============================== */
  /* Scroll at any point — mid-fade, mid-click, mid-anything — snaps straight
     to the resolved end state. Idempotent, and it can't be re-armed. */
  function resolveNow() {
    if (done) return;
    done = true;
    retired = true;
    breath.kill();
    gsap.killTweensOf([excuse, typing, card, glow, wrap, reply]);
    decay.pause().kill();
    copy.pause().kill();
    setResolved();
  }

  ['wheel', 'touchmove', 'keydown'].forEach(ev =>
    window.addEventListener(ev, (e) => {
      if (ev === 'keydown' && !['ArrowDown', 'PageDown', 'Space', ' ', 'End'].includes(e.key)) return;
      resolveNow();
    }, { once: false, passive: true }));

  /* A plain scroll-position check, deliberately NOT a ScrollTrigger: the hero
     sits at the very top of the document, so any trigger anchored to it reads
     as already-passed at scrollY 0 and resolves the sequence before it plays.
     The threshold keeps browser scroll restoration from doing the same. */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 4) resolveNow();
  }, { passive: true });

  /* keep the centring honest across resize and late font loads */
  window.addEventListener('resize', recentre);
  window.addEventListener('load', recentre);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(recentre);

  decay.play();
})();

/* ===========================================================================
   BRIDGE — the reframe, the resolution, the pivot, then the handoff.

   The hero ends on tension; this is where it resolves. Three lines arriving
   in sequence as the visitor scrolls, then a cue that says both what to do
   and what's coming.
=========================================================================== */
(function bridge() {
  const l1a = document.getElementById('bl-1a');
  const l1b = document.getElementById('bl-1b');
  const l2 = document.getElementById('bl-2');
  const l3 = document.getElementById('bl-3');
  const cue = document.getElementById('bridge-cue');
  const arrow = document.getElementById('cue-arrow');
  if (!l1a || !l2 || !l3) return;

  /* both clauses rise as one beat, so the correction reads as part of the
     same thought rather than a second line arriving late */
  const W1 = splitWords(l1a).concat(splitWords(l1b));
  const W2 = splitWords(l2);

  if (REDUCED) {
    gsap.set([W1, W2], { y: '0%' });
    gsap.set([l3, cue], { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.set([W1, W2], { y: '105%' });
  gsap.set([l3, cue], { autoAlpha: 0, y: 18 });

  /* each line waits for the visitor rather than firing all at once — the
     section's job is three separate beats, not one block of text */
  const rise = (words, trigger, stagger) => ScrollTrigger.create({
    trigger, start: 'top 84%', once: true,
    onEnter: () => gsap.to(words, {
      y: '0%', duration: .78, ease: 'power3.out', stagger
    })
  });
  rise(W1, l1a, .028);
  rise(W2, l2, .034);

  [l3, cue].forEach((el, i) => ScrollTrigger.create({
    trigger: i === 0 ? l3 : cue, start: 'top 88%', once: true,
    onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' })
  }));

  /* a slow bob, to make the instruction read as an instruction */
  gsap.to(arrow, {
    y: 7, duration: 1.5, ease: 'sine.inOut', repeat: -1, yoyo: true
  });
})();

/* ===========================================================================
   SKIP DEMO — a way out during the demo, not a choice before it.

   Bound to the span between the sequence pinning and the CTA arriving, so it
   is independent of the act count and survives the act restructure.
=========================================================================== */
(function skipDemo() {
  const pill = document.getElementById('skip-demo');
  const seq = document.getElementById('sequence');
  const signup = document.getElementById('signup');
  if (!pill || !seq || !signup) return;

  pill.hidden = false;
  gsap.set(pill, { autoAlpha: 0, y: 12, pointerEvents: 'none' });

  let shown = false;
  const show = () => {
    if (shown) return;
    shown = true;
    gsap.to(pill, { autoAlpha: 1, y: 0, duration: .4, ease: 'power3.out', pointerEvents: 'auto' });
  };
  const hide = () => {
    if (!shown) return;
    shown = false;
    gsap.to(pill, { autoAlpha: 0, y: 12, duration: .28, ease: 'power2.in', pointerEvents: 'none' });
  };

  /* Measured live rather than via endTrigger. An endTrigger on #signup reads
     its position before the pinned sequence inserts its pin-spacer, so the
     endpoint collapses onto the start and the range is never active — and
     refreshPriority doesn't fix it, because the pin lives in its own
     matchMedia context that refreshes separately. Re-measuring on every
     ScrollTrigger refresh sidesteps the ordering problem entirely. */
  let startY = 0, endY = 0;

  const measure = () => {
    const s = ScrollTrigger.getById('seq');
    startY = s ? s.start : seq.getBoundingClientRect().top + window.scrollY;
    /* gone by the time the CTA is genuinely on screen, not at its first pixel */
    endY = signup.getBoundingClientRect().top + window.scrollY - window.innerHeight * .55;
  };
  const update = () => {
    const y = window.scrollY;
    (y >= startY && y < endY) ? show() : hide();
  };

  ScrollTrigger.addEventListener('refresh', () => { measure(); update(); });
  window.addEventListener('scroll', update, { passive: true });
  measure();
  update();

  pill.addEventListener('click', () => { hide(); goToSignup(); });
})();

/* ---------------------------------------------------------------------------
   CTA -> form, and the form itself.

   NOTE: the form is NOT connected to anything yet. SIGNUP_ENDPOINT is a
   deliberate placeholder — submissions are not sent or stored anywhere.
   Wire it to a real hosted endpoint before this goes live.
--------------------------------------------------------------------------- */
const SIGNUP_ENDPOINT = null;   /* TODO: hosted form endpoint */

function goToSignup() {
  const target = document.getElementById('signup');
  if (!target) return;
  if (window.__lenis) window.__lenis.scrollTo(target, { offset: -40 });
  else target.scrollIntoView({ behavior: 'smooth' });
}
document.querySelectorAll('.btn-cta, .btn-outline-cta').forEach(b => b.addEventListener('click', goToSignup));
const resolveBtn = document.getElementById('resolve');
if (resolveBtn) resolveBtn.addEventListener('click', goToSignup);

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = signupForm.elements.name;
    const wa = signupForm.elements.whatsapp;
    let ok = true;
    [name, wa].forEach(f => {
      const bad = !f.value.trim();
      f.style.borderColor = bad ? '#2C5EFF' : '';
      if (bad) ok = false;
    });
    if (!ok) { name.value.trim() ? wa.focus() : name.focus(); return; }
    if (!SIGNUP_ENDPOINT) {
      /* nothing is transmitted until an endpoint exists */
      document.getElementById('sf-done').hidden = false;
      signupForm.querySelector('.sf-submit').disabled = true;
      return;
    }
  });
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
