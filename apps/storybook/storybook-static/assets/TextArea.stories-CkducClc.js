import{i as r,j as e,r as I}from"./iframe-mpPisOQX.js";import"./preload-helper-C1FmrZbK.js";const k={title:"Components/TextArea",component:r,parameters:{layout:"padded"},argTypes:{size:{control:"select",options:["sm","md","lg"]},resize:{control:"select",options:["none","vertical","horizontal","both"]},label:{control:"text"},placeholder:{control:"text"},helperText:{control:"text"},error:{control:"text"},disabled:{control:"boolean"},required:{control:"boolean"}}},t={args:{label:"Label",placeholder:"Your input",helperText:"Characters 0/500",size:"lg"}},s={args:{label:"Bio",placeholder:"Tell us about yourself",helperText:"Characters 0/500",required:!0}},o={args:{label:"Label",placeholder:"Your input",error:"Error message"}},n={args:{label:"Label",placeholder:"Your input",helperText:"Characters 0/500",disabled:!0}},i={render:()=>e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"flex-start",maxWidth:"1000px"},children:[e.jsx(r,{size:"sm",label:"Small",placeholder:"Your input",helperText:"Characters 0/500"}),e.jsx(r,{size:"md",label:"Medium",placeholder:"Your input",helperText:"Characters 0/500"}),e.jsx(r,{size:"lg",label:"Large",placeholder:"Your input",helperText:"Characters 0/500"})]})},c={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(r,{label:"Default",placeholder:"Your input",helperText:"Characters 0/500"}),e.jsx(r,{label:"With value",defaultValue:"Entered data",helperText:"Characters 11/500"}),e.jsx(r,{label:"Required",placeholder:"Your input",required:!0,helperText:"Characters 0/500"}),e.jsx(r,{label:"Error state",placeholder:"Your input",error:"Error message"}),e.jsx(r,{label:"Disabled",placeholder:"Your input",disabled:!0,helperText:"Characters 0/500"})]})},a={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(r,{label:"Both (default)",placeholder:"Resize me in any direction",resize:"both"}),e.jsx(r,{label:"Vertical only",placeholder:"Resize me up/down",resize:"vertical"}),e.jsx(r,{label:"Horizontal only",placeholder:"Resize me left/right",resize:"horizontal"}),e.jsx(r,{label:"No resize",placeholder:"Fixed size",resize:"none"})]})},l={render:()=>{const[p,F]=I.useState("");return e.jsx("div",{style:{maxWidth:"400px"},children:e.jsx(r,{label:"Message",placeholder:"Your input",maxLength:500,value:p,onChange:H=>F(H.target.value),helperText:`Characters ${p.length}/500`})})}};var d,u,h;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Your input",
    helperText: "Characters 0/500",
    size: "lg"
  }
}`,...(h=(u=t.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var x,m,b;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself",
    helperText: "Characters 0/500",
    required: true
  }
}`,...(b=(m=s.parameters)==null?void 0:m.docs)==null?void 0:b.source}}};var g,T,z;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Your input",
    error: "Error message"
  }
}`,...(z=(T=o.parameters)==null?void 0:T.docs)==null?void 0:z.source}}};var C,f,y;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Your input",
    helperText: "Characters 0/500",
    disabled: true
  }
}`,...(y=(f=n.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var v,Y,j;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(j=(Y=i.parameters)==null?void 0:Y.docs)==null?void 0:j.source}}};var A,S,D;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(D=(S=c.parameters)==null?void 0:S.docs)==null?void 0:D.source}}};var E,R,W,L,q;a.parameters={...a.parameters,docs:{...(E=a.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(W=(R=a.parameters)==null?void 0:R.docs)==null?void 0:W.source},description:{story:"Drag the bottom-right handle of each field to resize it in the allowed directions.",...(q=(L=a.parameters)==null?void 0:L.docs)==null?void 0:q.description}}};var V,B,M,$,w;l.parameters={...l.parameters,docs:{...(V=l.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => {
    const max = 500;
    const [value, setValue] = useState("");
    return <div style={{
      maxWidth: "400px"
    }}>
        <TextArea label="Message" placeholder="Your input" maxLength={max} value={value} onChange={e => setValue(e.target.value)} helperText={\`Characters \${value.length}/\${max}\`} />
      </div>;
  }
}`,...(M=(B=l.parameters)==null?void 0:B.docs)==null?void 0:M.source},description:{story:'Live character counter — the canonical use of the helper text (Figma "Characters 0/500").',...(w=($=l.parameters)==null?void 0:$.docs)==null?void 0:w.description}}};const G=["Default","Required","WithError","Disabled","AllSizes","AllStates","Resize","CharacterCounter"];export{i as AllSizes,c as AllStates,l as CharacterCounter,t as Default,n as Disabled,s as Required,a as Resize,o as WithError,G as __namedExportsOrder,k as default};
