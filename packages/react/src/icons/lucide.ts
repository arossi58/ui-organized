/**
 * Lucide icon adapter.
 *
 * Maps each of the components' own glyphs (`SystemGlyph` in @ui-organized/core)
 * to its Lucide React component.
 * Named imports enable tree-shaking within the library — only icons referenced
 * in this file are included in the bundle.
 *
 * The Vite plugin (packages/react-vite) will alias this entire module to an
 * empty stub when Lucide is not the selected library, so unused libraries are
 * excluded from production builds.
 */

import {
  ArrowDownAZ,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  File,
  Filter,
  Folder,
  Grid2X2,
  Home,
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
  Undo2,
  Upload,
  User,
  X,
  ArrowUpAZ,
  ListFilter,
  RotateCcw,
} from "lucide-react";
import type { SystemGlyph } from "@ui-organized/core";
import type { ComponentType } from "react";

export const lucideIconSet: Record<SystemGlyph, ComponentType<any>> = {
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  close: X,
  check: Check,
  plus: Plus,
  minus: Minus,
  copy: Copy,
  edit: Pencil,
  trash: Trash2,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  undo: Undo2,
  "sort-asc": ArrowUpAZ,
  "sort-desc": ArrowDownAZ,
  filter: Filter,
  sort: ListFilter,
  "check-circle": CheckCircle,
  "alert-circle": AlertCircle,
  "alert-triangle": AlertTriangle,
  info: Info,
  search: Search,
  eye: Eye,
  "eye-off": EyeOff,
  star: Star,
  tag: Tag,
  menu: Menu,
  grid: Grid2X2,
  list: List,
  file: File,
  folder: Folder,
  play: Play,
  pause: Pause,
  user: User,
  settings: Settings,
  home: Home,
  calendar: Calendar,
  pipette: Pipette,
  "rotate-ccw": RotateCcw,
};
