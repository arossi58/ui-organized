// Get Started's Angular CLI entry, copied verbatim from
// apps/marketing/src/docs/pages/getStartedSnippets.ts, plus the icon
// registration its "Set up icons" step adds below the icon-set import. The
// stylesheets are not here: the Angular CLI takes them in angular.json.
//
// `getStartedSnippets.test.ts` there holds this file, app/app.config.ts and
// angular.json's `styles` to the snippets, comments and spacing aside, so the
// docs and this gate change together. The quotes and missing semicolons are the
// docs' own, which is why prettier skips this file (.prettierignore).

// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { App } from './app/app'

import '@ui-organized/angular/icons/lucide'   // registers your icon set
import { registerIcons } from '@ui-organized/angular/icons/lucide'
import { lucideChevronDown, lucideRefreshCw, lucideTrash2 } from '@ng-icons/lucide'

registerIcons({ lucideChevronDown, lucideRefreshCw, lucideTrash2 })

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err))
