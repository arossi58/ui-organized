var f=Object.defineProperty;var t=(d,S)=>f(d,"name",{value:S,configurable:!0});import{az as r,j as e}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const T={title:"Components/Feedback/Skeleton",component:r,parameters:{layout:"padded",docs:{description:{component:"A shimmering placeholder sized to the eventual content. Use `variant` for shape, `width`/`height` for size, and `lines` for multi-line text."}}},argTypes:{variant:{control:"select",options:["text","circle","rect","rounded"]},animated:{control:"boolean"}}},a={render:t(d=>e.jsx(r,{...d,width:280}),"render"),args:{variant:"text",animated:!0}},n={render:t(()=>e.jsx(r,{variant:"text",lines:4,width:320}),"render")},i={render:t(()=>e.jsxs("div",{style:{display:"flex",gap:24,alignItems:"center"},children:[e.jsx(r,{variant:"circle",width:48,height:48}),e.jsx(r,{variant:"rounded",width:120,height:48}),e.jsx(r,{variant:"rect",width:120,height:48})]}),"render")},s={render:t(()=>e.jsxs("div",{style:{display:"flex",gap:12,width:320,padding:16,border:"1px solid var(--color-border-secondary)",borderRadius:"var(--radius-interactive)"},children:[e.jsx(r,{variant:"circle",width:40,height:40}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:8},children:[e.jsx(r,{variant:"text",width:"60%"}),e.jsx(r,{variant:"text",lines:2})]})]}),"render")};var o,l,c;a.parameters={...a.parameters,docs:{...(o=a.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => <Skeleton {...args} width={280} />,
  args: {
    variant: "text",
    animated: true
  }
}`,...(c=(l=a.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var p,h,x;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <Skeleton variant="text" lines={4} width={320} />
}`,...(x=(h=n.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var m,v,u;i.parameters={...i.parameters,docs:{...(m=i.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 24,
    alignItems: "center"
  }}>
      <Skeleton variant="circle" width={48} height={48} />
      <Skeleton variant="rounded" width={120} height={48} />
      <Skeleton variant="rect" width={120} height={48} />
    </div>
}`,...(u=(v=i.parameters)==null?void 0:v.docs)==null?void 0:u.source}}};var g,w,y;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12,
    width: 320,
    padding: 16,
    border: "1px solid var(--color-border-secondary)",
    borderRadius: "var(--radius-interactive)"
  }}>
      <Skeleton variant="circle" width={40} height={40} />
      <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" lines={2} />
      </div>
    </div>
}`,...(y=(w=s.parameters)==null?void 0:w.docs)==null?void 0:y.source}}};const z=["Text","MultilineText","Shapes","CardPlaceholder"];export{s as CardPlaceholder,n as MultilineText,i as Shapes,a as Text,z as __namedExportsOrder,T as default};
