/* ===========================================================================
   kuiperOS — one continuous scroll-scrubbed camera move.

   The chat THREAD is the spine: a single column of messages that only ever
   travels upward as the conversation advances. The camera leaves the thread
   to visit system internals (matching engine, assignment, agent desk, ops
   board) and always comes back to it.

   Motion rule: nothing "fades in". Everything travels, scales, or passes the
   camera. Opacity only ever supports a move already in progress.
=========================================================================== */

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const PERSP = 1400;
const stage = document.querySelector('.act-stage');
const camera = document.querySelector('.camera');
const thread = document.querySelector('#thread');
const inner = document.querySelector('#thread-inner');

const rail = {
  ref: document.getElementById('rail-ref'),
  step: document.getElementById('rail-step'),
  cap: document.getElementById('rail-caption')
};

/* --- Analytics: one event per act entry --- */
const trackAct = (() => {
  const seen = new Set();
  return (n) => {
    if (seen.has(n)) return;
    seen.add(n);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'act_entry', act: n });
  };
})();

const RAIL = [
  { ref: 'THREAD—0417', step: '01 / 05',
    cap: ['A message arrives at 10:41am.', 'In thirty seconds, the lead is qualified — not just logged.'] },
  { ref: 'MATCH—0417', step: '02 / 05',
    cap: ['Eighty-four listings. Only three match this inquiry.', 'The matching engine does the rest.'] },
  { ref: 'HANDOFF—0417', step: '03 / 05',
    cap: ['She picks one. The right agent is assigned with a click, and pinged instantly.'] },
  { ref: 'VIEWING—0417', step: '04 / 05',
    cap: ['The lead picks from the available slots.', 'The agent confirms with a click.'] },
  { ref: 'OPS—0417', step: '05 / 05',
    cap: ['This is one thread.', 'Forty-two others are running the same way, right now.'] }
];

function setRail(i) {
  const r = RAIL[Math.max(0, Math.min(RAIL.length - 1, i | 0))];
  if (rail.ref.textContent === r.ref) return;
  rail.ref.textContent = r.ref;
  rail.step.textContent = r.step;
  rail.cap.innerHTML = r.cap.map(l => '<p>' + l + '</p>').join('');
  document.body.classList.toggle('inverted', i === 4);
  trackAct(i + 1);
}

/* ===========================================================================
   Content generation — the engine grid and the ops board
=========================================================================== */

const PHOTOS = ['Assets/Listing 1.jpg', 'Assets/Listing 2.jpg', 'Assets/Listing 3.jpg'];
const AREAS = ['ACHRAFIEH', 'HAMRA', 'DBAYEH', 'JOUNIEH', 'BADARO', 'MAR MIKHAEL',
               'VERDUN', 'RABIEH', 'ANTELIAS', 'GEMMAYZE', 'ZALKA', 'BAABDA'];

/* 14-column grid; the three winners sit in the upper-middle band, spread
   apart so the survivors read as scattered across the whole field */
const WINNERS = [17, 22, 33];

/* Eliminations per round, so the counter reads 84 → 41 → 12 → 3 */
const ROUND_SIZE = [43, 29, 9];

