/**
 * Canonical icon name mapping for the design system.
 *
 * Components reference canonical names (e.g. "chevron-down", "close").
 * This module resolves each canonical name to the actual component name
 * in each supported library: Lucide, Tabler, and Heroicons.
 *
 * Used by the Icon component in packages/react and any future framework
 * implementations — the mapping is written once here, not per-framework.
 */

// ─── Canonical icon names ─────────────────────────────────────────────────────

export const CANONICAL_ICON_NAMES = [
  // Navigation / directional
  "chevron-down",
  "chevron-up",
  "chevron-left",
  "chevron-right",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "arrow-down",
  "external-link",
  // Actions
  "close",
  "check",
  "plus",
  "minus",
  "copy",
  "edit",
  "trash",
  "download",
  "upload",
  "refresh",
  "undo",
  "redo",
  "sort-asc",
  "sort-desc",
  "filter",
  // Status / feedback
  "check-circle",
  "alert-circle",
  "alert-triangle",
  "info",
  "loader",
  // Content / data
  "search",
  "eye",
  "eye-off",
  "bookmark",
  "star",
  "heart",
  "tag",
  "menu",
  "grid",
  "list",
  // People / identity
  "user",
  "users",
  "lock",
  "unlock",
  // Communication
  "mail",
  "phone",
  // Misc
  "settings",
  "home",
  "calendar",
  "clock",
] as const;

export type CanonicalIconName = (typeof CANONICAL_ICON_NAMES)[number];

// ─── Per-library name mappings ────────────────────────────────────────────────

export interface IconLibraryNames {
  /** Component export name from lucide-react */
  lucide: string;
  /** Component export name from @tabler/icons-react */
  tabler: string;
  /** Component export name from @heroicons/react/24/outline and /24/solid */
  heroicons: string;
}

