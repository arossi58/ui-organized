import type { Preview } from "@storybook/react";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { IconProvider } from "@ds/react";
import "@ds/tokens/variables.css";
import "@ds/react/styles";
import "../src/preview.css";

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
    (Story) => (
      <IconProvider library="lucide" style="outline" strokeAdjustment={true}>
        <Story />
      </IconProvider>
    ),
  ],
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
    layout: "padded",
  },
};

export default preview;
