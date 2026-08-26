/**
 * The Vue binding of the fake icon library, registered once for the whole suite
 * so `Icon` resolves without a provider as well as with one.
 */

import { registerIconSet, type IconComponent } from "@ui-organized/vue";
import { makeStubIconSet } from "../stubIconSet.js";
import StubIcon from "./StubIcon.vue";
import StubSolidIcon from "./StubSolidIcon.vue";

export const VUE_STUB_SET = makeStubIconSet<IconComponent>(
  StubIcon as IconComponent,
  StubSolidIcon as IconComponent,
);

registerIconSet(VUE_STUB_SET);
