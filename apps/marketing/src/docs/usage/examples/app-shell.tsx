import type { ReactNode } from "react";
import { AppHeader, AppShell, Button, NavItem, Sidebar } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

// The shell's own frame, inside the card: `scroll="main"` in a box of fixed height.
const frame = { height: 220, width: "100%" };
const logo = <span className="text-strong-body-medium">Acme</span>;

function Shell({ selected, actions }: { selected?: string; actions?: ReactNode }) {
  return (
    <div style={frame}>
      <AppShell
        layout="rail"
        scroll="main"
        header={<AppHeader logo={logo} actions={actions} />}
        sidebar={
          <Sidebar>
            <NavItem label="Home" selected={selected === "Home"} />
            <NavItem label="Reports" selected={selected === "Reports"} />
          </Sidebar>
        }
      >
        <div style={{ padding: 16 }}>
          <p className="text-default-body-medium" style={{ margin: 0 }}>
            Reports
          </p>
        </div>
      </AppShell>
    </div>
  );
}

export const appShellExamples: UsageExampleSet = {
  current: {
    layout: "padded",
    Do: () => <Shell selected="Reports" />,
    // Nothing says which page this is.
    Dont: () => <Shell />,
  },

  header: {
    layout: "padded",
    Do: () => <Shell selected="Reports" actions={<Button intent="secondary">Share</Button>} />,
    // Every action in the header.
    Dont: () => (
      <Shell
        selected="Reports"
        actions={
          <>
            <Button intent="secondary">Share</Button>
            <Button intent="secondary">Export</Button>
            <Button intent="secondary">Print</Button>
            <Button>New</Button>
          </>
        }
      />
    ),
  },
};
