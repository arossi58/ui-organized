---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Drawer: a panel along the bottom edge, dismissed by swiping it down, by Escape, by the backdrop or by its close button.

- **Parts:** `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter` and `DrawerClose`, mirroring Sheet. The title, description, footer and close button use the Dialog's chrome.
- **Swipe:** drag the grabber, or the content once the pointer moves clearly downward (never from a text field, and not while the content is scrolled down). On release it closes past halfway, or with a downward fling, and otherwise springs back. The backdrop fades with the drag, and a fling shortens the exit.
- **`DrawerContent`:** `showGrabber` and `showClose` (both on by default), `draggable` (whether the content as well as the grabber drags) and `container`.
- **Motion:** slides in and out on keyframes; under reduced motion it fades instead.
- **React, Svelte and Vue** are built on Ark's drawer. **Angular** (`<uio-drawer>`, with `uioDrawerTrigger`, `uioDrawerTitle`, `uioDrawerDescription`, `uioDrawerFooter` and `uioDrawerClose`) runs the same swipe arithmetic, which core exports as `drawerShouldDismiss`, `drawerReleaseVelocity` and friends, ported from zag. Its close waits for the exit animation, as Ark's presence does.
- v1 opens from the bottom only, with one resting position.
