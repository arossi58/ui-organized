import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ButtonLink } from "../chrome/ButtonLink";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { ShowcaseEngine, ShowcaseLayout, Slot } from "../../lib/showcaseStageEngine";
import { ShowcaseMockup } from "./showcase/ShowcaseMockup";
import { ShowcasePieces } from "./showcase/ShowcasePieces";
import { pieceSpecsFor } from "./showcase/parts";
import { snapshot, type SnapshotClip } from "./showcase/snapshot";
import { ShowcaseProvider, useShowcase } from "./showcase/showcaseContext";
import "../gradient/dot-grid.css";
import "./hero-showcase.css";

gsap.registerPlugin(ScrollTrigger);

const QUESTION = "Is your UI a mess?";
const ANSWER = "Let’s fix it";

/** Native size of the mockup in the design (Figma 2472:22351). */
const MOCKUP_W = 1422;
const MOCKUP_H = 832;
/** Breathing room around the scaled mockup, and the phone breakpoint. */
const GUTTER = 24;
const NARROW = 720;

/** localStorage key holding the local date (YYYY-MM-DD) the falling intro last
 * played, so it plays once per calendar day per visitor. */
const HERO_INTRO_KEY = "uio:hero-intro-day";

/** Today as a local YYYY-MM-DD stamp, so "per day" matches the visitor's clock. */
function todayStamp(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Whether the falling intro already played today. Falls back to playing it if
 * storage is unavailable (private mode, etc.). */
function introSeenToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(HERO_INTRO_KEY) === todayStamp();
  } catch {
    return false;
  }
}

/** An element's box in `root`'s coordinates, unaffected by transforms — the
 * GSAP timeline moves the stage, but slots are wanted at its resting place. */
