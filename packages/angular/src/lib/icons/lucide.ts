/**
 * Lucide name maps.
 *
 * Each canonical design-system name to the SVG markup `@ng-icons/lucide`
 * publishes for it. Written by hand, as React's are: `@ng-icons` derives its
 * export names from the upstream file names, which is close to but not the same
 * as the component names the React packages use — `Grid2X2`, `ArrowUpAZ` and
 * `Trash2` are exactly where a mechanical transform goes wrong.
 *
 * Named imports, so only the icons listed here reach a bundle; the pack itself
 * is a catalogue of thousands.
 */
import {
  lucideAlertCircle, lucideAlertTriangle, lucideArrowDown, lucideArrowDownAZ, lucideArrowLeft,
  lucideArrowRight, lucideArrowUp, lucideArrowUpAZ, lucideBookmark, lucideCalendar, lucideCheck,
  lucideCheckCircle, lucideChevronDown, lucideChevronLeft, lucideChevronRight, lucideChevronUp,
  lucideClock, lucideCopy, lucideDownload, lucideExternalLink, lucideEye, lucideEyeOff,
  lucideFile, lucideFilter, lucideFolder, lucideGrid2X2, lucideHeart, lucideHome, lucideInfo,
  lucideList, lucideLoader2, lucideLock, lucideLockOpen, lucideMail, lucideMenu, lucideMinus,
  lucidePause, lucidePencil, lucidePhone, lucidePipette, lucidePlay, lucidePlus, lucideRedo2,
  lucideRefreshCw, lucideRotateCw, lucideSearch, lucideSettings, lucideStar, lucideTag,
  lucideTrash2, lucideUndo2, lucideUpload, lucideUser, lucideUsers, lucideX, lucideListFilter, lucideRotateCcw,
} from "@ng-icons/lucide";
import type { CanonicalIconName } from "@ui-organized/utils";

export const lucideIconSet: Record<CanonicalIconName, string> = {
  "chevron-down":   lucideChevronDown,
  "chevron-up":     lucideChevronUp,
  "chevron-left":   lucideChevronLeft,
  "chevron-right":  lucideChevronRight,
  "arrow-left":     lucideArrowLeft,
  "arrow-right":    lucideArrowRight,
  "arrow-up":       lucideArrowUp,
  "arrow-down":     lucideArrowDown,
  "external-link":  lucideExternalLink,
  "close":          lucideX,
  "check":          lucideCheck,
  "plus":           lucidePlus,
  "minus":          lucideMinus,
  "copy":           lucideCopy,
  "edit":           lucidePencil,
  "trash":          lucideTrash2,
  "download":       lucideDownload,
  "upload":         lucideUpload,
  "refresh":        lucideRefreshCw,
  "undo":           lucideUndo2,
  "redo":           lucideRedo2,
  "sort-asc":       lucideArrowUpAZ,
  "sort-desc":      lucideArrowDownAZ,
  "filter":         lucideFilter,
  "sort":           lucideListFilter,
  "check-circle":   lucideCheckCircle,
  "alert-circle":   lucideAlertCircle,
  "alert-triangle": lucideAlertTriangle,
  "info":           lucideInfo,
  "loader":         lucideLoader2,
  "search":         lucideSearch,
  "eye":            lucideEye,
  "eye-off":        lucideEyeOff,
  "bookmark":       lucideBookmark,
  "star":           lucideStar,
  "heart":          lucideHeart,
  "tag":            lucideTag,
  "menu":           lucideMenu,
  "grid":           lucideGrid2X2,
  "list":           lucideList,
  "file":           lucideFile,
  "folder":         lucideFolder,
  "play":           lucidePlay,
  "pause":          lucidePause,
  "user":           lucideUser,
  "users":          lucideUsers,
  "lock":           lucideLock,
  "unlock":         lucideLockOpen,
  "mail":           lucideMail,
  "phone":          lucidePhone,
  "settings":       lucideSettings,
  "home":           lucideHome,
  "calendar":       lucideCalendar,
  "clock":          lucideClock,
  "pipette":        lucidePipette,
  "rotate-cw":      lucideRotateCw,
  "rotate-ccw":     lucideRotateCcw,
};
