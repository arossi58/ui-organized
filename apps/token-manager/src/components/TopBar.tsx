import { useEffect, useState } from "react";
import { Badge, Button, Select } from "@ui-organized/react";
import { useProjectDocument, useUndoState, undo, redo } from "../yjs/store.js";
import { useSelection } from "../state/SelectionContext.js";
import { ImportDialog } from "./ImportDialog.js";

type ChromeTheme = "light" | "dark";

export function TopBar() {
  const doc = useProjectDocument();
  const selection = useSelection();
  const { canUndo, canRedo } = useUndoState();
  const [importOpen, setImportOpen] = useState(false);

  const [chrome, setChrome] = useState<ChromeTheme>(
    () => (document.documentElement.getAttribute("data-theme") as ChromeTheme) ?? "dark",
  );
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", chrome);
  }, [chrome]);

  const themeOptions = doc.themes.map((t) => ({ value: t.name, label: t.name }));
  const modeOptions = Object.keys(doc.modes).map((m) => ({ value: m, label: m }));

  return (
    <header className="tm-topbar">
      <span className="tm-topbar__title">{doc.meta.name}</span>
      <Badge variant="info" emphasized={false} size="sm">
        Local
      </Badge>

      <div className="tm-topbar__spacer" />

      {themeOptions.length > 0 && (
        <div className="tm-topbar__group">
          <span className="tm-topbar__label">Theme</span>
          <Select
            size="sm"
            options={themeOptions}
            value={selection.themeName || undefined}
            onValueChange={selection.setThemeName}
            aria-label="Active theme"
          />
        </div>
      )}

      {modeOptions.length > 0 && (
        <div className="tm-topbar__group">
          <span className="tm-topbar__label">Mode</span>
          <Select
            size="sm"
            options={modeOptions}
            value={selection.mode || undefined}
            onValueChange={selection.setMode}
            aria-label="Active mode"
          />
        </div>
      )}

      <div className="tm-topbar__group">
        <Button intent="tertiary" size="sm" onClick={undo} disabled={!canUndo}>
          Undo
        </Button>
        <Button intent="tertiary" size="sm" onClick={redo} disabled={!canRedo}>
          Redo
        </Button>
      </div>

      <Button intent="secondary" size="sm" onClick={() => setImportOpen(true)}>
        Import
      </Button>

      <Select
        size="sm"
        options={[
          { value: "dark", label: "Dark UI" },
          { value: "light", label: "Light UI" },
        ]}
        value={chrome}
        onValueChange={(v) => setChrome(v as ChromeTheme)}
        aria-label="Editor appearance"
      />

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </header>
  );
}
