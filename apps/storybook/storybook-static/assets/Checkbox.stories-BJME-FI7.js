import{e as a,j as e}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const E={title:"Components/Checkbox",component:a,parameters:{layout:"padded"},argTypes:{label:{control:"text"},checked:{control:"boolean"},indeterminate:{control:"boolean"},disabled:{control:"boolean"},required:{control:"boolean"}}},r={args:{label:"Accept terms and conditions"}},s={args:{label:"Checked state",defaultChecked:!0}},t={args:{label:"Indeterminate state",indeterminate:!0}},d={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(a,{label:"Disabled unchecked",disabled:!0}),e.jsx(a,{label:"Disabled checked",disabled:!0,defaultChecked:!0})]})},l={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(a,{label:"Unchecked"}),e.jsx(a,{label:"Checked",defaultChecked:!0}),e.jsx(a,{label:"Indeterminate",indeterminate:!0}),e.jsx(a,{label:"Disabled unchecked",disabled:!0}),e.jsx(a,{label:"Disabled checked",disabled:!0,defaultChecked:!0})]})},n={args:{}};var c,o,i;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    label: "Accept terms and conditions"
  }
}`,...(i=(o=r.parameters)==null?void 0:o.docs)==null?void 0:i.source}}};var b,u,m;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: "Checked state",
    defaultChecked: true
  }
}`,...(m=(u=s.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var p,h,x;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: "Indeterminate state",
    indeterminate: true
  }
}`,...(x=(h=t.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var k,C,f;d.parameters={...d.parameters,docs:{...(k=d.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }}>
      <Checkbox label="Disabled unchecked" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </div>
}`,...(f=(C=d.parameters)==null?void 0:C.docs)==null?void 0:f.source}}};var g,D,j;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled unchecked" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </div>
}`,...(j=(D=l.parameters)==null?void 0:D.docs)==null?void 0:j.source}}};var y,S,v;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {}
}`,...(v=(S=n.parameters)==null?void 0:S.docs)==null?void 0:v.source}}};const L=["Default","Checked","Indeterminate","Disabled","AllStates","WithoutLabel"];export{l as AllStates,s as Checked,r as Default,d as Disabled,t as Indeterminate,n as WithoutLabel,L as __namedExportsOrder,E as default};
