import { Icon, QRCode } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const SHORT = "https://example.com/setup";
const LONG =
  "https://example.com/setup/devices/new?source=onboarding&step=3&ref=welcome-email&variant=b&session=8f2c1a9d4e7b6035";

const caption = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: "var(--spacing-space-02)",
  margin: 0,
  fontSize: "var(--type-size-body-medium)",
  color: "var(--color-content-secondary)",
};

export const qrCodeExamples: UsageExampleSet = {
  "short-value": {
    Do: () => <QRCode value={SHORT} size="sm" label="Setup guide" />,
    // Every extra character adds modules, so the same space holds a denser, harder code.
    Dont: () => <QRCode value={LONG} size="sm" label="Setup guide" />,
  },

  "overlay-correction": {
    Do: () => (
      <QRCode
        value={SHORT}
        size="sm"
        variant="framed"
        errorCorrection="H"
        overlay={<Icon name="star" size={16} />}
      />
    ),
    // At low correction the logo hides modules the scanner cannot rebuild.
    Dont: () => (
      <QRCode
        value={SHORT}
        size="sm"
        variant="framed"
        errorCorrection="L"
        overlay={<Icon name="star" size={16} />}
      />
    ),
  },

  caption: {
    Do: () => (
      <figure style={caption}>
        <QRCode value={SHORT} size="sm" label="Setup guide" />
        <figcaption>Scan to open the setup guide on your phone.</figcaption>
      </figure>
    ),
    // Nothing says what scanning this does or where it leads.
    Dont: () => <QRCode value={SHORT} size="sm" />,
  },
};
