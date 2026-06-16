var q=Object.defineProperty;var n=(A,U)=>q(A,"name",{value:U,configurable:!0});import{C as a,j as e}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const _={title:"Components/Forms/Checkbox",component:a,parameters:{layout:"padded",docs:{description:{component:"Checkbox is a labelled toggle for boolean input; use `label` for the caption, `checked` / `defaultChecked` for state, `indeterminate` for a partial state, and `disabled` / `required` for form behavior."}}},argTypes:{label:{control:"text"},checked:{control:"boolean"},indeterminate:{control:"boolean"},disabled:{control:"boolean"},required:{control:"boolean"}}},d={args:{label:"Accept terms and conditions"}},l={args:{label:"Checked state",defaultChecked:!0}},c={args:{label:"Indeterminate state",indeterminate:!0}},r={parameters:{docs:{source:{code:`
<Checkbox label="Disabled unchecked" disabled />
<Checkbox label="Disabled checked" disabled defaultChecked />
`.trim()}}},render:n(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(a,{label:"Disabled unchecked",disabled:!0}),e.jsx(a,{label:"Disabled checked",disabled:!0,defaultChecked:!0})]}),"render")},s={parameters:{docs:{source:{code:`
<Checkbox label="Unchecked" />
<Checkbox label="Checked" defaultChecked />
<Checkbox label="Indeterminate" indeterminate />
<Checkbox label="Disabled unchecked" disabled />
<Checkbox label="Disabled checked" disabled defaultChecked />
`.trim()}}},render:n(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(a,{label:"Unchecked"}),e.jsx(a,{label:"Checked",defaultChecked:!0}),e.jsx(a,{label:"Indeterminate",indeterminate:!0}),e.jsx(a,{label:"Disabled unchecked",disabled:!0}),e.jsx(a,{label:"Disabled checked",disabled:!0,defaultChecked:!0})]}),"render")},t={args:{}};var o,i,b;d.parameters={...d.parameters,docs:{...(o=d.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    label: "Accept terms and conditions"
  }
}`,...(b=(i=d.parameters)==null?void 0:i.docs)==null?void 0:b.source}}};var h,u,k;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: "Checked state",
    defaultChecked: true
  }
}`,...(k=(u=l.parameters)==null?void 0:u.docs)==null?void 0:k.source}}};var m,p,x;c.parameters={...c.parameters,docs:{...(m=c.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: "Indeterminate state",
    indeterminate: true
  }
}`,...(x=(p=c.parameters)==null?void 0:p.docs)==null?void 0:x.source}}};var C,f,D;r.parameters={...r.parameters,docs:{...(C=r.parameters)==null?void 0:C.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Checkbox label="Disabled unchecked" disabled />
<Checkbox label="Disabled checked" disabled defaultChecked />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }}>
      <Checkbox label="Disabled unchecked" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </div>
}`,...(D=(f=r.parameters)==null?void 0:f.docs)==null?void 0:D.source}}};var g,j,y;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Checkbox label="Unchecked" />
<Checkbox label="Checked" defaultChecked />
<Checkbox label="Indeterminate" indeterminate />
<Checkbox label="Disabled unchecked" disabled />
<Checkbox label="Disabled checked" disabled defaultChecked />
\`.trim()
      }
    }
  },
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
}`,...(y=(j=s.parameters)==null?void 0:j.docs)==null?void 0:y.source}}};var I,S,v;t.parameters={...t.parameters,docs:{...(I=t.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {}
}`,...(v=(S=t.parameters)==null?void 0:S.docs)==null?void 0:v.source}}};const F=["Default","Checked","Indeterminate","Disabled","AllStates","WithoutLabel"];export{s as AllStates,l as Checked,d as Default,r as Disabled,c as Indeterminate,t as WithoutLabel,F as __namedExportsOrder,_ as default};
