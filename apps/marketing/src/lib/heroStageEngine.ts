/**
 * Hero scroll-stage engine (SITE.md §5) — framework-agnostic. Owns the single
 * rAF loop, the matter-js world, spawn choreography, the physics→assembly pose
 * handoff, overlay transforms, the cursor glow, and (phase 4) arrange mode: once
 * organized, pieces can be dragged on the 44px dot lattice that the portal
 * reveals through the frame. React renders the DOM and hands the engine element
 * refs; the engine never creates DOM. The snapping math is pure in `lattice.ts`.
 */
import Matter from "matter-js";
import { FRAME_W, FRAME_H, PIECES, type PieceDef } from "./pieceManifest";
import {
  STAGE,
  OVERLAY,
  ARRANGE,
  pieceAssembly,
  staggerStart,
  titleTuck,
  titleHintFade,
  frameReveal,
  captionReveal,
  progressFor,
} from "./stagePhases";
import {
  type Point,
  type Rect,
  rectsOverlap,
  snapToLattice,
  wrapDot,
} from "./lattice";

const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter;

/** Half the cursor-glow's CSS size (520px), to center it on the pointer. */
const GLOW_HALF = 260;
const GLOW_EASE = 0.07;

/** Sidebar-collapse reflow geometry, in frame units (see pieceLayout). The DS
 * sidebar collapses from 240px to 68px (leading-body-medium + 2·space-02 +
 * 2·space-04), so the body reclaims 172px the content slides/widens into. */
const SIDEBAR_W = 240;
const SIDEBAR_W_COLLAPSED = 68;
const REFLOW_MAX = SIDEBAR_W - SIDEBAR_W_COLLAPSED;
const BODY_PAD = 24; // body padding (sidebar→content gap, and content→right edge)
const COL_PAD = 16; // content-panel inner padding
const COL_GAP = 32; // gap between the two control columns
const STAT_GAP = 24; // gap between stat cards
const LEFT_COL_LEFT0 = 280; // expanded left / right control-column left edges
const RIGHT_COL_LEFT0 = 736;
const STAT_CX0 = [369, 603, 837, 1071]; // expanded stat-card centers (→ index)
/** Controls whose width tracks the column (block controls); the rest keep size. */
const FLUID_KINDS = new Set([
  "input",
  "select",
  "range",
  "banner",
  "textarea",
  "meter",
  "pagination",
  "tabs",
  "search",
]);
/** Header account cluster pinned to the right: the avatar sits flush to the body
 * right edge and the badge sits this gap to its left. */
const AVATAR_W = 40;
const HEADER_GAP = 16;

export interface HeroStageRefs {
  stage: HTMLElement;
  sticky: HTMLElement;
  layer: HTMLElement;
  frame: HTMLElement;
  title: HTMLElement;
  /** Optional — the hero may render the title alone, with no eyebrow/hint. */
  titleEyebrow?: HTMLElement | null;
  titleHint?: HTMLElement | null;
  caption: HTMLElement;
  glow: HTMLElement | null;
  pieceEls: Array<HTMLElement | null>;
}

export interface HeroStageOptions {
  reducedMotion: boolean;
  finePointer: boolean;
}

interface PieceRuntime {
  def: PieceDef;
  el: HTMLElement | null;
  body: Matter.Body;
  /** Screen-space size (frame units × S). */
  w: number;
  h: number;
  spawned: boolean;
  /** Captured pose at the physics→assembly handoff. */
  capX: number;
  capY: number;
  capA: number;
  /** Stagger start within the assembly window. */
  t0: number;
  /** Home slot in frame units — the exact manifest (Figma) center; updated to a
   * lattice-snapped slot only when the piece is arranged (dragged). */
  homeCx: number;
  homeCy: number;
  /** Arrange-mode state: actively dragged / springing back to a snapped home. */
  gridDrag: boolean;
  gridSnap: boolean;
  /** Arrange position (px) + spring velocity. */
  gx: number;
  gy: number;
  gvx: number;
  gvy: number;
}

export interface HeroStageEngine {
  start(): void;
  stop(): void;
  /** Supply a cached, scroll-event-driven progress source (useScrollProgress)
   * so the loop doesn't read layout every frame. */
  setProgressSource(fn: () => number): void;
}

