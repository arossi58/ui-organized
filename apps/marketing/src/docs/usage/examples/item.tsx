import { Button, Item, ItemGroup, Switch } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const itemExamples: UsageExampleSet = {
  links: {
    layout: "padded",
    Do: () => (
      <div style={{ maxWidth: 420 }}>
        <Item
          variant="outline"
          icon="mail"
          title="Email address"
          description="Where we send account alerts."
          href="#email-address"
          actions={
            <Button size="sm" intent="secondary">
              Edit
            </Button>
          }
        />
      </div>
    ),
    // A button inside the title, so the row has no single target.
    Dont: () => (
      <div style={{ maxWidth: 420 }}>
        <Item
          variant="outline"
          icon="mail"
          title={
            <>
              Email address{" "}
              <Button size="sm" intent="link">
                Open
              </Button>
            </>
          }
          description="Where we send account alerts."
        />
      </div>
    ),
  },

  length: {
    layout: "padded",
    Do: () => (
      <div style={{ maxWidth: 420 }}>
        <Item
          title="Weekly digest"
          description="A summary of your account activity."
          actions={<Switch defaultChecked aria-label="Weekly digest" />}
        />
      </div>
    ),
    // A paragraph under the title.
    Dont: () => (
      <div style={{ maxWidth: 420 }}>
        <Item
          title="Weekly digest"
          description="Every Monday morning we send you an email that summarises everything that happened in your account over the previous seven days, including sign-ins, changes and new files."
          actions={<Switch defaultChecked aria-label="Weekly digest" />}
        />
      </div>
    ),
  },

  group: {
    layout: "padded",
    Do: () => (
      <div style={{ maxWidth: 420 }}>
        <ItemGroup variant="outline">
          <Item
            title="Product updates"
            actions={<Switch defaultChecked aria-label="Product updates" />}
          />
          <Item
            title="Weekly digest"
            actions={<Switch defaultChecked aria-label="Weekly digest" />}
          />
          <Item title="Tips and offers" actions={<Switch aria-label="Tips and offers" />} />
        </ItemGroup>
      </div>
    ),
    // Loose rows, each with its own frame.
    Dont: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
        <Item
          variant="outline"
          title="Product updates"
          actions={<Switch defaultChecked aria-label="Product updates" />}
        />
        <Item
          variant="outline"
          title="Weekly digest"
          actions={<Switch defaultChecked aria-label="Weekly digest" />}
        />
        <Item
          variant="outline"
          title="Tips and offers"
          actions={<Switch aria-label="Tips and offers" />}
        />
      </div>
    ),
  },
};
