import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

// Room under the bar for the open panel, which is positioned under its item.
const frame = { minHeight: 180, width: "100%" };

export const navigationMenuExamples: UsageExampleSet = {
  length: {
    layout: "padded",
    Do: () => (
      <NavigationMenu aria-label="Main">
        <NavigationMenuItem value="product" label="Product">
          <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="pricing" label="Pricing" href="#pricing" />
        <NavigationMenuItem value="about" label="About" href="#about" />
      </NavigationMenu>
    ),
    // More destinations than one row holds.
    Dont: () => (
      <div style={{ overflow: "hidden" }}>
        <NavigationMenu aria-label="Main">
          {[
            "Home",
            "Product",
            "Pricing",
            "Guides",
            "Events",
            "Team",
            "Careers",
            "Press",
            "Contact",
          ].map((label) => (
            <NavigationMenuItem
              key={label}
              value={label.toLowerCase()}
              label={label}
              href={`#${label.toLowerCase()}`}
            />
          ))}
        </NavigationMenu>
      </div>
    ),
  },

  describe: {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <NavigationMenu aria-label="Main" defaultValue="product">
          <NavigationMenuItem value="product" label="Product">
            <NavigationMenuLink href="#reports" description="Charts of every metric you track.">
              Reports
            </NavigationMenuLink>
            <NavigationMenuLink href="#alerts" description="Hear about changes as they happen.">
              Alerts
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenu>
      </div>
    ),
    // Names that say nothing until the page is open.
    Dont: () => (
      <div style={frame}>
        <NavigationMenu aria-label="Main" defaultValue="product">
          <NavigationMenuItem value="product" label="Product">
            <NavigationMenuLink href="#overview">Overview</NavigationMenuLink>
            <NavigationMenuLink href="#more">More</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenu>
      </div>
    ),
  },
};
