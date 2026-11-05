import { describe, expect, it } from "vitest";
import { DOC_FRAMEWORKS } from "@ui-organized/code-connect/browser";
import { composeSample } from "./composeSample";
import { DASHBOARD_SPEC, TABLE_SPEC } from "./showcaseSpecs";

describe("hero showcase code samples", () => {
  for (const framework of DOC_FRAMEWORKS) {
    for (const spec of [DASHBOARD_SPEC, TABLE_SPEC]) {
      it(`prints ${spec.name} in ${framework}`, () => {
        const { code } = composeSample(spec, framework);
        // Every component on the page ships in this framework, and every
        // binding resolved to that framework's syntax.
        expect(code).not.toMatch(/is not available in/);
        expect(code).not.toMatch(/@@bind:/);
      });
    }
  }

  it("imports the table from each framework's table package", () => {
    expect(composeSample(TABLE_SPEC, "react").code).toContain('from "@ui-organized/react-table"');
    expect(composeSample(TABLE_SPEC, "svelte").code).toContain('from "@ui-organized/svelte-table"');
    expect(composeSample(TABLE_SPEC, "vue").code).toContain('from "@ui-organized/vue-table"');
    expect(composeSample(TABLE_SPEC, "angular").code).toContain(
      'from "@ui-organized/angular-table"',
    );
  });

  it("binds script values in each framework's own syntax", () => {
    expect(composeSample(TABLE_SPEC, "react").code).toContain("columns={COLUMNS}");
    expect(composeSample(TABLE_SPEC, "svelte").code).toContain("columns={COLUMNS}");
    expect(composeSample(TABLE_SPEC, "vue").code).toContain(':columns="COLUMNS"');
    const angular = composeSample(TABLE_SPEC, "angular").code;
    expect(angular).toContain('[columns]="columns"');
    expect(angular).toContain("protected readonly columns = COLUMNS;");
  });

  it("never drops a prop from the React sample, which is the reference", () => {
    for (const spec of [DASHBOARD_SPEC, TABLE_SPEC]) {
      expect(composeSample(spec, "react").code).not.toMatch(/Not yet in/);
    }
  });
});