export function createHeroStageEngine(
  refs: HeroStageRefs,
  options: HeroStageOptions,
): HeroStageEngine {
  const { reducedMotion, finePointer } = options;

  let W = 0;
  let H = 0;
  let S = 1;
  const frameRect: Rect = { x: 0, y: 0, w: 0, h: 0 };

  let engine: Matter.Engine | null = null;
  let walls: Matter.Body[] = [];
  let mouseConstraint: Matter.MouseConstraint | null = null;
  let runtime: PieceRuntime[] = [];

  let P = 0;
  let inPhysics = true;
  let organizedMode = false;
  let raf = 0;
  const spawnTimers: number[] = [];
  /** Teardown for the per-piece arrange pointer listeners. */
  const arrangeCleanups: Array<() => void> = [];
  let resizeTimer: number | null = null;
  let getProgress: () => number = () => progressFor(refs.stage, window.innerHeight);

  // Sidebar-collapse reflow: `sidebarShrink` eases 0 (expanded) → 1 (collapsed),
  // read each frame from the live `.sidebar` element. The body content (heading,
  // stat cards, the control grid, and the panel backing) tracks it so it fills
  // the space the rail vacates (feedback).
  let sidebarShrink = 0;
  let sidebarClassEl: HTMLElement | null = null;
  let contentEl: HTMLElement | null = null;

  // Glow state
  let glowX = 0;
  let glowY = 0;
  let glowTX = 0;
  let glowTY = 0;
  let glowLive = false;

  // ---- geometry -----------------------------------------------------------

  function measure() {
    W = refs.sticky.clientWidth;
    H = refs.sticky.clientHeight;
    // Cap at 1 so the mockup never scales *past* its native 1:1 size — on large
    // screens the components stay their default size rather than zooming up
    // (feedback); smaller screens stay width/height-limited below 1.
    S = Math.min(1, (W * 0.92) / FRAME_W, (H * 0.58) / FRAME_H);
    frameRect.w = FRAME_W * S;
    frameRect.h = FRAME_H * S;
    frameRect.x = (W - frameRect.w) / 2;
    // Center the window vertically in the band between the tucked hero title and
    // the caption, so the gap above the mockup matches the gap below (feedback).
    // The title settles full-size, so project it to its tucked pose (the same
    // transform updateOverlays applies at full tuck); the caption is bottom-
    // anchored, so its laid-out top is exact.
    const titleH = (refs.title.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0;
    const titleScale = 1 - OVERLAY.titleShrink;
    const titleBottom =
      (H / 2) * titleScale - H * OVERLAY.titleRise + (titleH * titleScale) / 2;
    const captionTop = refs.caption.offsetTop;
    frameRect.y = titleBottom + (captionTop - titleBottom - frameRect.h) / 2;
    // Never let the window run off the top or bottom of the viewport.
    frameRect.y = Math.max(24, Math.min(frameRect.y, H - 24 - frameRect.h));
    const f = refs.frame.style;
    f.width = `${frameRect.w}px`;
    f.height = `${frameRect.h}px`;
    f.left = `${frameRect.x}px`;
    f.top = `${frameRect.y}px`;
    f.fontSize = `${16 * S}px`;
    // The mockup shell is laid out at full Figma scale and shrunk to the frame
    // by this factor (AppFrame's `__mockup` reads it as `--frame-scale`).
    f.setProperty("--frame-scale", `${S}`);
    // Align the portal dot lattice with the page lattice. 1 = frame border.
    f.setProperty("--dotx", `${-wrapDot(frameRect.x + 1)}px`);
    f.setProperty("--doty", `${-wrapDot(frameRect.y + 1)}px`);
  }

  /** Body content-left in frame units for the current sidebar width (264 → 92). */
  function bodyLeft(): number {
    return SIDEBAR_W - REFLOW_MAX * sidebarShrink + BODY_PAD;
  }

  /** Reflowed slot center + width (frame units) for a piece, given the current
   * sidebar-collapse amount. Layout-owning chrome (the rail itself, the right-
   * anchored badge) is fixed; everything else in the body tracks `bodyLeft` so it
   * fills the space the sidebar vacates, and block controls/stats widen too. */
  function pieceLayout(p: PieceRuntime): { cx: number; w: number } {
    const { kind, w } = p.def;
    const bL = bodyLeft();
    const bR = FRAME_W - BODY_PAD; // 1176, fixed right edge
    if (kind === "sidebar") return { cx: p.homeCx, w };
    if (kind === "avatar") return { cx: bR - w / 2, w }; // flush to the right edge
    if (kind === "badge") return { cx: bR - AVATAR_W - HEADER_GAP - w / 2, w }; // 16px left of the avatar
    if (kind === "heading") return { cx: bL + w / 2, w }; // pinned to body-left
    if (kind === "stat") {
      const i = STAT_CX0.indexOf(p.def.cx);
      const cardW = (bR - bL - 3 * STAT_GAP) / 4;
      return { cx: bL + i * (cardW + STAT_GAP) + cardW / 2, w: cardW };
    }
    // Control grid: two columns inside the panel (16px inner pad, 32px gap).
    const colW = (bR - bL - 2 * COL_PAD - COL_GAP) / 2;
    const isLeft = p.def.cx < 720;
    const colLeft = isLeft ? bL + COL_PAD : bL + COL_PAD + colW + COL_GAP;
    if (FLUID_KINDS.has(kind)) return { cx: colLeft + colW / 2, w: colW };
    // Fixed-size control: keep its width, preserve its offset within the column.
    const colLeft0 = isLeft ? LEFT_COL_LEFT0 : RIGHT_COL_LEFT0;
    const off = p.def.cx - w / 2 - colLeft0;
    return { cx: colLeft + off + w / 2, w };
  }

  /** Whether a piece's rendered width tracks the reflow (block controls + stats). */
  function widens(p: PieceRuntime): boolean {
    return p.def.kind === "stat" || FLUID_KINDS.has(p.def.kind);
  }

  /** Organized slot for a piece, honouring the sidebar-collapse reflow. */
  function targetForPiece(p: PieceRuntime): Point {
    return { x: frameRect.x + pieceLayout(p).cx * S, y: frameRect.y + p.homeCy * S };
  }

  /** Manifest slot for a def (used by the reduced-motion static layout). */
  function targetFor(def: PieceDef): Point {
    return { x: frameRect.x + def.cx * S, y: frameRect.y + def.cy * S };
  }

  function applyPieceSize(p: PieceRuntime) {
    if (!p.el) return;
    p.el.style.width = `${p.w}px`;
    p.el.style.height = `${p.h}px`;
    p.el.style.fontSize = `${16 * S}px`;
    // Real `@ui-organized/react` pieces are rem/token-sized, so they can't scale with the
    // em font-size like stickers — their `__fit` wrapper scales by this instead.
    p.el.style.setProperty("--piece-scale", `${S}`);
  }

  function setPiece(el: HTMLElement, x: number, y: number, a: number, w: number, h: number) {
    el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${a}rad)`;
  }

  // ---- world build --------------------------------------------------------

  function buildBodies() {
    runtime = PIECES.map((def, i) => {
      const w = def.w * S;
      const h = def.h * S;
      const opts: Matter.IBodyDefinition = {
        // Bouncier + less air drag so pieces float and rebound off the walls
        // (including the new ceiling) under the reduced gravity (feedback).
        restitution: 0.6,
        friction: 0.4,
        frictionAir: 0.008,
        density: 0.0016,
      };
      const body =
        def.shape === "circle"
          ? Bodies.circle(0, -500, w / 2, opts)
          : Bodies.rectangle(0, -500, w, h, {
              chamfer: { radius: Math.min(12, h / 2) },
              ...opts,
            });
      const p: PieceRuntime = {
        def,
        el: refs.pieceEls[i] ?? null,
        body,
        w,
        h,
        spawned: false,
        capX: 0,
        capY: 0,
        capA: 0,
        t0: staggerStart(i, PIECES.length),
        homeCx: def.cx,
        homeCy: def.cy,
        gridDrag: false,
        gridSnap: false,
        gx: 0,
        gy: 0,
        gvx: 0,
        gvy: 0,
      };
      applyPieceSize(p);
      if (p.el) p.el.style.visibility = "hidden";
      return p;
    });
  }

  function buildWalls() {
    if (!engine) return;
    walls.forEach((w) => Composite.remove(engine!.world, w));
    const T = 200;
    walls = [
      // floor
      Bodies.rectangle(W / 2, H + T / 2, W * 2, T, { isStatic: true }),
      // ceiling — the top is now a boundary too (feedback), so pieces bounce off
      // it instead of escaping above the viewport. Its bottom edge sits at y=0.
      Bodies.rectangle(W / 2, -T / 2, W * 2, T, { isStatic: true }),
      // left / right
      Bodies.rectangle(-T / 2, H / 2, T, H * 4, { isStatic: true }),
      Bodies.rectangle(W + T / 2, H / 2, T, H * 4, { isStatic: true }),
    ];
    Composite.add(engine.world, walls);
  }

  function buildMouse() {
    if (!engine || !finePointer || reducedMotion) return;
    const mouse = Mouse.create(refs.sticky);
    mouse.pixelRatio = 1;
    // Matter's Mouse hijacks wheel events with preventDefault, blocking page
    // scroll. We only need dragging, so strip the wheel listeners back off.
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

  function spawnPiece(p: PieceRuntime) {
    if (p.spawned || !engine) return;
    p.spawned = true;
    // Drop in from just below the ceiling (the new top boundary) so pieces still
    // fall from the top but stay inside the viewport; clamp the band so a tall
    // piece can't spawn through the floor (feedback).
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

  function spawnAllNow() {
    runtime.forEach(spawnPiece);
  }

  function scheduleSpawns() {
    const order = runtime.slice();
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j]!, order[i]!];
    }
    order.forEach((p, idx) => {
      const delay =
        STAGE.spawnBeatMs + idx * STAGE.spawnIntervalMs + Math.random() * STAGE.spawnJitterMs;
      spawnTimers.push(window.setTimeout(() => spawnPiece(p), delay));
    });
  }

  // ---- pose handoff -------------------------------------------------------

  function currentLerpPose(p: PieceRuntime) {
    const e = pieceAssembly(P, p.t0);
    const tgt = targetForPiece(p);
    return {
      x: p.capX + (tgt.x - p.capX) * e,
      y: p.capY + (tgt.y - p.capY) * e,
      a: p.capA * (1 - e),
    };
  }

  function capturePoses() {
    spawnAllNow();
    runtime.forEach((p) => {
      p.capX = p.body.position.x;
      p.capY = p.body.position.y;
      p.capA = p.body.angle;
      Body.setStatic(p.body, true);
    });
  }

  function releasePoses() {
    runtime.forEach((p) => {
      const bp = currentLerpPose(p);
      Body.setStatic(p.body, false);
      Body.setPosition(p.body, { x: bp.x, y: bp.y });
      Body.setAngle(p.body, bp.a);
      Body.setVelocity(p.body, { x: (Math.random() - 0.5) * 2, y: 1 + Math.random() * 2 });
      Body.setAngularVelocity(p.body, (Math.random() - 0.5) * 0.08);
    });
  }

  // ---- arrange mode (phase 4) ---------------------------------------------

  /** The real `@ui-organized/react` component element inside a piece (null for stickers). */
  function fitOf(p: PieceRuntime): HTMLElement | null {
    return p.el?.querySelector<HTMLElement>(".physics-piece__fit") ?? null;
  }

  function setOrganizedMode(on: boolean) {
    if (on === organizedMode) return;
    organizedMode = on;
    refs.layer.classList.toggle("is-arrangeable", on);
    // The grab cursor / touch-action affordance is gated separately so dragging
    // can be disabled (ARRANGE.dragEnabled) while pieces stay live/clickable.
    refs.layer.classList.toggle("is-draggable", on && ARRANGE.dragEnabled);
    // Real components are inert decoration while falling/assembling; once the
    // layout is organized they go live — clickable/typable as themselves, in
    // addition to draggable. Stickers stay decorative throughout.
    runtime.forEach((p) => {
      const fit = fitOf(p);
      if (fit) fit.inert = !on;
    });
    if (!on) {
      runtime.forEach((p) => {
        p.gridDrag = false;
        p.gridSnap = false;
        p.el?.classList.remove("is-arranging");
      });
      refs.frame.classList.remove("is-gridding");
    }
  }

  /** Would a piece dropped at `pos` (px center) collide with another's home? */
  function arrangeOverlaps(p: PieceRuntime, pos: Point): boolean {
    for (const q of runtime) {
      if (q === p) continue;
      const qt = targetForPiece(q);
      if (
        rectsOverlap(
          { x: pos.x, y: pos.y, w: p.w, h: p.h },
          { x: qt.x, y: qt.y, w: q.w, h: q.h },
        )
      ) {
        return true;
      }
    }
    return false;
  }

  function snapToArrangeGrid(p: PieceRuntime, c: Point): Point {
    return snapToLattice(p.w, p.h, c, frameRect, S, (pos) => !arrangeOverlaps(p, pos));
  }

  /** Wire pointer arrange on one piece. A press only becomes a drag once it
   * travels past `dragThresholdPx` — below that it passes straight through, so
   * the real component handles the click/toggle/focus itself (a piece is both
   * interactive and draggable). The drop snaps to the lattice as the new home. */
  function attachArrange(p: PieceRuntime) {
    const el = p.el;
    if (!el) return;
    // `armed`: pressed, not yet moved enough to be a drag (might be a click).
    let armed = false;
    let downClientX = 0;
    let downClientY = 0;
    let offX = 0;
    let offY = 0;

    const beginDrag = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId); // capture so a tap's click never fires
      const rect = refs.sticky.getBoundingClientRect();
      const pose = targetForPiece(p);
      const startX = p.gridSnap ? p.gx : pose.x;
      const startY = p.gridSnap ? p.gy : pose.y;
      offX = downClientX - rect.left - startX;
      offY = downClientY - rect.top - startY;
      p.gx = startX;
      p.gy = startY;
      p.gridDrag = true;
      p.gridSnap = false;
      el.classList.add("is-arranging");
      refs.frame.classList.add("is-gridding");
    };

    const onDown = (e: PointerEvent) => {
      // Dragging disabled: never arm a drag, so presses fall through to the live
      // component as plain clicks/taps. (Flip ARRANGE.dragEnabled to re-enable.)
      if (!ARRANGE.dragEnabled) return;
      // Ignore non-primary buttons; let the component handle right-click etc.
      if (!organizedMode || p.gridDrag || e.button !== 0) return;
      armed = true;
      downClientX = e.clientX;
      downClientY = e.clientY;
    };

    const onMove = (e: PointerEvent) => {
      if (armed && !p.gridDrag) {
        const dx = e.clientX - downClientX;
        const dy = e.clientY - downClientY;
        if (dx * dx + dy * dy < ARRANGE.dragThresholdPx * ARRANGE.dragThresholdPx) {
          return; // still within the slop — treat as a potential click
        }
        beginDrag(e);
      }
      if (!p.gridDrag) return;
      const rect = refs.sticky.getBoundingClientRect();
      p.gx = e.clientX - rect.left - offX;
      p.gy = e.clientY - rect.top - offY;
    };

    const onUp = () => {
      armed = false;
      if (!p.gridDrag) return; // a click/tap — the component already handled it
      p.gridDrag = false;
      el.classList.remove("is-arranging");
      refs.frame.classList.remove("is-gridding");
      const slot = snapToArrangeGrid(p, { x: p.gx, y: p.gy });
      p.homeCx = (slot.x - frameRect.x) / S; // the snapped slot is the new home
      p.homeCy = (slot.y - frameRect.y) / S;
      p.gridSnap = true;
      p.gvx = 0;
      p.gvy = 0;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    arrangeCleanups.push(() => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    });
  }

  // ---- overlays + glow ----------------------------------------------------

  function updateOverlays() {
    const tuck = titleTuck(P);
    refs.title.style.transform = `translateY(${-H * OVERLAY.titleRise * tuck}px) scale(${1 - OVERLAY.titleShrink * tuck})`;
    const hint = `${titleHintFade(P)}`;
    if (refs.titleEyebrow) refs.titleEyebrow.style.opacity = hint;
    if (refs.titleHint) refs.titleHint.style.opacity = hint;

    const fe = frameReveal(P);
    refs.frame.style.opacity = `${fe}`;
    refs.frame.style.transform = `translateY(${OVERLAY.frameRise * (1 - fe)}px) scale(${OVERLAY.frameScaleFrom + (1 - OVERLAY.frameScaleFrom) * fe})`;

    const cap = captionReveal(P);
    refs.caption.style.opacity = `${cap}`;
    refs.caption.style.transform = `translateY(${OVERLAY.captionRise * (1 - cap)}px)`;
    refs.caption.style.pointerEvents = cap > OVERLAY.captionInteractiveAt ? "auto" : "none";
  }

  function stepGlow() {
    if (!refs.glow || !glowLive) return;
    glowX += (glowTX - glowX) * GLOW_EASE;
    glowY += (glowTY - glowY) * GLOW_EASE;
    refs.glow.style.transform = `translate(${glowX - GLOW_HALF}px, ${glowY - GLOW_HALF}px)`;
  }

  function onGlowMove(e: PointerEvent) {
    const rect = refs.sticky.getBoundingClientRect();
    glowTX = e.clientX - rect.left;
    glowTY = e.clientY - rect.top;
    if (!glowLive) {
      glowLive = true;
      glowX = glowTX;
      glowY = glowTY;
      if (refs.glow) {
        refs.glow.style.left = "0px";
        refs.glow.style.top = "0px";
      }
    }
  }

  // ---- frame loop ---------------------------------------------------------

  function frameTick() {
    P = getProgress();

    const wantPhysics = P < STAGE.physicsEnd;
    if (wantPhysics !== inPhysics) {
      if (wantPhysics) {
        releasePoses();
        // Reflow only applies to the settled body; restore base widths so the
        // falling pieces match their (base-sized) physics bodies.
        runtime.forEach((p) => {
          if (!widens(p) || !p.el) return;
          const fit = fitOf(p);
          if (fit) fit.style.width = `${p.def.w}px`;
          p.el.style.width = `${p.w}px`;
        });
        refs.layer.classList.remove("is-frozen");
      } else {
        capturePoses();
        refs.layer.classList.add("is-frozen");
      }
      inPhysics = wantPhysics;
    }

    // Arrange mode opens once the pieces are fully organized (SITE.md §5).
    setOrganizedMode(!wantPhysics && P >= STAGE.organizedAt);

    // Ease the body reflow toward the rail's live collapsed state — tracked in
    // every phase (not just when organized) so a collapsed layout *assembles*
    // straight to its collapsed width instead of settling expanded then jumping.
    const wantCollapsed = !!sidebarClassEl?.classList.contains("sidebar--collapsed");
    sidebarShrink += ((wantCollapsed ? 1 : 0) - sidebarShrink) * 0.18;
    if (contentEl) contentEl.style.left = `${bodyLeft()}px`;

    if (inPhysics && engine) {
      Engine.update(engine, 1000 / 60);
      runtime.forEach((p) => {
        if (p.spawned && p.el) setPiece(p.el, p.body.position.x, p.body.position.y, p.body.angle, p.w, p.h);
      });
    } else {
      runtime.forEach((p) => {
        if (!p.el) return;
        if (p.gridDrag) {
          // Following the pointer 1:1.
          setPiece(p.el, p.gx, p.gy, 0, p.w, p.h);
          return;
        }
        if (p.gridSnap) {
          // Springing from the drop point onto the snapped home slot.
          const tgt = targetForPiece(p);
          p.gvx = (p.gvx + (tgt.x - p.gx) * ARRANGE.springPull) * ARRANGE.springDamp;
          p.gvy = (p.gvy + (tgt.y - p.gy) * ARRANGE.springPull) * ARRANGE.springDamp;
          p.gx += p.gvx;
          p.gy += p.gvy;
          if (
            Math.abs(tgt.x - p.gx) < ARRANGE.settlePos &&
            Math.abs(tgt.y - p.gy) < ARRANGE.settlePos &&
            Math.abs(p.gvx) < ARRANGE.settleVel &&
            Math.abs(p.gvy) < ARRANGE.settleVel
          ) {
            p.gridSnap = false;
            setPiece(p.el, tgt.x, tgt.y, 0, p.w, p.h);
          } else {
            setPiece(p.el, p.gx, p.gy, 0, p.w, p.h);
          }
          return;
        }
        const pose = currentLerpPose(p);
        const lay = pieceLayout(p);
        // Grow the width from its base (falling) size to the reflowed target in
        // step with the assembly easing `e`, matching the position lerp — so the
        // piece arrives at its final (e.g. collapsed) width with no late snap.
        const e = pieceAssembly(P, p.t0);
        const fw = p.def.w + (lay.w - p.def.w) * e;
        const ew = fw * S;
        setPiece(p.el, pose.x, pose.y, pose.a, ew, p.h);
        if (widens(p)) {
          // Widen the fit wrapper (and the el hit-box) so the control fills the
          // reflowed column; pose.x already uses the reflowed center.
          const fit = fitOf(p);
          if (fit) fit.style.width = `${fw}px`;
          p.el.style.width = `${ew}px`;
        }
      });
    }

    updateOverlays();
    stepGlow();
    raf = requestAnimationFrame(frameTick);
  }

  // ---- reduced motion -----------------------------------------------------

  function staticLayout() {
    measure();
    // Settle the title into its tucked pose (the animated path reaches this via
    // titleTuck) so the reduced-motion layout matches the centering measure()
    // computes between the tucked title and the caption.
    refs.title.style.transform = `translateY(${-H * OVERLAY.titleRise}px) scale(${1 - OVERLAY.titleShrink})`;
    refs.frame.style.opacity = "1";
    refs.frame.style.transform = "none";
    if (refs.titleHint) refs.titleHint.style.display = "none";
    refs.caption.style.opacity = "1";
    refs.caption.style.pointerEvents = "auto";
    // Place each piece directly on its exact mockup slot — the same Figma layout
    // the motion path settles into, no physics and no lattice snap (SITE.md §8).
    PIECES.forEach((def, i) => {
      const el = refs.pieceEls[i];
      if (!el) return;
      const w = def.w * S;
      const h = def.h * S;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.fontSize = `${16 * S}px`;
      el.style.setProperty("--piece-scale", `${S}`);
      el.style.visibility = "";
      const tgt = targetFor(def);
      setPiece(el, tgt.x, tgt.y, 0, w, h);
    });
  }

  // ---- resize -------------------------------------------------------------

  function onResize() {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const wasPhysics = inPhysics;
      measure();
      buildWalls();
      runtime.forEach((p) => {
        const w = p.def.w * S;
        const h = p.def.h * S;
        const sx = w / p.w;
        if (Math.abs(sx - 1) > 0.001) Body.scale(p.body, sx, h / p.h);
        p.w = w;
        p.h = h;
        applyPieceSize(p);
      });
      if (!wasPhysics) {
        runtime.forEach((p) => Body.setStatic(p.body, false));
        capturePoses();
      }
    }, 140);
  }

  // ---- lifecycle ----------------------------------------------------------

  function start() {
    if (reducedMotion) {
      staticLayout();
      window.addEventListener("resize", staticLayout);
      return;
    }

    engine = Engine.create();
    // Low gravity so the pieces drift and float rather than drop straight down
    // (feedback). Pairs with the bouncier bodies + the ceiling boundary below.
    engine.gravity.y = 0.35;

    measure();
    buildWalls();
    buildBodies();
    buildMouse();
    runtime.forEach(attachArrange);

    // Watch the rail's collapsed state to drive the body reflow, and grab the
    // content-panel backing so it tracks the reflow too.
    sidebarClassEl =
      runtime
        .find((p) => p.def.kind === "sidebar")
        ?.el?.querySelector<HTMLElement>(".sidebar") ?? null;
    contentEl = refs.frame.querySelector<HTMLElement>(".app-frame__content");

    if (finePointer && refs.glow) {
      refs.sticky.addEventListener("pointermove", onGlowMove);
    }

    P = getProgress();
    if (P >= STAGE.physicsEnd) {
      // Loaded mid-scroll: drop everything and pre-settle the pile before handoff.
      spawnAllNow();
      for (let k = 0; k < 180; k++) Engine.update(engine, 1000 / 60);
      capturePoses();
      refs.layer.classList.add("is-frozen");
      inPhysics = false;
    } else {
      scheduleSpawns();
    }

    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frameTick);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    spawnTimers.forEach((t) => window.clearTimeout(t));
    spawnTimers.length = 0;
    if (resizeTimer) window.clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("resize", staticLayout);
    refs.sticky.removeEventListener("pointermove", onGlowMove);
    arrangeCleanups.forEach((fn) => fn());
    arrangeCleanups.length = 0;
    organizedMode = false;
    sidebarShrink = 0;
    sidebarClassEl = null;
    contentEl = null;
    if (engine) {
      if (mouseConstraint) Composite.remove(engine.world, mouseConstraint);
      Engine.clear(engine);
      engine = null;
    }
    runtime = [];
    walls = [];
    mouseConstraint = null;
  }

  function setProgressSource(fn: () => number) {
    getProgress = fn;
  }

  return { start, stop, setProgressSource };
}
