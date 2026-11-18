// Get Started's `provideIconConfig` step, copied verbatim into the file
// `ng new` generates. Held to the snippet by getStartedSnippets.test.ts in
// apps/marketing; see src/main.ts.

// src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideIconConfig } from '@ui-organized/angular'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // also accepts a signal, to change it at runtime
    provideIconConfig({
      library: 'lucide',        // must match the subpath you imported
      style: 'outline',
      strokeAdjustment: true,
      baseSize: 24,
      baseStroke: 2,
    }),
  ],
}
