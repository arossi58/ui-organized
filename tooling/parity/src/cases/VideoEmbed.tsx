import type { ComponentType } from "react";
import { VideoEmbed as RVideoEmbed } from "@ui-organized/react";
import VideoEmbedFixture from "../fixtures/VideoEmbedFixture.svelte";
import VueVideoEmbedFixture from "../fixtures/vue/VideoEmbedFixture.vue";
import type { ParitySpec } from "./spec.js";

const FILE = { src: "/media/tour.mp4", title: "Product tour" };

const spec: ParitySpec = {
  component: "VideoEmbed",
  react: (p) => <RVideoEmbed {...(p as any)} />,
  svelte: VideoEmbedFixture as unknown as ComponentType<any>,
  vue: VueVideoEmbedFixture as unknown as ComponentType<any>,
  // The lightbox's dialog is portalled; only the box is compared here, and the
  // open dialog in the browser gate.
  select: ".video-embed",
  exclude: '[data-scope="dialog"]',
  cases: [
    { name: "facade", props: FILE },
    { name: "with poster", props: { ...FILE, poster: "/media/tour.jpg" } },
    { name: "iframe", props: { src: "https://player.example.com/embed/1", title: "Launch talk" } },
    { name: "aspect ratio", props: { ...FILE, aspectRatio: "4 / 3" } },
    { name: "play label", props: { ...FILE, playLabel: "Watch the tour" } },
    { name: "lightbox", props: { ...FILE, lightbox: true } },
    // Muted, looping and hidden from assistive tech; no poster button.
    { name: "background", props: { ...FILE, background: true } },
  ],
};

export default spec;
