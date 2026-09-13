import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImageCropper } from "@ui-organized/react";

/**
 * A data URI, deliberately — never a network URL.
 *
 * The visual suite waits for fonts and layout but not for an image to load, so
 * a remote source would race the screenshot. An inline SVG is decoded from the
 * document itself and is byte-identical on every run.
 */
const SAMPLE_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="#2563eb"/>
           <stop offset="50%" stop-color="#7c3aed"/>
           <stop offset="100%" stop-color="#dc2626"/>
         </linearGradient>
       </defs>
       <rect width="640" height="420" fill="url(#g)"/>
       <circle cx="200" cy="150" r="70" fill="#ffffff" fill-opacity="0.35"/>
       <circle cx="440" cy="290" r="100" fill="#000000" fill-opacity="0.25"/>
     </svg>`,
  );

const meta: Meta<typeof ImageCropper> = {
  title: "Components/Forms/ImageCropper",
  component: ImageCropper,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A crop box over an image — avatars, cover art, anything that has to land on a fixed frame. The crop rect, image transform and handle positions are all owned by the machine, so the component supplies only colour, the viewport height and the handles\' hit areas.\n\n`cropShape="circle"` masks the preview but still reports a square rect, because that is what a crop actually is.',
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    cropShape: { control: "select", options: ["rectangle", "circle"] },
    aspectRatio: { control: { type: "number", step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof ImageCropper>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <ImageCropper {...args} />
    </div>
  ),
  args: {
    src: SAMPLE_IMAGE,
    alt: "Sample gradient",
    label: "Crop your photo",
    size: "md",
    cropShape: "rectangle",
  },
};

export const Square: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ImageCropper src={SAMPLE_IMAGE} alt="Sample gradient" label="Square crop" aspectRatio={1} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<ImageCropper src={src} alt="…" label="Square crop" aspectRatio={1} />`,
      },
    },
  },
};

export const Circle: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ImageCropper
        src={SAMPLE_IMAGE}
        alt="Sample gradient"
        label="Profile picture"
        helperText="The crop is still a square; only the preview is round."
        cropShape="circle"
        aspectRatio={1}
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<ImageCropper
  src={src}
  alt="…"
  label="Profile picture"
  cropShape="circle"
  aspectRatio={1}
/>`,
      },
    },
  },
};

export const WithoutGrid: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ImageCropper src={SAMPLE_IMAGE} alt="Sample gradient" showGrid={false} />
    </div>
  ),
  parameters: {
    docs: {
      source: { code: `<ImageCropper src={src} alt="…" showGrid={false} />` },
    },
  },
};
