import { forwardRef, lazy, Suspense, useState } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  Skeleton,
  Tabs,
} from "@ui-organized/react";
import { DashboardPage, MirrorSlot } from "./DashboardPage";
import { TableContent, TablePage } from "./TablePage";
import {
  ALL_PART_IDS,
  CodeSwitch,
  DashboardControl,
  FRAMEWORKS,
  MockupAvatar,
  MockupSidebar,
  PAGES,
  StatCard,
  type ControlId,
  type ControlHandlers,
  type PartId,
} from "./parts";
import { useShowcase } from "./showcaseContext";
import "./showcase-mockup.css";

export type { ShowcasePage } from "./parts";

const ShowcaseCode = lazy(() => import("./ShowcaseCode"));

function PartContent({ id, ...handlers }: { id: PartId } & ControlHandlers) {
  if (id === "table") return <TableContent />;
  if (id.startsWith("stat-")) return <StatCard index={Number(id.slice("stat-".length))} />;
  return <DashboardControl id={id as ControlId} {...handlers} />;
}

/** What sits under the tabs. Keyed by view, so switching between the
 * components and their code fades the new one in (showcase-mockup.css). */
function PageBody() {
  const { page, framework, code } = useShowcase();
  return (
    <div className="showcase-view" key={code ? "code" : page}>
      {code ? (
        <Suspense fallback={<Skeleton className="showcase-code__loading" />}>
          <ShowcaseCode page={page} framework={framework} />
        </Suspense>
      ) : page === "dashboard" ? (
        <DashboardPage />
      ) : (
        <TablePage />
      )}
    </div>
  );
}

/**
 * The app window in the hero (Figma 2472:22351): a working mini-app built from
 * the library. The sidebar switches between the Dashboard and Table pages; the
 * Code switch swaps the page for its source, under tabs that pick which
 * framework the source is shown in. Laid out at the design's native
 * 1422×832 and scaled to fit by the hero (`--showcase-scale`).
 *
 * Every part (parts.tsx) is mounted here exactly once, through a portal into
 * the node `PartHost` gives it, whatever page or view is showing. The host
 * docks that node into the part's slot when there is one, and the hero lends
 * it to the physics layer while the mockup is in pieces — so nothing the
 * visitor does to a part is lost to a page switch, the Code view, or a
 * scroll back up through the hero.
 */
export const ShowcaseMockup = forwardRef<HTMLDivElement>(function ShowcaseMockup(_, ref) {
  const state = useShowcase();
  const { page, setPage, framework, setFramework, code, setCode, collapsed, setCollapsed, narrow, host } =
    state;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="showcase-mockup" ref={ref}>
      <MockupSidebar
        page={page}
        onNavigate={setPage}
        collapsible={!narrow}
        collapsed={narrow || collapsed}
        onCollapsedChange={setCollapsed}
      />

      <div className="showcase-body">
        <header className="showcase-header">
          <MirrorSlot id="title">
            <h2 className="showcase-header__title">{PAGES[page].title}</h2>
          </MirrorSlot>
          <div className="showcase-header__info">
            <MirrorSlot id="code">
              <CodeSwitch checked={code} onCheckedChange={setCode} />
            </MirrorSlot>
            <MirrorSlot id="avatar">
              <MockupAvatar />
            </MirrorSlot>
          </div>
        </header>

        {/* The framework tabs pick which language the source is shown in, so
            they exist only in the Code view; the components need no tabs. */}
        {code ? (
          <Tabs
            className="showcase-tabs"
            value={framework}
            onValueChange={(value) => setFramework(value as typeof framework)}
            tabs={FRAMEWORKS.map(({ value, label }) => ({
              value,
              label,
              // Tabs mounts every panel; only the visible one gets the body.
              content: value === framework ? <PageBody /> : null,
            }))}
          />
        ) : (
          <PageBody />
        )}
      </div>

      {ALL_PART_IDS.map((id) =>
        createPortal(
          <PartContent
            id={id}
            onDialog={() => setDialogOpen(true)}
            onSheet={() => setSheetOpen(true)}
          />,
          host.node(id),
          id,
        ),
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="sm">
          <DialogTitle>A real dialog</DialogTitle>
          <DialogDescription>
            Focus is trapped here, Escape closes it, and focus returns to the button that opened it.
          </DialogDescription>
          <DialogFooter>
            <DialogClose render={<Button intent="primary" />}>Got it</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" size="sm">
          <SheetTitle>A real sheet</SheetTitle>
          <SheetDescription>Same overlay primitives as the dialog, anchored to an edge.</SheetDescription>
          <div className="showcase-sheet-body">
            <Checkbox label="Active only" defaultChecked />
            <Checkbox label="Assigned to me" />
            <Checkbox label="Updated this week" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
});
