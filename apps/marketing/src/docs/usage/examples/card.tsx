import { Button, Card, CardBody, CardFooter, CardHeader, Tag } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--spacing-space-03)",
  width: "100%",
};

const body = { margin: 0, color: "var(--color-content-secondary)", fontSize: "var(--type-size-body-small)" };

export const cardExamples: UsageExampleSet = {
  "one-subject": {
    layout: "padded",
    Do: () => (
      <Card>
        <CardHeader>
          <strong>Quarterly report</strong>
        </CardHeader>
        <CardBody>
          <p style={body}>Updated two hours ago by Ada Lovelace.</p>
        </CardBody>
        <CardFooter>
          <Button intent="secondary" size="sm">
            Open
          </Button>
        </CardFooter>
      </Card>
    ),
    // Three unrelated things sharing one border.
    Dont: () => (
      <Card>
        <CardHeader>
          <strong>Quarterly report</strong>
        </CardHeader>
        <CardBody>
          <p style={body}>Updated two hours ago by Ada Lovelace.</p>
          <p style={body}>Storage used: 68 percent.</p>
          <p style={body}>Two teammates are waiting for an invitation.</p>
        </CardBody>
        <CardFooter>
          <Button intent="secondary" size="sm">
            Open
          </Button>
          <Button intent="secondary" size="sm">
            Manage storage
          </Button>
        </CardFooter>
      </Card>
    ),
  },

  consistent: {
    layout: "padded",
    Do: () => (
      <div style={grid}>
        <Card>
          <CardHeader>
            <strong>North</strong>
          </CardHeader>
          <CardBody>
            <Tag variant="success">Active</Tag>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <strong>South</strong>
          </CardHeader>
          <CardBody>
            <Tag variant="caution">Paused</Tag>
          </CardBody>
        </Card>
      </div>
    ),
    Dont: () => (
      <div style={grid}>
        <Card padding="sm">
          <CardHeader>
            <strong>North</strong>
          </CardHeader>
          <CardBody>
            <Tag variant="success">Active</Tag>
          </CardBody>
        </Card>
        <Card padding="lg" variant="elevated">
          <CardHeader>
            <strong>South</strong>
          </CardHeader>
          <CardBody>
            <Tag variant="caution">Paused</Tag>
          </CardBody>
        </Card>
      </div>
    ),
  },
};
