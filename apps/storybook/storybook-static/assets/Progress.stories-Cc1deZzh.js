var S=Object.defineProperty;var s=(l,b)=>S(l,"name",{value:b,configurable:!0});import{ay as r,j as e}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const k={title:"Components/Feedback/Progress",component:r,parameters:{layout:"padded",docs:{description:{component:"A horizontal progress bar. Pass `value` (or `null` for indeterminate), and use `variant`, `size`, `label`, and `showValue`."}}},argTypes:{variant:{control:"select",options:["default","success","warning","error"]},size:{control:"select",options:["sm","md","lg"]},value:{control:{type:"range",min:0,max:100}}}},a={render:s(l=>e.jsx("div",{style:{width:320},children:e.jsx(r,{...l})}),"render"),args:{value:60,variant:"default",size:"md"}},n={render:s(()=>e.jsx("div",{style:{width:320},children:e.jsx(r,{value:72,label:"Uploading…",showValue:!0})}),"render")},t={render:s(()=>e.jsxs("div",{style:{width:320,display:"flex",flexDirection:"column",gap:16},children:[e.jsx(r,{value:40,variant:"default"}),e.jsx(r,{value:100,variant:"success"}),e.jsx(r,{value:80,variant:"warning"}),e.jsx(r,{value:25,variant:"error"})]}),"render")},o={render:s(()=>e.jsxs("div",{style:{width:320,display:"flex",flexDirection:"column",gap:16},children:[e.jsx(r,{value:60,size:"sm"}),e.jsx(r,{value:60,size:"md"}),e.jsx(r,{value:60,size:"lg"})]}),"render")},i={render:s(()=>e.jsx("div",{style:{width:320},children:e.jsx(r,{value:null,label:"Working…"})}),"render")};var d,c,u;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: args => <div style={{
    width: 320
  }}>
      <Progress {...args} />
    </div>,
  args: {
    value: 60,
    variant: "default",
    size: "md"
  }
}`,...(u=(c=a.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var v,m,p;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 320
  }}>
      <Progress value={72} label="Uploading…" showValue />
    </div>
}`,...(p=(m=n.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var g,x,h;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 16
  }}>
      <Progress value={40} variant="default" />
      <Progress value={100} variant="success" />
      <Progress value={80} variant="warning" />
      <Progress value={25} variant="error" />
    </div>
}`,...(h=(x=t.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var f,y,j;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 16
  }}>
      <Progress value={60} size="sm" />
      <Progress value={60} size="md" />
      <Progress value={60} size="lg" />
    </div>
}`,...(j=(y=o.parameters)==null?void 0:y.docs)==null?void 0:j.source}}};var w,z,P;i.parameters={...i.parameters,docs:{...(w=i.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 320
  }}>
      <Progress value={null} label="Working…" />
    </div>
}`,...(P=(z=i.parameters)==null?void 0:z.docs)==null?void 0:P.source}}};const E=["Default","WithLabel","Variants","Sizes","Indeterminate"];export{a as Default,i as Indeterminate,o as Sizes,t as Variants,n as WithLabel,E as __namedExportsOrder,k as default};
