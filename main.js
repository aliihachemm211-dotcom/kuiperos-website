/* kuiperOS — scroll sequence
   Scrub-driven only: scroll position is the sole driver of every animation.
   Linear mapping (ease: "none") within pinned sections — pacing comes from
   scroll distance per act, not eased curves. */

gsap.registerPlugin(ScrollTrigger);

/* iOS Safari's collapsing address bar fires resize mid-scroll and would
   re-measure pinned sections at the worst moment; ignore those, while real
   resizes/orientation changes still trigger ScrollTrigger's auto-refresh. */
ScrollTrigger.config({ ignoreMobileResize: true });

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

/* --- Side rail + crop marks: snap on/off (never fade — deliberate) --- */
const railOn = () => document.body.classList.add('rail-on');
const railOff = () => document.body.classList.remove('rail-on');

const mm = gsap.matchMedia();

/* ===========================================================================
   Full cinematic experience
=========================================================================== */
mm.add('(prefers-reduced-motion: no-preference)', () => {

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
    .to({}, { duration: 0.16 }); /* hold on the pivot line before unpinning */

  /* --- Act 1 — Contact: pinned exactly 1x viewport (fast pacing) ---
     Depth choreography: each element travels a long way on the z-axis
     (roughly half the perspective distance, so its apparent size roughly
     doubles as it arrives), and opacity resolves in the FIRST third of the
     travel — the growth happens fully visible, not hidden inside a fade.
     As each new beat lands, the previous elements get pushed slightly
     deeper, like a camera rebalancing on the newest subject. */
  gsap.set('#anchor',        { autoAlpha: 0, y: 150, z: -850 });
  gsap.set('.auto-reply',    { autoAlpha: 0, y: 130, z: -780 });
  gsap.set('.form-card',     { autoAlpha: 0, y: 140, z: -820 });
  gsap.set('.capture-stamp', { autoAlpha: 0, z: 330 }); /* from the viewer's side, pressed onto the page */
  gsap.set('.tick-line',     { scaleY: 0, transformOrigin: 'top center' });
  gsap.set('.tick-label',    { autoAlpha: 0 });

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'act1',
      trigger: '#act-1',
      start: 'top top',
      end: '+=100%',
      pin: true,
      scrub: true,
      invalidateOnRefresh: true
    }
  })
    /* beat 1 — the anchor flies in from deep space */
    .to('#anchor', { autoAlpha: 1, duration: 0.05 }, 0)
    .to('#anchor', { y: 0, z: 0, duration: 0.16 }, 0)
    /* tick +00:03s draws downward */
    .to('.tick-1 .tick-line',  { scaleY: 1, duration: 0.05 }, 0.14)
    .to('.tick-1 .tick-label', { autoAlpha: 1, duration: 0.04 }, 0.16)
    /* beat 2 — the system speaks; the anchor settles back */
    .to('.auto-reply', { autoAlpha: 1, duration: 0.05 }, 0.20)
    .to('.auto-reply', { y: 0, z: 0, duration: 0.16 }, 0.20)
    .to('#anchor',     { z: -70, duration: 0.16 }, 0.20)
    /* tick +00:30s */
    .to('.tick-2 .tick-line',  { scaleY: 1, duration: 0.05 }, 0.34)
    .to('.tick-2 .tick-label', { autoAlpha: 1, duration: 0.04 }, 0.36)
    /* beat 3 — the qualifying form; both bubbles recede further */
    .to('.form-card',  { autoAlpha: 1, duration: 0.05 }, 0.40)
    .to('.form-card',  { y: 0, z: 0, duration: 0.18 }, 0.40)
    .to('#anchor',     { z: -130, duration: 0.18 }, 0.40)
    .to('.auto-reply', { z: -70, duration: 0.18 }, 0.40)
    /* beat 4 — CAPTURED stamps down onto the page from the camera side */
    .to('.capture-stamp', { autoAlpha: 1, duration: 0.04 }, 0.64)
    .to('.capture-stamp', { z: 0, duration: 0.12 }, 0.64)
    .to({}, { duration: 0.24 }); /* hold the completed frame */

  /* Rail + crop marks appear with Act 1 (snap, no fade) */
  ScrollTrigger.create({
    trigger: '#act-1',
    start: 'top 40%',
    end: 'bottom bottom',
    onEnter: () => { railOn(); trackActEntry(1); },
    onEnterBack: railOn,
    onLeaveBack: railOff
  });
});

/* ===========================================================================
   prefers-reduced-motion: complete static experience — same content, same
   order, no pinning, no scroll-tied transforms. Only the rail snaps in.
=========================================================================== */
mm.add('(prefers-reduced-motion: reduce)', () => {
  document.body.classList.add('reduced');

  ScrollTrigger.create({
    trigger: '#act-1',
    start: 'top 60%',
    end: 'bottom bottom',
    onEnter: () => { railOn(); trackActEntry(1); },
    onEnterBack: railOn,
    onLeaveBack: railOff
  });

  return () => document.body.classList.remove('reduced');
});

/* Re-measure pin distances once the self-hosted fonts have loaded (they
   change layout heights). */
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* DEV ONLY — remove before production deploy: ?scrub=0.4 jumps to that
   progress within Act 1's pin so frames can be reviewed in isolation. */
const scrubParam = new URLSearchParams(location.search).get('scrub');
if (scrubParam !== null) {
  window.addEventListener('load', () => setTimeout(() => {
    const st = ScrollTrigger.getById('act1');
    if (st) window.scrollTo(0, st.start + parseFloat(scrubParam) * (st.end - st.start));
  }, 300));
}