function buildEngine() {
  const grid = document.getElementById('engine-grid');
  if (!grid || grid.childElementCount) return;

  /* Scatter the eliminations across the grid (deterministically) so the
     field thins out everywhere at once, rather than wiping in reading order */
  const others = [];
  for (let i = 0; i < 84; i++) if (WINNERS.indexOf(i) === -1) others.push(i);
  others.sort((a, b) => ((a * 37) % 84) - ((b * 37) % 84));
  const round = {};
  let k = 0;
  ROUND_SIZE.forEach((n, r) => { for (let j = 0; j < n; j++) round[others[k++]] = r + 1; });

  /* The survivors are the exact three listings that then arrive in the
     thread — same areas, same photos, same prices. */
  const WIN_DATA = [
    { area: 'ACHRAFIEH', price: 180, photo: 0, score: 98 },
    { area: 'DBAYEH',    price: 176, photo: 1, score: 94 },
    { area: 'JOUNIEH',   price: 168, photo: 2, score: 91 }
  ];

  const frag = document.createDocumentFragment();
  for (let i = 0; i < 84; i++) {
    const t = document.createElement('div');
    const win = WINNERS.indexOf(i);
    const w = win > -1 ? WIN_DATA[win] : null;
    t.className = 'tile';
    t.dataset.round = w ? '0' : String(round[i]);
    t.innerHTML =
      '<img src="' + PHOTOS[w ? w.photo : i % 3] + '" alt="" loading="lazy">' +
      '<div class="tile-data"><b>' + (w ? w.area : AREAS[i % AREAS.length].slice(0, 9)) + '</b>' +
      (w ? 2 : (i % 4) + 1) + 'BR · $' + (w ? w.price : 90 + ((i * 37) % 260)) + 'K</div>' +
      '<div class="tile-score">' + (w ? w.score : 0) + '%</div>';
    frag.appendChild(t);
  }
  grid.appendChild(frag);
}

const CLIENTS = [
  'Nadia H.', 'Marc B.', 'Layla S.', 'Tarek A.', 'Joelle N., ', 'Ziad M.', 'Maya F.',
  'Rami T.', 'Carine D.', 'Elie G.', 'Nour S.', 'Hadi Z.', 'Yara C.', 'Fadi R.',
  'Lea P.', 'Omar J.', 'Rita B.', 'Sarah W.', 'Georges A.', 'Mona K.', 'Bilal H.',
  'Tala R.', 'Nabil S.', 'Perla M.', 'Wissam D.', 'Aline T.', 'Jad F.', 'Reem A.',
  'Kamal N.', 'Sandra L.', 'Hiba Y.', 'Michel C.', 'Dalia E.', 'Samir O.'
];

function buildOps() {
  const board = document.getElementById('kanban');
  if (!board || board.childElementCount) return;
  const cols = [
    { name: 'NEW', n: 8 },
    { name: 'QUALIFIED', n: 7 },
    { name: 'MATCHED', n: 6, lead: true },
    { name: 'ASSIGNED', n: 7 },
    { name: 'CONTACTED', n: 6 }
  ];
  let c = 0, ref = 1000;
  cols.forEach(col => {
    const el = document.createElement('div');
    el.className = 'kcol';
    el.innerHTML = '<div class="kcol-head"><span>' + col.name +
      '</span><span class="kcol-count">' + col.n + '</span></div>';
    if (col.lead) {
      /* the thread itself docks here — this slot reserves its footprint */
      const slot = document.createElement('div');
      slot.className = 'kcard lead-slot';
      slot.id = 'lead-slot';
      slot.style.visibility = 'hidden';
      slot.innerHTML = '<span class="kcard-name">RANIA K.</span><span class="kcard-ref">THREAD-0417</span>';
      el.appendChild(slot);
    }
    for (let i = 0; i < col.n; i++) {
      const card = document.createElement('div');
      card.className = 'kcard';
      card.innerHTML = '<span class="kcard-name">' + CLIENTS[c % CLIENTS.length].trim().replace(/,$/, '') +
        '</span><span class="kcard-ref">REF-' + (ref += 37) + '</span>';
      el.appendChild(card);
      c++;
    }
    board.appendChild(el);
  });
}

buildEngine();
buildOps();

/* ===========================================================================
   Layout helpers
=========================================================================== */

/* Scroll the thread so `el` rests just above the thread's lower edge. */
function threadY(sel, pad) {
  const el = document.querySelector(sel);
  if (!el) return 0;
  const h = thread.offsetHeight;
  return Math.min(h, -(el.offsetTop + el.offsetHeight - h + (pad === undefined ? 52 : pad)));
}

