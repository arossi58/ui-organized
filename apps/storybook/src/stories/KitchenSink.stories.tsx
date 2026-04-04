import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Icon,
  Input,
  RadioGroup,
  Select,
  Switch,
  Tabs,
} from "@ds/react";

const meta: Meta = {
  title: "Overview/Kitchen Sink",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [notificationsOn, setNotificationsOn] = useState(true);
    const [agreed, setAgreed] = useState(false);
    const [alertVisible, setAlertVisible] = useState(true);

    return (
      <div style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "32px" }}>

        {/* Alert */}
        {alertVisible && (
          <Alert
            variant="info"
            title="Design system preview"
            onDismiss={() => setAlertVisible(false)}
          >
            This kitchen sink demonstrates all components rendered together in a realistic layout.
          </Alert>
        )}

        {/* Badges row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Badge variant="default">Default</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Beta</Badge>
          <Badge variant="error">Deprecated</Badge>
        </div>

        {/* Card with form */}
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong>Account settings</strong>
              <Badge variant="success" size="sm">Pro</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Input label="First name" placeholder="Jane" />
                </div>
                <div style={{ flex: 1 }}>
                  <Input label="Last name" placeholder="Smith" />
                </div>
              </div>
              <Input label="Email address" placeholder="jane@example.com" helperText="Used for login and notifications." />
              <Select
                label="Country"
                placeholder="Select a country…"
                options={[
                  { value: "us", label: "United States" },
                  { value: "ca", label: "Canada" },
                  { value: "gb", label: "United Kingdom" },
                  { value: "au", label: "Australia" },
                ]}
              />
              <RadioGroup
                label="Account type"
                defaultValue="personal"
                orientation="horizontal"
                options={[
                  { value: "personal", label: "Personal" },
                  { value: "team", label: "Team" },
                  { value: "enterprise", label: "Enterprise" },
                ]}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Switch
                  label="Enable email notifications"
                  checked={notificationsOn}
                  onCheckedChange={setNotificationsOn}
                />
                <Checkbox
                  label="I agree to the terms and conditions"
                  checked={agreed}
                  onCheckedChange={setAgreed}
                />
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button intent="secondary">Cancel</Button>
              <Button intent="primary" icon="check" iconPosition="left" disabled={!agreed}>
                Save changes
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Tabs */}
        <Tabs
          defaultValue="components"
          tabs={[
            {
              value: "components",
              label: "Components",
              content: (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "4px" }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Button size="sm" intent="primary" icon="plus">New</Button>
                    <Button size="sm" intent="secondary" icon="download">Export</Button>
                    <Button size="sm" intent="ghost" icon="filter">Filter</Button>
                    <Button size="sm" intent="destructive" icon="trash">Delete</Button>
                  </div>
                  <Alert variant="success" title="All systems operational">
                    No incidents or degraded performance reported.
                  </Alert>
                  <Alert variant="warning">
                    Scheduled maintenance on Sunday 02:00–04:00 UTC.
                  </Alert>
                </div>
              ),
            },
            {
              value: "icons",
              label: "Icons",
              content: (
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", paddingTop: "4px" }}>
                  {(["check-circle", "alert-triangle", "info", "search", "user", "settings", "calendar", "mail"] as const).map((name) => (
                    <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <Icon name={name} size={20} />
                      <span style={{ fontSize: "11px", color: "var(--color-text-text-tertiary)", fontFamily: "monospace" }}>
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              value: "disabled",
              label: "Disabled",
              disabled: true,
              content: null,
            },
          ]}
        />

      </div>
    );
  },
};
