import { Card, CardBody, Stat } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const statExamples: UsageExampleSet = {
  sentiment: {
    layout: "padded",
    Do: () => (
      <div style={{ maxWidth: 240 }}>
        <Stat
          label="Refund rate"
          value="1.8%"
          delta="+0.2%"
          trend="up"
          sentiment="negative"
          description="vs last month"
        />
      </div>
    ),
    // A worsening refund rate shows in green.
    Dont: () => (
      <div style={{ maxWidth: 240 }}>
        <Stat
          label="Refund rate"
          value="1.8%"
          delta="+0.2%"
          trend="up"
          description="vs last month"
        />
      </div>
    ),
  },

  description: {
    layout: "padded",
    Do: () => (
      <div style={{ maxWidth: 240 }}>
        <Stat label="Sign-ups" value="1,204" delta="+4.1%" trend="up" description="vs last week" />
      </div>
    ),
    // The reader cannot tell what the change compares.
    Dont: () => (
      <div style={{ maxWidth: 240 }}>
        <Stat label="Sign-ups" value="1,204" delta="+4.1%" trend="up" />
      </div>
    ),
  },

  plain: {
    layout: "padded",
    Do: () => (
      <Card style={{ maxWidth: 480 }}>
        <CardBody>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 24 }}
          >
            <Stat variant="plain" label="Revenue" value="$48,260" delta="+12.4%" trend="up" />
            <Stat variant="plain" label="Orders" value="862" delta="-2.3%" trend="down" />
          </div>
        </CardBody>
      </Card>
    ),
    // A frame inside a frame.
    Dont: () => (
      <Card style={{ maxWidth: 480 }}>
        <CardBody>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}
          >
            <Stat label="Revenue" value="$48,260" delta="+12.4%" trend="up" />
            <Stat label="Orders" value="862" delta="-2.3%" trend="down" />
          </div>
        </CardBody>
      </Card>
    ),
  },
};
