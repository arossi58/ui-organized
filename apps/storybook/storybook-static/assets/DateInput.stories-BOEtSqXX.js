var P=Object.defineProperty;var p=(B,O)=>P(B,"name",{value:O,configurable:!0});import{D as a,j as e}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const H={title:"Components/Forms/DateInput",component:a,parameters:{layout:"padded",docs:{description:{component:'A date field built on `Input` — a native `<input type="date">` on the field surface with a leading calendar button. On desktop the button opens a design-system calendar popover; on touch devices it defers to the OS-native picker. Accepts native `value` / `min` / `max` (ISO `YYYY-MM-DD`) alongside the shared `label`, `helperText`, `error`, `size`, and `required` / `disabled` props.'}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},helperText:{control:"text"},error:{control:"text"},min:{control:"text"},max:{control:"text"},disabled:{control:"boolean"},required:{control:"boolean"}}},t={args:{label:"Date",size:"md"}},r={args:{label:"Start date",defaultValue:"2026-06-15"}},l={args:{label:"Date of birth",required:!0}},s={args:{label:"Appointment date",helperText:"Bookings open up to 30 days in advance."}},n={args:{label:"Date",error:"Please choose a date."}},o={args:{label:"Date (June 2026 only)",min:"2026-06-01",max:"2026-06-30",helperText:"Only dates in June 2026 can be selected."}},d={parameters:{docs:{source:{code:`
<DateInput size="sm" label="Small" />
<DateInput size="md" label="Medium" />
<DateInput size="lg" label="Large" />
`.trim()}}},render:p(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(a,{size:"sm",label:"Small"}),e.jsx(a,{size:"md",label:"Medium"}),e.jsx(a,{size:"lg",label:"Large"})]}),"render")},i={parameters:{docs:{source:{code:`
<DateInput label="Default" />
<DateInput label="With value" defaultValue="2026-06-15" />
<DateInput label="Required" required />
<DateInput label="With helper" helperText="Bookings open 30 days ahead." />
<DateInput label="Error state" error="Please choose a date." />
<DateInput label="Disabled" defaultValue="2026-06-15" disabled />
`.trim()}}},render:p(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(a,{label:"Default"}),e.jsx(a,{label:"With value",defaultValue:"2026-06-15"}),e.jsx(a,{label:"Required",required:!0}),e.jsx(a,{label:"With helper",helperText:"Bookings open 30 days ahead."}),e.jsx(a,{label:"Error state",error:"Please choose a date."}),e.jsx(a,{label:"Disabled",defaultValue:"2026-06-15",disabled:!0})]}),"render")};var u,c,m;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    label: "Date",
    size: "md"
  }
}`,...(m=(c=t.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var b,x,h;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: "Start date",
    defaultValue: "2026-06-15"
  }
}`,...(h=(x=r.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var D,g,f;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: "Date of birth",
    required: true
  }
}`,...(f=(g=l.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var I,y,S;s.parameters={...s.parameters,docs:{...(I=s.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: "Appointment date",
    helperText: "Bookings open up to 30 days in advance."
  }
}`,...(S=(y=s.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var W,v,z;n.parameters={...n.parameters,docs:{...(W=n.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    label: "Date",
    error: "Please choose a date."
  }
}`,...(z=(v=n.parameters)==null?void 0:v.docs)==null?void 0:z.source}}};var q,j,T;o.parameters={...o.parameters,docs:{...(q=o.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    label: "Date (June 2026 only)",
    min: "2026-06-01",
    max: "2026-06-30",
    helperText: "Only dates in June 2026 can be selected."
  }
}`,...(T=(j=o.parameters)==null?void 0:j.docs)==null?void 0:T.source}}};var V,M,k;d.parameters={...d.parameters,docs:{...(V=d.parameters)==null?void 0:V.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<DateInput size="sm" label="Small" />
<DateInput size="md" label="Medium" />
<DateInput size="lg" label="Large" />
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
      <DateInput size="sm" label="Small" />
      <DateInput size="md" label="Medium" />
      <DateInput size="lg" label="Large" />
    </div>
}`,...(k=(M=d.parameters)==null?void 0:M.docs)==null?void 0:k.source}}};var A,E,R;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<DateInput label="Default" />
<DateInput label="With value" defaultValue="2026-06-15" />
<DateInput label="Required" required />
<DateInput label="With helper" helperText="Bookings open 30 days ahead." />
<DateInput label="Error state" error="Please choose a date." />
<DateInput label="Disabled" defaultValue="2026-06-15" disabled />
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
      <DateInput label="Default" />
      <DateInput label="With value" defaultValue="2026-06-15" />
      <DateInput label="Required" required />
      <DateInput label="With helper" helperText="Bookings open 30 days ahead." />
      <DateInput label="Error state" error="Please choose a date." />
      <DateInput label="Disabled" defaultValue="2026-06-15" disabled />
    </div>
}`,...(R=(E=i.parameters)==null?void 0:E.docs)==null?void 0:R.source}}};const _=["Default","WithValue","Required","WithHelperText","WithError","WithMinMax","AllSizes","AllStates"];export{d as AllSizes,i as AllStates,t as Default,l as Required,n as WithError,s as WithHelperText,o as WithMinMax,r as WithValue,_ as __namedExportsOrder,H as default};
