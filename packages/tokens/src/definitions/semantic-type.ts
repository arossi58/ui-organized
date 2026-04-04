/**
 * Fixed semantic typography token definitions.
 *
 * Typography tokens are mode-independent — they do not change between
 * light and dark modes. Values are populated by the transform function
 * from the resolved ThemeConfig.
 *
 * These definitions establish the token names; the pipeline fills in values.
 */

export const SEMANTIC_TYPE_TOKEN_NAMES = {
  type: {
    font: {
      heading: { $type: "fontFamily" },
      body:    { $type: "fontFamily" },
    },
    size: {
      xs:       { $type: "dimension" },
      sm:       { $type: "dimension" },
      body:     { $type: "dimension" },
      "body-lg":{ $type: "dimension" },
      h4:       { $type: "dimension" },
      h3:       { $type: "dimension" },
      h2:       { $type: "dimension" },
      h1:       { $type: "dimension" },
      display:  { $type: "dimension" },
    },
    weight: {
      thin:       { $type: "fontWeight" },
      extralight: { $type: "fontWeight" },
      light:      { $type: "fontWeight" },
      regular:    { $type: "fontWeight" },
      medium:     { $type: "fontWeight" },
      semibold:   { $type: "fontWeight" },
      bold:       { $type: "fontWeight" },
      extrabold:  { $type: "fontWeight" },
      black:      { $type: "fontWeight" },
    },
    leading: {
      xs:       { $type: "dimension" },
      sm:       { $type: "dimension" },
      body:     { $type: "dimension" },
      "body-lg":{ $type: "dimension" },
      h4:       { $type: "dimension" },
      h3:       { $type: "dimension" },
      h2:       { $type: "dimension" },
      h1:       { $type: "dimension" },
      display:  { $type: "dimension" },
    },
  },
} as const;
