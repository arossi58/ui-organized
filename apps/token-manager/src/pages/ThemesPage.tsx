import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogConfirm,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Input,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Select,
} from "@ui-organized/react";
import type { ThemeSetStatus } from "@ui-organized/schema";
import {
  addMode,
  addTheme,
  deleteTheme,
  removeMode,
  renameTheme,
  setThemeSetStatus,
  useProjectDocument,
} from "../yjs/store.js";

const STATUS = [
  { value: "enabled", label: "Enabled" },
  { value: "source", label: "Source" },
  { value: "disabled", label: "Disabled" },
];

export function ThemesPage() {
  const doc = useProjectDocument();
  const themeNames = new Set(doc.themes.map((t) => t.name));
  const modes = Object.keys(doc.modes);

  const [addThemeOpen, setAddThemeOpen] = useState(false);
  const [addThemeName, setAddThemeName] = useState("");
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [addModeOpen, setAddModeOpen] = useState(false);
  const [modeName, setModeName] = useState("");

  return (
    <div className="tm-page-scroll">
      <div className="tm-page-inner">
        <header className="tm-page-head">
          <div>
            <h1 className="tm-page-title">Themes &amp; Modes</h1>
            <p className="tm-page-sub">
              Themes are named set-status combinations (multi-brand = multiple themes). Modes affect
              semantic mappings only.
            </p>
          </div>
          <Button intent="primary" size="sm" icon="plus" onClick={() => setAddThemeOpen(true)}>
            Add theme
          </Button>
        </header>

        <div className="tm-card">
          <span className="tm-card__title">Theme matrix</span>
          {doc.themes.length === 0 ? (
            <p className="tm-muted">No themes yet. Add one to combine set statuses.</p>
          ) : (
            <div className="tm-table-wrap">
              <table className="tm-table tm-matrix">
                <thead>
                  <tr>
                    <th className="tm-matrix__rowhead">Set</th>
                    {doc.themes.map((theme) => (
                      <th key={theme.name}>
                        <span className="tm-row-controls">
                          {theme.name}
                          <Menu>
                            <MenuTrigger
                              render={
                                <Button intent="ghost" size="sm" aria-label={`Actions for ${theme.name}`}>
                                  ⋯
                                </Button>
                              }
                            />
                            <MenuContent>
                              <MenuItem
                                icon="edit"
                                onSelect={() => {
                                  setRenameTarget(theme.name);
                                  setRenameName(theme.name);
                                }}
                              >
                                Rename
                              </MenuItem>
                              <MenuItem icon="trash" destructive onSelect={() => setDeleteTarget(theme.name)}>
                                Delete
                              </MenuItem>
                            </MenuContent>
                          </Menu>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doc.sets.map((set) => (
                    <tr key={set.name}>
                      <td className="tm-matrix__rowhead">{set.name}</td>
                      {doc.themes.map((theme) => (
                        <td key={theme.name}>
                          <Select
                            size="sm"
                            variant="ghost"
                            options={STATUS}
                            value={theme.selectedTokenSets[set.name] ?? "disabled"}
                            onValueChange={(v) => setThemeSetStatus(theme.name, set.name, v as ThemeSetStatus)}
                            aria-label={`${set.name} in ${theme.name}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="tm-card">
          <div className="tm-row-controls" style={{ justifyContent: "space-between" }}>
            <span className="tm-card__title" style={{ margin: 0 }}>
              Modes
            </span>
            <Button intent="secondary" size="sm" icon="plus" onClick={() => setAddModeOpen(true)}>
              Add mode
            </Button>
          </div>
          <p className="tm-muted" style={{ margin: "8px 0 0" }}>
            A set scoped to a mode (via <code>$extensions.mode</code>) participates only in that mode.
          </p>
          <div className="tm-row-controls" style={{ marginTop: 12 }}>
            {modes.length === 0 ? (
              <span className="tm-muted">No modes.</span>
            ) : (
              modes.map((mode) => (
                <span key={mode} className="tm-mode-chip">
                  {mode}
                  <Button
                    intent="ghost"
                    size="sm"
                    icon="close"
                    aria-label={`Remove ${mode}`}
                    onClick={() => removeMode(mode)}
                  />
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add theme */}
      <Dialog open={addThemeOpen} onOpenChange={setAddThemeOpen}>
        <DialogContent size="sm">
          <DialogTitle>New theme</DialogTitle>
          <Input
            label="Theme name"
            value={addThemeName}
            onChange={(e) => setAddThemeName(e.target.value)}
            error={addThemeName.trim() && themeNames.has(addThemeName.trim()) ? "A theme with that name exists" : undefined}
            autoFocus
          />
          <DialogFooter>
            <DialogClose render={<Button intent="tertiary">Cancel</Button>} />
            <Button
              intent="primary"
              onClick={() => {
                const name = addThemeName.trim();
                if (!name || themeNames.has(name)) return;
                addTheme(name);
                setAddThemeName("");
                setAddThemeOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename theme */}
      <Dialog open={renameTarget !== null} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent size="sm">
          <DialogTitle>Rename theme</DialogTitle>
          <Input label="Theme name" value={renameName} onChange={(e) => setRenameName(e.target.value)} autoFocus />
          <DialogFooter>
            <DialogClose render={<Button intent="tertiary">Cancel</Button>} />
            <Button
              intent="primary"
              onClick={() => {
                const name = renameName.trim();
                if (!renameTarget || !name || (name !== renameTarget && themeNames.has(name))) return;
                renameTheme(renameTarget, name);
                setRenameTarget(null);
              }}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete theme */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete “{deleteTarget}”?</AlertDialogTitle>
          <AlertDialogDescription>This removes the theme. It can be undone.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogConfirm
              intent="destructive"
              onClick={() => {
                if (deleteTarget) deleteTheme(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogConfirm>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add mode */}
      <Dialog open={addModeOpen} onOpenChange={setAddModeOpen}>
        <DialogContent size="sm">
          <DialogTitle>New mode</DialogTitle>
          <Input label="Mode name" value={modeName} onChange={(e) => setModeName(e.target.value)} placeholder="light, dark, high-contrast…" autoFocus />
          <DialogFooter>
            <DialogClose render={<Button intent="tertiary">Cancel</Button>} />
            <Button
              intent="primary"
              onClick={() => {
                const name = modeName.trim();
                if (!name) return;
                addMode(name);
                setModeName("");
                setAddModeOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
