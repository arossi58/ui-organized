import {
  Button,
  Input,
  Select,
  Checkbox,
  RadioGroup,
  Switch,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Alert,
  Tabs,
  IconProvider,
} from "@ds/react";
import styles from "./PreviewKitchenSink.module.css";

const SELECT_OPTIONS = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
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

export function PreviewKitchenSink() {
  return (
    <IconProvider library="lucide" style="outline" strokeAdjustment={true}>
      <div className={styles.root}>
        {/* ── Section: Buttons ─────────────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Buttons</h2>

          <div className={styles.group}>
            <span className={styles.label}>Primary</span>
            <div className={styles.row}>
              <Button size="sm" intent="primary">Small</Button>
              <Button size="md" intent="primary">Medium</Button>
              <Button size="lg" intent="primary">Large</Button>
              <Button size="md" intent="primary" disabled>Disabled</Button>
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>Secondary</span>
            <div className={styles.row}>
              <Button size="sm" intent="secondary">Small</Button>
              <Button size="md" intent="secondary">Medium</Button>
              <Button size="lg" intent="secondary">Large</Button>
              <Button size="md" intent="secondary" disabled>Disabled</Button>
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>Ghost / Destructive</span>
            <div className={styles.row}>
              <Button size="md" intent="ghost">Ghost</Button>
              <Button size="md" intent="destructive">Destructive</Button>
            </div>
          </div>
        </section>

        {/* ── Section: Form controls ───────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Form Controls</h2>

          <div className={styles.twoCol}>
            <div className={styles.group}>
              <span className={styles.label}>Text Input</span>
              <Input label="Full name" placeholder="Jane Smith" />
              <Input label="Email" placeholder="jane@example.com" helperText="We'll never share your email." />
              <Input label="Error state" placeholder="Invalid value" error="This field is required." />
              <Input label="Disabled" placeholder="Not editable" disabled />
            </div>

            <div className={styles.group}>
              <span className={styles.label}>Select</span>
              <Select
                label="Choose an option"
                options={SELECT_OPTIONS}
                placeholder="Select..."
              />
              <Select
                label="Disabled"
                options={SELECT_OPTIONS}
                placeholder="Select..."
                disabled
              />
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.group}>
              <span className={styles.label}>Checkboxes</span>
              <Checkbox label="Unchecked" />
              <Checkbox label="Checked" defaultChecked />
              <Checkbox label="Disabled" disabled />
              <Checkbox label="Disabled checked" disabled defaultChecked />
            </div>

            <div className={styles.group}>
              <span className={styles.label}>Radio Group</span>
              <RadioGroup
                name="preview-radio"
                options={RADIO_OPTIONS}
                defaultValue="a"
              />
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>Switches</span>
            <div className={styles.row}>
              <Switch label="Off" />
              <Switch label="On" defaultChecked />
              <Switch label="Disabled" disabled />
            </div>
          </div>
        </section>

        {/* ── Section: Cards ──────────────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cards</h2>
          <div className={styles.cardGrid}>
            <Card>
              <CardHeader>
                <strong>Dashboard Overview</strong>
              </CardHeader>
              <CardBody>
                <p>Monitor your project metrics, track usage trends, and review recent activity in one place.</p>
              </CardBody>
              <CardFooter>
                <Button size="sm" intent="primary">View details</Button>
                <Button size="sm" intent="ghost">Dismiss</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <strong>Settings</strong>
              </CardHeader>
              <CardBody>
                <Input label="Display name" placeholder="Your name" />
              </CardBody>
              <CardFooter>
                <Button size="sm" intent="primary">Save changes</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* ── Section: Badges ─────────────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Badges</h2>
          <div className={styles.row}>
            <Badge variant="success">Success</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge>Default</Badge>
          </div>
        </section>

        {/* ── Section: Alerts ─────────────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Alerts</h2>
          <div className={styles.alertStack}>
            <Alert variant="success" title="Changes saved">
              Your theme has been exported successfully.
            </Alert>
            <Alert variant="info" title="New version available">
              Update to get the latest features and fixes.
            </Alert>
            <Alert variant="warning" title="Approaching limit">
              You&apos;re using 90% of your available storage.
            </Alert>
            <Alert variant="error" title="Export failed">
              The config could not be validated. Check for missing values.
            </Alert>
          </div>
        </section>

        {/* ── Section: Tabs ───────────────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tabs</h2>
          <Tabs tabs={TABS_ITEMS} defaultValue="overview" />
        </section>
      </div>
    </IconProvider>
  );
}
