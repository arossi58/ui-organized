import { Button, PageHeader, SectionHeader } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const pageHeaderExamples: UsageExampleSet = {
  levels: {
    layout: "padded",
    Do: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <PageHeader title="Billing" description="Plans, invoices and payment methods." />
        <SectionHeader title="Invoices" description="Every invoice from the last year." size="sm" />
      </div>
    ),
    // Two level one headings, and nothing says which one the page is.
    Dont: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <PageHeader title="Billing" description="Plans, invoices and payment methods." />
        <PageHeader title="Invoices" description="Every invoice from the last year." />
      </div>
    ),
  },

  actions: {
    layout: "padded",
    Do: () => (
      <PageHeader
        title="Projects"
        actions={
          <>
            <Button intent="secondary">Import</Button>
            <Button>New project</Button>
          </>
        }
      />
    ),
    // Three equal calls to action.
    Dont: () => (
      <PageHeader
        title="Projects"
        actions={
          <>
            <Button>Import</Button>
            <Button>Export</Button>
            <Button>New project</Button>
          </>
        }
      />
    ),
  },
};
