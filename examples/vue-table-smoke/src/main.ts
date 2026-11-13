// Get Started's Vue entry, copied verbatim from
// apps/marketing/src/docs/pages/getStartedSnippets.ts, plus the two lines the
// page's later steps add to this file: the data table's stylesheet, after the
// component styles, and the icon registration, below the icon-set import.
//
// `getStartedSnippets.test.ts` there holds this file to the snippet line for
// line, comments and spacing aside, so the docs and this gate change together.
// The quotes and missing semicolons are the docs' own, which is why prettier
// skips this file (.prettierignore).
//
// The table's stylesheet is the line this app was first built to protect: it
// resolves through @ui-organized/vue-table's `exports` map to a file that
// physically lives in @ui-organized/table-core's dist.

// src/main.ts
import { createApp } from 'vue'

import '@ui-organized/tokens/variables.css'  // 1. token baseline
import '@ui-organized/vue/styles.css'        // 2. component styles
import '@ui-organized/vue-table/styles.css'   // after the component styles
import './styles/theme.css'                  // 3. your theme, last so it wins
import './style.css'                         // 4. your own layout

import '@ui-organized/vue/icons/lucide'      // registers your icon set
import { registerIcons } from '@ui-organized/vue/icons/lucide'
import { ChevronDown, RefreshCw, Trash } from '@lucide/vue'

registerIcons({ ChevronDown, RefreshCw, Trash })

import App from './App.vue'

createApp(App).mount('#app')
