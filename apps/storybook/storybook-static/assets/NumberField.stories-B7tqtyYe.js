var j=Object.defineProperty;var a=(d,v)=>j(d,"name",{value:v,configurable:!0});import{N as r,j as e}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const F={title:"Components/Forms/NumberField",component:r,parameters:{layout:"padded",docs:{description:{component:"A numeric input with increment/decrement steppers. Supports `min`/`max`/`step`, `Intl.NumberFormat` via `format`, and the shared field chrome (label, helper text, error)."}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},disabled:{control:"boolean"}}},l={render:a(d=>e.jsx("div",{style:{width:240},children:e.jsx(r,{...d})}),"render"),args:{label:"Quantity",defaultValue:1,min:0,helperText:"Between 0 and 100",max:100}},s={render:a(()=>e.jsx("div",{style:{width:240},children:e.jsx(r,{label:"Price",defaultValue:19.99,step:.01,min:0,format:{style:"currency",currency:"USD"}})}),"render")},t={render:a(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16,width:240},children:[e.jsx(r,{label:"Small",size:"sm",defaultValue:2}),e.jsx(r,{label:"Medium",size:"md",defaultValue:2}),e.jsx(r,{label:"Large",size:"lg",defaultValue:2})]}),"render")},n={render:a(()=>e.jsx("div",{style:{width:240},children:e.jsx(r,{label:"Age",defaultValue:0,min:18,error:"Must be 18 or older"})}),"render")};var i,o,u;l.parameters={...l.parameters,docs:{...(i=l.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div style={{
    width: 240
  }}>
      <NumberField {...args} />
    </div>,
  args: {
    label: "Quantity",
    defaultValue: 1,
    min: 0,
    helperText: "Between 0 and 100",
    max: 100
  }
}`,...(u=(o=l.parameters)==null?void 0:o.docs)==null?void 0:u.source}}};var m,c,p;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 240
  }}>
      <NumberField label="Price" defaultValue={19.99} step={0.01} min={0} format={{
      style: "currency",
      currency: "USD"
    }} />
    </div>
}`,...(p=(c=s.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var b,f,x;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: 240
  }}>
      <NumberField label="Small" size="sm" defaultValue={2} />
      <NumberField label="Medium" size="md" defaultValue={2} />
      <NumberField label="Large" size="lg" defaultValue={2} />
    </div>
}`,...(x=(f=t.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};var y,h,g;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 240
  }}>
      <NumberField label="Age" defaultValue={0} min={18} error="Must be 18 or older" />
    </div>
}`,...(g=(h=n.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};const N=["Default","Currency","Sizes","WithError"];export{s as Currency,l as Default,t as Sizes,n as WithError,N as __namedExportsOrder,F as default};
