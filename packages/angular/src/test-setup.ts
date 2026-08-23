/**
 * Angular's TestBed, compiling components at runtime in jsdom.
 *
 * `@angular/compiler` is imported for its side effect: it installs the JIT
 * compiler, which is what lets a `@Component` decorator become a real component
 * without an Angular build step. That is the whole reason this package needs no
 * Angular bundler plugin — see `vitest.config.ts`.
 */
import "@angular/compiler";
import { getTestBed } from "@angular/core/testing";
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from "@angular/platform-browser/testing";

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
