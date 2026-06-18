var y=Object.defineProperty;var o=(C,j)=>y(C,"name",{value:j,configurable:!0});import{f as a,j as e}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const q={title:"Components/Forms/Switch",component:a,parameters:{layout:"padded",docs:{description:{component:"Switch is an on/off toggle for an immediate setting; use `label` for the caption, `checked` / `defaultChecked` for state, and `disabled` / `required` for form behavior."}}},argTypes:{label:{control:"text"},checked:{control:"boolean"},disabled:{control:"boolean"},required:{control:"boolean"}}},l={args:{label:"Enable notifications"}},s={args:{label:"Dark mode",defaultChecked:!0}},t={parameters:{docs:{source:{code:`
<Switch label="Disabled off" disabled />
<Switch label="Disabled on" disabled defaultChecked />
`.trim()}}},render:o(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(a,{label:"Disabled off",disabled:!0}),e.jsx(a,{label:"Disabled on",disabled:!0,defaultChecked:!0})]}),"render")},d={parameters:{docs:{source:{code:`
<Switch label="Off state" />
<Switch label="On state" defaultChecked />
<Switch label="Disabled off" disabled />
<Switch label="Disabled on" disabled defaultChecked />
`.trim()}}},render:o(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(a,{label:"Off state"}),e.jsx(a,{label:"On state",defaultChecked:!0}),e.jsx(a,{label:"Disabled off",disabled:!0}),e.jsx(a,{label:"Disabled on",disabled:!0,defaultChecked:!0})]}),"render")},r={args:{}};var n,i,c;l.parameters={...l.parameters,docs:{...(n=l.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    label: "Enable notifications"
  }
}`,...(c=(i=l.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var b,f,u;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: "Dark mode",
    defaultChecked: true
  }
}`,...(u=(f=s.parameters)==null?void 0:f.docs)==null?void 0:u.source}}};var p,m,h;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Switch label="Disabled off" disabled />
<Switch label="Disabled on" disabled defaultChecked />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }}>
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
}`,...(h=(m=t.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};var S,D,x;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Switch label="Off state" />
<Switch label="On state" defaultChecked />
<Switch label="Disabled off" disabled />
<Switch label="Disabled on" disabled defaultChecked />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }}>
      <Switch label="Off state" />
      <Switch label="On state" defaultChecked />
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
}`,...(x=(D=d.parameters)==null?void 0:D.docs)==null?void 0:x.source}}};var k,w,g;r.parameters={...r.parameters,docs:{...(k=r.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {}
}`,...(g=(w=r.parameters)==null?void 0:w.docs)==null?void 0:g.source}}};const A=["Default","Checked","Disabled","AllStates","WithoutLabel"];export{d as AllStates,s as Checked,l as Default,t as Disabled,r as WithoutLabel,A as __namedExportsOrder,q as default};
