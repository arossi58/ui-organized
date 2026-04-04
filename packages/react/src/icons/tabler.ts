/**
 * Tabler icon adapter.
 *
 * Maps each canonical design system icon name to its Tabler React component.
 * Named imports enable tree-shaking within the library.
 *
 * The Vite plugin (packages/react-vite) will alias this entire module to an
 * empty stub when Tabler is not the selected library.
 */

import {
  IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp,
  IconAlertCircle, IconAlertTriangle,
  IconBookmark, IconCalendar, IconCheck, IconCircleCheck, IconChevronDown,
  IconChevronLeft, IconChevronRight, IconChevronUp, IconClock, IconCopy,
  IconDownload, IconExternalLink, IconEye, IconEyeOff, IconFilter,
  IconHeart, IconHome, IconInfoCircle, IconLayoutGrid, IconList, IconLoader2,
  IconLock, IconLockOpen, IconMail, IconMenu2, IconMinus,
  IconPencil, IconPhone, IconPlus, IconRefresh,
  IconSearch, IconSettings, IconSortAscending, IconSortDescending,
  IconStar, IconTag, IconTrash, IconUpload, IconUser, IconUsers, IconX,
  // Filled variants
  IconAlertCircleFilled, IconAlertTriangleFilled,
  IconBookmarkFilled, IconCalendarFilled, IconCircleCheckFilled, IconClockFilled,
  IconCopyFilled, IconEyeFilled, IconFilterFilled,
  IconHeartFilled, IconHomeFilled, IconInfoCircleFilled,
  IconLockFilled, IconMailFilled, IconPencilFilled, IconPhoneFilled,
  IconPlusFilled, IconSearchFilled, IconSettingsFilled,
  IconStarFilled, IconTagFilled, IconTrashFilled, IconUserFilled,
} from "@tabler/icons-react";
import type { CanonicalIconName } from "@ds/utils";
import type { ComponentType } from "react";

export const tablerIconSet: Record<CanonicalIconName, ComponentType<any>> = {
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
  "sort-asc":       IconSortAscending,
  "sort-desc":      IconSortDescending,
  "filter":         IconFilter,
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
};

/**
 * Tabler filled/solid icon set.
 * Only icons that have an official filled variant are listed here.
 * Icons without a filled variant fall back to the outline set in Icon.tsx.
 */
export const tablerSolidSet: Partial<Record<CanonicalIconName, ComponentType<any>>> = {
  "alert-circle":   IconAlertCircleFilled,
  "alert-triangle": IconAlertTriangleFilled,
  "bookmark":       IconBookmarkFilled,
  "calendar":       IconCalendarFilled,
  "check-circle":   IconCircleCheckFilled,
  "clock":          IconClockFilled,
  "copy":           IconCopyFilled,
  "edit":           IconPencilFilled,
  "eye":            IconEyeFilled,
  "filter":         IconFilterFilled,
  "heart":          IconHeartFilled,
  "home":           IconHomeFilled,
  "info":           IconInfoCircleFilled,
  "lock":           IconLockFilled,
  "mail":           IconMailFilled,
  "phone":          IconPhoneFilled,
  "plus":           IconPlusFilled,
  "search":         IconSearchFilled,
  "settings":       IconSettingsFilled,
  "star":           IconStarFilled,
  "tag":            IconTagFilled,
  "trash":          IconTrashFilled,
  "user":           IconUserFilled,
};
