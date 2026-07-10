import { useState } from "react";
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
} from "@ui-organized/react";
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

export function PreviewKitchenSink() {
  const portalContainer = usePreviewPortalContainer();
  const [page, setPage] = useState(2);

  return (
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
      </section>

      {/* ── Toggles & switches ───────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Toggles</h2>
        <div className={styles.row}>
          <ToggleGroup defaultValue={["grid"]}>
            <Toggle value="list" icon="list" aria-label="List view" />
            <Toggle value="grid" icon="grid" aria-label="Grid view" />
          </ToggleGroup>
          <Toggle icon="star">Favorite</Toggle>
          <div className={styles.spacer} />
          <Switch label="Off" />
          <Switch label="On" defaultChecked />
          <Switch label="Disabled" disabled />
        </div>
      </section>

      {/* ── Text fields ──────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Text Fields</h2>
        <div className={styles.twoCol}>
          <div className={styles.group}>
            <Input label="Full name" placeholder="Jane Smith" />
            <Input label="Email" placeholder="jane@example.com" helperText="We'll never share your email." />
            <Input label="Error state" placeholder="Invalid value" error="This field is required." />
            <SearchInput label="Search" placeholder="Find anything…" />
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
          </div>
        </div>
      </section>

      {/* ── Status & feedback ────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Status &amp; Feedback</h2>

        <div className={styles.group}>
          <span className={styles.label}>Tags</span>
          <div className={styles.row}>
            <Tag variant="success">Success</Tag>
            <Tag variant="info">Info</Tag>
            <Tag variant="warning">Warning</Tag>
            <Tag variant="error">Error</Tag>
            <Tag variant="caution">Caution</Tag>
            <Tag variant="info" emphasized={false}>Subtle</Tag>
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
          <Alert variant="success" title="Changes saved">Your theme has been exported successfully.</Alert>
          <Alert variant="info" title="New version available">Update to get the latest features and fixes.</Alert>
          <Alert variant="warning" title="Approaching limit">You&apos;re using 90% of your available storage.</Alert>
          <Alert variant="error" title="Export failed">The config could not be validated. Check for missing values.</Alert>
        </div>
      </section>

      {/* ── Data display ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Display</h2>
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
      </section>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Overlays</h2>
        <div className={styles.row}>
          <Tooltip content="Save (⌘S)" container={portalContainer}>
            <Button intent="secondary" icon="check">Hover me</Button>
          </Tooltip>

          <Dialog>
            <DialogTrigger
              render={<Button intent="primary">Open dialog</Button>}
            />
            <DialogContent container={portalContainer}>
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
            <PopoverContent container={portalContainer}>
              <p>Popovers inherit the themed surface and text tokens.</p>
            </PopoverContent>
          </Popover>

          <Menu>
            <MenuTrigger render={<Button intent="secondary" icon="menu" iconPosition="right">Actions</Button>} />
            <MenuContent container={portalContainer}>
              <MenuItem icon="edit">Edit</MenuItem>
              <MenuItem icon="copy">Duplicate</MenuItem>
              <MenuSeparator />
              <MenuItem icon="trash" destructive>Delete</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </section>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Navigation</h2>
        <Breadcrumb items={BREADCRUMB_ITEMS} />
        <Tabs tabs={TABS_ITEMS} defaultValue="overview" />
        <Pagination page={page} count={8} onPageChange={setPage} />
      </section>

      {/* ── Containers ───────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Containers</h2>
        <div className={styles.cardGrid}>
          <Card variant="elevated">
            <CardHeader><strong>Dashboard Overview</strong></CardHeader>
            <CardBody>
              <p>Monitor your project metrics, track usage trends, and review recent activity in one place.</p>
            </CardBody>
            <CardFooter>
              <Button size="sm" intent="primary">View details</Button>
              <Button size="sm" intent="ghost">Dismiss</Button>
            </CardFooter>
          </Card>

          <Card variant="outlined">
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
      </section>
    </div>
  );
}