function offsetWithin(el: HTMLElement, root: HTMLElement): Slot {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  // Offsets ignore scrolling. Take off whatever the containers in between
  // (the table's grid, the dashboard on a phone) are scrolled by, so a piece
  // lands where its part is drawn rather than where it would be unscrolled.
  for (let parent = el.parentElement; parent && parent !== root; parent = parent.parentElement) {
    x -= parent.scrollLeft;
    y -= parent.scrollTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

const EMPTY_SLOT: Slot = { x: 0, y: 0, w: 0, h: 0 };

interface SnapshotSlot {
  slot: Slot;
  clip?: SnapshotClip;
}

/**
 * A table snapshot's slot: its live element's box, or empty when there's
 * nothing there to copy (no filters applied, fewer rows than pieces).
 *
 * A grid row is cut to the part of it the grid actually shows — the table is
 * wider than the grid and scrolls, and the last row is partly below its
 * bottom edge. Landing a whole row would make the cut-off part vanish the
 * moment the live table takes over. `clip` says where in the row that visible
 * part starts, for the copy to be cut to match (snapshot.ts).
 */
function snapshotSlot(target: HTMLElement | null, mockup: HTMLElement): SnapshotSlot {
  if (!target) return { slot: EMPTY_SLOT };
  const slot = offsetWithin(target, mockup);
  const viewport = target.closest<HTMLElement>(".data-table__viewport");
  if (!viewport || !(target instanceof HTMLTableRowElement)) return { slot };

  const frame = offsetWithin(viewport, mockup);
  const left = frame.x + viewport.clientLeft;
  const top = frame.y + viewport.clientTop;
  const x0 = Math.max(slot.x, left);
  const x1 = Math.min(slot.x + slot.w, left + viewport.clientWidth);
  const y0 = Math.max(slot.y, top);
  const y1 = Math.min(slot.y + slot.h, top + viewport.clientHeight);
  if (x1 <= x0 || y1 <= y0) return { slot: EMPTY_SLOT };
  return {
    slot: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
    clip: { x: x0 - slot.x, y: y0 - slot.y, w: x1 - x0, h: y1 - y0 },
  };
}

/**
 * One character per inline-block span, grouped per word so a line only ever
 * breaks between words. The heading's accessible text lives in a separate
 * visually-hidden span; these are presentation only.
 */
function SplitLine({ text, className }: { text: string; className: string }) {
  return (
    <span className={`hero-showcase__line ${className}`} aria-hidden="true">
      {text.split(" ").map((word, w) => (
        <Fragment key={w}>
          {w > 0 && " "}
          <span className="hero-showcase__word">
            {[...word].map((char, c) => (
              <span className="hero-showcase__char" key={c}>
                {char}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/**
 * The homepage hero (Figma 2427:20480 → 2472:22350), pinned in a scroll track
 * over the dot lattice.
 *
 * It opens on "Is your UI a mess?" while the mockup's parts — real library
 * components — rain in under matter-js and pile up beneath it. Scrolling
 * drives one GSAP timeline: the question travels up under the nav, and only
 * once it is there do its characters fall away and "Let's fix it" rise in their
 * place. The mockup's window lifts in, and every piece flies from the pile into the exact spot its
 * component occupies. When the last one lands the pieces hand off to the live
 * mockup underneath, which is interactive from then on.
 *
 * The physics engine (lib/showcaseStageEngine.ts) reads the timeline's own
 * progress, so the pieces and the heading run on one clock. Under reduced
 * motion there is no track and no physics: the finished layout renders
 * statically, live from the start.
 */
export function HeroShowcase() {
  return (
    <ShowcaseProvider>
      <HeroStage />
    </ShowcaseProvider>
  );
}

/** Below this raw scroll progress an open Code view switches back to the
 * components, so the mockup always comes apart into components, never code.
 * Raw progress leads the scrubbed clock the engine runs on, so the view has
 * changed well before the hand-off at 0.8. */
const CODE_RESET_AT = 0.9;

function HeroStage() {
  const reduced = useReducedMotion();
  const { page, code, setCode, host } = useShowcase();
  // The pieces for the page the visitor is on: the table falls apart as
  // readily as the dashboard.
  const specs = useMemo(() => pieceSpecsFor(page), [page]);
  const codeRef = useRef(code);
  codeRef.current = code;
  const [finePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
  );
  // The staggered fall-in plays on the first visit of the day; later visits
  // open on the settled pile. Captured once at mount.
  const [skipIntro] = useState(introSeenToday);
  // The pieces have handed off to the live mockup.
  const [live, setLive] = useState(reduced);

  const trackRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const pieceEls = useRef<Array<HTMLElement | null>>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  // Restarts (a page switch) open on the settled pile, never a fresh fall-in.
  const engineStarted = useRef(false);

  useEffect(() => {
    if (reduced || skipIntro) return;
    try {
      window.localStorage.setItem(HERO_INTRO_KEY, todayStamp());
    } catch {
      /* storage unavailable: the intro just replays next visit. */
    }
  }, [reduced, skipIntro]);

  // Fit the mockup into whatever the viewport leaves under the heading. Wide
  // screens scale the native-size window uniformly; phones get the reflowed
  // layout at 1:1, sized to the space instead.
  useLayoutEffect(() => {
    const sticky = stickyRef.current;
    const stage = stageRef.current;
    if (!sticky || !stage) return;

    const fit = () => {
      // The nav floats over the hero; the heading is centred in the space
      // between its bottom edge and the mockup (hero-showcase.css).
      const nav = document.querySelector(".site-nav__pill");
      if (nav) {
        const navBottom = Math.round(nav.getBoundingClientRect().bottom);
        sticky.style.setProperty("--hero-nav-bottom", `${navBottom}px`);
      }
      const width = sticky.clientWidth;
      const available = Math.max(sticky.clientHeight - stage.offsetTop - GUTTER, 320);
      if (width <= NARROW) {
        stage.style.setProperty("--showcase-scale", "1");
        stage.style.width = `${width - 2 * 16}px`;
        stage.style.height = `${available}px`;
        return;
      }
      const scale = Math.min(1, (width - 2 * GUTTER) / MOCKUP_W, available / MOCKUP_H);
      stage.style.setProperty("--showcase-scale", String(scale));
      stage.style.width = `${MOCKUP_W * scale}px`;
      stage.style.height = `${MOCKUP_H * scale}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(sticky);
    // Web fonts change the heading's height, which moves the stage.
    void document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, [reduced]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    const head = headRef.current;
    const title = titleRef.current;
    const cta = ctaRef.current;
    const stage = stageRef.current;
    if (!track || !sticky || !head || !title || !cta || !stage) return;

    if (reduced) {
      cta.removeAttribute("inert");
      setLive(true);
      return;
    }

    // Back to the shell until the engine hands off (matters only if reduced
    // motion was switched off mid-visit).
    setLive(false);

    const ctx = gsap.context(() => {
      const question = title.querySelectorAll(".hero-showcase__line--question .hero-showcase__char");
      const answer = title.querySelectorAll(".hero-showcase__line--answer .hero-showcase__char");

      // How far the heading sits below its resting place when it is centred in
      // the viewport. A function so ScrollTrigger re-measures on refresh.
      const centreOffset = () =>
        sticky.clientHeight / 2 - (head.offsetTop + title.offsetHeight / 2);

      // The link can't take focus until it has faded in. (The mockup goes
      // live when the engine hands off to it.)
      const syncInert = (progress: number) => cta.toggleAttribute("inert", progress < 0.75);

      const onScroll = (progress: number) => {
        syncInert(progress);
        if (progress < CODE_RESET_AT && codeRef.current) setCode(false);
      };

      // Set rather than a staggered from(): a from() only renders its start
      // state immediately for the first target, so the rest of the answer
      // showed through the question until the scroll reached it.
      gsap.set(answer, { yPercent: -60, rotateX: 80, opacity: 0 });

      // Positions are fractions of the track, and the timeline is exactly 1
      // long, so its progress is the engine's clock. SHOWCASE_STAGE in the
      // engine holds the matching marks: physics until 0.1, pieces home by
      // 0.78, hand-off at 0.8.
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => onScroll(progress),
        },
      });

      timeline
        // 1. The question travels up to rest under the nav as the pile starts
        //    lifting off. Its text doesn't change until it has arrived.
        .from(head, { y: centreOffset, duration: 0.16, ease: "power2.inOut" }, 0.04)
        // 2. Only then does it fall apart, character by character, dropping
        //    away from the nav rather than into it…
        .to(
          question,
          {
            yPercent: 120,
            rotateX: -80,
            opacity: 0,
            duration: 0.1,
            stagger: { each: 0.007, from: "start" },
            ease: "power2.in",
          },
          0.21,
        )
        // …and the answer settles in where it stood, from just above.
        .to(
          answer,
          {
            yPercent: 0,
            rotateX: 0,
            opacity: 1,
            duration: 0.1,
            stagger: { each: 0.009, from: "start" },
            ease: "power3.out",
          },
          0.31,
        )
        // 3. The window the pieces land in lifts in beneath it.
        .from(
          stage,
          {
            y: () => sticky.clientHeight * 0.3,
            scale: 0.94,
            opacity: 0,
            duration: 0.2,
            ease: "power2.out",
          },
          0.4,
        )
        .from(cta, { y: 12, opacity: 0, duration: 0.08, ease: "power1.out" }, 0.72)
        // 4. Pad the timeline to exactly 1 so its progress maps 1:1 to the track.
        .to({}, { duration: 0.01 }, 0.99);

      syncInert(timeline.scrollTrigger?.progress ?? 0);
      timelineRef.current = timeline;
    }, track);

    return () => {
      timelineRef.current = null;
      ctx.revert();
    };
  }, [reduced, setCode]);

  // The physics. Restarted when the page changes, because the pieces are that
  // page's parts; a restart while the mockup is live is invisible (the engine
  // opens on the settled pile, already handed off).
  useLayoutEffect(() => {
    const sticky = stickyRef.current;
    const stage = stageRef.current;
    const mockup = mockupRef.current;
    const layer = layerRef.current;
    const timeline = timelineRef.current;
    if (reduced || !sticky || !stage || !mockup || !layer || !timeline) return;

    const partIds = specs.filter((spec) => spec.kind === "part").map((spec) => spec.id);

    const measure = (): ShowcaseLayout => {
      // Parts are measured in their slots. If they're out in the physics
      // layer, bring them home for the read and send them straight back —
      // all inside one frame, so nothing paints in between.
      const wasDocked = host.isDocked;
      if (!wasDocked) host.dock();
      const scale = parseFloat(stage.style.getPropertyValue("--showcase-scale")) || 1;
      const tableShown = mockup.querySelector('[data-piece="table"]') !== null;
      const slots = specs.map((spec) => {
        if (spec.kind === "snapshot") {
          // No table on screen (the Code view is open): keep the last slot.
          if (!tableShown) return null;
          return snapshotSlot(mockup.querySelector<HTMLElement>(spec.target), mockup).slot;
        }
        const el =
          spec.kind === "mirror"
            ? mockup.querySelector<HTMLElement>(spec.target)
            : (host.node(spec.id).firstElementChild as HTMLElement | null);
        // Not rendered right now (the Code view is open): the engine keeps the
        // slot it measured last.
        return el && mockup.contains(el) ? offsetWithin(el, mockup) : null;
      });
      if (!wasDocked) host.undock(partIds);
      return { scale, originX: stage.offsetLeft, originY: stage.offsetTop, slots };
    };

    // The hand-off, both ways: the parts move between the physics layer and
    // their slots, and the mockup chrome the mirrors stand in for is hidden
    // while they're in flight. Imperative and in the engine's own frame, so
    // pieces and mockup swap with no frame of either missing.
    const onOrganizedChange = (organized: boolean) => {
      if (organized) host.dock();
      else host.undock(partIds);
      // The table's pieces are photographed as it comes apart, so they fall
      // showing exactly what it showed; dropped again once it's whole.
      for (const spec of specs) {
        if (spec.kind !== "snapshot") continue;
        const live = organized ? null : mockup.querySelector<HTMLElement>(spec.target);
        const copy = live ? snapshot(live, snapshotSlot(live, mockup).clip) : null;
        host.shell(spec.id)?.replaceChildren(...(copy ? [copy] : []));
      }
      mockup.toggleAttribute("data-assembling", !organized);
      setLive(organized);
    };

    let engine: ShowcaseEngine | null = null;
    let cancelled = false;
    const restart = engineStarted.current;
    // matter-js streams in as its own chunk, after first paint.
    void import("../../lib/showcaseStageEngine").then(({ createShowcaseEngine }) => {
      if (cancelled) return;
      engine = createShowcaseEngine({
        sticky,
        layer,
        // Exactly this page's pieces: the previous page's layer nulls its own
        // refs on unmount, which can leave the shared array longer than this.
        pieceEls: pieceEls.current.slice(0, specs.length),
        shapes: specs.map((spec) => spec.shape),
        measure,
        getProgress: () => timeline.progress(),
        onOrganizedChange,
        finePointer,
        skipIntro: skipIntro || restart,
      });
      engine.start();
      engineStarted.current = true;
      void document.fonts?.ready.then(() => engine?.remeasure());
    });

    return () => {
      cancelled = true;
      engine?.stop();
    };
  }, [reduced, specs, host, finePointer, skipIntro]);

  return (
    <section
      className={`hero-showcase${reduced ? " hero-showcase--static" : ""}`}
      ref={trackRef}
      aria-labelledby="hero-title"
    >
      <div className="hero-showcase__sticky" ref={stickyRef}>
        <div className="hero-showcase__dots dot-grid" aria-hidden="true" />

        <div className="hero-showcase__head" ref={headRef}>
          <h1 className="hero-showcase__title" id="hero-title" ref={titleRef}>
            <span className="hero-showcase__sr">
              {QUESTION} {ANSWER}.
            </span>
            {!reduced && <SplitLine text={QUESTION} className="hero-showcase__line--question" />}
            <SplitLine text={ANSWER} className="hero-showcase__line--answer" />
          </h1>
          {/* Inert until revealed, so the invisible link can't take focus. The
              attribute is set imperatively by the timeline from then on. */}
          <div className="hero-showcase__cta" ref={ctaRef} {...{ inert: "" }}>
            <ButtonLink href="#overview" intent="primary" size="lg">
              Get Started
            </ButtonLink>
          </div>
        </div>

        {/* Inert until the pieces hand off to it: nothing in the window is
            reachable while it is still an empty shell. */}
        <div className="hero-showcase__stage" ref={stageRef} {...(live ? {} : { inert: "" })}>
          <div className="hero-showcase__scaler">
            <ShowcaseMockup ref={mockupRef} />
          </div>
        </div>

        {!reduced && (
          <ShowcasePieces key={page} ref={layerRef} specs={specs} pieceEls={pieceEls} />
        )}
      </div>
    </section>
  );
}
