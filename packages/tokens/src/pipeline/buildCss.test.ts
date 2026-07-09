import { describe, it, expect } from "vitest";
import { transformConfig } from "./transform.js";
import { buildCss } from "./buildCss.js";
import exampleTheme from "../../node_modules/@ui-organized/schema/src/example-theme.json" with { type: "json" };
import { validateConfig } from "@ui-organized/schema";

const config = validateConfig(exampleTheme);
const transformResult = transformConfig(config);
const { css, propertyNames } = buildCss(transformResult);

describe("buildCss — output structure", () => {
  it("produces a non-empty CSS string", () => {
    expect(css.length).toBeGreaterThan(100);
  });

  it("contains a :root block", () => {
    expect(css).toContain(":root {");
  });

  it("contains a [data-theme='dark'] block", () => {
    expect(css).toContain('[data-theme="dark"]');
  });

  it("contains a [data-theme='light'] block", () => {
    expect(css).toContain('[data-theme="light"]');
  });

  it("does not contain unresolved aliases ({...})", () => {
    expect(css).not.toMatch(/\{[a-z]/);
  });
});

describe("buildCss — primitive custom properties", () => {
  it("emits --brand-900 (primary brand color)", () => {
    expect(propertyNames).toContain("--brand-900");
    expect(css).toMatch(/--brand-900:\s*#[0-9a-f]{6}/i);
  });

  it("emits --neutral-1600 (darkest surface)", () => {
    expect(propertyNames).toContain("--neutral-1600");
  });

  it("emits --black-1600", () => {
    expect(propertyNames).toContain("--black-1600");
  });

  it("emits --white-100", () => {
    expect(propertyNames).toContain("--white-100");
  });

  it("emits --crimson-1300", () => {
    expect(propertyNames).toContain("--crimson-1300");
  });

  it("emits --border-radius-04 with value 8px", () => {
    expect(propertyNames).toContain("--border-radius-04");
    expect(css).toMatch(/--border-radius-04:\s*8px/);
  });

  it("emits --border-radius-full with large value", () => {
    expect(css).toMatch(/--border-radius-full:\s*99999px/);
  });

  it("emits --spacing-space-01 equal to base unit", () => {
    expect(css).toMatch(new RegExp(`--spacing-space-01:\\s*${config.spacing.baseUnit}px`));
  });

  it("emits --spacing-space-04 = 16px", () => {
    expect(css).toMatch(/--spacing-space-04:\s*16px/);
  });
});

describe("buildCss — typography custom properties", () => {
  it("emits --type-font-heading", () => {
    expect(propertyNames).toContain("--type-font-heading");
    expect(css).toContain(`--type-font-heading: ${config.typography.headingFont.family}`);
  });

  it("emits --type-font-body", () => {
    expect(propertyNames).toContain("--type-font-body");
  });

  it("emits --type-size-body-large = 16px", () => {
    expect(propertyNames).toContain("--type-size-body-large");
    expect(css).toMatch(/--type-size-body-large:\s*16px/);
  });

  it("emits --type-size-display-xlarge = 64px", () => {
    expect(propertyNames).toContain("--type-size-display-xlarge");
    expect(css).toMatch(/--type-size-display-xlarge:\s*64px/);
  });

  it("emits --type-size-caption = 10px", () => {
    expect(css).toMatch(/--type-size-caption:\s*10px/);
  });

  it("emits --type-weight-body-regular", () => {
    expect(propertyNames).toContain("--type-weight-body-regular");
  });

  it("emits --type-leading-body-large", () => {
    expect(propertyNames).toContain("--type-leading-body-large");
  });
});

describe("buildCss — semantic custom properties", () => {
  it("emits --color-surface-base", () => {
    expect(propertyNames).toContain("--color-surface-base");
  });

  it("emits --color-content-primary", () => {
    expect(propertyNames).toContain("--color-content-primary");
  });

  it("emits --color-interactive-primary-default", () => {
    expect(propertyNames).toContain("--color-interactive-primary-default");
  });

  it("emits --color-status-error", () => {
    expect(propertyNames).toContain("--color-status-error");
  });

  it("emits --color-border-subtle", () => {
    expect(propertyNames).toContain("--color-border-subtle");
  });
});

describe("buildCss — component custom properties", () => {
  it("emits --radius-interactive", () => {
    expect(propertyNames).toContain("--radius-interactive");
  });

  it("emits --Button-Small-horizontal", () => {
    expect(propertyNames).toContain("--Button-Small-horizontal");
  });

  it("emits --Button-Large-square", () => {
    expect(propertyNames).toContain("--Button-Large-square");
  });
});

describe("buildCss — mode overrides", () => {
  it("dark mode overrides --color-surface-base", () => {
    const darkBlock = css.split('[data-theme="dark"]')[1] ?? "";
    expect(darkBlock).toMatch(/--color-surface-base:\s*#[0-9a-f]{6}/i);
  });

  it("light and dark --color-surface-base differ", () => {
    const darkMatch = css.match(/\[data-theme="dark"\][^}]+--color-surface-base:\s*(#[0-9a-f]{6})/i);
    const lightMatch = css.match(/\[data-theme="light"\][^}]+--color-surface-base:\s*(#[0-9a-f]{6})/i);
    if (darkMatch && lightMatch) {
      expect(darkMatch[1]).not.toBe(lightMatch[1]);
    }
  });
});
