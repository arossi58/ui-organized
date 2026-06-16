var O=Object.defineProperty;var r=(a,S)=>O(a,"name",{value:S,configurable:!0});import{aC as s,j as e}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const L="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=faces",b={title:"Components/Data Display/Avatar",component:s,parameters:{layout:"padded",docs:{description:{component:"Represents a user with an image, deriving initials from `name` (or a user icon) when no image is available. Control `size` and `shape`."}}},argTypes:{size:{control:"select",options:["xs","sm","md","lg","xl"]},shape:{control:"select",options:["circle","rounded","square"]}}},n={args:{src:L,name:"Ada Lovelace",size:"md",shape:"circle"}},o={render:r(()=>e.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[e.jsx(s,{name:"Ada Lovelace"}),e.jsx(s,{name:"Grace Hopper"}),e.jsx(s,{name:"Linus"})]}),"render")},c={render:r(()=>e.jsx(s,{size:"lg"}),"render")},t={render:r(()=>e.jsx("div",{style:{display:"flex",gap:12,alignItems:"center"},children:["xs","sm","md","lg","xl"].map(a=>e.jsx(s,{name:"Ada Lovelace",size:a},a))}),"render")},i={render:r(()=>e.jsx("div",{style:{display:"flex",gap:12,alignItems:"center"},children:["circle","rounded","square"].map(a=>e.jsx(s,{src:L,name:"Ada Lovelace",size:"lg",shape:a},a))}),"render")};var l,d,p;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    src: PHOTO,
    name: "Ada Lovelace",
    size: "md",
    shape: "circle"
  }
}`,...(p=(d=n.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var m,g,u;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12,
    alignItems: "center"
  }}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Linus" />
    </div>
}`,...(u=(g=o.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};var v,x,h;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <Avatar size="lg" />
}`,...(h=(x=c.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var y,A,f;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12,
    alignItems: "center"
  }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map(size => <Avatar key={size} name="Ada Lovelace" size={size} />)}
    </div>
}`,...(f=(A=t.parameters)==null?void 0:A.docs)==null?void 0:f.source}}};var z,I,j;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12,
    alignItems: "center"
  }}>
      {(["circle", "rounded", "square"] as const).map(shape => <Avatar key={shape} src={PHOTO} name="Ada Lovelace" size="lg" shape={shape} />)}
    </div>
}`,...(j=(I=i.parameters)==null?void 0:I.docs)==null?void 0:j.source}}};const q=["WithImage","Initials","IconFallback","Sizes","Shapes"];export{c as IconFallback,o as Initials,i as Shapes,t as Sizes,n as WithImage,q as __namedExportsOrder,b as default};
