import{g as a,j as e}from"./iframe-mpPisOQX.js";import"./preload-helper-C1FmrZbK.js";const y={title:"Components/Switch",component:a,parameters:{layout:"padded"},argTypes:{label:{control:"text"},checked:{control:"boolean"},disabled:{control:"boolean"},required:{control:"boolean"}}},s={args:{label:"Enable notifications"}},l={args:{label:"Dark mode",defaultChecked:!0}},r={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(a,{label:"Disabled off",disabled:!0}),e.jsx(a,{label:"Disabled on",disabled:!0,defaultChecked:!0})]})},t={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(a,{label:"Off state"}),e.jsx(a,{label:"On state",defaultChecked:!0}),e.jsx(a,{label:"Disabled off",disabled:!0}),e.jsx(a,{label:"Disabled on",disabled:!0,defaultChecked:!0})]})},o={args:{}};var d,n,c;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    label: "Enable notifications"
  }
}`,...(c=(n=s.parameters)==null?void 0:n.docs)==null?void 0:c.source}}};var i,u,b;l.parameters={...l.parameters,docs:{...(i=l.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    label: "Dark mode",
    defaultChecked: true
  }
}`,...(b=(u=l.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};var p,m,f;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }}>
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
}`,...(f=(m=r.parameters)==null?void 0:m.docs)==null?void 0:f.source}}};var x,h,D;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(D=(h=t.parameters)==null?void 0:h.docs)==null?void 0:D.source}}};var g,S,k;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {}
}`,...(k=(S=o.parameters)==null?void 0:S.docs)==null?void 0:k.source}}};const w=["Default","Checked","Disabled","AllStates","WithoutLabel"];export{t as AllStates,l as Checked,s as Default,r as Disabled,o as WithoutLabel,w as __namedExportsOrder,y as default};
