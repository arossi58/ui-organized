/**
 * No `treeshake` overrides and no aliases — the point of this app is to be built
 * exactly the way a consumer's would be.
 *
 * The two `tsconfigRaw` options are the exception, and they are not preferences.
 * Angular's decorators need `experimentalDecorators`, and
 * `useDefineForClassFields: false` is load-bearing rather than stylistic — with
 * it on, a decorated field's initializer overwrites what the decorator installed
 * and every component silently loses its inputs. Both are what a real Angular
 * consumer's tsconfig carries; esbuild just has to be told separately.
 */
export default {
  logLevel: "error",

  resolve: {
    /**
     * `style` is for `@angular/cdk/overlay-prebuilt.css`, which the CDK exports
     * under that condition alone. Angular's own builder applies it; Vite does
     * not by default, and the failure is "no known conditions" rather than a
     * missing file, which reads like a broken import. The rest of the list is
     * Vite's default, which naming any condition at all replaces.
     *
     * This is a real consumer requirement rather than a harness workaround —
     * anyone building `@ui-organized/angular` with Vite needs it, so it is
     * written down in the package README too.
     */
    conditions: ["style", "module", "browser", "development|production"],
  },

  esbuild: {
    tsconfigRaw: {
      compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false },
    },
  },
};
