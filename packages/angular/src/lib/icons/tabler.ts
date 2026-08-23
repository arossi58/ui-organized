/**
 * Tabler name maps.
 *
 * Each canonical design-system name to the SVG markup `@ng-icons/tabler-icons`
 * publishes for it. Written by hand, as React's are: `@ng-icons` derives its
 * export names from the upstream file names, which is close to but not the same
 * as the component names the React packages use — `Grid2X2`, `ArrowUpAZ` and
 * `Trash2` are exactly where a mechanical transform goes wrong.
 *
 * Named imports, so only the icons listed here reach a bundle; the pack itself
 * is a catalogue of thousands.
 */
import {
  tablerAlertCircle, tablerAlertTriangle, tablerArrowBackUp, tablerArrowDown,
  tablerArrowForwardUp, tablerArrowLeft, tablerArrowRight, tablerArrowUp, tablerBookmark,
  tablerCalendar, tablerCheck, tablerChevronDown, tablerChevronLeft, tablerChevronRight,
  tablerChevronUp, tablerCircleCheck, tablerClock, tablerColorPicker, tablerCopy,
  tablerDownload, tablerExternalLink, tablerEye, tablerEyeOff, tablerFile, tablerFilter,
  tablerFolder, tablerHeart, tablerHome, tablerInfoCircle, tablerLayoutGrid, tablerList,
  tablerLoader2, tablerLock, tablerLockOpen, tablerMail, tablerMenu2, tablerMinus, tablerPencil,
  tablerPhone, tablerPlayerPause, tablerPlayerPlay, tablerPlus, tablerRefresh,
  tablerRotateClockwise, tablerSearch, tablerSettings, tablerSortAscending,
  tablerSortDescending, tablerStar, tablerTag, tablerTrash, tablerUpload, tablerUser,
  tablerUsers, tablerX,
} from "@ng-icons/tabler-icons";
import {
  tablerAlertCircleFill, tablerAlertTriangleFill, tablerBookmarkFill, tablerCalendarFill,
  tablerCircleCheckFill, tablerClockFill, tablerCopyFill, tablerEyeFill, tablerFileFill,
  tablerFilterFill, tablerFolderFill, tablerHeartFill, tablerHomeFill, tablerInfoCircleFill,
  tablerLockFill, tablerMailFill, tablerPencilFill, tablerPhoneFill, tablerPlayerPauseFill,
  tablerPlayerPlayFill, tablerPlusFill, tablerSearchFill, tablerSettingsFill, tablerStarFill,
  tablerTagFill, tablerTrashFill, tablerUserFill,
} from "@ng-icons/tabler-icons/fill";
import type { CanonicalIconName } from "@ui-organized/utils";

export const tablerIconSet: Record<CanonicalIconName, string> = {
  "chevron-down":   tablerChevronDown,
  "chevron-up":     tablerChevronUp,
  "chevron-left":   tablerChevronLeft,
  "chevron-right":  tablerChevronRight,
  "arrow-left":     tablerArrowLeft,
  "arrow-right":    tablerArrowRight,
  "arrow-up":       tablerArrowUp,
  "arrow-down":     tablerArrowDown,
  "external-link":  tablerExternalLink,
  "close":          tablerX,
  "check":          tablerCheck,
  "plus":           tablerPlus,
  "minus":          tablerMinus,
  "copy":           tablerCopy,
  "edit":           tablerPencil,
  "trash":          tablerTrash,
  "download":       tablerDownload,
  "upload":         tablerUpload,
  "refresh":        tablerRefresh,
  "undo":           tablerArrowBackUp,
  "redo":           tablerArrowForwardUp,
  "sort-asc":       tablerSortAscending,
  "sort-desc":      tablerSortDescending,
  "filter":         tablerFilter,
  "check-circle":   tablerCircleCheck,
  "alert-circle":   tablerAlertCircle,
  "alert-triangle": tablerAlertTriangle,
  "info":           tablerInfoCircle,
  "loader":         tablerLoader2,
  "search":         tablerSearch,
  "eye":            tablerEye,
  "eye-off":        tablerEyeOff,
  "bookmark":       tablerBookmark,
  "star":           tablerStar,
  "heart":          tablerHeart,
  "tag":            tablerTag,
  "menu":           tablerMenu2,
  "grid":           tablerLayoutGrid,
  "list":           tablerList,
  "file":           tablerFile,
  "folder":         tablerFolder,
  "play":           tablerPlayerPlay,
  "pause":          tablerPlayerPause,
  "user":           tablerUser,
  "users":          tablerUsers,
  "lock":           tablerLock,
  "unlock":         tablerLockOpen,
  "mail":           tablerMail,
  "phone":          tablerPhone,
  "settings":       tablerSettings,
  "home":           tablerHome,
  "calendar":       tablerCalendar,
  "clock":          tablerClock,
  "pipette":        tablerColorPicker,
  "rotate-cw":      tablerRotateClockwise,
};

/**
 * Tabler's filled cut, which exists for only some icons. The rest fall back to
 * the outline one, which `resolveIconComponent` in core does on its own — the
 * same arrangement the React adapter has.
 */
export const tablerSolidSet: Partial<Record<CanonicalIconName, string>> = {
  "alert-circle":   tablerAlertCircleFill,
  "alert-triangle": tablerAlertTriangleFill,
  "bookmark":       tablerBookmarkFill,
  "calendar":       tablerCalendarFill,
  "check-circle":   tablerCircleCheckFill,
  "clock":          tablerClockFill,
  "copy":           tablerCopyFill,
  "edit":           tablerPencilFill,
  "eye":            tablerEyeFill,
  "file":           tablerFileFill,
  "filter":         tablerFilterFill,
  "folder":         tablerFolderFill,
  "heart":          tablerHeartFill,
  "home":           tablerHomeFill,
  "info":           tablerInfoCircleFill,
  "lock":           tablerLockFill,
  "mail":           tablerMailFill,
  "phone":          tablerPhoneFill,
  "play":           tablerPlayerPlayFill,
  "pause":          tablerPlayerPauseFill,
  "plus":           tablerPlusFill,
  "search":         tablerSearchFill,
  "settings":       tablerSettingsFill,
  "star":           tablerStarFill,
  "tag":            tablerTagFill,
  "trash":          tablerTrashFill,
  "user":           tablerUserFill,
};
