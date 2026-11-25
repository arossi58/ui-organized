import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * A real, one-frame WebM in `browser/public/`. The file has to exist: axe's
 * `no-autoplay-audio` rule waits for an autoplaying video's metadata before it
 * audits, and a missing file never delivers any, so every library would sit out
 * axe's full preload timeout and the a11y gate would time out.
 */
const FILE = { src: "/media/tour.webm", title: "Product tour" };

const scenarios: BrowserScenario[] = staticScenarios("VideoEmbed", [
  { name: "facade", props: FILE },
  { name: "with poster", props: { ...FILE, poster: "/media/tour.jpg" } },
  { name: "iframe", props: { src: "https://player.example.com/embed/1", title: "Launch talk" } },
  { name: "lightbox", props: { ...FILE, lightbox: true } },
  { name: "background", props: { ...FILE, background: true } },
]);

scenarios.push(
  {
    // Pressing play swaps the poster button for the player, in place.
    component: "VideoEmbed",
    name: "plays in place",
    props: FILE,
    steps: [
      { do: "click", target: ".video-embed__poster" },
      { do: "wait", target: "video.video-embed__media" },
    ],
    regions: ["#mount"],
  },
  {
    // With `lightbox`, the player opens in a full-screen dialog instead.
    component: "VideoEmbed",
    name: "opens the lightbox",
    props: { ...FILE, lightbox: true },
    steps: [
      { do: "click", target: ".video-embed__poster" },
      { do: "wait", target: `${part("dialog", "content")}[data-state="open"]` },
      { do: "wait", target: "video.video-embed__media" },
      { do: "wait", target: '#mount[aria-hidden="true"]' },
    ],
    regions: [part("dialog", "backdrop"), part("dialog", "positioner"), "#mount"],
  },
);

export default scenarios;
