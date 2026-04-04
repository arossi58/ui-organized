/**
 * Font weight fallback resolution.
 *
 * The system defines a fixed ordered set of semantic weight roles.
 * Users assign numeric weights to whichever roles their font supports.
 * Roles without an explicit assignment fall back to the nearest assigned weight.
 *
 * "Nearest" means the assigned weight whose numeric value is closest.
 * When equidistant, the lighter weight is preferred.
 */

// ─── System weight roles ──────────────────────────────────────────────────────

/**
 * Canonical ordered list of semantic weight roles.
 * The order also implies the fallback direction — missing roles resolve
 * to their nearest neighbour in numeric weight space, not position.
 */
export const WEIGHT_ROLES = [
  "thin",
  "extralight",
  "light",
  "regular",
  "medium",
  "semibold",
  "bold",
  "extrabold",
  "black",
] as const;

export type WeightRole = (typeof WEIGHT_ROLES)[number];

/** Canonical numeric values for each role (used when a role is referenced but not assigned). */
const ROLE_DEFAULTS: Record<WeightRole, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

// ─── Resolution ───────────────────────────────────────────────────────────────

/**
 * Resolve all semantic weight roles to numeric values.
 *
 * Assigned roles are returned as-is. Unassigned roles are resolved to
 * the numeric value of the nearest assigned role.
 *
 * @param assigned - Partial mapping of role name → numeric weight provided by the user.
 * @returns Complete mapping of all roles → resolved numeric weight.
 */
export function resolveWeights(
  assigned: Partial<Record<string, number>>,
): Record<WeightRole, number> {
  const assignedEntries = Object.entries(assigned).filter(
    ([, v]) => v !== undefined,
  ) as [string, number][];

  if (assignedEntries.length === 0) {
    // Nothing assigned — use system defaults for all roles
    return { ...ROLE_DEFAULTS };
  }

  const result = {} as Record<WeightRole, number>;

  for (const role of WEIGHT_ROLES) {
    if (assigned[role] !== undefined) {
      result[role] = assigned[role]!;
    } else {
      // Find the assigned entry whose numeric value is closest to this role's default
      const targetValue = ROLE_DEFAULTS[role];
      let nearest = assignedEntries[0]!;
      let nearestDiff = Math.abs(nearest[1] - targetValue);

      for (const entry of assignedEntries.slice(1)) {
        const diff = Math.abs(entry[1] - targetValue);
        if (diff < nearestDiff || (diff === nearestDiff && entry[1] < nearest[1])) {
          nearest = entry;
          nearestDiff = diff;
        }
      }

      result[role] = nearest[1];
    }
  }

  return result;
}

/**
 * Resolve only the roles that are actually needed by the system.
 * This is a filtered version useful for token output —
 * we only emit CSS custom properties for roles in the input set.
 *
 * @param assigned - User-provided weight mapping (only supported roles included).
 * @returns The same set of roles with any gaps filled by nearest-neighbour fallback.
 */
export function resolveAssignedWeights(
  assigned: Record<string, number>,
): Record<string, number> {
  const keys = Object.keys(assigned) as WeightRole[];
  const assignedEntries = Object.entries(assigned) as [string, number][];
  const result: Record<string, number> = { ...assigned };

  for (const role of WEIGHT_ROLES) {
    if (keys.includes(role)) continue;
    // This role is not in the user's set — skip it (don't add extra roles)
  }

  // Fill gaps within the user's set if they have a sparse assignment
  // e.g. { regular: 400, bold: 700 } — medium resolves to 400 (nearest)
  for (const role of keys) {
    if (result[role] === undefined) {
      const targetValue = ROLE_DEFAULTS[role] ?? 400;
      let nearest = assignedEntries[0]!;
      let nearestDiff = Math.abs(nearest[1] - targetValue);
      for (const entry of assignedEntries.slice(1)) {
        const diff = Math.abs(entry[1] - targetValue);
        if (diff < nearestDiff || (diff === nearestDiff && entry[1] < nearest[1])) {
          nearest = entry;
          nearestDiff = diff;
        }
      }
      result[role] = nearest[1];
    }
  }

  return result;
}
