import { useMemo, useState } from "react";
import {
  Button,
  Toggle,
  ToggleGroup,
  Switch,
  Input,
  SearchInput,
  PasswordInput,
  NumberField,
  TextArea,
  DateInput,
  DateTimeInput,
  DateRangeInput,
  Select,
  Combobox,
  Checkbox,
  RadioGroup,
  Range,
  Tag,
  Alert,
  Progress,
  Meter,
  Skeleton,
  Avatar,
  Tooltip,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Accordion,
  Tabs,
  Divider,
  Breadcrumb,
  Pagination,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  Menubar,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogConfirm,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  FloatingPanel,
  FloatingPanelTrigger,
  FloatingPanelContent,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelClose,
  FloatingPanelBody,
  Tour,
  ToastProvider,
  useToastManager,
  Toolbar,
  SegmentedControl,
  PinInput,
  TagsInput,
  Editable,
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
  Listbox,
  RatingGroup,
  AngleSlider,
  ColorPicker,
  DatePicker,
  Chip,
  Timer,
  Steps,
  TreeView,
  Clipboard,
  QRCode,
  Icon,
  Marquee,
  Carousel,
  NavItem,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  ScrollArea,
  Splitter,
  FileUpload,
  ImageCropper,
  SignaturePad,
  type TreeViewNode,
  type TourStep,
} from "@ui-organized/react";
import { PreviewOverlayProvider } from "@ui-organized/react/preview";
import { DataTable, type TableColumn } from "@ui-organized/react-table";
import { usePreviewPortalContainer } from "./previewPortal";
import styles from "./PreviewKitchenSink.module.css";

const SELECT_OPTIONS = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

const COMBOBOX_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
];

const RADIO_OPTIONS = [
  { value: "a", label: "Choice A" },
  { value: "b", label: "Choice B" },
  { value: "c", label: "Choice C" },
];

const TABS_ITEMS = [
  { value: "overview", label: "Overview", content: <span>Overview content</span> },
  { value: "details",  label: "Details",  content: <span>Details content</span> },
  { value: "settings", label: "Settings", content: <span>Settings content</span> },
];

const ACCORDION_ITEMS = [
  { value: "1", title: "What's included?", content: "Every component re-skins through the design-system tokens." },
  { value: "2", title: "How do I export?", content: "Open the Export tab and download a ready-to-use theme.css." },
  { value: "3", title: "Light and dark?", content: "Both modes are generated from your chosen brand and neutral families." },
];

const BREADCRUMB_ITEMS = [
  { label: "Home", href: "#" },
  { label: "Components", href: "#" },
  { label: "Buttons" },
];

const SEGMENT_ITEMS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const LISTBOX_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "push", label: "Push notification" },
  { value: "sms", label: "Text message" },
];

const TREE_ITEMS: TreeViewNode[] = [
  {
    id: "reports",
    label: "Reports",
    children: [
      { id: "q1", label: "First quarter", icon: "file" },
      { id: "q2", label: "Second quarter", icon: "file" },
    ],
  },
  { id: "notes", label: "Meeting notes", icon: "file" },
];

const STEPS = [{ title: "Details" }, { title: "Access" }, { title: "Review" }];

const MARQUEE_ITEMS = ["Northwind", "Brightline", "Harbor", "Quarry", "Lumen", "Fieldstone"].map(
  (name) => ({ id: name, content: name }),
);

const CAROUSEL_SLIDES = ["Harbour at dusk", "Field at noon", "Ridge at dawn"].map((title, i) => ({
  id: `slide-${i}`,
  content: <div className={styles.slide}>{title}</div>,
}));

const SPLITTER_PANELS = [
  { id: "list", label: "List", content: <div className={styles.pane}>List</div>, minSize: 20 },
  { id: "detail", label: "Detail", content: <div className={styles.pane}>Detail</div>, minSize: 40 },
];

const SCROLL_ROWS = Array.from({ length: 12 }, (_, i) => `Activity item ${i + 1}`);


