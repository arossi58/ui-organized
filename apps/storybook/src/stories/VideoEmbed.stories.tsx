import type { Meta, StoryObj } from "@storybook/react-vite";
import { VideoEmbed } from "@ui-organized/react";

/** A drawn poster, so the stories need no image file and render the same everywhere. */
const POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2f36"/><stop offset="1" stop-color="#5a4b3c"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1220" cy="260" r="180" fill="#ffffff" fill-opacity="0.08"/><rect x="160" y="620" width="520" height="40" rx="8" fill="#ffffff" fill-opacity="0.18"/></svg>`,
  );

const meta: Meta<typeof VideoEmbed> = {
  title: "Components/Data Display/VideoEmbed",
  component: VideoEmbed,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A video behind a poster. Nothing loads until play is pressed; `lightbox` plays it in a dialog, and `background` is a muted decorative loop.",
      },
    },
  },
  argTypes: {
    lightbox: { control: "boolean" },
    background: { control: "boolean" },
    aspectRatio: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof VideoEmbed>;

export const Inspect: Story = {
  tags: ["dev"],
  args: { src: "/media/product-tour.mp4", title: "Product tour", poster: POSTER },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <VideoEmbed {...args} />
    </div>
  ),
};

/** The poster and a play button; the player loads only when it is pressed. */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<VideoEmbed src="/media/product-tour.mp4" title="Product tour" poster="/media/product-tour.jpg" />`,
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <VideoEmbed src="/media/product-tour.mp4" title="Product tour" poster={POSTER} />
    </div>
  ),
};

/** An embed URL plays in an iframe; without a poster the box keeps its ratio. */
export const IframeAndRatio: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<VideoEmbed src="https://player.example.com/embed/1?autoplay=1" title="Launch talk" />
<VideoEmbed src="/media/clip.mp4" title="Square clip" aspectRatio="1 / 1" poster="/media/clip.jpg" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ width: 360 }}>
        <VideoEmbed src="https://player.example.com/embed/1?autoplay=1" title="Launch talk" />
      </div>
      <div style={{ width: 200 }}>
        <VideoEmbed src="/media/clip.mp4" title="Square clip" aspectRatio="1 / 1" poster={POSTER} />
      </div>
    </div>
  ),
};

/** `lightbox` opens the player in a full-screen dialog. */
export const Lightbox: Story = {
  parameters: {
    docs: {
      source: {
        code: `<VideoEmbed src="/media/product-tour.mp4" title="Product tour" poster="/media/product-tour.jpg" lightbox />`,
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <VideoEmbed src="/media/product-tour.mp4" title="Product tour" poster={POSTER} lightbox />
    </div>
  ),
};