export const ICON_MAP: Record<CanonicalIconName, IconLibraryNames> = {
  // Navigation / directional
  "chevron-down":   { lucide: "ChevronDown",    tabler: "IconChevronDown",    heroicons: "ChevronDownIcon"              },
  "chevron-up":     { lucide: "ChevronUp",      tabler: "IconChevronUp",      heroicons: "ChevronUpIcon"                },
  "chevron-left":   { lucide: "ChevronLeft",    tabler: "IconChevronLeft",    heroicons: "ChevronLeftIcon"              },
  "chevron-right":  { lucide: "ChevronRight",   tabler: "IconChevronRight",   heroicons: "ChevronRightIcon"             },
  "arrow-left":     { lucide: "ArrowLeft",      tabler: "IconArrowLeft",      heroicons: "ArrowLeftIcon"                },
  "arrow-right":    { lucide: "ArrowRight",     tabler: "IconArrowRight",     heroicons: "ArrowRightIcon"               },
  "arrow-up":       { lucide: "ArrowUp",        tabler: "IconArrowUp",        heroicons: "ArrowUpIcon"                  },
  "arrow-down":     { lucide: "ArrowDown",      tabler: "IconArrowDown",      heroicons: "ArrowDownIcon"                },
  "external-link":  { lucide: "ExternalLink",   tabler: "IconExternalLink",   heroicons: "ArrowTopRightOnSquareIcon"    },
  // Actions
  "close":          { lucide: "X",              tabler: "IconX",              heroicons: "XMarkIcon"                    },
  "check":          { lucide: "Check",          tabler: "IconCheck",          heroicons: "CheckIcon"                    },
  "plus":           { lucide: "Plus",           tabler: "IconPlus",           heroicons: "PlusIcon"                     },
  "minus":          { lucide: "Minus",          tabler: "IconMinus",          heroicons: "MinusIcon"                    },
  "copy":           { lucide: "Copy",           tabler: "IconCopy",           heroicons: "DocumentDuplicateIcon"        },
  "edit":           { lucide: "Pencil",         tabler: "IconPencil",         heroicons: "PencilIcon"                   },
  "trash":          { lucide: "Trash2",         tabler: "IconTrash",          heroicons: "TrashIcon"                    },
  "download":       { lucide: "Download",       tabler: "IconDownload",       heroicons: "ArrowDownTrayIcon"            },
  "upload":         { lucide: "Upload",         tabler: "IconUpload",         heroicons: "ArrowUpTrayIcon"              },
  "refresh":        { lucide: "RefreshCw",      tabler: "IconRefresh",        heroicons: "ArrowPathIcon"                },
  "undo":           { lucide: "Undo2",          tabler: "IconArrowBackUp",    heroicons: "ArrowUturnLeftIcon"           },
  "redo":           { lucide: "Redo2",          tabler: "IconArrowForwardUp", heroicons: "ArrowUturnRightIcon"          },
  "sort-asc":       { lucide: "ArrowUpAZ",      tabler: "IconSortAscending",  heroicons: "BarsArrowUpIcon"              },
  "sort-desc":      { lucide: "ArrowDownAZ",    tabler: "IconSortDescending", heroicons: "BarsArrowDownIcon"            },
  "filter":         { lucide: "Filter",         tabler: "IconFilter",         heroicons: "FunnelIcon"                   },
  // Status / feedback
  "check-circle":   { lucide: "CheckCircle",    tabler: "IconCircleCheck",    heroicons: "CheckCircleIcon"              },
  "alert-circle":   { lucide: "AlertCircle",    tabler: "IconAlertCircle",    heroicons: "ExclamationCircleIcon"        },
  "alert-triangle": { lucide: "AlertTriangle",  tabler: "IconAlertTriangle",  heroicons: "ExclamationTriangleIcon"      },
  "info":           { lucide: "Info",           tabler: "IconInfoCircle",     heroicons: "InformationCircleIcon"        },
  "loader":         { lucide: "Loader2",        tabler: "IconLoader2",        heroicons: "ArrowPathIcon"                },
  // Content / data
  "search":         { lucide: "Search",         tabler: "IconSearch",         heroicons: "MagnifyingGlassIcon"          },
  "eye":            { lucide: "Eye",            tabler: "IconEye",            heroicons: "EyeIcon"                      },
  "eye-off":        { lucide: "EyeOff",         tabler: "IconEyeOff",         heroicons: "EyeSlashIcon"                 },
  "bookmark":       { lucide: "Bookmark",       tabler: "IconBookmark",       heroicons: "BookmarkIcon"                 },
  "star":           { lucide: "Star",           tabler: "IconStar",           heroicons: "StarIcon"                     },
  "heart":          { lucide: "Heart",          tabler: "IconHeart",          heroicons: "HeartIcon"                    },
  "tag":            { lucide: "Tag",            tabler: "IconTag",            heroicons: "TagIcon"                      },
  "menu":           { lucide: "Menu",           tabler: "IconMenu2",          heroicons: "Bars3Icon"                    },
  "grid":           { lucide: "Grid2X2",        tabler: "IconLayoutGrid",     heroicons: "Squares2X2Icon"               },
  "list":           { lucide: "List",           tabler: "IconList",           heroicons: "ListBulletIcon"               },
  // People / identity
  "user":           { lucide: "User",           tabler: "IconUser",           heroicons: "UserIcon"                     },
  "users":          { lucide: "Users",          tabler: "IconUsers",          heroicons: "UsersIcon"                    },
  "lock":           { lucide: "Lock",           tabler: "IconLock",           heroicons: "LockClosedIcon"               },
  "unlock":         { lucide: "LockOpen",       tabler: "IconLockOpen",       heroicons: "LockOpenIcon"                 },
  // Communication
  "mail":           { lucide: "Mail",           tabler: "IconMail",           heroicons: "EnvelopeIcon"                 },
  "phone":          { lucide: "Phone",          tabler: "IconPhone",          heroicons: "PhoneIcon"                    },
  // Misc
  "settings":       { lucide: "Settings",       tabler: "IconSettings",       heroicons: "Cog6ToothIcon"                },
  "home":           { lucide: "Home",           tabler: "IconHome",           heroicons: "HomeIcon"                     },
  "calendar":       { lucide: "Calendar",       tabler: "IconCalendar",       heroicons: "CalendarIcon"                 },
  "clock":          { lucide: "Clock",          tabler: "IconClock",          heroicons: "ClockIcon"                    },
};

// ─── Name resolution ──────────────────────────────────────────────────────────

/**
 * Resolve a canonical icon name to the actual component export name for
 * the given library. For Heroicons the same name is used for both outline
 * and solid; style controls which subpath is imported.
 */
export function resolveIconName(
  name: CanonicalIconName,
  library: "lucide" | "tabler" | "heroicons",
): string {
  return ICON_MAP[name][library];
}
