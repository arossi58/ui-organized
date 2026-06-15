import{R as n,j as l}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const e=[{value:"free",label:"Free"},{value:"pro",label:"Pro"},{value:"team",label:"Team"},{value:"enterprise",label:"Enterprise",disabled:!0}],N={title:"Components/RadioGroup",component:n,parameters:{layout:"padded"},argTypes:{orientation:{control:"select",options:["vertical","horizontal"]},label:{control:"text"},disabled:{control:"boolean"}}},a={args:{options:e,label:"Select a plan",defaultValue:"pro"}},o={args:{options:e,label:"Select a plan",defaultValue:"free",orientation:"horizontal"}},r={args:{options:e,label:"Select a plan",defaultValue:"pro",disabled:!0}},t={render:()=>l.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"32px"},children:[l.jsx(n,{options:e,label:"Vertical (default)",defaultValue:"free",orientation:"vertical"}),l.jsx(n,{options:e,label:"Horizontal",defaultValue:"free",orientation:"horizontal"})]})};var s,i,p;a.parameters={...a.parameters,docs:{...(s=a.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "pro"
  }
}`,...(p=(i=a.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var c,d,u;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "free",
    orientation: "horizontal"
  }
}`,...(u=(d=o.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var m,f,b;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "pro",
    disabled: true
  }
}`,...(b=(f=r.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};var S,O,x;t.parameters={...t.parameters,docs:{...(S=t.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  }}>
      <RadioGroup options={PLAN_OPTIONS} label="Vertical (default)" defaultValue="free" orientation="vertical" />
      <RadioGroup options={PLAN_OPTIONS} label="Horizontal" defaultValue="free" orientation="horizontal" />
    </div>
}`,...(x=(O=t.parameters)==null?void 0:O.docs)==null?void 0:x.source}}};const V=["Default","Horizontal","Disabled","BothOrientations"];export{t as BothOrientations,a as Default,r as Disabled,o as Horizontal,V as __namedExportsOrder,N as default};
