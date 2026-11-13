// Get Started's Svelte entry, copied verbatim from
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
// resolves through @ui-organized/svelte-table's `exports` map to a file that
// physically lives in @ui-organized/table-core's dist.

// src/main.ts
import { mount } from 'svelte'

import '@ui-organized/tokens/variables.css'  // 1. token baseline
import '@ui-organized/svelte/styles.css'     // 2. component styles
import '@ui-organized/svelte-table/styles.css'   // after the component styles
import './styles/theme.css'                  // 3. your theme, last so it wins
import './app.css'                           // 4. your own layout

import '@ui-organized/svelte/icons/lucide'   // registers your icon set
import { registerIcons } from '@ui-organized/svelte/icons/lucide'
import { ChevronDown, RefreshCw, Trash } from '@lucide/svelte'

registerIcons({ ChevronDown, RefreshCw, Trash })

import App from './App.svelte'

mount(App, { target: document.getElementById('app')! })
