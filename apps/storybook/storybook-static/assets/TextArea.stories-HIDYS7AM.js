var _=Object.defineProperty;var a=(u,s)=>_(u,"name",{value:s,configurable:!0});import{T as r,j as e,r as O}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const K={title:"Components/Forms/TextArea",component:r,parameters:{layout:"padded",docs:{description:{component:"A multi-line text field with an optional `label`, `helperText`, and `error` message; use `size` for density, `resize` to control the drag handle, and the `required` / `disabled` booleans for state."}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},resize:{control:"select",options:["none","vertical","horizontal","both"]},label:{control:"text"},placeholder:{control:"text"},helperText:{control:"text"},error:{control:"text"},disabled:{control:"boolean"},required:{control:"boolean"}}},o={args:{label:"Label",placeholder:"Your input",helperText:"Characters 0/500",size:"lg"}},n={args:{label:"Bio",placeholder:"Tell us about yourself",helperText:"Characters 0/500",required:!0}},i={args:{label:"Label",placeholder:"Your input",error:"Error message"}},c={args:{label:"Label",placeholder:"Your input",helperText:"Characters 0/500",disabled:!0}},d={parameters:{docs:{source:{code:`
<TextArea size="sm" label="Small" placeholder="Your input" helperText="Characters 0/500" />
<TextArea size="md" label="Medium" placeholder="Your input" helperText="Characters 0/500" />
<TextArea size="lg" label="Large" placeholder="Your input" helperText="Characters 0/500" />
`.trim()}}},render:a(()=>e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"flex-start",maxWidth:"1000px"},children:[e.jsx(r,{size:"sm",label:"Small",placeholder:"Your input",helperText:"Characters 0/500"}),e.jsx(r,{size:"md",label:"Medium",placeholder:"Your input",helperText:"Characters 0/500"}),e.jsx(r,{size:"lg",label:"Large",placeholder:"Your input",helperText:"Characters 0/500"})]}),"render")},p={parameters:{docs:{source:{code:`
<TextArea label="Default" placeholder="Your input" helperText="Characters 0/500" />
<TextArea label="With value" defaultValue="Entered data" helperText="Characters 11/500" />
<TextArea label="Required" placeholder="Your input" required helperText="Characters 0/500" />
<TextArea label="Error state" placeholder="Your input" error="Error message" />
<TextArea label="Disabled" placeholder="Your input" disabled helperText="Characters 0/500" />
`.trim()}}},render:a(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(r,{label:"Default",placeholder:"Your input",helperText:"Characters 0/500"}),e.jsx(r,{label:"With value",defaultValue:"Entered data",helperText:"Characters 11/500"}),e.jsx(r,{label:"Required",placeholder:"Your input",required:!0,helperText:"Characters 0/500"}),e.jsx(r,{label:"Error state",placeholder:"Your input",error:"Error message"}),e.jsx(r,{label:"Disabled",placeholder:"Your input",disabled:!0,helperText:"Characters 0/500"})]}),"render")},l={parameters:{docs:{source:{code:`
<TextArea label="Both (default)" placeholder="Resize me in any direction" resize="both" />
<TextArea label="Vertical only" placeholder="Resize me up/down" resize="vertical" />
<TextArea label="Horizontal only" placeholder="Resize me left/right" resize="horizontal" />
<TextArea label="No resize" placeholder="Fixed size" resize="none" />
`.trim()}}},render:a(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(r,{label:"Both (default)",placeholder:"Resize me in any direction",resize:"both"}),e.jsx(r,{label:"Vertical only",placeholder:"Resize me up/down",resize:"vertical"}),e.jsx(r,{label:"Horizontal only",placeholder:"Resize me left/right",resize:"horizontal"}),e.jsx(r,{label:"No resize",placeholder:"Fixed size",resize:"none"})]}),"render")},t={parameters:{docs:{source:{code:`
const max = 500;
const [value, setValue] = useState("");

<TextArea
  label="Message"
  placeholder="Your input"
  maxLength={max}
  value={value}
  onChange={(e) => setValue(e.target.value)}
  helperText={"Characters " + value.length + "/" + max}
/>
`.trim()}}},render:a(()=>{const[s,$]=O.useState("");return e.jsx("div",{style:{maxWidth:"400px"},children:e.jsx(r,{label:"Message",placeholder:"Your input",maxLength:500,value:s,onChange:a(I=>$(I.target.value),"onChange"),helperText:`Characters ${s.length}/500`})})},"render")};var h,x,m;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Your input",
    helperText: "Characters 0/500",
    size: "lg"
  }
}`,...(m=(x=o.parameters)==null?void 0:x.docs)==null?void 0:m.source}}};var b,T,g;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself",
    helperText: "Characters 0/500",
    required: true
  }
}`,...(g=(T=n.parameters)==null?void 0:T.docs)==null?void 0:g.source}}};var z,C,A;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Your input",
    error: "Error message"
  }
}`,...(A=(C=i.parameters)==null?void 0:C.docs)==null?void 0:A.source}}};var f,v,Y;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Your input",
    helperText: "Characters 0/500",
    disabled: true
  }
}`,...(Y=(v=c.parameters)==null?void 0:v.docs)==null?void 0:Y.source}}};var y,R,S;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<TextArea size="sm" label="Small" placeholder="Your input" helperText="Characters 0/500" />
<TextArea size="md" label="Medium" placeholder="Your input" helperText="Characters 0/500" />
<TextArea size="lg" label="Large" placeholder="Your input" helperText="Characters 0/500" />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    maxWidth: "1000px"
  }}>
      <TextArea size="sm" label="Small" placeholder="Your input" helperText="Characters 0/500" />
      <TextArea size="md" label="Medium" placeholder="Your input" helperText="Characters 0/500" />
      <TextArea size="lg" label="Large" placeholder="Your input" helperText="Characters 0/500" />
    </div>
}`,...(S=(R=d.parameters)==null?void 0:R.docs)==null?void 0:S.source}}};var j,E,D;p.parameters={...p.parameters,docs:{...(j=p.parameters)==null?void 0:j.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<TextArea label="Default" placeholder="Your input" helperText="Characters 0/500" />
<TextArea label="With value" defaultValue="Entered data" helperText="Characters 11/500" />
<TextArea label="Required" placeholder="Your input" required helperText="Characters 0/500" />
<TextArea label="Error state" placeholder="Your input" error="Error message" />
<TextArea label="Disabled" placeholder="Your input" disabled helperText="Characters 0/500" />
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
      <TextArea label="Default" placeholder="Your input" helperText="Characters 0/500" />
      <TextArea label="With value" defaultValue="Entered data" helperText="Characters 11/500" />
      <TextArea label="Required" placeholder="Your input" required helperText="Characters 0/500" />
      <TextArea label="Error state" placeholder="Your input" error="Error message" />
      <TextArea label="Disabled" placeholder="Your input" disabled helperText="Characters 0/500" />
    </div>
}`,...(D=(E=p.parameters)==null?void 0:E.docs)==null?void 0:D.source}}};var L,V,q,W,M;l.parameters={...l.parameters,docs:{...(L=l.parameters)==null?void 0:L.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<TextArea label="Both (default)" placeholder="Resize me in any direction" resize="both" />
<TextArea label="Vertical only" placeholder="Resize me up/down" resize="vertical" />
<TextArea label="Horizontal only" placeholder="Resize me left/right" resize="horizontal" />
<TextArea label="No resize" placeholder="Fixed size" resize="none" />
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
      <TextArea label="Both (default)" placeholder="Resize me in any direction" resize="both" />
      <TextArea label="Vertical only" placeholder="Resize me up/down" resize="vertical" />
      <TextArea label="Horizontal only" placeholder="Resize me left/right" resize="horizontal" />
      <TextArea label="No resize" placeholder="Fixed size" resize="none" />
    </div>
}`,...(q=(V=l.parameters)==null?void 0:V.docs)==null?void 0:q.source},description:{story:"Drag the bottom-right handle of each field to resize it in the allowed directions.",...(M=(W=l.parameters)==null?void 0:W.docs)==null?void 0:M.description}}};var w,B,F,H,N;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
const max = 500;
const [value, setValue] = useState("");

<TextArea
  label="Message"
  placeholder="Your input"
  maxLength={max}
  value={value}
  onChange={(e) => setValue(e.target.value)}
  helperText={"Characters " + value.length + "/" + max}
/>
\`.trim()
      }
    }
  },
  render: () => {
    const max = 500;
    const [value, setValue] = useState("");
    return <div style={{
      maxWidth: "400px"
    }}>
        <TextArea label="Message" placeholder="Your input" maxLength={max} value={value} onChange={e => setValue(e.target.value)} helperText={\`Characters \${value.length}/\${max}\`} />
      </div>;
  }
}`,...(F=(B=t.parameters)==null?void 0:B.docs)==null?void 0:F.source},description:{story:'Live character counter — the canonical use of the helper text (Figma "Characters 0/500").',...(N=(H=t.parameters)==null?void 0:H.docs)==null?void 0:N.description}}};const P=["Default","Required","WithError","Disabled","AllSizes","AllStates","Resize","CharacterCounter"];export{d as AllSizes,p as AllStates,t as CharacterCounter,o as Default,c as Disabled,n as Required,l as Resize,i as WithError,P as __namedExportsOrder,K as default};
