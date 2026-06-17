// Design-system presets: faithful, editable color scales from popular systems.
//
// PRESET_REGISTRY holds metadata only (no hex) and is safe to import eagerly for
// rendering the picker. The bulky per-system hex modules load on demand via
// loadPresetDefinition() so they stay out of the tool's initial chunk — Vite
// code-splits each dynamic import() into its own chunk.

export const PRESET_REGISTRY = [
  { id: 'tailwind', label: 'Tailwind CSS' },
  { id: 'radix',    label: 'Radix Colors' },
  { id: 'material', label: 'Material Design' },
  { id: 'carbon',   label: 'IBM Carbon' },
];

const LOADERS = {
  tailwind: () => import('./tailwind.js'),
  radix: () => import('./radix.js'),
  material: () => import('./material.js'),
  carbon: () => import('./carbon.js'),
};

// Resolve a preset's full definition (with hex data) by id. Returns null for an
// unknown id; callers should also guard against a missing/malformed payload.
export async function loadPresetDefinition(id) {
  const loader = LOADERS[id];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}
