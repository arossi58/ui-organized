/**
 * Physics for the homepage hero (HeroShowcase). The pieces — real library
 * components, see `PIECE_SPECS` — rain into the viewport under matter-js and
 * pile up while the heading asks "Is your UI a mess?". As the visitor scrolls,
 * each piece leaves its resting pose and eases into the exact spot its live
 * counterpart occupies in the mockup; once every piece is home they hand off
 * to the live mockup underneath and hide.
 *
 * The engine owns only the pieces. The heading, the CTA and the mockup shell
 * are animated by the GSAP timeline in HeroShowcase, whose progress this
 * engine reads as its clock, so the two can never drift apart.
 *
 * Nothing about the mockup's layout is written down here. Each piece's slot is
 * measured from the live mockup's DOM (`measure` in the options), so a piece
 * lands where its component really is at every breakpoint, and a change to
 * the mockup's CSS moves the pieces with it.
 *
 * Carried over from the original physics stage (heroStageEngine): the spawn
 * choreography, the low-gravity bouncy world with a ceiling, mouse dragging of
 * falling pieces, and the capture → lerp → release pose hand-off.
 */
import Matter from "matter-js";
import { clamp01, easeInOut } from "./stagePhases";

const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter;

/** Progress marks on the hero timeline. HeroShowcase lays its GSAP tweens out
 * against the same numbers. */
export const SHOWCASE_STAGE = {
  /** Below this the pieces are live physics. */
  physicsEnd: 0.1,
  /** Time one piece spends travelling to its slot. */
  assemblySpan: 0.3,
  /** Spread of assembly start times, first piece to last. */
  staggerWindow: 0.38,
  /** Every piece is home by here (0.1 + 0.38 + 0.3 = 0.78): hand off to the
   * live mockup. */
  organizedAt: 0.8,
  /** Spawn choreography (ms). */
  spawnBeatMs: 350,
  spawnIntervalMs: 140,
  spawnJitterMs: 60,
} as const;

/** A piece's home, in unscaled mockup px: top-left plus size. */
export interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ShowcaseLayout {
  /** Mockup scale (the hero's --showcase-scale). */
  scale: number;
  /** Mockup top-left in the sticky viewport, at its resting position. */
  originX: number;
  originY: number;
  /** One per piece, index-aligned with `pieceEls`; null when the part isn't
   * rendered right now, in which case the piece keeps its last slot. */
  slots: Array<Slot | null>;
}

export interface ShowcaseEngineOptions {
  sticky: HTMLElement;
  layer: HTMLElement;
  pieceEls: Array<HTMLElement | null>;
  shapes: Array<"rect" | "circle">;
  measure: () => ShowcaseLayout;
  getProgress: () => number;
  /** Fires when the pieces hand off to the live mockup, and back. */
  onOrganizedChange: (organized: boolean) => void;
  finePointer: boolean;
  /** Start with the pile already settled — no staggered fall-in. */
  skipIntro: boolean;
}

export interface ShowcaseEngine {
  start(): void;
  stop(): void;
  /** Re-read the layout (fonts loaded, breakpoint changed). */
  remeasure(): void;
}

interface PieceRuntime {
  el: HTMLElement | null;
  fit: HTMLElement | null;
  body: Matter.Body;
  slot: Slot;
  /** Screen size: slot size × scale. */
  w: number;
  h: number;
  spawned: boolean;
  capX: number;
  capY: number;
  capA: number;
  t0: number;
}

