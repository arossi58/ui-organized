---
"@ui-organized/react": major
---

Toast: migrate from Base UI to Ark UI's toast.

`useToastManager().add({ title, description, type, actionProps })` is preserved
(now backed by Ark's `createToaster().create`), as is `close(id)`. Breaking
changes: the manager no longer exposes Base UI's `promise`/`toasts`; the manager
is a module-level toaster (not React context); `ToastProviderProps` is
re-authored to `{ children }` (Base UI provider options like `timeout`/`limit`
are configured on the toaster instead — default duration 5s). DOM/attribute
shift to Zag (`Action`→`ActionTrigger`, `Close`→`CloseTrigger`,
`data-starting/ending-style`→`data-state`; Ark drives stack position + swipe via
inline transforms). Custom CSS / e2e selectors must update.
