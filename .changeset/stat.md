---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Stat: one number and what it means, such as a dashboard's headline figures.

- **Content:** `label`, `value` (already formatted), and optionally `delta`, `description` and a `chart` slot for a small chart under the numbers, such as a Meter.
- **Change:** `trend` (`up`, `down` or `flat`) draws the arrow in the delta, and `sentiment` (`positive`, `negative` or `neutral`) sets its colour. Sentiment defaults from the trend, up positive and down negative, so set it for a figure where up is bad news.
- **Accessibility:** the arrow is decoration; the direction is also written out, visually hidden, before the delta. `trendLabel` replaces the default "Increase", "Decrease" or "No change".
- **Props:** `variant` is `card` (on a Card's surface) or `plain`, and `size` is `sm`, `md` or `lg`.
- **Angular:** `<div uioStat label value>`, with the chart projected as `<div uioStatChart>`.
