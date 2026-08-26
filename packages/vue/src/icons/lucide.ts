/**
 * Lucide icon adapter.
 *
 * Maps each canonical design system icon name to its `@lucide/vue` component.
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
  ArrowDown, ArrowDownAZ, ArrowLeft, ArrowRight, ArrowUp, ArrowUpAZ,
  Bookmark, Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  CircleAlert, CircleCheckBig, Clock, Copy,
  Download, ExternalLink, Eye, EyeOff, File, Folder, Funnel,
  Grid2x2, Heart, House, Info, List, LoaderCircle, Lock, LockOpen,
  Mail, Menu, Minus, Pause, Pencil, Phone, Pipette, Play, Plus,
  Redo2, RefreshCw, RotateCw,
  Search, Settings, Star, Tag, Trash2, TriangleAlert, Undo2, Upload, User, Users, X,
} from "@lucide/vue";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { IconComponent } from "./registry.js";

export const lucideIconSet: Record<CanonicalIconName, IconComponent> = {
  "chevron-down":   ChevronDown,
  "chevron-up":     ChevronUp,
  "chevron-left":   ChevronLeft,
  "chevron-right":  ChevronRight,
  "arrow-left":     ArrowLeft,
  "arrow-right":    ArrowRight,
  "arrow-up":       ArrowUp,
  "arrow-down":     ArrowDown,
  "external-link":  ExternalLink,
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
  "redo":           Redo2,
  "sort-asc":       ArrowUpAZ,
  "sort-desc":      ArrowDownAZ,
  "filter":         Funnel,
  "check-circle":   CircleCheckBig,
  "alert-circle":   CircleAlert,
  "alert-triangle": TriangleAlert,
  "info":           Info,
  "loader":         LoaderCircle,
  "search":         Search,
  "eye":            Eye,
  "eye-off":        EyeOff,
  "bookmark":       Bookmark,
  "star":           Star,
  "heart":          Heart,
  "tag":            Tag,
  "menu":           Menu,
  "grid":           Grid2x2,
  "list":           List,
  "file":           File,
  "folder":         Folder,
  "play":           Play,
  "pause":          Pause,
  "user":           User,
  "users":          Users,
  "lock":           Lock,
  "unlock":         LockOpen,
  "mail":           Mail,
  "phone":          Phone,
  "settings":       Settings,
  "home":           House,
  "calendar":       Calendar,
  "clock":          Clock,
  "pipette":        Pipette,
  "rotate-cw":      RotateCw,
};
