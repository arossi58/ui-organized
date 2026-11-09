/**
 * Lucide icon adapter.
 *
 * Maps each of the components' own glyphs (`SystemGlyph` in @ui-organized/core)
 * to its `@lucide/vue` component.
 * Named imports keep tree-shaking intact — only the icons listed here are pulled
 * out of the catalogue of thousands.
 *
 * ── Why the package is `@lucide/vue`, not `lucide-vue-next` ─────────────────
 *
 * `lucide-vue-next` is deprecated on npm and points at `@lucide/vue`.
 *
 * ── Why several names differ from packages/react's Lucide map ───────────────
 *
 * React pins `lucide-react@^0.400`, which predates Lucide's naming cleanup.
 * `@lucide/vue` is Lucide v1, where seven of these were renamed:
 * AlertCircle→CircleAlert, AlertTriangle→TriangleAlert, CheckCircle→CircleCheckBig,
 * Filter→Funnel, Grid2X2→Grid2x2, Home→House, Loader2→LoaderCircle. The old names
 * still resolve as deprecated aliases, so copying React's list verbatim would
 * have compiled and then broken on the release that drops them. Same glyphs,
 * current names.
 */

import {
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheckBig,
  Copy,
  Download,
  Eye,
  EyeOff,
  File,
  Folder,
  Funnel,
  Grid2x2,
  House,
  Info,
  List,
  Menu,
  Minus,
  Pause,
  Pencil,
  Pipette,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  Tag,
  Trash2,
  TriangleAlert,
  Undo2,
  Upload,
  User,
  X,
  ListFilter,
  RotateCcw,
} from "@lucide/vue";
import type { SystemGlyph } from "@ui-organized/core";
import type { IconComponent } from "./registry.js";

export const lucideIconSet: Record<SystemGlyph, IconComponent> = {
  "chevron-down":   ChevronDown,
  "chevron-up":     ChevronUp,
  "chevron-left":   ChevronLeft,
  "chevron-right":  ChevronRight,
  "close":          X,
  "check":          Check,
  "plus":           Plus,
  "minus":          Minus,
  "copy":           Copy,
  "edit":           Pencil,
  "trash":          Trash2,
  "download":       Download,
  "upload":         Upload,
  "refresh":        RefreshCw,
  "undo":           Undo2,
  "sort-asc":       ArrowUpAZ,
  "sort-desc":      ArrowDownAZ,
  "filter":         Funnel,
  "sort":           ListFilter,
  "check-circle":   CircleCheckBig,
  "alert-circle":   CircleAlert,
  "alert-triangle": TriangleAlert,
  "info":           Info,
  "search":         Search,
  "eye":            Eye,
  "eye-off":        EyeOff,
  "star":           Star,
  "tag":            Tag,
  "menu":           Menu,
  "grid":           Grid2x2,
  "list":           List,
  "file":           File,
  "folder":         Folder,
  "play":           Play,
  "pause":          Pause,
  "user":           User,
  "settings":       Settings,
  "home":           House,
  "calendar":       Calendar,
  "pipette":        Pipette,
  "rotate-ccw":     RotateCcw,
};
