import{h as a,j as e,r as F}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const P={title:"Components/Range",component:a,parameters:{layout:"padded"},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},min:{control:"number"},max:{control:"number"},step:{control:"number"},rangeLabels:{control:"boolean"},hideValue:{control:"boolean"},disabled:{control:"boolean"},error:{control:"text"}}},p={display:"flex",flexDirection:"column",gap:"24px",maxWidth:"320px"},t={args:{label:"Volume",defaultValue:40,size:"md"}},o={args:{label:"Brightness",defaultValue:60,rangeLabels:!0}},u={render:()=>e.jsxs("div",{style:p,children:[e.jsx(a,{size:"sm",label:"Small",defaultValue:30,rangeLabels:!0}),e.jsx(a,{size:"md",label:"Medium",defaultValue:50,rangeLabels:!0}),e.jsx(a,{size:"lg",label:"Large",defaultValue:70,rangeLabels:!0})]})},d={render:()=>e.jsxs("div",{style:p,children:[e.jsx(a,{label:"Default",defaultValue:50,rangeLabels:!0}),e.jsx(a,{label:"Disabled",defaultValue:50,rangeLabels:!0,disabled:!0}),e.jsx(a,{label:"Error",defaultValue:50,rangeLabels:!0,error:"Please pick a lower value."})]})},s={args:{label:"Rating (steps of 10)",min:0,max:100,step:10,defaultValue:30,rangeLabels:!0}},l={render:()=>{const c=[8,16,24,32,48,64];return e.jsx("div",{style:p,children:e.jsx(a,{label:"Font size",snapValues:c,defaultValue:16,rangeLabels:!0,startLabel:"8px",endLabel:"64px",formatValue:n=>`${n}px`})})}},i={render:()=>{const[c,n]=F.useState(25);return e.jsxs("div",{style:p,children:[e.jsx(a,{label:"Opacity",value:c,onValueChange:n,rangeLabels:!0,formatValue:r=>`${r}%`}),e.jsx("div",{style:{display:"flex",gap:"8px"},children:[0,25,50,75,100].map(r=>e.jsxs("button",{type:"button",onClick:()=>n(r),children:[r,"%"]},r))})]})}};var m,b,g;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: "Volume",
    defaultValue: 40,
    size: "md"
  }
}`,...(g=(b=t.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var x,f,V;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    label: "Brightness",
    defaultValue: 60,
    rangeLabels: true
  }
}`,...(V=(f=o.parameters)==null?void 0:f.docs)==null?void 0:V.source}}};var v,L,y;u.parameters={...u.parameters,docs:{...(v=u.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <div style={wrap}>
      <Range size="sm" label="Small" defaultValue={30} rangeLabels />
      <Range size="md" label="Medium" defaultValue={50} rangeLabels />
      <Range size="lg" label="Large" defaultValue={70} rangeLabels />
    </div>
}`,...(y=(L=u.parameters)==null?void 0:L.docs)==null?void 0:y.source}}};var S,h,j;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div style={wrap}>
      <Range label="Default" defaultValue={50} rangeLabels />
      <Range label="Disabled" defaultValue={50} rangeLabels disabled />
      <Range label="Error" defaultValue={50} rangeLabels error="Please pick a lower value." />
    </div>
}`,...(j=(h=d.parameters)==null?void 0:h.docs)==null?void 0:j.source}}};var z,R,w,C,D;s.parameters={...s.parameters,docs:{...(z=s.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    label: "Rating (steps of 10)",
    min: 0,
    max: 100,
    step: 10,
    defaultValue: 30,
    rangeLabels: true
  }
}`,...(w=(R=s.parameters)==null?void 0:R.docs)==null?void 0:w.source},description:{story:"`step` snaps the thumb at regular intervals between min and max.",...(D=(C=s.parameters)==null?void 0:C.docs)==null?void 0:D.description}}};var k,E,A,$,O;l.parameters={...l.parameters,docs:{...(k=l.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => {
    const sizes = [8, 16, 24, 32, 48, 64];
    return <div style={wrap}>
        <Range label="Font size" snapValues={sizes} defaultValue={16} rangeLabels startLabel="8px" endLabel="64px" formatValue={v => \`\${v}px\`} />
      </div>;
  }
}`,...(A=(E=l.parameters)==null?void 0:E.docs)==null?void 0:A.source},description:{story:"`snapValues` snaps to a fixed, possibly uneven, set of allowed values.",...(O=($=l.parameters)==null?void 0:$.docs)==null?void 0:O.description}}};var T,W,B;i.parameters={...i.parameters,docs:{...(T=i.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(B=(W=i.parameters)==null?void 0:W.docs)==null?void 0:B.source}}};const _=["Default","WithRangeLabels","AllSizes","States","SnapAtIntervals","SnapToValues","Controlled"];export{u as AllSizes,i as Controlled,t as Default,s as SnapAtIntervals,l as SnapToValues,d as States,o as WithRangeLabels,_ as __namedExportsOrder,P as default};
