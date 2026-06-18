var x=Object.defineProperty;var o=(n,y)=>x(n,"name",{value:y,configurable:!0});import{aq as e,j as t,ar as g}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const f={title:"Components/Overlay/Tooltip",component:e,parameters:{layout:"centered",docs:{description:{component:"A short hint shown on hover or focus. Wrap a trigger and pass `content`. Use `side`/`align` for placement and an app-level `<TooltipProvider>` to share open/close delays."}}}},s={render:o(()=>t.jsx(e,{content:"Copy to clipboard",children:t.jsx("button",{className:"btn btn--secondary btn--md",children:"Hover me"})}),"render")},r={render:o(()=>t.jsx("div",{style:{display:"flex",gap:12},children:["top","right","bottom","left"].map(n=>t.jsx(e,{content:`On the ${n}`,side:n,children:t.jsx("button",{className:"btn btn--secondary btn--md",children:n})},n))}),"render")},a={render:o(()=>t.jsx(g,{delay:150,closeDelay:0,children:t.jsxs("div",{style:{display:"flex",gap:12},children:[t.jsx(e,{content:"Bold",children:t.jsx("button",{className:"btn btn--ghost btn--md",children:"B"})}),t.jsx(e,{content:"Italic",children:t.jsx("button",{className:"btn btn--ghost btn--md",children:"I"})}),t.jsx(e,{content:"Underline",children:t.jsx("button",{className:"btn btn--ghost btn--md",children:"U"})})]})}),"render")};var l,d,c;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <Tooltip content="Copy to clipboard">
      <button className="btn btn--secondary btn--md">Hover me</button>
    </Tooltip>
}`,...(c=(d=s.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var i,p,b;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12
  }}>
      {(["top", "right", "bottom", "left"] as const).map(side => <Tooltip key={side} content={\`On the \${side}\`} side={side}>
          <button className="btn btn--secondary btn--md">{side}</button>
        </Tooltip>)}
    </div>
}`,...(b=(p=r.parameters)==null?void 0:p.docs)==null?void 0:b.source}}};var m,h,u;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <TooltipProvider delay={150} closeDelay={0}>
      <div style={{
      display: "flex",
      gap: 12
    }}>
        <Tooltip content="Bold">
          <button className="btn btn--ghost btn--md">B</button>
        </Tooltip>
        <Tooltip content="Italic">
          <button className="btn btn--ghost btn--md">I</button>
        </Tooltip>
        <Tooltip content="Underline">
          <button className="btn btn--ghost btn--md">U</button>
        </Tooltip>
      </div>
    </TooltipProvider>
}`,...(u=(h=a.parameters)==null?void 0:h.docs)==null?void 0:u.source}}};const N=["Default","Sides","WithProvider"];export{s as Default,r as Sides,a as WithProvider,N as __namedExportsOrder,f as default};
