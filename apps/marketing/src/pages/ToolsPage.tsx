import { useNavigate, useParams } from "react-router-dom";
import { Sidebar, NavItem, Icon } from "@ui-organized/react";
import { SiteNav } from "../components/chrome/SiteNav";
import { TOOLS, resolveTool } from "../lib/tools";
import "../components/gradient/dot-grid.css";
import "./tools-page.css";

/**
 * Tools — the design-system tool gallery. The marketing nav stays in flow at the
 * top, then the design system's own `Sidebar` (NavItem rail) lets you switch
 * between tools (color palette generator, icon scaler, theme builder, token
 * manager). Each tool lives at `/tools/<id>`; the actual tools are embedded
 * later, so for now the panel shows a placeholder describing the selected tool.
 */
export function ToolsPage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const active = resolveTool(toolId);

  return (
    <div className="tools-page">
      {/* Same flat-surface dot lattice the home hero + docs route sit on. */}
      <div className="tools-page__dots dot-grid" aria-hidden="true" />
      <SiteNav variant="solid" />

      <main className="tools-page__stage" id="main">
        <div className="tools-shell">
          <Sidebar
            navLabel="Tools"
            logo={
              <div className="tools-brand">
                <span className="tools-brand__eyebrow">Design System</span>
                <span className="tools-brand__name">Tools</span>
              </div>
            }
          >
            {TOOLS.map((tool) => (
              <NavItem
                key={tool.id}
                label={tool.name}
                icon={tool.icon}
                selected={tool.id === active.id}
                onClick={() => navigate(`/tools/${tool.id}`)}
              />
            ))}
          </Sidebar>

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
        </div>
      </main>
    </div>
  );
}
