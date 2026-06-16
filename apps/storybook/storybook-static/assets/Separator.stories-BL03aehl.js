var g=Object.defineProperty;var a=(t,m)=>g(t,"name",{value:m,configurable:!0});import{aJ as o,j as n}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const v={title:"Components/Layout/Separator",component:o,parameters:{layout:"padded",docs:{description:{component:"A thin rule that separates content. Use `orientation` for horizontal or vertical, and `spacing` to control the surrounding margin."}}},argTypes:{orientation:{control:"inline-radio",options:["horizontal","vertical"]},spacing:{control:"select",options:["none","sm","md","lg"]}}},r={render:a(t=>n.jsxs("div",{style:{maxWidth:360,color:"var(--color-text-text-secondary)"},children:[n.jsx("p",{style:{margin:0},children:"Section one"}),n.jsx(o,{...t}),n.jsx("p",{style:{margin:0},children:"Section two"})]}),"render"),args:{orientation:"horizontal",spacing:"md"}},e={render:a(()=>n.jsxs("div",{style:{display:"flex",alignItems:"center",height:24,color:"var(--color-text-text-secondary)"},children:[n.jsx("span",{children:"Home"}),n.jsx(o,{orientation:"vertical",spacing:"md"}),n.jsx("span",{children:"Docs"}),n.jsx(o,{orientation:"vertical",spacing:"md"}),n.jsx("span",{children:"Pricing"})]}),"render")};var s,i,c;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: args => <div style={{
    maxWidth: 360,
    color: "var(--color-text-text-secondary)"
  }}>
      <p style={{
      margin: 0
    }}>Section one</p>
      <Separator {...args} />
      <p style={{
      margin: 0
    }}>Section two</p>
    </div>,
  args: {
    orientation: "horizontal",
    spacing: "md"
  }
}`,...(c=(i=r.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var l,p,d;e.parameters={...e.parameters,docs:{...(l=e.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    height: 24,
    color: "var(--color-text-text-secondary)"
  }}>
      <span>Home</span>
      <Separator orientation="vertical" spacing="md" />
      <span>Docs</span>
      <Separator orientation="vertical" spacing="md" />
      <span>Pricing</span>
    </div>
}`,...(d=(p=e.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};const u=["Horizontal","Vertical"];export{r as Horizontal,e as Vertical,u as __namedExportsOrder,v as default};
