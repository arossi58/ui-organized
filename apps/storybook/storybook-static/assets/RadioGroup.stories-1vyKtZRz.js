var R=Object.defineProperty;var i=(N,v)=>R(N,"name",{value:v,configurable:!0});import{R as n,j as t}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const e=[{value:"free",label:"Free"},{value:"pro",label:"Pro"},{value:"team",label:"Team"},{value:"enterprise",label:"Enterprise",disabled:!0}],G={title:"Components/Forms/RadioGroup",component:n,parameters:{layout:"padded",docs:{description:{component:"RadioGroup lets the user pick one option from a set; pass `options` (each with `value`, `label`, and optional `disabled`), a group `label`, `defaultValue` / `value` for selection, and `orientation` to lay items out vertically or horizontally."}}},argTypes:{orientation:{control:"select",options:["vertical","horizontal"]},label:{control:"text"},disabled:{control:"boolean"}}},a={parameters:{docs:{source:{code:`
<RadioGroup options={PLAN_OPTIONS} label="Select a plan" defaultValue="pro" />
`.trim()}}},args:{options:e,label:"Select a plan",defaultValue:"pro"}},o={parameters:{docs:{source:{code:`
<RadioGroup options={PLAN_OPTIONS} label="Select a plan" defaultValue="free" orientation="horizontal" />
`.trim()}}},args:{options:e,label:"Select a plan",defaultValue:"free",orientation:"horizontal"}},l={parameters:{docs:{source:{code:`
<RadioGroup options={PLAN_OPTIONS} label="Select a plan" defaultValue="pro" disabled />
`.trim()}}},args:{options:e,label:"Select a plan",defaultValue:"pro",disabled:!0}},r={parameters:{docs:{source:{code:`
const options = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
  { value: "enterprise", label: "Enterprise", disabled: true },
];

<RadioGroup options={options} label="Vertical (default)" defaultValue="free" orientation="vertical" />
<RadioGroup options={options} label="Horizontal" defaultValue="free" orientation="horizontal" />
`.trim()}}},render:i(()=>t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"32px"},children:[t.jsx(n,{options:e,label:"Vertical (default)",defaultValue:"free",orientation:"vertical"}),t.jsx(n,{options:e,label:"Horizontal",defaultValue:"free",orientation:"horizontal"})]}),"render")};var s,p,u;a.parameters={...a.parameters,docs:{...(s=a.parameters)==null?void 0:s.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<RadioGroup options={PLAN_OPTIONS} label="Select a plan" defaultValue="pro" />
\`.trim()
      }
    }
  },
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "pro"
  }
}`,...(u=(p=a.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var d,c,m;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<RadioGroup options={PLAN_OPTIONS} label="Select a plan" defaultValue="free" orientation="horizontal" />
\`.trim()
      }
    }
  },
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "free",
    orientation: "horizontal"
  }
}`,...(m=(c=o.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var f,b,S;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<RadioGroup options={PLAN_OPTIONS} label="Select a plan" defaultValue="pro" disabled />
\`.trim()
      }
    }
  },
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "pro",
    disabled: true
  }
}`,...(S=(b=l.parameters)==null?void 0:b.docs)==null?void 0:S.source}}};var O,P,V;r.parameters={...r.parameters,docs:{...(O=r.parameters)==null?void 0:O.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
const options = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
  { value: "enterprise", label: "Enterprise", disabled: true },
];

<RadioGroup options={options} label="Vertical (default)" defaultValue="free" orientation="vertical" />
<RadioGroup options={options} label="Horizontal" defaultValue="free" orientation="horizontal" />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  }}>
      <RadioGroup options={PLAN_OPTIONS} label="Vertical (default)" defaultValue="free" orientation="vertical" />
      <RadioGroup options={PLAN_OPTIONS} label="Horizontal" defaultValue="free" orientation="horizontal" />
    </div>
}`,...(V=(P=r.parameters)==null?void 0:P.docs)==null?void 0:V.source}}};const g=["Default","Horizontal","Disabled","BothOrientations"];export{r as BothOrientations,a as Default,l as Disabled,o as Horizontal,g as __namedExportsOrder,G as default};
