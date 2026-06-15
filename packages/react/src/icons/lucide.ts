/**
 * Lucide icon adapter.
 *
 * Maps each canonical design system icon name to its Lucide React component.
 * Named imports enable tree-shaking within the library — only icons referenced
 * in this file are included in the bundle.
 *
 * The Vite plugin (packages/react-vite) will alias this entire module to an
 * empty stub when Lucide is not the selected library, so unused libraries are
 * excluded from production builds.
 */

import {
  ArrowDown, ArrowDownAZ, ArrowLeft, ArrowRight, ArrowUp,
  AlertCircle, AlertTriangle,
  Bookmark, Calendar, Check, CheckCircle, ChevronDown,
  ChevronLeft, ChevronRight, ChevronUp, Clock, Copy,
  Download, ExternalLink, Eye, EyeOff, Filter,
  Grid2X2, Heart, Home, Info, List, Loader2, Lock, LockOpen,
  Mail, Menu, Minus, Pencil, Phone, Plus, RefreshCw,
  Search, Settings, Star, Tag, Trash2, Upload, User, Users, X,
  ArrowUpAZ,
} from "lucide-react";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { ComponentType } from "react";

export const lucideIconSet: Record<CanonicalIconName, ComponentType<any>> = {
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
  "sort-asc":       ArrowUpAZ,
  "sort-desc":      ArrowDownAZ,
  "filter":         Filter,
  "check-circle":   CheckCircle,
  "alert-circle":   AlertCircle,
  "alert-triangle": AlertTriangle,
  "info":           Info,
  "loader":         Loader2,
  "search":         Search,
  "eye":            Eye,
  "eye-off":        EyeOff,
  "bookmark":       Bookmark,
  "star":           Star,
  "heart":          Heart,
  "tag":            Tag,
  "menu":           Menu,
  "grid":           Grid2X2,
  "list":           List,
  "user":           User,
  "users":          Users,
  "lock":           Lock,
  "unlock":         LockOpen,
  "mail":           Mail,
  "phone":          Phone,
  "settings":       Settings,
  "home":           Home,
  "calendar":       Calendar,
  "clock":          Clock,
};
