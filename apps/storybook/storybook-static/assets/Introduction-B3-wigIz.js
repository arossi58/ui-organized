import{u as r,j as e,M as t}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const o="https://www.npmjs.com/package/@ui-organized/react",a="https://www.figma.com/community",c="https://github.com/arossi58/ui-organized";function i(s){const n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[`
`,`
`,e.jsx(t,{title:"Introduction"}),`
`,e.jsx(n.h1,{id:"ui-organized",children:"UI Organized"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"UI Organized is an open-source, token-driven design system ecosystem."}),` A
single theme config drives everything — design and code — so a brand colour
chosen once shows up identically in Figma, in the component library, and on the
products built with it. This Storybook is the live component reference; it's
itself built with the system.`]}),`
`,e.jsx(n.h2,{id:"the-ecosystem",children:"The ecosystem"}),`
`,e.jsx(n.p,{children:"One config flows through every layer:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`theme config
   │   (@ui-organized/schema — Zod-validated shape)
   ▼
design tokens  ──►  generation utils  ──►  React components
(@ui-organized/tokens)   (@ui-organized/utils)        (@ui-organized/react, on Base UI)
   │                                          ▲
   └──►  Figma plugin  ·  theme builder  ·  Vite plugin (@ui-organized/react-vite)
`})}),`
`,e.jsx(n.h3,{id:"published-packages",children:"Published packages"}),`
`,e.jsxs(n.p,{children:[`| Package | Role |
| --- | --- |
| `,e.jsx(n.code,{children:"@ui-organized/react"}),` | React component library, built on Base UI |
| `,e.jsx(n.code,{children:"@ui-organized/tokens"}),` | Design tokens — typed exports + generated CSS variables |
| `,e.jsx(n.code,{children:"@ui-organized/schema"}),` | Zod schema / types for the theme config |
| `,e.jsx(n.code,{children:"@ui-organized/utils"}),` | Colour, type-scale, spacing & semantic-token utilities |
| `,e.jsx(n.code,{children:"@ui-organized/react-vite"})," | Vite plugin that builds & injects theme tokens |"]}),`
`,e.jsx(n.h3,{id:"tools",children:"Tools"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Figma plugin"})," — pushes the same config into Figma as variables, modes, and styles, keeping design and code in lockstep."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Theme builder"})," — a web tool to pick a brand + neutral and preview the whole system live, then export the tokens."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"This Storybook"})," — white-labeled component docs (also embedded in the marketing site under ",e.jsx(n.strong,{children:"Docs"}),")."]}),`
`]}),`
`,e.jsx(n.h2,{id:"what-makes-it-better",children:"What makes it better"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"One source of truth."})," Components reference semantic ",e.jsx(n.em,{children:"roles"}),", not hexes. Re-theme by swapping the brand/neutral family — every surface, border, and control follows. See ",e.jsx(n.a,{href:"?path=/docs/foundations-color--docs",children:"Foundations → Color"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Design ↔ code parity."})," The Figma plugin emits the ",e.jsx(n.em,{children:"same"})," config the code consumes, so there's no hand-translation drift between the two."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Accessible by construction."})," Brand steps are contrast-checked against on-brand text, and light/dark are first-class — each token carries its own assignment per mode."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Framework-agnostic foundation."})," Tokens ship as plain CSS variables and typed exports; the React library is one consumer, not the boundary."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Built on Base UI."})," Behaviour, focus management, and accessibility come from a robust headless layer; the design system owns only the look."]}),`
`]}),`
`,e.jsx(n.h2,{id:"resources",children:"Resources"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsx("a",{href:o,target:"_blank",rel:"noreferrer",children:"npm — @ui-organized packages"}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx("a",{href:a,target:"_blank",rel:"noreferrer",children:"Figma — design library"})," ",e.jsx(n.em,{children:"(placeholder — drop in the published URL)"})]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx("a",{href:c,target:"_blank",rel:"noreferrer",children:"GitHub — source & docs"}),`
`]}),`
`]}),`
`,e.jsxs(n.p,{children:["Browse ",e.jsx(n.strong,{children:"Foundations"})," for the token reference, or ",e.jsx(n.strong,{children:"Components"})," for the library."]})]})}function h(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{a as FIGMA,c as GITHUB,o as NPM,h as default};