/** An image to crop that needs no network: a gradient in a data URL. */
const CROP_SAMPLE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2563eb"/><stop offset="50%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#dc2626"/></linearGradient></defs><rect width="640" height="420" fill="url(#g)"/></svg>`,
  );

interface Member {
  id: string;
  name: string;
  role: string;
  team: string;
  status: "Active" | "Invited" | "Suspended";
  seats: number;
}

const MEMBERS: Member[] = [
  { id: "m1", name: "Ada Lovelace", role: "Owner", team: "Platform", status: "Active", seats: 12 },
  { id: "m2", name: "Grace Hopper", role: "Admin", team: "Design", status: "Active", seats: 4 },
  { id: "m3", name: "Alan Turing", role: "Editor", team: "Data", status: "Invited", seats: 108 },
  { id: "m4", name: "Katherine Johnson", role: "Editor", team: "Research", status: "Active", seats: 9 },
  { id: "m5", name: "Edsger Dijkstra", role: "Viewer", team: "Platform", status: "Suspended", seats: 1 },
];

const STATUS_TAG = { Active: "success", Invited: "info", Suspended: "error" } as const;

const MEMBER_COLUMNS: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true } },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "team", header: "Team" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as Member["status"];
      return (
        <Tag variant={STATUS_TAG[status]} size="sm" emphasized={false}>
          {status}
        </Tag>
      );
    },
  },
  { accessorKey: "seats", header: "Seats", meta: { align: "end" } },
];

/** Toasts are imperative, so the demo is a button that raises one. */
function ToastDemo() {
  const toast = useToastManager();
  return (
    <Button
      intent="secondary"
      icon="bell"
      onClick={() =>
        toast.add({ title: "Theme saved", description: "Your changes are live.", type: "success" })
      }
    >
      Show toast
    </Button>
  );
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "theme",
    title: "Your theme, everywhere",
    description: "Every component here re-skins from the tokens you choose.",
    actions: [
      { label: "Skip", action: "dismiss" },
      { label: "Next", action: "next" },
    ],
  },
  {
    id: "export",
    title: "Take it with you",
    description: "Export a ready-to-use theme.css.",
    actions: [
      { label: "Back", action: "prev" },
      { label: "Done", action: "dismiss" },
    ],
  },
];

/**
 * Contained, the way the docs show it: rendered in place inside a frame whose
 * `contain: paint` makes the backdrop and the centred card resolve to the frame.
 * Portalled into the scrolling preview instead, the card got no placement and
 * stayed hidden while the backdrop blocked the whole page.
 */
function TourDemo() {
  const [stepId, setStepId] = useState<string | null>(null);
  return (
    <div className={styles.tourFrame}>
      <PreviewOverlayProvider contain>
        <Button intent="secondary" icon="compass" onClick={() => setStepId(TOUR_STEPS[0]!.id)}>
          Start tour
        </Button>
        <Tour steps={TOUR_STEPS} stepId={stepId} onStepChange={setStepId} size="sm" variant="compact" />
      </PreviewOverlayProvider>
    </div>
  );
}