export function createShowcaseEngine(options: ShowcaseEngineOptions): ShowcaseEngine {
  const { sticky, layer, pieceEls, shapes, measure, getProgress, onOrganizedChange } = options;

  let layout: ShowcaseLayout = { scale: 1, originX: 0, originY: 0, slots: [] };
  let W = 0;
  let H = 0;

  let engine: Matter.Engine | null = null;
  let walls: Matter.Body[] = [];
  let mouseConstraint: Matter.MouseConstraint | null = null;
  let mouse: Matter.Mouse | null = null;
  let runtime: PieceRuntime[] = [];

  let P = 0;
  let inPhysics = true;
  let organized = false;
  let raf = 0;
  const spawnTimers: number[] = [];
  let resizeTimer: number | null = null;

  // ---- geometry -----------------------------------------------------------

  function readLayout() {
    W = sticky.clientWidth;
    H = sticky.clientHeight;
    layout = measure();
  }

  function target(p: PieceRuntime) {
    const { scale, originX, originY } = layout;
    return {
      x: originX + (p.slot.x + p.slot.w / 2) * scale,
      y: originY + (p.slot.y + p.slot.h / 2) * scale,
    };
  }

  /** Size the piece shell to its slot; the component inside renders at native
   * size in `__fit` and is scaled down with the mockup. */
  function applySize(p: PieceRuntime) {
    if (!p.el) return;
    // An empty slot (a part this layout hides, a table row that isn't on
    // screen) has nowhere to land: the piece sits the whole fall out.
    p.el.style.display = p.slot.w === 0 || p.slot.h === 0 ? "none" : "";
    p.el.style.width = `${p.w}px`;
    p.el.style.height = `${p.h}px`;
    p.el.style.setProperty("--piece-scale", `${layout.scale}`);
    if (p.fit) {
      p.fit.style.width = `${p.slot.w}px`;
      p.fit.style.height = `${p.slot.h}px`;
    }
  }

  function setPose(el: HTMLElement, x: number, y: number, a: number, w: number, h: number) {
    el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${a}rad)`;
  }

  // ---- world --------------------------------------------------------------

  function buildBodies() {
    const count = pieceEls.length;
    runtime = pieceEls.map((el, i) => {
      const slot = layout.slots[i] ?? { x: 0, y: 0, w: 120, h: 40 };
      const w = Math.max(slot.w * layout.scale, 8);
      const h = Math.max(slot.h * layout.scale, 8);
      // Bouncy, low drag: under the reduced gravity the pieces float and
      // rebound off the walls and ceiling rather than dropping dead.
      const opts: Matter.IBodyDefinition = {
        restitution: 0.6,
        friction: 0.4,
        frictionAir: 0.008,
        density: 0.0016,
      };
      const body =
        shapes[i] === "circle"
          ? Bodies.circle(0, -500, w / 2, opts)
          : Bodies.rectangle(0, -500, w, h, { chamfer: { radius: Math.min(12, h / 2) }, ...opts });
      const p: PieceRuntime = {
        el,
        fit: el?.querySelector<HTMLElement>(".physics-piece__fit") ?? null,
        body,
        slot,
        w,
        h,
        spawned: false,
        capX: 0,
        capY: 0,
        capA: 0,
        t0: (i / count) * SHOWCASE_STAGE.staggerWindow,
      };
      applySize(p);
      if (el) el.style.visibility = "hidden";
      return p;
    });
  }

  function buildWalls() {
    if (!engine) return;
    walls.forEach((wall) => Composite.remove(engine!.world, wall));
    const T = 200;
    walls = [
      Bodies.rectangle(W / 2, H + T / 2, W * 2, T, { isStatic: true }), // floor
      Bodies.rectangle(W / 2, -T / 2, W * 2, T, { isStatic: true }), // ceiling
      Bodies.rectangle(-T / 2, H / 2, T, H * 4, { isStatic: true }), // left
      Bodies.rectangle(W + T / 2, H / 2, T, H * 4, { isStatic: true }), // right
    ];
    Composite.add(engine.world, walls);
  }

  function buildMouse() {
    if (!engine || !options.finePointer) return;
    mouse = Mouse.create(sticky);
    mouse.pixelRatio = 1;
    // Matter's Mouse hijacks wheel events with preventDefault, which blocks
    // page scroll. Only dragging is wanted, so strip the wheel listeners.
    const m = mouse as unknown as { mousewheel: EventListener };
    mouse.element.removeEventListener("wheel", m.mousewheel);
    mouse.element.removeEventListener("mousewheel", m.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", m.mousewheel);
    mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.18, damping: 0.12, render: { visible: false } },
    });
    Composite.add(engine.world, mouseConstraint);
  }

  // ---- spawning -----------------------------------------------------------

  function spawn(p: PieceRuntime) {
    if (p.spawned || !engine) return;
    p.spawned = true;
    // A part the current layout hides (the avatar on phones) has no slot to
    // land in, so it never enters the world and stays hidden.
    if (p.slot.w === 0 || p.slot.h === 0) return;
    // In from just under the ceiling, clamped so a tall piece can't spawn
    // through the floor.
    const topY = p.h / 2 + 8;
    const maxY = Math.max(topY, H - 8 - p.h / 2);
    Body.setPosition(p.body, {
      x: W * 0.12 + W * 0.76 * Math.random(),
      y: topY + Math.random() * Math.min(maxY - topY, H * 0.15),
    });
    Body.setAngle(p.body, Math.random() * 0.9 - 0.45);
    Body.setVelocity(p.body, { x: (Math.random() - 0.5) * 1.5, y: 2 + Math.random() * 3 });
    Body.setAngularVelocity(p.body, Math.random() * 0.14 - 0.07);
    Composite.add(engine.world, p.body);
    if (p.el) p.el.style.visibility = "";
  }

  function spawnAll() {
    runtime.forEach(spawn);
  }

  function scheduleSpawns() {
    const order = runtime.slice();
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j]!, order[i]!];
    }
    const { spawnBeatMs, spawnIntervalMs, spawnJitterMs } = SHOWCASE_STAGE;
    order.forEach((p, idx) => {
      const delay = spawnBeatMs + idx * spawnIntervalMs + Math.random() * spawnJitterMs;
      spawnTimers.push(window.setTimeout(() => spawn(p), delay));
    });
  }

  // ---- pose hand-off ------------------------------------------------------

  function assembly(p: PieceRuntime): number {
    const { physicsEnd, assemblySpan } = SHOWCASE_STAGE;
    return easeInOut(clamp01((P - physicsEnd - p.t0) / assemblySpan));
  }

  function lerpPose(p: PieceRuntime) {
    const e = assembly(p);
    const t = target(p);
    return { x: p.capX + (t.x - p.capX) * e, y: p.capY + (t.y - p.capY) * e, a: p.capA * (1 - e) };
  }

  function capturePoses() {
    spawnAll();
    runtime.forEach((p) => {
      p.capX = p.body.position.x;
      p.capY = p.body.position.y;
      p.capA = p.body.angle;
      Body.setStatic(p.body, true);
    });
  }

  function releasePoses() {
    runtime.forEach((p) => {
      const pose = lerpPose(p);
      Body.setStatic(p.body, false);
      Body.setPosition(p.body, { x: pose.x, y: pose.y });
      Body.setAngle(p.body, pose.a);
      Body.setVelocity(p.body, { x: (Math.random() - 0.5) * 2, y: 1 + Math.random() * 2 });
      Body.setAngularVelocity(p.body, (Math.random() - 0.5) * 0.08);
    });
  }

  // ---- loop ---------------------------------------------------------------

  function setOrganized(on: boolean) {
    if (on === organized) return;
    organized = on;
    // Coming apart: re-read the slots first. While it was live the visitor
    // may have collapsed the sidebar or resized a text area, and the pieces
    // must leave from where the parts are now.
    if (!on) remeasure();
    layer.classList.toggle("is-done", on);
    onOrganizedChange(on);
  }

  function tick() {
    P = getProgress();

    const wantPhysics = P < SHOWCASE_STAGE.physicsEnd;
    if (wantPhysics !== inPhysics) {
      if (wantPhysics) {
        releasePoses();
        layer.classList.remove("is-frozen");
      } else {
        capturePoses();
        layer.classList.add("is-frozen");
      }
      inPhysics = wantPhysics;
    }

    setOrganized(!wantPhysics && P >= SHOWCASE_STAGE.organizedAt);

    if (inPhysics && engine) {
      Engine.update(engine, 1000 / 60);
      runtime.forEach((p) => {
        if (p.spawned && p.el) setPose(p.el, p.body.position.x, p.body.position.y, p.body.angle, p.w, p.h);
      });
    } else if (!organized) {
      runtime.forEach((p) => {
        if (!p.el) return;
        const pose = lerpPose(p);
        setPose(p.el, pose.x, pose.y, pose.a, p.w, p.h);
      });
    }

    raf = requestAnimationFrame(tick);
  }

  // ---- resize -------------------------------------------------------------

  function remeasure() {
    readLayout();
    buildWalls();
    runtime.forEach((p, i) => {
      p.slot = layout.slots[i] ?? p.slot;
      const w = Math.max(p.slot.w * layout.scale, 8);
      const h = Math.max(p.slot.h * layout.scale, 8);
      if (Math.abs(w / p.w - 1) > 0.001 || Math.abs(h / p.h - 1) > 0.001) {
        Body.scale(p.body, w / p.w, h / p.h);
      }
      p.w = w;
      p.h = h;
      applySize(p);
    });
    // Mid-assembly: re-capture so the lerp starts from where pieces are drawn
    // now rather than from a pose measured against the old viewport.
    if (!inPhysics) {
      runtime.forEach((p) => Body.setStatic(p.body, false));
      capturePoses();
    }
  }

  function onResize() {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(remeasure, 140);
  }

  // ---- lifecycle ----------------------------------------------------------

  function start() {
    engine = Engine.create();
    // Low gravity: the pieces drift and float rather than drop.
    engine.gravity.y = 0.35;

    readLayout();
    buildWalls();
    buildBodies();
    buildMouse();

    P = getProgress();
    // A repeat visit today skips the staggered fall-in, and a load part-way
    // down the page needs the pile settled before it can hand off: spawn
    // everything and fast-forward the world.
    if (options.skipIntro || P >= SHOWCASE_STAGE.physicsEnd) {
      spawnAll();
      for (let k = 0; k < 180; k++) Engine.update(engine, 1000 / 60);
      if (P >= SHOWCASE_STAGE.physicsEnd) {
        capturePoses();
        layer.classList.add("is-frozen");
        inPhysics = false;
      }
    } else {
      scheduleSpawns();
    }

    // Announce where we start, before the first frame: a restart while the
    // mockup is live (the visitor switched page) must not flash a pile over it.
    organized = !inPhysics && P >= SHOWCASE_STAGE.organizedAt;
    layer.classList.toggle("is-done", organized);
    onOrganizedChange(organized);
    // Every piece is placed (or hidden) now. Until this the layer is hidden,
    // so a freshly mounted one never shows its pieces stacked at its origin.
    layer.classList.add("is-ready");

    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);
  }

  /** Matter's Mouse has no teardown; take its listeners off the stage by hand
   * so a restarted engine doesn't leave the old one listening. */
  function removeMouse() {
    if (!mouse) return;
    const m = mouse as unknown as Record<string, EventListener>;
    const pairs: Array<[string, string]> = [
      ["mousemove", "mousemove"],
      ["mousedown", "mousedown"],
      ["mouseup", "mouseup"],
      ["touchmove", "mousemove"],
      ["touchstart", "mousedown"],
      ["touchend", "mouseup"],
    ];
    for (const [type, handler] of pairs) {
      if (m[handler]) mouse.element.removeEventListener(type, m[handler]);
    }
    mouse = null;
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    spawnTimers.forEach((t) => window.clearTimeout(t));
    spawnTimers.length = 0;
    if (resizeTimer) window.clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    removeMouse();
    if (engine) {
      if (mouseConstraint) Composite.remove(engine.world, mouseConstraint);
      Engine.clear(engine);
      engine = null;
    }
    layer.classList.remove("is-frozen", "is-done", "is-ready");
    runtime = [];
    walls = [];
    mouseConstraint = null;
    organized = false;
  }

  return { start, stop, remeasure };
}
