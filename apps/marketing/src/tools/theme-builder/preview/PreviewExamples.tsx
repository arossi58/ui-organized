import {
  Sidebar,
  NavItem,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  TextArea,
  Select,
  Switch,
  Checkbox,
  Tag,
  Avatar,
  Meter,
  Progress,
  Range,
  Divider,
  Breadcrumb,
  SearchInput,
  Icon,
} from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import { usePreviewPortalContainer } from "./previewPortal";
import styles from "./PreviewExamples.module.css";

const COUNTRY_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "de", label: "Germany" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

/** A small wordmark used as the app/site logo across examples. */
function Wordmark({ label = "Acme" }: { label?: string }) {
  return (
    <span className={styles.wordmark}>
      <span className={styles.wordmarkDot} />
      {label}
    </span>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Revenue",       value: "$48,260", delta: "+12.4%", variant: "success" as const, meter: 72 },
  { label: "New customers", value: "1,204",   delta: "+4.1%",  variant: "success" as const, meter: 54 },
  { label: "Orders",        value: "862",     delta: "-2.3%",  variant: "error" as const,   meter: 38 },
  { label: "Refund rate",   value: "1.8%",    delta: "+0.2%",  variant: "warning" as const, meter: 18 },
];

const ORDERS = [
  { id: "#10241", name: "Jane Cooper",   status: "Paid",     variant: "success" as const, amount: "$129.00" },
  { id: "#10240", name: "Marcus Lee",    status: "Pending",  variant: "warning" as const, amount: "$59.00" },
  { id: "#10239", name: "Ada Lovelace",  status: "Paid",     variant: "success" as const, amount: "$312.00" },
  { id: "#10238", name: "Grace Hopper",  status: "Refunded", variant: "error" as const,   amount: "$24.00" },
  { id: "#10237", name: "Alan Turing",   status: "Paid",     variant: "success" as const, amount: "$88.00" },
];

function DashboardExample() {
  return (
    <div className={styles.appShell}>
      <div className={styles.sidebarWrap}>
        <Sidebar
          logo={<Wordmark />}
          footer={
            <div className={styles.sidebarUser}>
              <Avatar name="Riley Park" size="sm" />
              <div className={styles.sidebarUserText}>
                <span className={styles.sidebarUserName}>Riley Park</span>
                <span className={styles.sidebarUserMail}>riley@acme.co</span>
              </div>
            </div>
          }
        >
          <NavItem icon="grid" label="Dashboard" selected />
          <NavItem icon="users" label="Customers" />
          <NavItem icon="tag" label="Orders" />
          <NavItem icon="calendar" label="Schedule" />
          <NavItem icon="settings" label="Settings" />
        </Sidebar>
      </div>

      <div className={styles.appMain}>
        <header className={styles.appBar}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>Welcome back — here&apos;s today at a glance.</p>
          </div>
          <div className={styles.appBarActions}>
            <SearchInput size="sm" placeholder="Search…" aria-label="Search" />
            <Button intent="primary" icon="plus">New report</Button>
          </div>
        </header>

        <div className={styles.statRow}>
          {STATS.map((s) => (
            <Card key={s.label} variant="outlined" padding="md" className={styles.statCard}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>{s.value}</span>
              <div className={styles.statFooter}>
                <Tag variant={s.variant} size="sm" emphasized={false}>{s.delta}</Tag>
                <Meter value={s.meter} variant={s.variant === "error" ? "warning" : "default"} size="sm" />
              </div>
            </Card>
          ))}
        </div>

        <div className={styles.dashGrid}>
          <Card variant="outlined" padding="none" className={styles.ordersCard}>
            <CardHeader className={styles.cardHeaderRow}>
              <strong>Recent orders</strong>
              <Button intent="ghost" size="sm">View all</Button>
            </CardHeader>
            <div className={styles.table}>
              {ORDERS.map((o) => (
                <div key={o.id} className={styles.tableRow}>
                  <span className={styles.orderId}>{o.id}</span>
                  <div className={styles.orderCustomer}>
                    <Avatar name={o.name} size="xs" />
                    <span>{o.name}</span>
                  </div>
                  <Tag variant={o.variant} size="sm">{o.status}</Tag>
                  <span className={styles.orderAmount}>{o.amount}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="outlined" padding="md" className={styles.activityCard}>
            <CardHeader className={styles.cardHeaderPlain}><strong>Goals</strong></CardHeader>
            <CardBody className={styles.goalsBody}>
              <div className={styles.goal}>
                <div className={styles.goalLabel}><span>Monthly revenue</span><span>72%</span></div>
                <Progress value={72} />
              </div>
              <div className={styles.goal}>
                <div className={styles.goalLabel}><span>New signups</span><span>54%</span></div>
                <Progress value={54} variant="success" />
              </div>
              <div className={styles.goal}>
                <div className={styles.goalLabel}><span>Support SLA</span><span>38%</span></div>
                <Progress value={38} variant="warning" />
              </div>
              <Divider spacing="sm" />
              <div className={styles.teamRow}>
                <span className={styles.goalLabel}>Team online</span>
                <div className={styles.avatarStack}>
                  <Avatar name="Jane Cooper" size="sm" />
                  <Avatar name="Marcus Lee" size="sm" />
                  <Avatar name="Ada Lovelace" size="sm" />
                  <Avatar name="+3" size="sm" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Form / Settings ──────────────────────────────────────────────────────────

function FormExample({ portal }: { portal: HTMLElement | null }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <Breadcrumb
          items={[{ label: "Home", href: "#" }, { label: "Settings", href: "#" }, { label: "Profile" }]}
        />
        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>Profile settings</h1>
          <p className={styles.pageSubtitle}>Manage how your information appears across the workspace.</p>
        </div>

        <Card variant="outlined" padding="lg" className={styles.formCard}>
          <CardHeader className={styles.cardHeaderPlain}><strong>Personal information</strong></CardHeader>
          <CardBody className={styles.formBody}>
            <div className={styles.formGrid}>
              <Input label="First name" defaultValue="Riley" />
              <Input label="Last name" defaultValue="Park" />
              <Input label="Email" type="email" defaultValue="riley@acme.co" />
              <Select label="Country" options={COUNTRY_OPTIONS} defaultValue="us" portalContainer={portal} />
            </div>
            <TextArea label="Bio" placeholder="Tell us a little about yourself…" resize="vertical" />
          </CardBody>
          <CardFooter className={styles.formFooter}>
            <Button intent="ghost">Cancel</Button>
            <Button intent="primary">Save changes</Button>
          </CardFooter>
        </Card>

        <Card variant="outlined" padding="lg">
          <CardHeader className={styles.cardHeaderPlain}><strong>Notifications</strong></CardHeader>
          <CardBody className={styles.prefBody}>
            <div className={styles.prefRow}>
              <div className={styles.prefText}>
                <span className={styles.prefTitle}>Product updates</span>
                <span className={styles.prefDesc}>News about features and releases.</span>
              </div>
              <Switch defaultChecked aria-label="Product updates" />
            </div>
            <Divider spacing="sm" />
            <div className={styles.prefRow}>
              <div className={styles.prefText}>
                <span className={styles.prefTitle}>Weekly digest</span>
                <span className={styles.prefDesc}>A summary of your account activity.</span>
              </div>
              <Switch defaultChecked aria-label="Weekly digest" />
            </div>
            <Divider spacing="sm" />
            <div className={styles.prefRow}>
              <div className={styles.prefText}>
                <span className={styles.prefTitle}>Marketing emails</span>
                <span className={styles.prefDesc}>Tips, offers, and product news.</span>
              </div>
              <Switch aria-label="Marketing emails" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ─── E-commerce ───────────────────────────────────────────────────────────────

const PRODUCTS = [
  { name: "Aero Runner",    price: "$128", tag: "New",  variant: "info" as const,    hue: 18 },
  { name: "Trail Knit",     price: "$96",  tag: "-20%", variant: "success" as const, hue: 152 },
  { name: "Court Classic",  price: "$110", tag: null,   variant: "info" as const,    hue: 268 },
  { name: "Cloud Slide",    price: "$74",  tag: "New",  variant: "info" as const,    hue: 210 },
  { name: "Summit Boot",    price: "$184", tag: null,   variant: "info" as const,    hue: 38 },
  { name: "Drift Sandal",   price: "$58",  tag: "-15%", variant: "success" as const, hue: 320 },
];

function EcommerceExample({ portal }: { portal: HTMLElement | null }) {
  return (
    <div className={styles.page}>
      <header className={styles.shopBar}>
        <Wordmark label="Sole" />
        <SearchInput size="sm" placeholder="Search products…" aria-label="Search products" className={styles.shopSearch} />
        <div className={styles.shopBarActions}>
          <Select options={SORT_OPTIONS} defaultValue="popular" size="sm" portalContainer={portal} aria-label="Sort" />
          <Button intent="secondary" icon="tag">Cart <Tag variant="info" size="sm">3</Tag></Button>
        </div>
      </header>

      <div className={styles.shopLayout}>
        <aside className={styles.filters}>
          <h3 className={styles.filterTitle}>Category</h3>
          <Checkbox label="Running" defaultChecked />
          <Checkbox label="Lifestyle" />
          <Checkbox label="Trail" />
          <Checkbox label="Sandals" />
          <Divider spacing="md" />
          <h3 className={styles.filterTitle}>Price</h3>
          <Range label="Max price" defaultValue={150} min={0} max={300} formatValue={(v) => `$${v}`} />
          <Divider spacing="md" />
          <Button intent="primary" className={styles.filterApply}>Apply filters</Button>
        </aside>

        <div className={styles.productGrid}>
          {PRODUCTS.map((p) => (
            <Card key={p.name} variant="outlined" padding="none" className={styles.productCard}>
              <div
                className={styles.productImage}
                style={{ background: `linear-gradient(135deg, hsl(${p.hue} 70% 55%), hsl(${p.hue + 30} 65% 42%))` }}
              >
                {p.tag && <span className={styles.productTag}><Tag variant={p.variant} size="sm">{p.tag}</Tag></span>}
              </div>
              <div className={styles.productBody}>
                <div className={styles.productMeta}>
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.productRating}><Icon name="star" size={13} /> 4.8</span>
                </div>
                <div className={styles.productBuy}>
                  <span className={styles.productPrice}>{p.price}</span>
                  <Button intent="primary" size="sm" icon="plus" aria-label={`Add ${p.name} to cart`} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Marketing site ───────────────────────────────────────────────────────────

const FEATURES = [
  { icon: "grid" as const,  title: "Composable",  text: "Every screen is built from the same tokenized primitives." },
  { icon: "star" as const,  title: "Accessible",  text: "WCAG-checked color, focus, and keyboard support by default." },
  { icon: "refresh" as const, title: "Themeable", text: "Re-skin the entire system from one source of truth." },
];

const TIERS = [
  { name: "Starter", price: "$0",  blurb: "For side projects.", features: ["1 project", "Community support", "Core components"], intent: "secondary" as const, featured: false },
  { name: "Pro",     price: "$24", blurb: "For growing teams.", features: ["Unlimited projects", "Priority support", "Theme builder", "Figma sync"], intent: "primary" as const, featured: true },
  { name: "Scale",   price: "$80", blurb: "For organizations.", features: ["SSO & roles", "Audit log", "Dedicated support"], intent: "secondary" as const, featured: false },
];

function MarketingExample() {
  return (
    <div className={styles.page}>
      <nav className={styles.siteNav}>
        <Wordmark label="Lattice" />
        <div className={styles.siteLinks}>
          <a href="#" className={styles.siteLink}>Product</a>
          <a href="#" className={styles.siteLink}>Pricing</a>
          <a href="#" className={styles.siteLink}>Docs</a>
        </div>
        <div className={styles.siteNavActions}>
          <Button intent="ghost" size="sm">Sign in</Button>
          <Button intent="primary" size="sm">Get started</Button>
        </div>
      </nav>

      <section className={styles.hero}>
        <Tag variant="info" emphasized={false}>New · v2 design system</Tag>
        <h1 className={styles.heroTitle}>Design once. Ship everywhere.</h1>
        <p className={styles.heroText}>
          A token-driven component library that keeps product, brand, and code in
          perfect sync — from the first prototype to production.
        </p>
        <div className={styles.heroActions}>
          <Button intent="primary" size="lg" icon="arrow-right" iconPosition="right">Start building</Button>
          <Button intent="secondary" size="lg">Live demo</Button>
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.heroVisualBar} />
          <div className={styles.heroVisualRow}>
            <div className={styles.heroVisualCard} />
            <div className={styles.heroVisualCard} />
            <div className={styles.heroVisualCard} />
          </div>
        </div>
      </section>

      <section className={styles.featureGrid}>
        {FEATURES.map((f) => (
          <Card key={f.title} variant="outlined" padding="lg" className={styles.featureCard}>
            <span className={styles.featureIcon}><Icon name={f.icon} size={20} /></span>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureText}>{f.text}</p>
          </Card>
        ))}
      </section>

      <section className={styles.pricing}>
        <h2 className={styles.sectionHeading}>Simple, scalable pricing</h2>
        <div className={styles.pricingGrid}>
          {TIERS.map((t) => (
            <Card
              key={t.name}
              variant={t.featured ? "elevated" : "outlined"}
              padding="lg"
              className={`${styles.tierCard} ${t.featured ? styles.tierFeatured : ""}`}
            >
              {t.featured && <span className={styles.tierBadge}><Tag variant="info" size="sm">Popular</Tag></span>}
              <span className={styles.tierName}>{t.name}</span>
              <div className={styles.tierPrice}>{t.price}<span className={styles.tierPer}>/mo</span></div>
              <p className={styles.tierBlurb}>{t.blurb}</p>
              <ul className={styles.tierFeatures}>
                {t.features.map((feat) => (
                  <li key={feat}><Icon name="check" size={15} /> {feat}</li>
                ))}
              </ul>
              <Button intent={t.intent} className={styles.tierButton}>Choose {t.name}</Button>
            </Card>
          ))}
        </div>
      </section>

      <footer className={styles.siteFooter}>
        <Wordmark label="Lattice" />
        <span className={styles.footerNote}>© 2026 Lattice Labs. Built with the design system.</span>
      </footer>
    </div>
  );
}

// ─── Switcher ─────────────────────────────────────────────────────────────────

export function PreviewExamples() {
  const { activeExample } = useBuilderStore();
  const portal = usePreviewPortalContainer();

  switch (activeExample) {
    case "dashboard": return <DashboardExample />;
    case "form":      return <FormExample portal={portal} />;
    case "ecommerce": return <EcommerceExample portal={portal} />;
    case "marketing": return <MarketingExample />;
  }
}
