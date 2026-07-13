import { Fragment, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar, NavItem, Icon, useNavContext } from "@ui-organized/react";
import { Monitor } from "lucide-react";
import { TOOLS, resolveTool } from "../lib/tools";
import { TOOL_COMPONENTS } from "../lib/toolComponents";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { trackEvent } from "../lib/analytics";
import "../components/gradient/dot-grid.css";
import "./tools-page.css";

/**
 * Tools — the design-system tool gallery. The marketing nav stays in flow at the
 * top, then the design system's own `Sidebar` (NavItem rail) lets you switch
 * between tools (color palette generator, icon scaler, theme builder, token
 * manager). Each tool lives at `/tools/<id>`; "live" tools render their embedded
 * app in the panel, while the rest show a placeholder describing what's coming.
 */
/**
 * Sidebar group heading + divider (e.g. "Standalone apps"). On the collapsed
 * icon-only rail the label is dropped, leaving just the divider — the label
 * would have nothing to align to. Reads the rail's collapsed state from the DS
 * Navigation context.
 */
function ToolsNavSection({ label }: { label: string }) {
  const { collapsed } = useNavContext();
  return (
    <div className="tools-nav-section" role="presentation">
      {!collapsed && <span className="tools-nav-section__label">{label}</span>}
    </div>
  );
}

export function ToolsPage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const active = resolveTool(toolId);
  const ToolComponent =
    active.status === "live" ? TOOL_COMPONENTS[active.id] : undefined;
  // The tools are interactive, canvas-heavy apps (palette generator, icon
  // scaler, theme builder) built for a wide, precise workspace — they don't fit
  // a phone. On mobile we skip mounting them entirely and show a note to come
  // back on a larger screen.
  const isMobile = useMediaQuery("(max-width: 720px)");

  if (isMobile) {
    return (
      <div className="tools-page">
        <div className="tools-page__dots dot-grid" aria-hidden="true" />
        <main className="tools-page__stage" id="main">
          <div className="tools-note">
            <span className="tools-note__art" aria-hidden="true">
              <Icon name={Monitor} size={40} />
            </span>
            <h1 className="tools-note__title">Best viewed on desktop</h1>
            <p className="tools-note__body">
              The design tools need a larger screen to work well. Open this page
              on a desktop or tablet to try them.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="tools-page">
      {/* Same flat-surface dot lattice the home hero + docs route sit on. */}
      <div className="tools-page__dots dot-grid" aria-hidden="true" />

      <main className="tools-page__stage" id="main">
        <div className="tools-shell">
          <Sidebar navLabel="Tools" collapsible>
            {TOOLS.filter((tool) => !tool.hidden).map((tool, i, visible) => {
              // Open the "Standalone apps" group at the first standalone tool.
              const startsStandaloneGroup =
                tool.standalone && !visible[i - 1]?.standalone;
              return (
                <Fragment key={tool.id}>
                  {startsStandaloneGroup && (
                    <ToolsNavSection label="Standalone apps" />
                  )}
                  <NavItem
                    label={tool.name}
                    icon={tool.icon}
                    selected={tool.id === active.id}
                    onClick={() => {
                      // Only count a deliberate switch to a different tool; the
                      // route change itself still fires a page_view via
                      // usePageTracking.
                      if (tool.id !== active.id) {
                        trackEvent("tool_select", {
                          tool_id: tool.id,
                          tool_status: tool.status,
                        });
                      }
                      navigate(`/tools/${tool.id}`);
                    }}
                  />
                </Fragment>
              );
            })}
          </Sidebar>

          {ToolComponent ? (
            <section
              className="tools-panel tools-panel--embed"
              aria-label={active.name}
            >
              <Suspense
                fallback={
                  <div className="tools-panel__loading">Loading {active.name}…</div>
                }
              >
                <ToolComponent />
              </Suspense>
            </section>
          ) : (
            <section
              className="tools-panel"
              aria-live="polite"
              aria-label={active.name}
            >
              <div className="tools-panel__art">
                <Icon name={active.icon} size={40} />
              </div>
              <p className="tools-panel__status">
                {active.status === "planned" ? "Planned" : "Coming soon"}
              </p>
              <h2 className="tools-panel__title">{active.name}</h2>
              <p className="tools-panel__tagline">{active.tagline}</p>
              <p className="tools-panel__desc">{active.description}</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
