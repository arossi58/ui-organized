var W=Object.defineProperty;var l=(n,s)=>W(n,"name",{value:s,configurable:!0});import{d as a,j as e,r as B}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const G={title:"Components/Forms/Range",component:a,parameters:{layout:"padded",docs:{description:{component:"Range is a slider for picking a numeric value; configure it with `min` / `max` / `step` (or `snapValues` for uneven stops), `value` / `defaultValue` and `onValueChange` for state, `size`, and display options like `rangeLabels`, `hideValue`, and `formatValue`."}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},min:{control:"number"},max:{control:"number"},step:{control:"number"},rangeLabels:{control:"boolean"},hideValue:{control:"boolean"},disabled:{control:"boolean"},error:{control:"text"}}},b={display:"flex",flexDirection:"column",gap:"24px",maxWidth:"320px"},u={args:{label:"Volume",defaultValue:40,size:"md"}},d={args:{label:"Brightness",defaultValue:60,rangeLabels:!0}},i={parameters:{docs:{source:{code:`
<Range size="sm" label="Small" defaultValue={30} rangeLabels />
<Range size="md" label="Medium" defaultValue={50} rangeLabels />
<Range size="lg" label="Large" defaultValue={70} rangeLabels />
`.trim()}}},render:l(()=>e.jsxs("div",{style:b,children:[e.jsx(a,{size:"sm",label:"Small",defaultValue:30,rangeLabels:!0}),e.jsx(a,{size:"md",label:"Medium",defaultValue:50,rangeLabels:!0}),e.jsx(a,{size:"lg",label:"Large",defaultValue:70,rangeLabels:!0})]}),"render")},c={parameters:{docs:{source:{code:`
<Range label="Default" defaultValue={50} rangeLabels />
<Range label="Disabled" defaultValue={50} rangeLabels disabled />
<Range label="Error" defaultValue={50} rangeLabels error="Please pick a lower value." />
`.trim()}}},render:l(()=>e.jsxs("div",{style:b,children:[e.jsx(a,{label:"Default",defaultValue:50,rangeLabels:!0}),e.jsx(a,{label:"Disabled",defaultValue:50,rangeLabels:!0,disabled:!0}),e.jsx(a,{label:"Error",defaultValue:50,rangeLabels:!0,error:"Please pick a lower value."})]}),"render")},t={args:{label:"Rating (steps of 10)",min:0,max:100,step:10,defaultValue:30,rangeLabels:!0}},o={parameters:{docs:{source:{code:`
const sizes = [8, 16, 24, 32, 48, 64];

<Range
  label="Font size"
  snapValues={sizes}
  defaultValue={16}
  rangeLabels
  startLabel="8px"
  endLabel="64px"
  formatValue={(v) => v + "px"}
/>
`.trim()}}},render:l(()=>{const n=[8,16,24,32,48,64];return e.jsx("div",{style:b,children:e.jsx(a,{label:"Font size",snapValues:n,defaultValue:16,rangeLabels:!0,startLabel:"8px",endLabel:"64px",formatValue:l(s=>`${s}px`,"formatValue")})})},"render")},p={parameters:{docs:{source:{code:`
const [value, setValue] = useState(25);

<Range
  label="Opacity"
  value={value}
  onValueChange={setValue}
  rangeLabels
  formatValue={(v) => v + "%"}
/>
`.trim()}}},render:l(()=>{const[n,s]=B.useState(25);return e.jsxs("div",{style:b,children:[e.jsx(a,{label:"Opacity",value:n,onValueChange:s,rangeLabels:!0,formatValue:l(r=>`${r}%`,"formatValue")}),e.jsx("div",{style:{display:"flex",gap:"8px"},children:[0,25,50,75,100].map(r=>e.jsxs("button",{type:"button",onClick:l(()=>s(r),"onClick"),children:[r,"%"]},r))})]})},"render")};var m,g,V;u.parameters={...u.parameters,docs:{...(m=u.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: "Volume",
    defaultValue: 40,
    size: "md"
  }
}`,...(V=(g=u.parameters)==null?void 0:g.docs)==null?void 0:V.source}}};var f,L,v;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: "Brightness",
    defaultValue: 60,
    rangeLabels: true
  }
}`,...(v=(L=d.parameters)==null?void 0:L.docs)==null?void 0:v.source}}};var x,R,z;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Range size="sm" label="Small" defaultValue={30} rangeLabels />
<Range size="md" label="Medium" defaultValue={50} rangeLabels />
<Range size="lg" label="Large" defaultValue={70} rangeLabels />
\`.trim()
      }
    }
  },
  render: () => <div style={wrap}>
      <Range size="sm" label="Small" defaultValue={30} rangeLabels />
      <Range size="md" label="Medium" defaultValue={50} rangeLabels />
      <Range size="lg" label="Large" defaultValue={70} rangeLabels />
    </div>
}`,...(z=(R=i.parameters)==null?void 0:R.docs)==null?void 0:z.source}}};var y,S,h;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Range label="Default" defaultValue={50} rangeLabels />
<Range label="Disabled" defaultValue={50} rangeLabels disabled />
<Range label="Error" defaultValue={50} rangeLabels error="Please pick a lower value." />
\`.trim()
      }
    }
  },
  render: () => <div style={wrap}>
      <Range label="Default" defaultValue={50} rangeLabels />
      <Range label="Disabled" defaultValue={50} rangeLabels disabled />
      <Range label="Error" defaultValue={50} rangeLabels error="Please pick a lower value." />
    </div>
}`,...(h=(S=c.parameters)==null?void 0:S.docs)==null?void 0:h.source}}};var j,w,D,C,k;t.parameters={...t.parameters,docs:{...(j=t.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    label: "Rating (steps of 10)",
    min: 0,
    max: 100,
    step: 10,
    defaultValue: 30,
    rangeLabels: true
  }
}`,...(D=(w=t.parameters)==null?void 0:w.docs)==null?void 0:D.source},description:{story:"`step` snaps the thumb at regular intervals between min and max.",...(k=(C=t.parameters)==null?void 0:C.docs)==null?void 0:k.description}}};var E,F,O,A,M;o.parameters={...o.parameters,docs:{...(E=o.parameters)==null?void 0:E.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
const sizes = [8, 16, 24, 32, 48, 64];

<Range
  label="Font size"
  snapValues={sizes}
  defaultValue={16}
  rangeLabels
  startLabel="8px"
  endLabel="64px"
  formatValue={(v) => v + "px"}
/>
\`.trim()
      }
    }
  },
  render: () => {
    const sizes = [8, 16, 24, 32, 48, 64];
    return <div style={wrap}>
        <Range label="Font size" snapValues={sizes} defaultValue={16} rangeLabels startLabel="8px" endLabel="64px" formatValue={v => \`\${v}px\`} />
      </div>;
  }
}`,...(O=(F=o.parameters)==null?void 0:F.docs)==null?void 0:O.source},description:{story:"`snapValues` snaps to a fixed, possibly uneven, set of allowed values.",...(M=(A=o.parameters)==null?void 0:A.docs)==null?void 0:M.description}}};var P,$,T;p.parameters={...p.parameters,docs:{...(P=p.parameters)==null?void 0:P.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
const [value, setValue] = useState(25);

<Range
  label="Opacity"
  value={value}
  onValueChange={setValue}
  rangeLabels
  formatValue={(v) => v + "%"}
/>
\`.trim()
      }
    }
  },
  render: () => {
    const [value, setValue] = useState(25);
    return <div style={wrap}>
        <Range label="Opacity" value={value} onValueChange={setValue} rangeLabels formatValue={v => \`\${v}%\`} />
        <div style={{
        display: "flex",
        gap: "8px"
      }}>
          {[0, 25, 50, 75, 100].map(v => <button key={v} type="button" onClick={() => setValue(v)}>
              {v}%
            </button>)}
        </div>
      </div>;
  }
}`,...(T=($=p.parameters)==null?void 0:$.docs)==null?void 0:T.source}}};const H=["Default","WithRangeLabels","AllSizes","States","SnapAtIntervals","SnapToValues","Controlled"];export{i as AllSizes,p as Controlled,u as Default,t as SnapAtIntervals,o as SnapToValues,c as States,d as WithRangeLabels,H as __namedExportsOrder,G as default};
