/**
 * Get started's code, one copy per framework.
 *
 * Every entry here was checked against a consumer that is really built: the
 * `examples/*-table-smoke` apps and `examples/preview/src/entry-*`. Those are
 * release gates, so when an import order changes there it breaks a build, and
 * this file is where the docs follow. Edit a snippet here only after its
 * consumer agrees.
 *
 * Only what differs lives here. The theme order, mode pinning and fonts are the
 * same for all four libraries and stay inline on the page.
 */
import type { DocFramework } from "@ui-organized/code-connect/browser";

export interface FrameworkSetup {
  install: string;
  /** Icon packages this library has an adapter for, in its own spelling. */
  iconPackages: string[];
  /** Name of the entry file, as the stylesheet table refers to it. */
  entryFile: string;
  entry: string;
  entryLanguage: string;
  /** Rows for the "why it sits there" table, in import order. */
  imports: { path: string; why: string }[];
  iconRegister: string;
  iconConfig: string;
  iconConfigLanguage: string;
  iconUsage: string;
  iconDirect: string;
  app: string;
  appLanguage: string;
  table: { install: string; styles: string };
}

const TOKENS_WHY =
  "The token baseline: primitive ramps plus the semantic layer. Optional if your theme file is self-contained.";
const STYLES_WHY =
  "The component styles.";
const THEME_WHY =
  "Your theme, from the Theme Builder. Last of the stylesheets above. It and the baseline both declare on :root. ";
const OWN_WHY = "Any styling of your own.";

function iconWhy(pkg: string): string {
  return `Not a stylesheet. It registers your icon set. Swap lucide for the set you installed: ${pkg}.`;
}

