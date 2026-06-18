var F=Object.defineProperty;var r=(t,p)=>F(t,"name",{value:p,configurable:!0});import{b as a,j as e,r as G}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const Q={title:"Components/Forms/DateRangeInput",component:a,parameters:{layout:"padded",docs:{description:{component:'A from–to date range built from two native `<input type="date">` controls on the Input field surface, under one shared `label`, `helperText`, and `error`. On desktop the calendar buttons open one shared design-system two-month range calendar; on touch devices they defer to the OS-native picker. The two ends auto-constrain each other (the end can\'t precede the start) on top of the optional `min` / `max` bounds. Works controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).'}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},helperText:{control:"text"},error:{control:"text"},min:{control:"text"},max:{control:"text"},disabled:{control:"boolean"},required:{control:"boolean"}}},s={args:{label:"Date range",size:"md"}},l={args:{label:"Trip dates",defaultValue:{start:"2026-06-15",end:"2026-06-22"}}},d={args:{label:"Booking window",required:!0}},o={args:{label:"Reporting period",helperText:"Pick the first and last day to include."}},u={args:{label:"Date range",error:"End date must be on or after the start date."}},i={args:{label:"Date range (2026 only)",min:"2026-01-01",max:"2026-12-31",defaultValue:{start:"2026-06-01",end:"2026-06-30"},helperText:"Only dates within 2026 can be selected."}},c={parameters:{docs:{source:{code:`
<DateRangeInput size="sm" label="Small" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
<DateRangeInput size="md" label="Medium" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
<DateRangeInput size="lg" label="Large" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
`.trim()}}},render:r(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"480px"},children:[e.jsx(a,{size:"sm",label:"Small",defaultValue:{start:"2026-06-15",end:"2026-06-22"}}),e.jsx(a,{size:"md",label:"Medium",defaultValue:{start:"2026-06-15",end:"2026-06-22"}}),e.jsx(a,{size:"lg",label:"Large",defaultValue:{start:"2026-06-15",end:"2026-06-22"}})]}),"render")},g={parameters:{docs:{source:{code:`
<DateRangeInput label="Default" />
<DateRangeInput label="With value" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
<DateRangeInput label="Required" required />
<DateRangeInput label="Error state" error="End date must be on or after the start date." />
<DateRangeInput label="Disabled" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} disabled />
`.trim()}}},render:r(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"480px"},children:[e.jsx(a,{label:"Default"}),e.jsx(a,{label:"With value",defaultValue:{start:"2026-06-15",end:"2026-06-22"}}),e.jsx(a,{label:"Required",required:!0}),e.jsx(a,{label:"Error state",error:"End date must be on or after the start date."}),e.jsx(a,{label:"Disabled",defaultValue:{start:"2026-06-15",end:"2026-06-22"},disabled:!0})]}),"render")},n={parameters:{docs:{source:{code:`
const [range, setRange] = useState<DateRangeValue>({ start: "", end: "" });
const nights =
  range.start && range.end
    ? Math.round(
        (new Date(range.end).getTime() - new Date(range.start).getTime()) / 86_400_000,
      )
    : null;

<DateRangeInput
  label="Stay dates"
  value={range}
  onChange={setRange}
  helperText={nights != null ? nights + " night(s)" : "Pick your check-in and check-out."}
/>
`.trim()}}},render:r(()=>{const[t,p]=G.useState({start:"",end:""}),m=t.start&&t.end?Math.round((new Date(t.end).getTime()-new Date(t.start).getTime())/864e5):null;return e.jsx("div",{style:{maxWidth:"480px"},children:e.jsx(a,{label:"Stay dates",value:t,onChange:p,helperText:m!=null?`${m} night(s)`:"Pick your check-in and check-out."})})},"render")};var h,b,x;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: "Date range",
    size: "md"
  }
}`,...(x=(b=s.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var D,f,R;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: "Trip dates",
    defaultValue: {
      start: "2026-06-15",
      end: "2026-06-22"
    }
  }
}`,...(R=(f=l.parameters)==null?void 0:f.docs)==null?void 0:R.source}}};var y,I,V;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    label: "Booking window",
    required: true
  }
}`,...(V=(I=d.parameters)==null?void 0:I.docs)==null?void 0:V.source}}};var S,T,v;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: "Reporting period",
    helperText: "Pick the first and last day to include."
  }
}`,...(v=(T=o.parameters)==null?void 0:T.docs)==null?void 0:v.source}}};var k,w,z;u.parameters={...u.parameters,docs:{...(k=u.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    label: "Date range",
    error: "End date must be on or after the start date."
  }
}`,...(z=(w=u.parameters)==null?void 0:w.docs)==null?void 0:z.source}}};var W,E,j;i.parameters={...i.parameters,docs:{...(W=i.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    label: "Date range (2026 only)",
    min: "2026-01-01",
    max: "2026-12-31",
    defaultValue: {
      start: "2026-06-01",
      end: "2026-06-30"
    },
    helperText: "Only dates within 2026 can be selected."
  }
}`,...(j=(E=i.parameters)==null?void 0:E.docs)==null?void 0:j.source}}};var q,C,M;c.parameters={...c.parameters,docs:{...(q=c.parameters)==null?void 0:q.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<DateRangeInput size="sm" label="Small" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
<DateRangeInput size="md" label="Medium" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
<DateRangeInput size="lg" label="Large" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "480px"
  }}>
      <DateRangeInput size="sm" label="Small" defaultValue={{
      start: "2026-06-15",
      end: "2026-06-22"
    }} />
      <DateRangeInput size="md" label="Medium" defaultValue={{
      start: "2026-06-15",
      end: "2026-06-22"
    }} />
      <DateRangeInput size="lg" label="Large" defaultValue={{
      start: "2026-06-15",
      end: "2026-06-22"
    }} />
    </div>
}`,...(M=(C=c.parameters)==null?void 0:C.docs)==null?void 0:M.source}}};var _,P,A;g.parameters={...g.parameters,docs:{...(_=g.parameters)==null?void 0:_.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<DateRangeInput label="Default" />
<DateRangeInput label="With value" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
<DateRangeInput label="Required" required />
<DateRangeInput label="Error state" error="End date must be on or after the start date." />
<DateRangeInput label="Disabled" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} disabled />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "480px"
  }}>
      <DateRangeInput label="Default" />
      <DateRangeInput label="With value" defaultValue={{
      start: "2026-06-15",
      end: "2026-06-22"
    }} />
      <DateRangeInput label="Required" required />
      <DateRangeInput label="Error state" error="End date must be on or after the start date." />
      <DateRangeInput label="Disabled" defaultValue={{
      start: "2026-06-15",
      end: "2026-06-22"
    }} disabled />
    </div>
}`,...(A=(P=g.parameters)==null?void 0:P.docs)==null?void 0:A.source}}};var O,B,L,H,$;n.parameters={...n.parameters,docs:{...(O=n.parameters)==null?void 0:O.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
const [range, setRange] = useState<DateRangeValue>({ start: "", end: "" });
const nights =
  range.start && range.end
    ? Math.round(
        (new Date(range.end).getTime() - new Date(range.start).getTime()) / 86_400_000,
      )
    : null;

<DateRangeInput
  label="Stay dates"
  value={range}
  onChange={setRange}
  helperText={nights != null ? nights + " night(s)" : "Pick your check-in and check-out."}
/>
\`.trim()
      }
    }
  },
  render: () => {
    const [range, setRange] = useState<DateRangeValue>({
      start: "",
      end: ""
    });
    const nights = range.start && range.end ? Math.round((new Date(range.end).getTime() - new Date(range.start).getTime()) / 86_400_000) : null;
    return <div style={{
      maxWidth: "480px"
    }}>
        <DateRangeInput label="Stay dates" value={range} onChange={setRange} helperText={nights != null ? \`\${nights} night(s)\` : "Pick your check-in and check-out."} />
      </div>;
  }
}`,...(L=(B=n.parameters)==null?void 0:B.docs)==null?void 0:L.source},description:{story:"Controlled range with a live nights count derived from the two ends.",...($=(H=n.parameters)==null?void 0:H.docs)==null?void 0:$.description}}};const U=["Default","WithValue","Required","WithHelperText","WithError","Bounded","AllSizes","AllStates","Controlled"];export{c as AllSizes,g as AllStates,i as Bounded,n as Controlled,s as Default,d as Required,u as WithError,o as WithHelperText,l as WithValue,U as __namedExportsOrder,Q as default};
