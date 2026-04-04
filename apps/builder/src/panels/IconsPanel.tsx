import { useBuilderStore, type IconLibrary, type IconStyle } from "../state/themeState";
import styles from "./IconsPanel.module.css";

// ─── Library metadata ─────────────────────────────────────────────────────────

const LIBRARIES: {
  id: IconLibrary;
  name: string;
  description: string;
  supportsOutline: boolean;
  supportsSolid: boolean;
  pkg: string;
}[] = [
  {
    id: "lucide",
    name: "Lucide",
    description: "Clean, consistent open-source icons. Outline only.",
    supportsOutline: true,
    supportsSolid: false,
    pkg: "lucide-react",
  },
  {
    id: "tabler",
    name: "Tabler Icons",
    description: "4000+ pixel-perfect icons. Supports outline and solid.",
    supportsOutline: true,
    supportsSolid: true,
    pkg: "@tabler/icons-react",
  },
  {
    id: "heroicons",
    name: "Heroicons",
    description: "Handcrafted SVGs by the Tailwind team. Supports outline and solid.",
    supportsOutline: true,
    supportsSolid: true,
    pkg: "@heroicons/react",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function LibraryCard({
  lib,
  selected,
  onClick,
}: {
  lib: (typeof LIBRARIES)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.libraryCard} ${selected ? styles.libraryCardSelected : ""}`}
      onClick={onClick}
    >
      <div className={styles.libraryCardHeader}>
        <span className={styles.libraryName}>{lib.name}</span>
        <span className={styles.libraryPkg}>{lib.pkg}</span>
      </div>
      <p className={styles.libraryDesc}>{lib.description}</p>
      <div className={styles.libraryBadges}>
        {lib.supportsOutline && <span className={styles.badge}>Outline</span>}
        {lib.supportsSolid   && <span className={styles.badge}>Solid</span>}
      </div>
    </button>
  );
}

function StyleToggle({
  value,
  onChange,
  outlineAvailable,
  solidAvailable,
}: {
  value: IconStyle;
  onChange: (v: IconStyle) => void;
  outlineAvailable: boolean;
  solidAvailable: boolean;
}) {
  return (
    <div className={styles.styleToggle}>
      <button
        type="button"
        className={`${styles.styleBtn} ${value === "outline" ? styles.styleBtnActive : ""}`}
        disabled={!outlineAvailable}
        onClick={() => onChange("outline")}
      >
        Outline
      </button>
      <button
        type="button"
        className={`${styles.styleBtn} ${value === "solid" ? styles.styleBtnActive : ""}`}
        disabled={!solidAvailable}
        onClick={() => onChange("solid")}
      >
        Solid
      </button>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function IconsPanel() {
  const { icons, setIcons } = useBuilderStore();
  const activeLib = LIBRARIES.find((l) => l.id === icons.library)!;

  function handleLibraryChange(lib: IconLibrary) {
    const meta = LIBRARIES.find((l) => l.id === lib)!;
    // If the current style is unsupported by the new library, reset to outline
    const style: IconStyle =
      icons.style === "solid" && !meta.supportsSolid ? "outline" : icons.style;
    // Stroke adjustment only makes sense for outline
    const strokeAdjustment = style === "outline" ? icons.strokeAdjustment : false;
    setIcons({ library: lib, style, strokeAdjustment });
  }

  function handleStyleChange(style: IconStyle) {
    const strokeAdjustment = style === "outline" ? icons.strokeAdjustment : false;
    setIcons({ style, strokeAdjustment });
  }

  return (
    <div className={styles.panel}>
      {/* ── Library ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Icon Library</h3>
        <p className={styles.hint}>
          Choose which icon library your project uses. Install only the one you
          select — the others are not required.
        </p>
        <div className={styles.libraryGrid}>
          {LIBRARIES.map((lib) => (
            <LibraryCard
              key={lib.id}
              lib={lib}
              selected={icons.library === lib.id}
              onClick={() => handleLibraryChange(lib.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Style ───────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Icon Style</h3>
        <p className={styles.hint}>
          {activeLib.id === "lucide"
            ? "Lucide only supports outline style."
            : "Choose outline (stroke) or solid (filled) icons."}
        </p>
        <StyleToggle
          value={icons.style}
          onChange={handleStyleChange}
          outlineAvailable={activeLib.supportsOutline}
          solidAvailable={activeLib.supportsSolid}
        />
      </section>

      {/* ── Base size & stroke ──────────────────────────────────────── */}
      {icons.style === "outline" && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Reference Size &amp; Stroke</h3>
          <p className={styles.hint}>
            Set the size at which your base stroke weight is defined. At this
            size no adjustment is made. Lucide and Tabler are designed at 24px
            with a stroke of 2.
          </p>
          <div className={styles.twoCol}>
            <label className={styles.fieldLabel}>
              Base size (px)
              <input
                type="number"
                className={styles.numberInput}
                value={icons.baseSize}
                min={8}
                max={128}
                step={4}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 1) setIcons({ baseSize: v });
                }}
              />
            </label>
            <label className={styles.fieldLabel}>
              Base stroke
              <input
                type="number"
                className={styles.numberInput}
                value={icons.baseStroke}
                min={0.25}
                max={8}
                step={0.25}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v) && v > 0) setIcons({ baseStroke: v });
                }}
              />
            </label>
          </div>
        </section>
      )}

      {/* ── Stroke adjustment ───────────────────────────────────────── */}
      {icons.style === "outline" && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Dynamic Stroke Weight</h3>
          <p className={styles.hint}>
            When enabled, stroke width scales with icon size using the formula{" "}
            <code>stroke = baseStroke × (size / baseSize)^0.50</code>. At the
            base size no adjustment is made.
          </p>
          <label className={styles.toggleRow}>
            <div
              className={`${styles.toggle} ${icons.strokeAdjustment ? styles.toggleOn : ""}`}
              onClick={() => setIcons({ strokeAdjustment: !icons.strokeAdjustment })}
              role="switch"
              aria-checked={icons.strokeAdjustment}
              tabIndex={0}
              onKeyDown={(e) => e.key === " " && setIcons({ strokeAdjustment: !icons.strokeAdjustment })}
            >
              <div className={styles.toggleThumb} />
            </div>
            <span className={styles.toggleLabel}>
              {icons.strokeAdjustment ? "Enabled" : "Disabled"}
            </span>
          </label>
        </section>
      )}

    </div>
  );
}
