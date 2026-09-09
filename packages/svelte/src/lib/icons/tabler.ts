/**
 * Tabler icon adapter.
 *
 * Maps each canonical design system icon name to its `@tabler/icons-svelte`
 * component, outline and filled. Named imports keep tree-shaking intact.
 *
 * ── Why the two sets are asserted rather than annotated ─────────────────────
 *
 * The package ships `.svelte` source, so the component a consumer actually gets
 * is whatever their Svelte 5 compiler produces — a function component. But its
 * published `.d.ts` files were generated under Svelte 4 and still declare each
 * icon as `class Check extends SvelteComponentTyped`, which has no call
 * signature and so satisfies no `Component<…>`. Annotating the map would fail
 * `svelte-check` against types that do not describe the shipped runtime value.
 *
 * `satisfies Record<CanonicalIconName, unknown>` keeps everything that is real:
 * a missing or renamed upstream export still fails at the import, and a missing
 * or misspelled canonical key still fails here. Only the component *shape* goes
 * unchecked, and `scripts/smoke-icons.mjs` evaluates the built adapter to cover
 * exactly that.
 */

import {
  IconAlertCircle, IconAlertTriangle,
  IconArrowBackUp, IconArrowDown, IconArrowForwardUp, IconArrowLeft, IconArrowRight, IconArrowUp,
  IconBookmark, IconCalendar, IconCheck, IconChevronDown, IconChevronLeft,
  IconChevronRight, IconChevronUp, IconCircleCheck, IconClock, IconColorPicker, IconCopy,
  IconDownload, IconExternalLink, IconEye, IconEyeOff, IconFile, IconFilter, IconFolder,
  IconHeart, IconHome, IconInfoCircle, IconLayoutGrid, IconList, IconLoader2,
  IconLock, IconLockOpen, IconMail, IconMenu2, IconMinus,
  IconPencil, IconPhone, IconPlayerPause, IconPlayerPlay, IconPlus,
  IconRefresh, IconRotateClockwise,
  IconSearch, IconSettings, IconSortAscending, IconSortDescending,
  IconStar, IconTag, IconTrash, IconUpload, IconUser, IconUsers, IconX,
  // Filled variants
  IconAlertCircleFilled, IconAlertTriangleFilled,
  IconBookmarkFilled, IconCalendarFilled, IconCircleCheckFilled, IconClockFilled,
  IconCopyFilled, IconEyeFilled, IconFileFilled, IconFilterFilled, IconFolderFilled,
  IconHeartFilled, IconHomeFilled, IconInfoCircleFilled,
  IconLockFilled, IconMailFilled, IconPencilFilled, IconPhoneFilled,
  IconPlayerPauseFilled, IconPlayerPlayFilled,
  IconPlusFilled, IconSearchFilled, IconSettingsFilled,
  IconStarFilled, IconTagFilled, IconTrashFilled, IconUserFilled, IconArrowsSort, IconRotate,
} from "@tabler/icons-svelte";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { IconComponent } from "./registry.js";

const outline = {
  "chevron-down":   IconChevronDown,
  "chevron-up":     IconChevronUp,
  "chevron-left":   IconChevronLeft,
  "chevron-right":  IconChevronRight,
  "arrow-left":     IconArrowLeft,
  "arrow-right":    IconArrowRight,
  "arrow-up":       IconArrowUp,
  "arrow-down":     IconArrowDown,
  "external-link":  IconExternalLink,
  "close":          IconX,
  "check":          IconCheck,
  "plus":           IconPlus,
  "minus":          IconMinus,
  "copy":           IconCopy,
  "edit":           IconPencil,
  "trash":          IconTrash,
  "download":       IconDownload,
  "upload":         IconUpload,
  "refresh":        IconRefresh,
  "undo":           IconArrowBackUp,
  "redo":           IconArrowForwardUp,
  "sort-asc":       IconSortAscending,
  "sort-desc":      IconSortDescending,
  "filter":         IconFilter,
  "sort":           IconArrowsSort,
  "check-circle":   IconCircleCheck,
  "alert-circle":   IconAlertCircle,
  "alert-triangle": IconAlertTriangle,
  "info":           IconInfoCircle,
  "loader":         IconLoader2,
  "search":         IconSearch,
  "eye":            IconEye,
  "eye-off":        IconEyeOff,
  "bookmark":       IconBookmark,
  "star":           IconStar,
  "heart":          IconHeart,
  "tag":            IconTag,
  "menu":           IconMenu2,
  "grid":           IconLayoutGrid,
  "list":           IconList,
  "file":           IconFile,
  "folder":         IconFolder,
  "play":           IconPlayerPlay,
  "pause":          IconPlayerPause,
  "user":           IconUser,
  "users":          IconUsers,
  "lock":           IconLock,
  "unlock":         IconLockOpen,
  "mail":           IconMail,
  "phone":          IconPhone,
  "settings":       IconSettings,
  "home":           IconHome,
  "calendar":       IconCalendar,
  "clock":          IconClock,
  "pipette":        IconColorPicker,
  "rotate-cw":      IconRotateClockwise,
  "rotate-ccw":     IconRotate,
} satisfies Record<CanonicalIconName, unknown>;

/**
 * Tabler's filled cut, which covers 27 of the 55 canonical names. The rest have
 * no official filled variant; `resolveIconComponent` falls back to the outline
 * one rather than leaving a hole.
 */
const solid = {
  "alert-circle":   IconAlertCircleFilled,
  "alert-triangle": IconAlertTriangleFilled,
  "bookmark":       IconBookmarkFilled,
  "calendar":       IconCalendarFilled,
  "check-circle":   IconCircleCheckFilled,
  "clock":          IconClockFilled,
  "copy":           IconCopyFilled,
  "edit":           IconPencilFilled,
  "eye":            IconEyeFilled,
  "file":           IconFileFilled,
  "filter":         IconFilterFilled,
  "folder":         IconFolderFilled,
  "heart":          IconHeartFilled,
  "home":           IconHomeFilled,
  "info":           IconInfoCircleFilled,
  "lock":           IconLockFilled,
  "mail":           IconMailFilled,
  "phone":          IconPhoneFilled,
  "play":           IconPlayerPlayFilled,
  "pause":          IconPlayerPauseFilled,
  "plus":           IconPlusFilled,
  "search":         IconSearchFilled,
  "settings":       IconSettingsFilled,
  "star":           IconStarFilled,
  "tag":            IconTagFilled,
  "trash":          IconTrashFilled,
  "user":           IconUserFilled,
} satisfies Partial<Record<CanonicalIconName, unknown>>;

export const tablerIconSet = outline as unknown as Record<CanonicalIconName, IconComponent>;
export const tablerSolidSet = solid as unknown as Partial<Record<CanonicalIconName, IconComponent>>;
