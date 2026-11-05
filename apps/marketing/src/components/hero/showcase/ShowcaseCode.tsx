/**
 * The mockup's Code view. Loaded lazily: composing a sample resolves each
 * component against the four packages' real surfaces, which means reading the
 * docs registry — far too much to put in the homepage's first chunk for a view
 * most visitors never open.
 */

import { useMemo } from "react";
import type { DocFramework } from "@ui-organized/code-connect/browser";
import { CodeBlock } from "../../../docs/components/CodeBlock";
import { composeSample } from "./composeSample";
import { DASHBOARD_SPEC, TABLE_SPEC } from "./showcaseSpecs";
import type { ShowcasePage } from "./ShowcaseMockup";

const SPECS = { dashboard: DASHBOARD_SPEC, table: TABLE_SPEC };

export default function ShowcaseCode({
  page,
  framework,
}: {
  page: ShowcasePage;
  framework: DocFramework;
}) {
  const sample = useMemo(() => composeSample(SPECS[page], framework), [page, framework]);
  return (
    <div className="showcase-code">
      <CodeBlock code={sample.code} language={sample.language} />
    </div>
  );
}
