---
"@ui-organized/core": patch
---

Sheet's stylesheet now declares `.sheet__popup` once: the slide timing variables moved into the panel's main rule. Nothing renders differently. The CSS lint gate had not been checking the component stylesheets since they moved into `@ui-organized/core`, and this was the one rule it flagged once it did.
