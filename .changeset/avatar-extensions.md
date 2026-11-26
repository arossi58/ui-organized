---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Avatar gains a status dot and a verified badge. AvatarGroup and AvatarLabel are new.

- **Avatar**
  - `status` (`online`, `away`, `busy` or `offline`) draws a presence dot in green, amber, red or grey.
  - `verified` draws a check badge in the brand colour.
  - Each is an image named by `statusLabel` (default "Online" and so on) or `verifiedLabel` (default "Verified").
  - An avatar without either renders exactly as before. Only one with an indicator lets its overflow show, so the dot can sit on its edge.
  - `--avatar-ring` sets the ring around an indicator for a different surface.
- **AvatarGroup** (`div[uioAvatarGroup]` in Angular) shows overlapping avatars from an `items` array, with a `+N` once `max` is reached.
  - `max` counts the `+N` as one of its slots.
  - The group is named by `label`, and the count by `moreLabel`.
- **AvatarLabel** (`div[uioAvatarLabel]`) shows an avatar with a name and a line of supporting text.
  - The avatar is hidden from assistive technology, because the name sits beside it.
  - Its status or verified badge is announced after the name instead.