export function PreviewKitchenSink() {
  const portalContainer = usePreviewPortalContainer();
  // Two conventions for the same idea: the fields take the element (`portalContainer`),
  // the overlays take a ref (`container`). Passing the raw element to the second
  // group made Ark read `.current` off an element, get `undefined`, and quietly
  // fall back to `document.body` — so those four overlays rendered outside the
  // themed container they were supposed to be demonstrating.
  const portalContainerRef = useMemo(
    () => (portalContainer ? { current: portalContainer } : undefined),
    [portalContainer],
  );
  const [page, setPage] = useState(2);

  return (
    // Overlays without their own `container` (Tour, Sheet, the new menus…) portal
    // here too, so they inherit the theme. The toaster renders inside for the same reason.
    <PreviewOverlayProvider contain={false} container={portalContainerRef}>
    <ToastProvider>
    <div className={styles.root}>
      {/* ── Buttons ──────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Buttons</h2>

        <div className={styles.group}>
          <span className={styles.label}>Intents</span>
          <div className={styles.row}>
            <Button intent="primary">Primary</Button>
            <Button intent="secondary">Secondary</Button>
            <Button intent="tertiary">Tertiary</Button>
            <Button intent="ghost">Ghost</Button>
            <Button intent="destructive">Destructive</Button>
            <Button intent="destructive-ghost">Destructive ghost</Button>
          </div>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Sizes &amp; icons</span>
          <div className={styles.row}>
            <Button size="sm" intent="primary">Small</Button>
            <Button size="md" intent="primary">Medium</Button>
            <Button size="lg" intent="primary">Large</Button>
            <Button intent="primary" icon="download">Download</Button>
            <Button intent="secondary" icon="plus" iconPosition="right">Add</Button>
            <Button intent="secondary" icon="settings" aria-label="Settings" />
            <Button intent="primary" disabled>Disabled</Button>
          </div>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Toolbar</span>
          <Toolbar>
            <Button intent="ghost" size="sm" icon="copy" aria-label="Copy" />
            <Button intent="ghost" size="sm" icon="pencil" aria-label="Edit" />
            <Button intent="ghost" size="sm" icon="trash-2" aria-label="Delete" />
          </Toolbar>
        </div>
      </section>

      {/* ── Toggles & switches ───────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Toggles</h2>
        <div className={styles.row}>
          <ToggleGroup defaultValue={["grid"]}>
            <Toggle value="list" icon="list" aria-label="List view" />
            <Toggle value="grid" icon="grid-2x2" aria-label="Grid view" />
          </ToggleGroup>
          <Toggle icon="star">Favorite</Toggle>
          <div className={styles.spacer} />
          <Switch label="Off" />
          <Switch label="On" defaultChecked />
          <Switch label="Disabled" disabled />
        </div>
        <SegmentedControl aria-label="Range" defaultValue="week" items={SEGMENT_ITEMS} />
      </section>

      {/* ── Text fields ──────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Text fields</h2>
        <div className={styles.twoCol}>
          <div className={styles.group}>
            <Input label="Full name" placeholder="Jane Smith" />
            <Input label="Email" placeholder="jane@example.com" helperText="We'll never share your email." />
            <Input label="Error state" placeholder="Invalid value" error="This field is required." />
            <SearchInput label="Search" placeholder="Find anything…" />
            <PinInput label="Verification code" length={6} defaultValue="4821" />
            <Editable label="Project name" defaultValue="Quarterly review" showControls />
            <Field>
              <FieldLabel>Custom field</FieldLabel>
              <FieldControl placeholder="Built from Field parts" />
              <FieldDescription>Field, FieldLabel, FieldControl and FieldDescription.</FieldDescription>
            </Field>
          </div>
          <div className={styles.group}>
            <PasswordInput label="Password" placeholder="••••••••" />
            <NumberField label="Quantity" defaultValue={3} min={0} max={99} />
            <DateInput
              label="Start date"
              defaultValue="2026-06-16"
              portalContainer={portalContainer}
            />
            <DateTimeInput
              label="Starts at"
              defaultValue="2026-06-16T09:00"
              portalContainer={portalContainer}
            />
            <DateRangeInput
              label="Date range"
              defaultValue={{ start: "2026-06-16", end: "2026-06-20" }}
              portalContainer={portalContainer}
            />
            <TextArea label="Notes" placeholder="Add a note…" resize="vertical" />
            <TagsInput label="Topics" placeholder="Add a topic" defaultValue={["Design", "Research"]} />
            <div className={styles.subGroup}>
              <Input label="Start date" defaultValue="2020-01-01" />
              <FieldError>Choose a date in the future.</FieldError>
            </div>
          </div>
        </div>
      </section>

      {/* ── Selection ────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Selection</h2>
        <div className={styles.twoCol}>
          <div className={styles.group}>
            <Select
              label="Select"
              options={SELECT_OPTIONS}
              placeholder="Choose an option…"
              portalContainer={portalContainer}
            />
            <Combobox
              label="Combobox"
              options={COMBOBOX_OPTIONS}
              placeholder="Search countries…"
              portalContainer={portalContainer}
            />
            <Range label="Range" defaultValue={60} />
            <DatePicker label="Due date" />
            <ColorPicker label="Accent color" format="hex" defaultValue="#2563eb" />
            <RatingGroup label="How useful was this?" defaultValue={4} />
          </div>
          <div className={styles.group}>
            <div className={styles.subGroup}>
              <span className={styles.label}>Checkboxes</span>
              <Checkbox label="Unchecked" />
              <Checkbox label="Checked" defaultChecked />
              <Checkbox label="Disabled" disabled />
            </div>
            <div className={styles.subGroup}>
              <span className={styles.label}>Radio group</span>
              <RadioGroup name="preview-radio" options={RADIO_OPTIONS} defaultValue="a" />
            </div>
            <Listbox
              label="Notification channel"
              options={LISTBOX_OPTIONS}
              defaultValue={["email"]}
              variant="bordered"
            />
            <AngleSlider label="Rotation" defaultValue={135} />
          </div>
        </div>
      </section>

      {/* ── Status & feedback ────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Status &amp; feedback</h2>

        <div className={styles.group}>
          <span className={styles.label}>Tags</span>
          <div className={styles.row}>
            <Tag variant="success">Success</Tag>
            <Tag variant="info">Info</Tag>
            <Tag variant="error">Error</Tag>
            <Tag variant="caution">Caution</Tag>
            <Tag variant="info" emphasized={false}>Subtle</Tag>
          </div>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Chips</span>
          <div className={styles.row}>
            <Chip label="Role" operator="is any of" value="Admin, Owner" />
            <Chip label="Status" operator="is" value="Active" />
          </div>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Timer &amp; toast</span>
          <div className={styles.row}>
            <Timer parts={["minutes", "seconds"]} startMs={5 * 60 * 1000} countdown />
            <ToastDemo />
          </div>
        </div>

        <div className={styles.twoCol}>
          <div className={styles.group}>
            <span className={styles.label}>Progress</span>
            <Progress value={64} label="Uploading" showValue />
            <Progress label="Syncing" />
          </div>
          <div className={styles.group}>
            <span className={styles.label}>Meter</span>
            <Meter value={72} label="Storage" showValue />
            <Meter value={28} variant="warning" label="Budget" showValue />
          </div>
        </div>

        <div className={styles.alertStack}>
          <Alert variant="success" title="Changes saved">Your theme has been exported.</Alert>
          <Alert variant="info" title="New version available">Update to get the latest features and fixes.</Alert>
          <Alert variant="warning" title="Approaching limit">You&apos;re using 90% of your available storage.</Alert>
          <Alert variant="error" title="Export failed">The config could not be validated. Check for missing values.</Alert>
        </div>
      </section>

      {/* ── Data display ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data display</h2>
        <div className={styles.group}>
          <span className={styles.label}>Avatars</span>
          <div className={styles.row}>
            <Avatar name="Jane Smith" size="xs" />
            <Avatar name="Mark Lee" size="sm" />
            <Avatar name="Ada Lovelace" size="md" />
            <Avatar name="Grace Hopper" size="lg" shape="rounded" />
            <Avatar name="Alan Turing" size="xl" shape="square" />
          </div>
        </div>
        <div className={styles.group}>
          <span className={styles.label}>Skeleton</span>
          <div className={styles.skeletonRow}>
            <Skeleton variant="circle" width={48} height={48} />
            <div className={styles.skeletonLines}>
              <Skeleton variant="text" lines={3} />
            </div>
          </div>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Table</span>
          <DataTable<Member>
            label="Team members"
            data={MEMBERS}
            columns={MEMBER_COLUMNS}
            getRowId={(row) => row.id}
            size="sm"
          />
        </div>

        <div className={styles.twoCol}>
          <div className={styles.group}>
            <span className={styles.label}>Tree view</span>
            <TreeView label="Documents" items={TREE_ITEMS} defaultExpandedValue={["reports"]} size="sm" />
          </div>
          <div className={styles.group}>
            <span className={styles.label}>Clipboard &amp; QR code</span>
            <Clipboard label="Invite link" value="https://example.com/invite/7f3k29" />
            <QRCode value="https://example.com/setup" size="sm" label="Setup guide" />
          </div>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Icons</span>
          <div className={styles.row}>
            {(["house", "search", "bell", "settings", "mail", "star", "download", "trash-2"] as const).map(
              (name) => (
                <Icon key={name} name={name} size={20} />
              ),
            )}
          </div>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Marquee</span>
          <Marquee items={MARQUEE_ITEMS} defaultPaused />
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Carousel</span>
          <Carousel label="Gallery" slides={CAROUSEL_SLIDES} />
        </div>
      </section>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Overlays</h2>
        <div className={styles.row}>
          <Tooltip content="Save (⌘S)" container={portalContainerRef}>
            <Button intent="secondary" icon="check">Hover me</Button>
          </Tooltip>

          <Dialog>
            <DialogTrigger
              render={<Button intent="primary">Open dialog</Button>}
            />
            <DialogContent container={portalContainerRef}>
              <DialogTitle>Confirm export</DialogTitle>
              <DialogDescription>
                Download your theme as a ready-to-use stylesheet?
              </DialogDescription>
              <DialogFooter>
                <DialogClose render={<Button intent="ghost">Cancel</Button>} />
                <DialogClose render={<Button intent="primary">Download</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Popover>
            <PopoverTrigger render={<Button intent="secondary">Popover</Button>} />
            <PopoverContent container={portalContainerRef}>
              <p>Popovers inherit the themed surface and text tokens.</p>
            </PopoverContent>
          </Popover>

          <Menu>
            <MenuTrigger render={<Button intent="secondary" icon="menu" iconPosition="right">Actions</Button>} />
            <MenuContent container={portalContainerRef}>
              <MenuItem icon="pencil">Edit</MenuItem>
              <MenuItem icon="copy">Duplicate</MenuItem>
              <MenuSeparator />
              <MenuItem icon="trash-2" destructive>Delete</MenuItem>
            </MenuContent>
          </Menu>

          <AlertDialog>
            <AlertDialogTrigger render={<Button intent="destructive">Delete files</Button>} />
            <AlertDialogContent>
              <AlertDialogTitle>Delete three files?</AlertDialogTitle>
              <AlertDialogDescription>
                They are removed for everyone with access, and this can&apos;t be undone.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogConfirm intent="destructive">Delete files</AlertDialogConfirm>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Sheet>
            <SheetTrigger render={<Button intent="secondary" icon="filter">Filters</Button>} />
            <SheetContent side="right" size="sm">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Applied to the list behind this panel.</SheetDescription>
              <Checkbox label="Active only" defaultChecked />
              <Checkbox label="Assigned to me" />
              <SheetFooter>
                <SheetClose render={<Button intent="primary">Apply</Button>} />
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <FloatingPanel defaultSize={{ width: 280, height: 160 }}>
            <FloatingPanelTrigger render={<Button intent="secondary" icon="layers">Layers</Button>} />
            <FloatingPanelContent size="sm">
              <FloatingPanelHeader>
                <FloatingPanelTitle>Layers</FloatingPanelTitle>
                <FloatingPanelClose />
              </FloatingPanelHeader>
              <FloatingPanelBody>Background, Header, Footer.</FloatingPanelBody>
            </FloatingPanelContent>
          </FloatingPanel>
        </div>

        <div className={styles.row}>
          <HoverCard>
            <HoverCardTrigger>Ada Lovelace</HoverCardTrigger>
            <HoverCardContent>
              <div className={styles.row}>
                <Avatar name="Ada Lovelace" size="md" />
                <span>Maintainer. Joined 2021.</span>
              </div>
            </HoverCardContent>
          </HoverCard>

          <ContextMenu>
            <ContextMenuTrigger className={styles.contextTarget}>Right-click this row</ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem icon="pencil">Rename</ContextMenuItem>
              <ContextMenuItem icon="copy">Duplicate</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem icon="trash-2" destructive>Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Tour</span>
          <TourDemo />
        </div>
      </section>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Navigation</h2>
        <Breadcrumb items={BREADCRUMB_ITEMS} />
        <Tabs tabs={TABS_ITEMS} defaultValue="overview" />
        <Pagination page={page} count={8} onPageChange={setPage} />
        <Steps steps={STEPS} defaultStep={1} showContent={false} size="sm" />
        <div className={styles.twoCol}>
          <div className={styles.navRail}>
            <NavItem label="Home" icon="house" />
            <NavItem label="Projects" icon="grid-2x2" selected />
            <NavItem label="Messages" icon="mail" />
          </div>
          <Menubar>
            <Menu>
              <MenuTrigger className="menubar__trigger">File</MenuTrigger>
              <MenuContent>
                <MenuItem>New</MenuItem>
                <MenuItem>Open</MenuItem>
                <MenuSeparator />
                <MenuItem>Save</MenuItem>
              </MenuContent>
            </Menu>
            <Menu>
              <MenuTrigger className="menubar__trigger">Edit</MenuTrigger>
              <MenuContent>
                <MenuItem icon="copy">Copy</MenuItem>
                <MenuItem icon="undo-2">Undo</MenuItem>
              </MenuContent>
            </Menu>
          </Menubar>
        </div>
      </section>

      {/* ── Containers ───────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Containers</h2>
        <div className={styles.cardGrid}>
          <Card variant="elevated">
            <CardHeader><strong>Dashboard overview</strong></CardHeader>
            <CardBody>
              <p>Usage and recent activity for this project.</p>
            </CardBody>
            <CardFooter>
              <Button size="sm" intent="primary">View details</Button>
              <Button size="sm" intent="ghost">Dismiss</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader><strong>Settings</strong></CardHeader>
            <CardBody>
              <Input label="Display name" placeholder="Your name" />
            </CardBody>
            <CardFooter>
              <Button size="sm" intent="primary">Save changes</Button>
            </CardFooter>
          </Card>
        </div>

        <Divider spacing="md" />

        <Accordion items={ACCORDION_ITEMS} variant="bordered" defaultValue={["1"]} />

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="text-default-body-medium btn btn--ghost btn--sm">
            Delivery options
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p>Standard arrives in three to five days. Express arrives tomorrow.</p>
          </CollapsibleContent>
        </Collapsible>

        <div className={styles.twoCol}>
          <div className={styles.group}>
            <span className={styles.label}>Scroll area</span>
            <ScrollArea className={styles.scrollFrame}>
              {SCROLL_ROWS.map((row) => (
                <div key={row} className={styles.scrollRow}>
                  {row}
                </div>
              ))}
            </ScrollArea>
          </div>
          <div className={styles.group}>
            <span className={styles.label}>Splitter</span>
            <div className={styles.splitterFrame}>
              <Splitter panels={SPLITTER_PANELS} defaultSize={[35, 65]} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Media ────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Media</h2>
        <FileUpload
          label="Profile photo"
          triggerLabel="Choose file"
          helperText="PNG or JPG, up to 5 MB."
          size="sm"
        />
        <div className={styles.twoCol}>
          <ImageCropper
            src={CROP_SAMPLE}
            alt="Abstract gradient"
            label="Profile picture"
            size="sm"
            cropShape="circle"
            aspectRatio={1}
          />
          <SignaturePad label="Sign to approve" size="sm" />
        </div>
      </section>
    </div>
    </ToastProvider>
    </PreviewOverlayProvider>
  );
}
