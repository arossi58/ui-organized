---
"@ui-organized/react": minor
---

Export `ToastOptions`.

It is the argument to `toast.add()` — the whole imperative toast API — and was
the one part of it a consumer could not name:

```ts
import { useToastManager, type ToastOptions } from "@ui-organized/react";

const SAVED: ToastOptions = { title: "Saved", type: "success" };
```

Found by the cross-framework parity harness, which could not type a shared
fixture: the Svelte and Vue packages have exported it since they were written.
Additive only — no behaviour changes.
