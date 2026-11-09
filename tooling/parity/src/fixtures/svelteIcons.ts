/**
 * The Svelte binding of the fake icon library, registered once for the whole
 * suite so `Icon` resolves without a provider as well as with one.
 */

import { registerIconSet, registerLibraryIcons, type IconComponent } from "@ui-organized/svelte";
import { makeStubIconSet } from "./stubIconSet.js";
import StubIcon from "./StubIcon.svelte";
import StubSolidIcon from "./StubSolidIcon.svelte";

export const SVELTE_STUB_SET = makeStubIconSet<IconComponent>(
  StubIcon as IconComponent,
  StubSolidIcon as IconComponent,
);

registerIconSet(SVELTE_STUB_SET);

// The names a consumer would register. Native Lucide names, so `x`, not the
// glyph key `close` the stub set is indexed by.
registerLibraryIcons("lucide", { check: StubIcon, x: StubIcon, info: StubIcon });
registerLibraryIcons("lucide", { check: StubSolidIcon }, { style: "solid" });
