var v=Object.defineProperty;var t=(o,g)=>v(o,"name",{value:g,configurable:!0});import{ag as s,j as e,ah as m,ai as h}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const b={title:"Components/Overlay/Popover",component:s,parameters:{layout:"centered",docs:{description:{component:"A floating surface anchored to a trigger. Compose `<Popover>` with `<PopoverTrigger>` and `<PopoverContent>` (which accepts `side`, `align`, `sideOffset`, and `showArrow`)."}}}},r={render:t(()=>e.jsxs(s,{children:[e.jsx(m,{className:"btn btn--secondary btn--md",children:"Open popover"}),e.jsxs(h,{showArrow:!0,style:{maxWidth:260},children:[e.jsx("h4",{style:{margin:"0 0 8px",fontSize:"var(--type-size-body-large)"},children:"Dimensions"}),e.jsx("p",{style:{margin:0,color:"var(--color-text-text-secondary)",fontSize:"var(--type-size-body-small)"},children:"Set the width and height of the selected layer."})]})]}),"render")},n={render:t(()=>e.jsx("div",{style:{display:"flex",gap:12},children:["top","right","bottom","left"].map(o=>e.jsxs(s,{children:[e.jsx(m,{className:"btn btn--secondary btn--md",children:o}),e.jsxs(h,{side:o,showArrow:!0,children:["Positioned on the ",o,"."]})]},o))}),"render")};var a,i,d;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`{
  render: () => <Popover>
      <PopoverTrigger className="btn btn--secondary btn--md">Open popover</PopoverTrigger>
      <PopoverContent showArrow style={{
      maxWidth: 260
    }}>
        <h4 style={{
        margin: "0 0 8px",
        fontSize: "var(--type-size-body-large)"
      }}>Dimensions</h4>
        <p style={{
        margin: 0,
        color: "var(--color-text-text-secondary)",
        fontSize: "var(--type-size-body-small)"
      }}>
          Set the width and height of the selected layer.
        </p>
      </PopoverContent>
    </Popover>
}`,...(d=(i=r.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};var p,c,l;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12
  }}>
      {(["top", "right", "bottom", "left"] as const).map(side => <Popover key={side}>
          <PopoverTrigger className="btn btn--secondary btn--md">{side}</PopoverTrigger>
          <PopoverContent side={side} showArrow>
            Positioned on the {side}.
          </PopoverContent>
        </Popover>)}
    </div>
}`,...(l=(c=n.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};const f=["Default","Sides"];export{r as Default,n as Sides,f as __namedExportsOrder,b as default};
