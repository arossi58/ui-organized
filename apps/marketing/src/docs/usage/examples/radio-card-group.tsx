import { RadioCardGroup } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const box = { width: "100%", maxWidth: 420 };

export const radioCardGroupExamples: UsageExampleSet = {
  descriptions: {
    layout: "padded",
    Do: () => (
      <div style={box}>
        <RadioCardGroup
          label="Delivery speed"
          size="sm"
          defaultValue="standard"
          options={[
            { value: "standard", label: "Standard", description: "Arrives in three to five days." },
            { value: "express", label: "Express", description: "Arrives the next working day." },
          ]}
        />
      </div>
    ),
    // The descriptions restate the titles, and the deciding detail is missing.
    Dont: () => (
      <div style={box}>
        <RadioCardGroup
          label="Delivery speed"
          size="sm"
          defaultValue="standard"
          options={[
            { value: "standard", label: "Standard", description: "The standard delivery option." },
            { value: "express", label: "Express", description: "The express delivery option." },
          ]}
        />
      </div>
    ),
  },

  columns: {
    layout: "padded",
    Do: () => (
      <div style={{ width: "100%" }}>
        <RadioCardGroup
          label="Layout"
          size="sm"
          columns={3}
          defaultValue="grid"
          options={[
            { value: "list", label: "List" },
            { value: "grid", label: "Grid" },
            { value: "board", label: "Board" },
          ]}
        />
      </div>
    ),
    // Long descriptions in narrow columns stack into towers of text.
    Dont: () => (
      <div style={{ width: "100%" }}>
        <RadioCardGroup
          label="Layout"
          size="sm"
          columns={3}
          defaultValue="grid"
          options={[
            { value: "list", label: "List", description: "One item per row, with every field shown in full." },
            { value: "grid", label: "Grid", description: "Items as tiles, with an image and a title on each." },
            { value: "board", label: "Board", description: "Items in columns by status, dragged between them." },
          ]}
        />
      </div>
    ),
  },
};
