var g=Object.defineProperty;var r=(l,w)=>g(l,"name",{value:w,configurable:!0});import{ax as a,j as e}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const b={title:"Components/Feedback/Meter",component:a,parameters:{layout:"padded",docs:{description:{component:"Shows a static measured value within a known range (disk usage, score) — distinct from Progress, which tracks task completion. `value` is required."}}},argTypes:{variant:{control:"select",options:["default","success","warning","error"]},size:{control:"select",options:["sm","md","lg"]},value:{control:{type:"range",min:0,max:100}}}},t={render:r(l=>e.jsx("div",{style:{width:320},children:e.jsx(a,{...l})}),"render"),args:{value:64,variant:"default",size:"md"}},s={render:r(()=>e.jsx("div",{style:{width:320},children:e.jsx(a,{value:.72,min:0,max:1,label:"Storage used",showValue:!0,format:{style:"percent"}})}),"render")},n={render:r(()=>e.jsxs("div",{style:{width:320,display:"flex",flexDirection:"column",gap:16},children:[e.jsx(a,{value:30,variant:"default",label:"Default",showValue:!0}),e.jsx(a,{value:90,variant:"success",label:"Healthy",showValue:!0}),e.jsx(a,{value:75,variant:"warning",label:"Warning",showValue:!0}),e.jsx(a,{value:95,variant:"error",label:"Critical",showValue:!0})]}),"render")};var o,i,u;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => <div style={{
    width: 320
  }}>
      <Meter {...args} />
    </div>,
  args: {
    value: 64,
    variant: "default",
    size: "md"
  }
}`,...(u=(i=t.parameters)==null?void 0:i.docs)==null?void 0:u.source}}};var d,c,m;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 320
  }}>
      <Meter value={0.72} min={0} max={1} label="Storage used" showValue format={{
      style: "percent"
    }} />
    </div>
}`,...(m=(c=s.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var v,p,h;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 16
  }}>
      <Meter value={30} variant="default" label="Default" showValue />
      <Meter value={90} variant="success" label="Healthy" showValue />
      <Meter value={75} variant="warning" label="Warning" showValue />
      <Meter value={95} variant="error" label="Critical" showValue />
    </div>
}`,...(h=(p=n.parameters)==null?void 0:p.docs)==null?void 0:h.source}}};const V=["Default","WithLabel","Variants"];export{t as Default,n as Variants,s as WithLabel,V as __namedExportsOrder,b as default};
