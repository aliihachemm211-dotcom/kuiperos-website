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
const narrTab  = document.getElementById('narration-tab');
const narrStack = document.getElementById('narration-stack');

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

/* Section 8.3 — narration captions, verbatim. The Control Room line carries
   the whole final beat, Pipeline included (8.9). */
const CAPTIONS = [
  'A message arrives at 10:41am. In thirty seconds, the lead is qualified — not just logged.',
  'Eighty-four listings. Only three match this inquiry. The matching engine does the rest.',
  'The agent is assigned with a click, and pinged instantly.',
  'The lead picks from the available slots. The agent confirms with a click.',
  'This is one thread. Forty-two others are running the same way, right now.'
];

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

function buildCaptions() {
  narrStack.innerHTML = CAPTIONS.map(c =>
    '<p class="narration-line">' + c.split(' ').map(w => '<span class="w">' + w + '</span>').join(' ') + '</p>'
  ).join('');
  return gsap.utils.toArray('.narration-line').map(l => gsap.utils.toArray(l.querySelectorAll('.w')));
}

const mm = gsap.matchMedia();

/* ===========================================================================
   Cinematic
=========================================================================== */
mm.add('(prefers-reduced-motion: no-preference)', () => {

  fitMachine();
  ScrollTrigger.addEventListener('refreshInit', fitMachine);

  const CAP = buildCaptions();
  const appbar = document.querySelector('.appbar');

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
  CAP.forEach(ws => gsap.set(ws, { autoAlpha: 0, y: 16, filter: 'blur(5px)' }));
  gsap.set('.lrow', { autoAlpha: 0, x: -14 });
  gsap.set('.scanline', { autoAlpha: 0, y: 0 });
  gsap.set('.lrow-win-inner', { autoAlpha: 0 });
  document.querySelectorAll('.fval').forEach(e => e.textContent = '');

  /* The timeline's own duration is the source of truth for both the pinned
     scroll distance and the progress-derived state — a hand-declared total
     that drifts from the real one silently skews every derived value. */
  let DUR = 10.30;
  const SWITCHES = [{ t: 0, tab: 'inbox' }];
  let curTab = 'inbox', zTop = 4;

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'seq', trigger: '#sequence', start: 'top top',
      end: () => '+=' + (DUR * 100) + '%',
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

  const capIn  = (i, at) => tl.to(CAP[i], { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .16, stagger: { each: .022 } }, at);
  const capOut = (i, at) => tl.to(CAP[i], { autoAlpha: 0, y: -14, filter: 'blur(4px)', duration: .12, stagger: { each: .012 } }, at);

  /* =====================================================================
     ACT 1 — Inbox
  ===================================================================== */
  tl.to(screenEl, { backgroundColor: '#FAF9F7', duration: .22 }, 0)
    .to([appbar, PANEL.inbox], { autoAlpha: 1, duration: .12 }, .06)
    .to([appbar, PANEL.inbox], { scale: 1, filter: 'blur(0px)', y: 0, duration: .34 }, .06)
    .to(underline, {
      x: () => TABEL.inbox.offsetLeft, width: () => TABEL.inbox.offsetWidth, duration: .26
    }, .16);

  capIn(0, .46);

  pushIn(thInbox, inInbox, '#m-ask',   .50, .26);
  pushIn(thInbox, inInbox, '#m-reply', .88, .26);
  pushIn(thInbox, inInbox, '#m-form', 1.22, .30, 20);

  const F0 = 1.62, STEP = .18;
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
  const AT_S = F0 + FIELDS.length * STEP + .06;
  moveTo(submit, AT_S, .12, 20, -14);
  tl.to(submit, { y: -2, duration: .05 }, AT_S + .13);
  click(AT_S + .19);
  tl.to(submit, { scale: .96, y: 1, duration: .035 }, AT_S + .19)
    .to(submit, { scale: 1, y: 0, duration: .05 }, AT_S + .225);
  pushIn(thInbox, inInbox, '#m-captured', AT_S + .34, .22, 22);
  tl.to(cursor, { x: SCREEN_W + 60, y: SCREEN_H - 60, duration: .22 }, AT_S + .34);

  /* =====================================================================
     ACT 2 — Matching: out of the thread, into the engine
  ===================================================================== */
  capOut(0, 3.36);
  switchTab('matching', 3.34, .45);
  capIn(1, 3.60);

  /* the ledger streams in and a scan sweeps it */
  tl.to('.lrow', { autoAlpha: 1, x: 0, duration: .16, stagger: { each: .009 } }, 3.86);
  tl.fromTo('.scanline', { y: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: .06, immediateRender: false }, 3.96)
    .to('.scanline', { y: () => document.getElementById('ledger-body').offsetHeight - 33, duration: .42 }, 4.02)
    .to('.scanline', { autoAlpha: 0, duration: .06 }, 4.40);

  /* each criterion ticks on, its listings collapse out, the counter rolls */
  const numEl = document.getElementById('match-num');
  const COUNT = [84, 41, 12, 3];
  [0, 1, 2].forEach(w => {
    const at = 4.46 + w * .52;
    tl.to('.chip[data-c="' + w + '"]', { duration: .001,
      onStart: () => document.querySelector('.chip[data-c="' + w + '"]').classList.add('is-on'),
      onReverseComplete: () => document.querySelector('.chip[data-c="' + w + '"]').classList.remove('is-on')
    }, at);
    /* the eliminated rows collapse and the survivors close the gap */
    tl.to('.lrow[data-wave="' + w + '"]', {
      height: 0, opacity: 0, x: -22, borderBottomWidth: 0,
      duration: .3, stagger: { each: .01 }
    }, at + .06);
    const p = { n: COUNT[w] };
    tl.to(p, { n: COUNT[w + 1], duration: .34, snap: { n: 1 },
      onUpdate: () => { numEl.textContent = Math.round(p.n); } }, at + .06);
  });

  /* only the three winners carry photos */
  tl.to('.lrow.win', { height: 108, duration: .26, stagger: .06 }, 6.10)
    .to('.lrow-win-inner', { autoAlpha: 1, duration: .14, stagger: .06 }, 6.18);

  /* ---- back into the thread; the three arrive as messages ---- */
  switchTab('inbox', 6.56, .45);
  pushIn(thInbox, inInbox, '#m-l1', 7.06, .30, 24);
  pushIn(thInbox, inInbox, '#m-l2', 7.42, .30, 24);
  pushIn(thInbox, inInbox, '#m-l3', 7.78, .30, 24);

  /* =====================================================================
     ACT 3 — she picks one, and the handoff fires
  ===================================================================== */
  const interest = document.getElementById('btn-interest');
  tl.to(inInbox, { y: () => threadY(thInbox, document.getElementById('m-l1'), 24), duration: .28 }, 8.16);
  moveTo(interest, 8.48, .16, 18, -12);
  click(8.68);
  tl.to(interest, { scale: .955, duration: .035 }, 8.68)
    .to(interest, { scale: 1, duration: .05 }, 8.715)
    .to(interest, { backgroundColor: '#2C5EFF', borderColor: '#2C5EFF', color: '#FAF9F7', duration: .07 }, 8.69)
    .to(cursor, { x: SCREEN_W + 60, y: SCREEN_H - 60, duration: .2 }, 8.80);

  capOut(1, 8.86);
  switchTab('agent', 8.84, .45);
  capIn(2, 9.10);

  pushIn(thAgent, inAgent, '#a-admin',   9.36, .30, 24);
  pushIn(thAgent, inAgent, '#a-karim',   9.74, .26, 24);
  pushIn(thAgent, inAgent, '#a-confirm', 10.02, .22, 24);

  const confirm = document.getElementById('btn-confirm');
  moveTo(confirm, 10.28, .14, 16, -12);
  click(10.44);
  tl.to(confirm, { scale: .955, duration: .035 }, 10.44)
    .to(confirm, { scale: 1, duration: .05 }, 10.475);

  /* =====================================================================
     ACT 4 — the calendar reaches her in the thread; she picks; he confirms
  ===================================================================== */
  capOut(2, 10.62);
  switchTab('inbox', 10.60, .42);
  capIn(3, 10.86);

  pushIn(thInbox, inInbox, '#m-cal', 11.08, .30, 24);

  const slot = document.getElementById('slot-pick');
  moveTo(slot, 11.50, .14, 15, -11);
  click(11.66);
  tl.to(slot, { scale: .94, duration: .035 }, 11.66)
    .to(slot, { scale: 1, duration: .05 }, 11.695)
    /* the picked slot fills solid; the others step back out of contention */
    .to(slot, { backgroundColor: '#2C5EFF', borderColor: '#2C5EFF', color: '#FAF9F7', duration: .07 }, 11.67)
    .to('.cal-slot:not(#slot-pick)', { opacity: .32, scale: .975, duration: .12, stagger: .015 }, 11.74)
    .to(cursor, { x: SCREEN_W + 60, y: SCREEN_H - 60, duration: .2 }, 11.88);

  switchTab('agent', 12.06, .42);
  pushIn(thAgent, inAgent, '#a-book', 12.54, .30, 24);

  const book = document.getElementById('btn-book');
  moveTo(book, 12.92, .14, 15, -11);
  click(13.08);
  tl.to(book, { scale: .955, duration: .035 }, 13.08)
    .to(book, { scale: 1, duration: .05 }, 13.115)
    .to('.book-actions .btn-ghost', { opacity: .32, duration: .08 }, 13.10)
    .to(cursor, { x: SCREEN_W + 60, y: SCREEN_H - 60, duration: .2 }, 13.20);

  /* =====================================================================
     ACT 5 — Pipeline first (still Paper), then the Control Room inversion
  ===================================================================== */
  capOut(3, 13.42);
  switchTab('pipeline', 13.40, .42);
  capIn(4, 13.66);

  /* the board fills: dozens of real opportunities, ours among them */
  tl.to('.kcard:not(.is-lead)', { autoAlpha: 1, y: 0, duration: .16, stagger: { each: .008 } }, 13.92);
  tl.fromTo('#lead-card', { autoAlpha: 0, y: -12, scale: .9 },
    { autoAlpha: 1, y: 0, scale: 1, duration: .2, immediateRender: false }, 14.34)
    .fromTo('#lead-card', { boxShadow: '0 0 0 1px rgba(126,155,255,.55), 0 8px 22px -6px rgba(44,94,255,.55)' },
      { boxShadow: '0 0 0 4px rgba(44,94,255,.28), 0 14px 34px -6px rgba(44,94,255,.7)', duration: .16, immediateRender: false }, 14.50);

  /* the one deliberate tonal inversion — and it happens here, not before */
  const INV = 14.96, INV_D = .5;
  switchTab('control', INV, INV_D);
  tl.to('body', { backgroundColor: '#1A1917', duration: INV_D * .8 }, INV)
    .to('#pagelight', { opacity: 0, duration: INV_D * .6 }, INV)
    .to(screenEl, { backgroundColor: '#1A1917', duration: INV_D * .8 }, INV)
    .to('.site-header', { backgroundColor: 'rgba(26,25,23,.78)', borderBottomColor: '#3C3A37', duration: INV_D * .8 }, INV)
    .to('.wordmark', { color: '#FAF9F7', duration: INV_D * .8 }, INV)
    .to('.narration-line', { color: '#F2F0ED', duration: INV_D * .8 }, INV)
    /* the app chrome inverts with the room, tab colours included */
    .to('.appbar', {
      backgroundColor: '#211F1E', borderBottomColor: '#3C3A37',
      '--tab-idle': '#8A867F', '--tab-active': '#F7F5F2', '--mark': '#F7F5F2',
      duration: INV_D * .8
    }, INV)
    .to('.app-user', { backgroundColor: 'rgba(44,94,255,.22)', color: '#C9D6FF', duration: INV_D * .8 }, INV)
    /* keep the machine readable once the page is as dark as its bezel */
    .to('.ambient', { opacity: 1.6, duration: INV_D * .8 }, INV);

  tl.to('.ctrl-head', { autoAlpha: 1, y: 0, duration: .12 }, 15.44)
    .to('.ctrl-aggregate', { autoAlpha: 1, y: 0, duration: .22 }, 15.52)
    .to('.ctrl-row', { autoAlpha: 1, y: 0, duration: .16, stagger: { each: .045 } }, 15.74);

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
    if (narrTab.textContent !== TAB_LABEL[cur]) narrTab.textContent = TAB_LABEL[cur];
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
  buildCaptions();
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

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
