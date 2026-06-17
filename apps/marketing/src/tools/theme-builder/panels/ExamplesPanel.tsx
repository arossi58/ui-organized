import { useBuilderStore, type ExampleId } from "../state/themeState";
import styles from "./ExamplesPanel.module.css";

const EXAMPLES: { id: ExampleId; name: string; description: string }[] = [
  { id: "dashboard", name: "Dashboard",      description: "Sidebar nav, stat cards, and a recent-activity table." },
  { id: "form",      name: "Form & Settings", description: "A profile form with inputs, selects, and switches." },
  { id: "ecommerce", name: "E-commerce",     description: "Product grid with a filters rail and cart." },
  { id: "marketing", name: "Marketing site", description: "Landing page with hero, features, and pricing." },
];

export function ExamplesPanel() {
  const { activeExample, setActiveExample } = useBuilderStore();

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Examples</h3>
        <p className={styles.hint}>
          See your theme applied to real-world layouts. Pick a page to preview —
          every screen is built entirely from the design-system components.
        </p>

        <div className={styles.list}>
          {EXAMPLES.map((ex) => {
            const selected = activeExample === ex.id;
            return (
              <button
                key={ex.id}
                type="button"
                className={`${styles.item} ${selected ? styles.itemSelected : ""}`}
                aria-pressed={selected}
                onClick={() => setActiveExample(ex.id)}
              >
                <span className={styles.itemName}>{ex.name}</span>
                <span className={styles.itemDesc}>{ex.description}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
