import type { UsageGuide } from "../types.js";

export const qrCodeUsage: UsageGuide = {
  slug: "qr-code",
  codeName: "QRCode",
  summary:
    "A scannable square that carries a string from a screen to a camera. It hands a link or a code to a second device, where typing it out would be slow or error prone.",
  useWhen: [
    "The reader is on one device and needs the value on another, usually a phone.",
    "The value is a link or identifier too long or fiddly to type by hand.",
    "The code may be printed or shown on a large display and read from a distance.",
  ],
  avoid: [
    {
      text: "When the reader is already on the device that needs the value.",
      instead: ["clipboard", "button"],
    },
    {
      text: "As the only way to reach something, since not everyone can scan.",
    },
    {
      text: "For decoration or branding, where a code that goes nowhere erodes trust in the real ones.",
    },
  ],
  guidance: [
    {
      do: "Encode the shortest value that works, so the modules stay large enough to scan.",
      dont: "Encode a long address with every tracking parameter, packing the code into a dense grid.",
      example: "short-value",
    },
    {
      do: "Raise `errorCorrection` to H whenever an `overlay` covers the centre.",
      dont: "Put a logo over a code at low correction, hiding modules the scanner cannot recover.",
      example: "overlay-correction",
    },
    {
      do: "Say beside the code what scanning it does and where it leads.",
      dont: "Show a bare code and expect the reader to scan something unexplained.",
      example: "caption",
    },
    {
      do: "Use `framed` when the code sits on a photo or a colored band.",
      dont: "Let a busy background run up to the pattern and eat its quiet margin.",
    },
  ],
  accessibility: [
    "The code is announced as an image named by `label`, or by the raw value when there is none.",
    "Give a `label` that describes the destination, since a spoken address is rarely useful.",
    "Always offer the same destination as a link or text for anyone who cannot scan.",
  ],
  content: [
    "Name the outcome next to the code: Scan to open the setup guide, not Scan me.",
    "Keep the download label a plain noun or verb, such as Download.",
  ],
  related: [
    { slug: "clipboard", when: "the value is used on the same device it is shown on." },
  ],
};
