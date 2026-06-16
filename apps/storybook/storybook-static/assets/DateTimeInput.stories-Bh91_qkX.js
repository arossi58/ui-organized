var O=Object.defineProperty;var m=(P,H)=>O(P,"name",{value:H,configurable:!0});import{c as a,j as e}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const w={title:"Components/Forms/DateTimeInput",component:a,parameters:{layout:"padded",docs:{description:{component:'A date-and-time field built on `Input` — a native `<input type="datetime-local">` on the field surface with a leading calendar button. On desktop the button opens a design-system calendar popover with a time field; on touch devices it defers to the OS-native picker. Accepts native `value` / `min` / `max` / `step` (ISO `YYYY-MM-DDTHH:mm`) alongside the shared `label`, `helperText`, `error`, `size`, and `required` / `disabled` props.'}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},helperText:{control:"text"},error:{control:"text"},min:{control:"text"},max:{control:"text"},disabled:{control:"boolean"},required:{control:"boolean"}}},t={args:{label:"Date and time",size:"md"}},r={args:{label:"Starts at",defaultValue:"2026-06-15T09:30"}},l={args:{label:"Meeting time",required:!0}},s={args:{label:"Reminder",helperText:"We'll notify you at this local date and time."}},n={args:{label:"Date and time",error:"Please choose a date and time."}},i={args:{label:"Appointment slot",step:900,defaultValue:"2026-06-15T09:00",helperText:"Slots are available on the quarter hour."}},o={parameters:{docs:{source:{code:`
<DateTimeInput size="sm" label="Small" />
<DateTimeInput size="md" label="Medium" />
<DateTimeInput size="lg" label="Large" />
`.trim()}}},render:m(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(a,{size:"sm",label:"Small"}),e.jsx(a,{size:"md",label:"Medium"}),e.jsx(a,{size:"lg",label:"Large"})]}),"render")},d={parameters:{docs:{source:{code:`
<DateTimeInput label="Default" />
<DateTimeInput label="With value" defaultValue="2026-06-15T09:30" />
<DateTimeInput label="Required" required />
<DateTimeInput label="With helper" helperText="Local date and time." />
<DateTimeInput label="Error state" error="Please choose a date and time." />
<DateTimeInput label="Disabled" defaultValue="2026-06-15T09:30" disabled />
`.trim()}}},render:m(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(a,{label:"Default"}),e.jsx(a,{label:"With value",defaultValue:"2026-06-15T09:30"}),e.jsx(a,{label:"Required",required:!0}),e.jsx(a,{label:"With helper",helperText:"Local date and time."}),e.jsx(a,{label:"Error state",error:"Please choose a date and time."}),e.jsx(a,{label:"Disabled",defaultValue:"2026-06-15T09:30",disabled:!0})]}),"render")};var u,p,c;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    label: "Date and time",
    size: "md"
  }
}`,...(c=(p=t.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};var b,T,h;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: "Starts at",
    defaultValue: "2026-06-15T09:30"
  }
}`,...(h=(T=r.parameters)==null?void 0:T.docs)==null?void 0:h.source}}};var x,D,g;l.parameters={...l.parameters,docs:{...(x=l.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    label: "Meeting time",
    required: true
  }
}`,...(g=(D=l.parameters)==null?void 0:D.docs)==null?void 0:g.source}}};var f,I,S;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: "Reminder",
    helperText: "We'll notify you at this local date and time."
  }
}`,...(S=(I=s.parameters)==null?void 0:I.docs)==null?void 0:S.source}}};var W,v,z;n.parameters={...n.parameters,docs:{...(W=n.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    label: "Date and time",
    error: "Please choose a date and time."
  }
}`,...(z=(v=n.parameters)==null?void 0:v.docs)==null?void 0:z.source}}};var q,y,V;i.parameters={...i.parameters,docs:{...(q=i.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    label: "Appointment slot",
    step: 900,
    defaultValue: "2026-06-15T09:00",
    helperText: "Slots are available on the quarter hour."
  }
}`,...(V=(y=i.parameters)==null?void 0:y.docs)==null?void 0:V.source}}};var j,M,R;o.parameters={...o.parameters,docs:{...(j=o.parameters)==null?void 0:j.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<DateTimeInput size="sm" label="Small" />
<DateTimeInput size="md" label="Medium" />
<DateTimeInput size="lg" label="Large" />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "400px"
  }}>
      <DateTimeInput size="sm" label="Small" />
      <DateTimeInput size="md" label="Medium" />
      <DateTimeInput size="lg" label="Large" />
    </div>
}`,...(R=(M=o.parameters)==null?void 0:M.docs)==null?void 0:R.source}}};var A,E,L;d.parameters={...d.parameters,docs:{...(A=d.parameters)==null?void 0:A.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<DateTimeInput label="Default" />
<DateTimeInput label="With value" defaultValue="2026-06-15T09:30" />
<DateTimeInput label="Required" required />
<DateTimeInput label="With helper" helperText="Local date and time." />
<DateTimeInput label="Error state" error="Please choose a date and time." />
<DateTimeInput label="Disabled" defaultValue="2026-06-15T09:30" disabled />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "400px"
  }}>
      <DateTimeInput label="Default" />
      <DateTimeInput label="With value" defaultValue="2026-06-15T09:30" />
      <DateTimeInput label="Required" required />
      <DateTimeInput label="With helper" helperText="Local date and time." />
      <DateTimeInput label="Error state" error="Please choose a date and time." />
      <DateTimeInput label="Disabled" defaultValue="2026-06-15T09:30" disabled />
    </div>
}`,...(L=(E=d.parameters)==null?void 0:E.docs)==null?void 0:L.source}}};const _=["Default","WithValue","Required","WithHelperText","WithError","FifteenMinuteSteps","AllSizes","AllStates"];export{o as AllSizes,d as AllStates,t as Default,i as FifteenMinuteSteps,l as Required,n as WithError,s as WithHelperText,r as WithValue,_ as __namedExportsOrder,w as default};
