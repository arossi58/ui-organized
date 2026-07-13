import { useState } from "react";
import {
  Alert,
  Avatar,
  Tag,
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Icon,
  Input,
  Meter,
  NavItem,
  NavSubItem,
  Pagination,
  RadioGroup,
  Range,
  SearchInput,
  Select,
  Sidebar,
  Switch,
  Tabs,
  TextArea,
} from "@ui-organized/react";
import type { PieceDef, PieceKind } from "../../lib/pieceManifest";
import "./pieces.css";

/** Pagination is the one piece that needs its own state to stay interactive once
 * the layout goes live (the rest are uncontrolled or display-only). */
function PaginationPiece() {
  const [page, setPage] = useState(2);
  return <Pagination page={page} count={8} siblingCount={1} onPageChange={setPage} />;
}

/**
 * Every hero piece is a real `@ui-organized/react` component (SITE.md §5/§10): the site is
 * the demo, so the assembled "app" is built entirely from the library. These are
 * the interactive controls of the Branding dashboard mockup — they fall, fill
 * the content panel `AppFrame` draws, then go live. The piece's slot size/scale/
 * transform are driven by the engine on the root and the `__fit` wrapper.
 */
function RealComponent({
  kind,
  label,
  value,
}: {
  kind: PieceKind;
  label?: string;
  value?: string;
}) {
  switch (kind) {
    case "input":
      return <Input label={label} placeholder="" aria-label="Input" />;
    case "select":
      return (
        <Select
          label={label}
          placeholder="Pick one!"
          options={[
            { value: "one", label: "Option one" },
            { value: "two", label: "Option two" },
            { value: "three", label: "Option three" },
          ]}
        />
      );
    case "range":
      return <Range label={label} defaultValue={50} />;
    case "checks":
      return <Checkbox label={label} defaultChecked />;
    case "btn-primary":
      return <Button intent="primary">{label}</Button>;
    case "btn-secondary":
      return <Button intent="secondary">{label}</Button>;
    case "dialog":
      return (
        <Dialog>
          <DialogTrigger render={<Button intent="secondary">{label}</Button>} />
          <DialogContent>
            <DialogTitle>Build with UI Organized</DialogTitle>
            <DialogDescription>
              An open-source design system, Figma library, and tools — free
              forever. Drop in components and ship.
            </DialogDescription>
            <DialogFooter>
              <DialogClose render={<Button intent="ghost">Close</Button>} />
              <DialogClose render={<Button intent="primary">Get started</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    case "banner":
      return <Alert variant="info">{label}</Alert>;
    case "radios":
      return (
        <RadioGroup
          orientation="vertical"
          options={[
            { value: "a", label: label ?? "Radio" },
            { value: "b", label: label ?? "Radio" },
          ]}
        />
      );
    case "toggle":
      return <Switch label={label} />;
    case "textarea":
      return (
        <TextArea label={label} placeholder="Your input" resize="none" rows={2} />
      );
    case "meter":
      return <Meter value={72} label={label} showValue size="sm" />;
    case "pagination":
      return <PaginationPiece />;
    case "tabs":
      return (
        <Tabs
          className="physics-piece__tabs"
          size="small"
          tabs={[
            { value: "overview", label: "Overview", content: "" },
            { value: "activity", label: "Activity", content: "" },
            { value: "settings", label: "Settings", content: "" },
          ]}
        />
      );
    case "search":
      return <SearchInput aria-label="Search" placeholder="Search…" clearable />;
    case "avatar":
      return <Avatar name={label} size="md" />;
    case "sidebar":
      return (
        <Sidebar className="physics-piece__sidebar" navLabel="Pages" collapsible>
          <NavItem label="Welcome" icon="home" selected />
          <NavItem label="Multipage Select" icon="list">
            <NavSubItem label="Sub page" />
          </NavItem>
          <NavItem label="Another Page" icon="bookmark" />
          <NavItem label="The Last Page" icon="star" />
        </Sidebar>
      );
    case "heading":
      return <p className="physics-piece__heading">{label}</p>;
    case "badge":
      return <Tag variant="success">{label}</Tag>;
    case "stat":
      return (
        <div className="physics-piece__stat">
          <span className="physics-piece__stat-value">{value}</span>
          <span className="physics-piece__stat-label">{label}</span>
        </div>
      );
    case "tabbar":
      return (
        <div className="physics-piece__tabbar">
          <span className="physics-piece__tab is-active">
            <Icon name="home" size={22} />
          </span>
          <span className="physics-piece__tab">
            <Icon name="search" size={22} />
          </span>
          <span className="physics-piece__tab">
            <Icon name="grid" size={22} />
          </span>
          <span className="physics-piece__tab">
            <Icon name="settings" size={22} />
          </span>
        </div>
      );
    default:
      return null;
  }
}

interface PhysicsPieceProps {
  def: PieceDef;
  /** Callback ref so the engine can drive this element's transform per frame. */
  assignRef: (el: HTMLElement | null) => void;
}

/** Start each piece as `inert` — decoration while it falls and assembles (out of
 * the tab order and a11y tree, no pointer hit-testing). The engine clears
 * `inert` once the layout is organized, so the piece becomes a live, focusable,
 * clickable component there (and is restored on the way out). */
const setInitiallyInert = (node: HTMLSpanElement | null) => {
  if (node) node.inert = true;
};

/**
 * Positioning shell for one hero piece. Holds no logic — the engine writes its
 * width/height, the `--piece-scale` it scales the component by, and its
 * per-frame transform directly. The real `@ui-organized/react` component renders into a
 * `__fit` wrapper sized to the slot and scaled by S (the library components are
 * rem/token-sized, so they can't ride a font-size like the old stickers).
 */
export function PhysicsPiece({ def, assignRef }: PhysicsPieceProps) {
  return (
    <div ref={assignRef} className="physics-piece physics-piece--real">
      <span
        className="physics-piece__fit"
        style={{ width: def.w, height: def.h }}
        ref={setInitiallyInert}
      >
        <RealComponent kind={def.kind} label={def.label} value={def.value} />
      </span>
    </div>
  );
}