/* Fit the whole stage to short viewports (continuous, never stepped). */
function fitStage() {
  if (document.body.classList.contains('reduced')) return;
  const need = 920; /* tallest composition: the engine, head + filters + grid */
  const have = window.innerHeight - 40;
  const s = Math.min(1, have / need);
  stage.style.transform = s < 1 ? 'scale(' + s.toFixed(4) + ')' : 'none';
  stage.style.transformOrigin = '50% 50%';
}

const mm = gsap.matchMedia();

/* ===========================================================================
   The cinematic build
=========================================================================== */
mm.add('(prefers-reduced-motion: no-preference)', () => {

  fitStage();
  ScrollTrigger.addEventListener('refreshInit', fitStage);

  /* --- Opener --- */
  gsap.set(['.opener-tension-1', '.opener-tension-2', '.opener-pivot'], { autoAlpha: 0, y: 34 });
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '#opener', start: 'top top', end: '+=130%',
      pin: true, scrub: true, invalidateOnRefresh: true
    }
  })
    .to('.opener-tension-1', { autoAlpha: 1, y: 0, duration: .2 }, .06)
    .to('.opener-tension-2', { autoAlpha: 1, y: 0, duration: .2 }, .34)
    .to('.opener-pivot', { autoAlpha: 1, y: 0, duration: .2 }, .64)
    .to({}, { duration: .16 });

  /* --- Base state: thread holds the frame, all content below the fold --- */
  gsap.set(inner, { y: () => thread.offsetHeight });
  gsap.set(thread, { x: 0, y: 0, z: 0, scale: 1 });
  gsap.set(['.scene-engine', '.scene-assign', '.scene-agent', '.scene-ops'],
    { autoAlpha: 0, z: -2400 });
  gsap.set('.focus-ring', { autoAlpha: 0 });
  gsap.set('.fval', { y: 38 }); /* fully below the 46px field box until entered */
  gsap.set('.tile-score', { y: 14 });
  gsap.set('.beam-fill', { scaleX: 0, transformOrigin: 'left center' });
  gsap.set('.beam-head', { x: 0, scale: 0 });
  gsap.set('.beam-chip', { autoAlpha: 0, y: 10 });
  gsap.set('.assign-stem', { scaleY: 0, transformOrigin: 'top center' });
  gsap.set(['.agent-admin', '.agent-karim'], { autoAlpha: 0 });
  gsap.set('.notify-card', { autoAlpha: 0 });
  gsap.set('.scene-agent .agent-mini, .booking-card', { autoAlpha: 0 });
  gsap.set('.kcol', { autoAlpha: 0 });
  gsap.set('.kcol .kcard:not(.lead-slot)', { autoAlpha: 0 });
  gsap.set('.ledger', { autoAlpha: 0 });

  /* Segment plan — units are viewport-heights of scroll.
     `r` is the side-rail act index; the camera alternates between the
     thread and its excursions throughout. */
  const SEG = [
    { r: 0, len: 1.50 },  /*  0  thread: contact + form         */
    { r: 0, len: 0.40 },  /*  1  → engine                       */
    { r: 1, len: 1.90 },  /*  2  engine narrows 84 → 3          */
    { r: 1, len: 0.40 },  /*  3  → back to thread               */
    { r: 1, len: 1.15 },  /*  4  three listings arrive          */
    { r: 2, len: 0.50 },  /*  5  she taps "I am interested"     */
    { r: 2, len: 0.40 },  /*  6  → assignment                   */
    { r: 2, len: 1.15 },  /*  7  handoff to Karim               */
    { r: 3, len: 0.40 },  /*  8  → back to thread               */
    { r: 3, len: 0.75 },  /*  9  calendar arrives, slot picked  */
    { r: 3, len: 0.40 },  /* 10  → agent desk                   */
    { r: 3, len: 0.60 },  /* 11  agent confirms                 */
    { r: 3, len: 0.55 },  /* 12  → back to thread, confirmed    */
    { r: 4, len: 0.50 },  /* 13  → the control room             */
    { r: 4, len: 1.70 }   /* 14  the whole operation            */
  ];
  const AT = [];
  let total = 0;
  SEG.forEach((s, i) => { AT[i] = total; total += s.len; });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'seq',
      trigger: '#sequence', start: 'top top',
      end: () => '+=' + (total * 100) + '%',
      pin: true, scrub: true, invalidateOnRefresh: true,
      onEnter: () => document.body.classList.add('rail-on'),
      onEnterBack: () => document.body.classList.add('rail-on'),
      onLeaveBack: () => document.body.classList.remove('rail-on'),
      onUpdate: (self) => {
        const u = self.progress * total;
        let idx = 0;
        for (let i = 0; i < SEG.length; i++) if (u >= AT[i] - 0.08) idx = SEG[i].r;
        setRail(idx);
      }
    }
  });

  /* ---------------------------------------------------------------------
     Reusable physics
  --------------------------------------------------------------------- */

  /* A message arrives: the whole column travels up to make room. No fade —
     the message was always below the fold, the thread simply moves. */
  function push(sel, at, dur, pad) {
    tl.to(inner, { y: () => threadY(sel, pad), duration: dur }, at);
    tl.fromTo(sel, { scale: .965 }, { scale: 1, duration: dur * .8, immediateRender: false }, at);
  }

  /* The camera leaves the thread for an excursion, then returns. */
  function leave(scene, at, dur) {
    /* far enough that the thread clears the frame entirely — the camera has
       genuinely left it, rather than parking it on top of the side rail */
    tl.to(thread, { x: -1750, z: -700, duration: dur }, at)
      .fromTo(scene, { z: -2400, autoAlpha: 0 },
        { z: 0, autoAlpha: 1, duration: dur, immediateRender: false }, at)
      .to(scene, { autoAlpha: 1, duration: dur * .22 }, at);
  }
  function comeBack(scene, at, dur) {
    /* the excursion passes the camera as the thread returns to frame */
    tl.to(scene, { z: 900, duration: dur }, at)
      .to(scene, { autoAlpha: 0, duration: dur * .34 }, at + dur * .55)
      .to(thread, { x: 0, z: 0, duration: dur }, at);
  }

  /* =====================================================================
     ACT 1 — Contact
  ===================================================================== */
  (function act1() {
    const a = AT[0];
    push('.m-a1-ask', a + 0.02, 0.16);
    push('.m-a1-t1', a + 0.20, 0.07, 18);
    push('.m-a1-reply', a + 0.28, 0.15);
    push('.m-a1-t2', a + 0.45, 0.07, 18);
    push('.m-a1-form', a + 0.53, 0.18, 28);

    /* One accent focus ring walks the form, and each value slides up into
       its field as the ring lands on it — a form being completed. */
    const ring = document.querySelector('.focus-ring');
    const boxes = gsap.utils.toArray('.form-msg .fbox');
    /* .ffield is statically positioned, so each .fbox already measures
       against .form-msg — its nearest positioned ancestor, and the ring's
       own containing block. */
    const at = (b) => ({
      x: b.offsetLeft, y: b.offsetTop,
      w: b.offsetWidth, h: b.offsetHeight
    });

    let t = a + 0.72;
    boxes.forEach((b, i) => {
      const p = () => at(b);
      if (i === 0) {
        tl.set(ring, {
          x: () => p().x, y: () => p().y,
          width: () => p().w, height: () => p().h
        }, t)
          .fromTo(ring, { autoAlpha: 0, scale: 1.06 },
            { autoAlpha: 1, scale: 1, duration: .035, immediateRender: false }, t);
      } else {
        tl.to(ring, {
          x: () => p().x, y: () => p().y,
          width: () => p().w, height: () => p().h,
          duration: .052
        }, t);
      }
      /* the value is entered */
      tl.to(b.querySelector('.fval'), { y: 0, duration: .04 }, t + .026);
      t += .055;
    });

    tl.to(ring, { autoAlpha: 0, scale: 1.1, duration: .035 }, t);

    /* submit is pressed */
    tl.to('.form-submit', { scale: .962, y: 2, duration: .03 }, t + .04)
      .to('.form-submit', { scale: 1, y: 0, duration: .045 }, t + .07);

    push('.m-a1-captured', a + 1.24, 0.13, 30);
  })();

  /* =====================================================================
     ACT 2 — Matching.  Out of the chat, into the engine; the engine
     visibly narrows the field; back into the chat with the winners.
  ===================================================================== */
  leave('.scene-engine', AT[1], SEG[1].len);

  (function act2() {
    const a = AT[2];

    /* the three criteria land, one per elimination round */
    gsap.set('.fchip', { autoAlpha: 0, y: 20 });
    gsap.set('.engine-count', { autoAlpha: 0, y: 16 });
    tl.to('.engine-count', { autoAlpha: 1, y: 0, duration: .1 }, a + .02);

    /* a live counter — the field shrinking is the headline number */
    const n = { v: 84 };
    const numEl = document.getElementById('engine-num');
    const unitEl = document.getElementById('engine-unit');
    const REMAIN = [84, 41, 12, 3];

    ROUND_SIZE.forEach((_, r) => {
      const t = a + .22 + r * .42;
      const tiles = gsap.utils.toArray('.tile[data-round="' + (r + 1) + '"]');

      /* criterion snaps in and turns accent as it starts filtering */
      tl.to('.fchip[data-w="' + (r + 1) + '"]', { autoAlpha: 1, y: 0, duration: .05 }, t)
        .to('.fchip[data-w="' + (r + 1) + '"]', {
          borderColor: '#2C5EFF', color: '#1E45CC',
          backgroundColor: 'rgba(44,94,255,.07)', duration: .05
        }, t + .05);

      /* eliminated listings drop back into the depth of the grid */
      tl.to(tiles, {
        z: -520, scale: .86, y: 16, opacity: .13,
        duration: .2, stagger: { each: .0022, from: 'random' }
      }, t + .08);

      /* the count runs down with them */
      tl.to(n, {
        v: REMAIN[r + 1], duration: .22, snap: { v: 1 },
        onUpdate: () => { numEl.textContent = Math.round(n.v); }
      }, t + .08);
    });

    /* the three survivors come forward, out of the plane of the grid */
    const wins = WINNERS.map(i => '.tile:nth-child(' + (i + 1) + ')');
    tl.to(wins, {
      z: 210, scale: 1.5, duration: .3, stagger: .07
    }, a + 1.30)
      .to(wins, {
        borderColor: '#2C5EFF',
        boxShadow: '0 0 0 1.5px #2C5EFF, 0 10px 30px -6px rgba(44,94,255,.45)',
        duration: .12, stagger: .07
      }, a + 1.32)
      .to(wins.map(w => w + ' .tile-score'), {
        y: 0, opacity: 1, duration: .1, stagger: .07
      }, a + 1.40);

    tl.call(() => { unitEl.textContent = 'MATCHES'; }, null, a + 1.34)
      .call(() => { unitEl.textContent = 'ACTIVE LISTINGS'; }, null, a + 1.32);

    /* back into the chat — the engine passes the camera */
    comeBack('.scene-engine', AT[3], SEG[3].len);

    /* the winners arrive as messages */
    const b = AT[4];
    push('.m-a2-l1', b + .02, .26, 34);
    push('.m-a2-l2', b + .34, .26, 34);
    push('.m-a2-l3', b + .66, .26, 34);
  })();

  /* =====================================================================
     ACT 3 — She picks one, and the handoff fires.
  ===================================================================== */
  (function act3() {
    /* she scrolls back to the Achrafieh listing and taps it — the thread
       travels back down the conversation, which is what the visitor sees */
    const a = AT[5];
    tl.to(inner, { y: () => threadY('.m-a2-l1', 34), duration: .26 }, a + .02);

    const btn = '#btn-interest-1';
    tl.to(btn, { scale: .955, duration: .035 }, a + .32)
      .to(btn, { scale: 1, duration: .05 }, a + .365)
      .to(btn, {
        backgroundColor: '#2C5EFF', borderColor: '#2C5EFF', color: '#FAF9F7',
        boxShadow: '0 2px 6px rgba(44,94,255,.10), 0 18px 40px -12px rgba(44,94,255,.22)',
        duration: .07
      }, a + .34);

    /* the camera leaves for the assignment */
    leave('.scene-assign', AT[6], SEG[6].len);

    const b = AT[7];
    /* the two people arrive from opposite sides, with real depth */
    tl.fromTo('.agent-admin', { autoAlpha: 0, x: -180, z: -700 },
      { autoAlpha: 1, x: 0, z: 0, duration: .22, immediateRender: false }, b + .02)
      .fromTo('.agent-karim', { autoAlpha: 0, x: 180, z: -700 },
        { autoAlpha: 1, x: 0, z: 0, duration: .22, immediateRender: false }, b + .08);

    /* the assignment travels the wire, left to right */
    const beamW = () => document.querySelector('.beam').offsetWidth;
    tl.to('.beam-head', { scale: 1, duration: .04 }, b + .34)
      .to('.beam-fill', { scaleX: 1, duration: .30 }, b + .34)
      .to('.beam-head', { x: () => beamW(), duration: .30 }, b + .34)
      .to('.beam-chip', { autoAlpha: 1, y: 0, duration: .07 }, b + .40)
      /* it lands on Karim */
      .to('.beam-head', { scale: 2.6, autoAlpha: 0, duration: .09 }, b + .64)
      .to('.agent-karim', { scale: 1.035, duration: .06 }, b + .64)
      .to('.agent-karim', { scale: 1, duration: .10 }, b + .70);

    /* and the ping drops out of his card */
    tl.to('.assign-stem', { scaleY: 1, duration: .10 }, b + .74)
      .fromTo('.notify-card', { autoAlpha: 0, y: -40, z: -520 },
        { autoAlpha: 1, y: 0, z: 0, duration: .22, immediateRender: false }, b + .82);
  })();

  /* Placeholder hold for acts not yet rebuilt — filled in next passes. */
  tl.to({}, { duration: Math.max(0.01, total - tl.duration()) });

  /* --- dev frame capture: ?frame=0.42 --- */
  const fp = new URLSearchParams(location.search).get('frame');
  if (fp !== null) {
    const apply = () => {
      document.body.classList.add('framemode', 'rail-on');
      ScrollTrigger.getAll().forEach(t => t.disable(true));
      fitStage();
      const p = parseFloat(fp);
      tl.pause().progress(0).progress(p);
      const u = p * total;
      let idx = 0;
      for (let i = 0; i < SEG.length; i++) if (u >= AT[i] - 0.08) idx = SEG[i].r;
      rail.ref.textContent = '';
      setRail(idx);
      window.scrollTo(0, 0);
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() =>
      requestAnimationFrame(() => setTimeout(apply, 60)));
  }

  return () => ScrollTrigger.removeEventListener('refreshInit', fitStage);
});

/* ===========================================================================
   Reduced motion — same content and order, no camera, nothing hidden
=========================================================================== */
mm.add('(prefers-reduced-motion: reduce)', () => {
  document.body.classList.add('reduced', 'rail-on');
  const leadSlot = document.getElementById('lead-slot');
  if (leadSlot) { leadSlot.style.visibility = 'visible'; leadSlot.classList.add('kcard-lead'); }

  const scenes = ['#thread', '.scene-engine', '.scene-assign', '.scene-agent', '.scene-ops'];
  scenes.forEach((s, i) => {
    ScrollTrigger.create({
      trigger: s, start: 'top 60%',
      onEnter: () => setRail(Math.min(i, 4)),
      onEnterBack: () => setRail(Math.min(i, 4))
    });
  });
  setRail(0);
  return () => document.body.classList.remove('reduced', 'rail-on');
});

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