export const SETUP: Record<DocFramework, FrameworkSetup> = {
  react: {
    install: `npm install @ui-organized/react @ui-organized/tokens`,
    iconPackages: ["lucide-react", "@tabler/icons-react", "@heroicons/react"],
    entryFile: "src/main.tsx",
    entryLanguage: "tsx",
    entry: `// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IconProvider } from '@ui-organized/react'

import '@ui-organized/tokens/variables.css'  // 1. token baseline
import '@ui-organized/react/styles'          // 2. component styles
import './styles/theme.css'                  // 3. your theme, last so it wins
import './index.css'                         // 4. your own layout

import '@ui-organized/react/icons/lucide'    // registers your icon set

import { iconConfig } from './icons'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IconProvider {...iconConfig}>
      <App />
    </IconProvider>
  </StrictMode>,
)`,
    imports: [
      { path: "@ui-organized/tokens/variables.css", why: TOKENS_WHY },
      { path: "@ui-organized/react/styles", why: STYLES_WHY },
      { path: "./styles/theme.css", why: THEME_WHY },
      { path: "./index.css", why: OWN_WHY },
      { path: "@ui-organized/react/icons/lucide", why: iconWhy("tabler or heroicons") },
    ],
    iconRegister: `import { registerIcons } from '@ui-organized/react/icons/lucide'
import { ChevronDown, RefreshCw, Trash2 } from 'lucide-react'

registerIcons({ ChevronDown, RefreshCw, Trash2 })`,
    iconConfigLanguage: "ts",
    iconConfig: `// src/icons.ts
import type { IconConfig } from '@ui-organized/react'

export const iconConfig: IconConfig = {
  library: 'lucide',        // must match the subpath you imported
  style: 'outline',
  strokeAdjustment: true,
  baseSize: 24,
  baseStroke: 2,
}`,
    iconUsage: `import { Button, Icon } from '@ui-organized/react'

<Icon name="chevron-down" />
<Icon name="trash-2" size={16} label="Delete project" />
<Button icon="refresh-cw">Reload</Button>`,
    iconDirect: `import { Sparkles } from 'lucide-react'

<Icon name={Sparkles} size={20} />`,
    appLanguage: "tsx",
    app: `// src/App.tsx
import { Button, Card, Input } from '@ui-organized/react'

export default function App() {
  return (
    <Card>
      <Input label="Email" placeholder="you@example.com" />
      <Button intent="primary">Save</Button>
    </Card>
  )
}`,
    table: {
      install: `npm install @ui-organized/react-table`,
      styles: `import '@ui-organized/react-table/styles'   // after the component styles`,
    },
  },

  svelte: {
    install: `npm install @ui-organized/svelte @ui-organized/tokens`,
    iconPackages: ["@lucide/svelte", "@tabler/icons-svelte"],
    entryFile: "src/main.ts",
    entryLanguage: "ts",
    entry: `// src/main.ts
import { mount } from 'svelte'

import '@ui-organized/tokens/variables.css'  // 1. token baseline
import '@ui-organized/svelte/styles'         // 2. component styles
import './styles/theme.css'                  // 3. your theme, last so it wins
import './app.css'                           // 4. your own layout

import '@ui-organized/svelte/icons/lucide'   // registers your icon set

import App from './App.svelte'

mount(App, { target: document.getElementById('root')! })`,
    imports: [
      { path: "@ui-organized/tokens/variables.css", why: TOKENS_WHY },
      { path: "@ui-organized/svelte/styles", why: STYLES_WHY },
      { path: "./styles/theme.css", why: THEME_WHY },
      { path: "./app.css", why: OWN_WHY },
      { path: "@ui-organized/svelte/icons/lucide", why: iconWhy("tabler") },
    ],
    iconRegister: `import { registerIcons } from '@ui-organized/svelte/icons/lucide'
import { ChevronDown, RefreshCw, Trash } from '@lucide/svelte'

registerIcons({ ChevronDown, RefreshCw, Trash })`,
    iconConfigLanguage: "svelte",
    iconConfig: `<!-- src/App.svelte -->
<script lang="ts">
  import { IconProvider } from '@ui-organized/svelte'
</script>

<IconProvider
  library="lucide"
  style="outline"
  strokeAdjustment
  baseSize={24}
  baseStroke={2}
>
  <!-- the rest of your app -->
</IconProvider>`,
    iconUsage: `<script lang="ts">
  import { Button, Icon } from '@ui-organized/svelte'
</script>

<Icon name="chevron-down" />
<Icon name="trash-2" size={16} label="Delete project" />
<Button icon="refresh-cw">Reload</Button>`,
    iconDirect: `<script lang="ts">
  import { Sparkles } from '@lucide/svelte'
</script>

<Icon name={Sparkles} size={20} />`,
    appLanguage: "svelte",
    app: `<!-- src/App.svelte -->
<script lang="ts">
  import { Button, Card, Input } from '@ui-organized/svelte'
</script>

<Card>
  <Input label="Email" placeholder="you@example.com" />
  <Button intent="primary">Save</Button>
</Card>`,
    table: {
      install: `npm install @ui-organized/svelte-table`,
      styles: `import '@ui-organized/svelte-table/styles'   // after the component styles`,
    },
  },

  vue: {
    install: `npm install @ui-organized/vue @ui-organized/tokens`,
    iconPackages: ["@lucide/vue", "@tabler/icons-vue", "@heroicons/vue"],
    entryFile: "src/main.ts",
    entryLanguage: "ts",
    entry: `// src/main.ts
import { createApp } from 'vue'

import '@ui-organized/tokens/variables.css'  // 1. token baseline
import '@ui-organized/vue/styles'            // 2. component styles
import './styles/theme.css'                  // 3. your theme, last so it wins
import './style.css'                         // 4. your own layout

import '@ui-organized/vue/icons/lucide'      // registers your icon set

import App from './App.vue'

createApp(App).mount('#app')`,
    imports: [
      { path: "@ui-organized/tokens/variables.css", why: TOKENS_WHY },
      { path: "@ui-organized/vue/styles", why: STYLES_WHY },
      { path: "./styles/theme.css", why: THEME_WHY },
      { path: "./style.css", why: OWN_WHY },
      { path: "@ui-organized/vue/icons/lucide", why: iconWhy("tabler or heroicons") },
    ],
    iconRegister: `import { registerIcons } from '@ui-organized/vue/icons/lucide'
import { ChevronDown, RefreshCw, Trash } from '@lucide/vue'

registerIcons({ ChevronDown, RefreshCw, Trash })`,
    iconConfigLanguage: "vue",
    iconConfig: `<!-- src/App.vue -->
<script setup lang="ts">
import { IconProvider } from '@ui-organized/vue'
</script>

<template>
  <!-- icon-style, not style: Vue reserves \`style\` for inline CSS -->
  <IconProvider
    library="lucide"
    icon-style="outline"
    stroke-adjustment
    :base-size="24"
    :base-stroke="2"
  >
    <!-- the rest of your app -->
  </IconProvider>
</template>`,
    iconUsage: `<script setup lang="ts">
import { Button, Icon } from '@ui-organized/vue'
</script>

<template>
  <Icon name="chevron-down" />
  <Icon name="trash-2" :size="16" label="Delete project" />
  <Button icon="refresh-cw">Reload</Button>
</template>`,
    iconDirect: `<script setup lang="ts">
import { Sparkles } from '@lucide/vue'
</script>

<template>
  <Icon :name="Sparkles" :size="20" />
</template>`,
    appLanguage: "vue",
    app: `<!-- src/App.vue -->
<script setup lang="ts">
import { Button, Card, Input } from '@ui-organized/vue'
</script>

<template>
  <Card>
    <Input label="Email" placeholder="you@example.com" />
    <Button intent="primary">Save</Button>
  </Card>
</template>`,
    table: {
      install: `npm install @ui-organized/vue-table`,
      styles: `import '@ui-organized/vue-table/styles'   // after the component styles`,
    },
  },

  angular: {
    install: `npm install @ui-organized/angular @ui-organized/tokens @angular/cdk @angular/forms`,
    iconPackages: ["@ng-icons/lucide", "@ng-icons/tabler-icons", "@ng-icons/heroicons"],
    entryFile: "src/main.ts",
    entryLanguage: "ts",
    entry: `// src/main.ts
import { provideZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideIconConfig } from '@ui-organized/angular'

import '@ui-organized/tokens/variables.css'  // 1. token baseline
import '@angular/cdk/overlay-prebuilt.css'   // 2. the CDK's overlay pane
import '@ui-organized/angular/styles.css'    // 3. component styles
import '@ui-organized/angular/overlay.css'   // 4. overlay stacking
import './styles/theme.css'                  // 5. your theme, last so it wins
import './styles.css'                        // 6. your own layout

import '@ui-organized/angular/icons/lucide'  // registers your icon set

import { iconConfig } from './icons'
import { AppComponent } from './app/app.component'

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection(), provideIconConfig(iconConfig)],
})`,
    imports: [
      { path: "@ui-organized/tokens/variables.css", why: TOKENS_WHY },
      {
        path: "@angular/cdk/overlay-prebuilt.css",
        why: "The CDK's overlay container, where dialogs, menus and popovers render.",
      },
      { path: "@ui-organized/angular/styles.css", why: STYLES_WHY },
      {
        path: "@ui-organized/angular/overlay.css",
        why: "Puts CDK overlays on the design system's z-index scale, so they sit above the page.",
      },
      { path: "./styles/theme.css", why: THEME_WHY },
      { path: "./styles.css", why: OWN_WHY },
      { path: "@ui-organized/angular/icons/lucide", why: iconWhy("tabler or heroicons") },
    ],
    iconRegister: `import { registerIcons } from '@ui-organized/angular/icons/lucide'
import { lucideChevronDown, lucideRefreshCw, lucideTrash2 } from '@ng-icons/lucide'

registerIcons({ lucideChevronDown, lucideRefreshCw, lucideTrash2 })`,
    iconConfigLanguage: "ts",
    iconConfig: `// src/icons.ts
import type { UioIconConfig } from '@ui-organized/angular'

export const iconConfig: Partial<UioIconConfig> = {
  library: 'lucide',        // must match the subpath you imported
  style: 'outline',
  strokeAdjustment: true,
  baseSize: 24,
  baseStroke: 2,
}
// provideIconConfig also accepts a signal if you want to change this at runtime`,
    iconUsage: `<span uioIcon name="chevron-down"></span>
<span uioIcon name="trash-2" [size]="16" label="Delete project"></span>
<button uioButton icon="refresh-cw">Reload</button>`,
    iconDirect: `// in the component class
import { lucideSparkles } from '@ng-icons/lucide'
protected readonly sparkles = lucideSparkles

<!-- in its template: pass it as svg, not name -->
<span uioIcon [svg]="sparkles" [size]="20"></span>`,
    appLanguage: "ts",
    app: `// src/app/app.component.ts
import { Component } from '@angular/core'
import { UioButton, UioCard, UioInput } from '@ui-organized/angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UioButton, UioCard, UioInput],
  template: \`
    <div uioCard>
      <div uioInput label="Email" placeholder="you@example.com"></div>
      <button uioButton intent="primary">Save</button>
    </div>
  \`,
})
export class AppComponent {}`,
    table: {
      install: `npm install @ui-organized/angular-table`,
      styles: `import '@ui-organized/angular-table/styles'   // after the component styles`,
    },
  },
};

/**
 * Angular on Vite needs two things its own builder does for you. Both come from
 * `examples/angular-table-smoke/vite.config.js`, where they are load-bearing.
 */
export const ANGULAR_VITE_CONFIG = `// vite.config.ts
export default {
  resolve: {
    // The CDK's CSS is only exported under 'style'. Listing any condition
    // replaces Vite's defaults, so the others are listed too.
    conditions: ['style', 'module', 'browser', 'development|production'],
  },
  esbuild: {
    tsconfigRaw: {
      // Required: with useDefineForClassFields on, decorated inputs lose their values
      compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false },
    },
  },
}`;

export const ANGULAR_JIT = `import '@angular/compiler'   // first line of main.ts, Vite (JIT) only`;
