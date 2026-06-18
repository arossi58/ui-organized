var H=Object.defineProperty;var a=(s,h)=>H(s,"name",{value:h,configurable:!0});import{P as r,j as e,r as _}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const B={title:"Components/Forms/PasswordInput",component:r,parameters:{layout:"padded",docs:{description:{component:"A password field built on `Input` — adds a trailing show/hide toggle that switches the control between masked and plain text (toggle with `showToggle`). Supports the same `label`, `helperText`, `error`, `size`, and `required` / `disabled` props."}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},placeholder:{control:"text"},helperText:{control:"text"},error:{control:"text"},showToggle:{control:"boolean"},disabled:{control:"boolean"},required:{control:"boolean"}}},o={args:{label:"Password",placeholder:"Enter your password",size:"md"}},l={args:{label:"Password",placeholder:"Enter your password",required:!0}},n={args:{label:"New password",placeholder:"Enter your password",helperText:"Must be at least 8 characters."}},d={args:{label:"Password",placeholder:"Enter your password",error:"Password must be at least 8 characters."}},p={args:{label:"Password",placeholder:"Enter your password",showToggle:!1}},u={parameters:{docs:{source:{code:`
<PasswordInput size="sm" label="Small" placeholder="Enter your password" />
<PasswordInput size="md" label="Medium" placeholder="Enter your password" />
<PasswordInput size="lg" label="Large" placeholder="Enter your password" />
`.trim()}}},render:a(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(r,{size:"sm",label:"Small",placeholder:"Enter your password"}),e.jsx(r,{size:"md",label:"Medium",placeholder:"Enter your password"}),e.jsx(r,{size:"lg",label:"Large",placeholder:"Enter your password"})]}),"render")},c={parameters:{docs:{source:{code:`
<PasswordInput label="Default" placeholder="Enter your password" />
<PasswordInput label="With value" defaultValue="hunter2pass" />
<PasswordInput label="Required" placeholder="Enter your password" required />
<PasswordInput label="With helper" placeholder="Enter your password" helperText="Must be at least 8 characters." />
<PasswordInput label="Error state" placeholder="Enter your password" error="Password is too short." />
<PasswordInput label="Disabled" defaultValue="hunter2pass" disabled />
`.trim()}}},render:a(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(r,{label:"Default",placeholder:"Enter your password"}),e.jsx(r,{label:"With value",defaultValue:"hunter2pass"}),e.jsx(r,{label:"Required",placeholder:"Enter your password",required:!0}),e.jsx(r,{label:"With helper",placeholder:"Enter your password",helperText:"Must be at least 8 characters."}),e.jsx(r,{label:"Error state",placeholder:"Enter your password",error:"Password is too short."}),e.jsx(r,{label:"Disabled",defaultValue:"hunter2pass",disabled:!0})]}),"render")},t={parameters:{docs:{source:{code:`
const [value, setValue] = useState("");
const strength =
  value.length === 0 ? "" : value.length < 8 ? "Weak" : value.length < 12 ? "Good" : "Strong";

<PasswordInput
  label="Create password"
  placeholder="Enter your password"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  helperText={strength ? "Strength: " + strength : "Must be at least 8 characters."}
/>
`.trim()}}},render:a(()=>{const[s,h]=_.useState(""),i=s.length===0?"":s.length<8?"Weak":s.length<12?"Good":"Strong";return e.jsx("div",{style:{maxWidth:"400px"},children:e.jsx(r,{label:"Create password",placeholder:"Enter your password",value:s,onChange:a(N=>h(N.target.value),"onChange"),helperText:i?`Strength: ${i}`:"Must be at least 8 characters."})})},"render")};var w,m,g;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    label: "Password",
    placeholder: "Enter your password",
    size: "md"
  }
}`,...(g=(m=o.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var b,x,y;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: "Password",
    placeholder: "Enter your password",
    required: true
  }
}`,...(y=(x=l.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var E,P,v;n.parameters={...n.parameters,docs:{...(E=n.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: "New password",
    placeholder: "Enter your password",
    helperText: "Must be at least 8 characters."
  }
}`,...(v=(P=n.parameters)==null?void 0:P.docs)==null?void 0:v.source}}};var I,S,f;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: "Password",
    placeholder: "Enter your password",
    error: "Password must be at least 8 characters."
  }
}`,...(f=(S=d.parameters)==null?void 0:S.docs)==null?void 0:f.source}}};var W,T,z;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    label: "Password",
    placeholder: "Enter your password",
    showToggle: false
  }
}`,...(z=(T=p.parameters)==null?void 0:T.docs)==null?void 0:z.source}}};var j,V,q;u.parameters={...u.parameters,docs:{...(j=u.parameters)==null?void 0:j.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<PasswordInput size="sm" label="Small" placeholder="Enter your password" />
<PasswordInput size="md" label="Medium" placeholder="Enter your password" />
<PasswordInput size="lg" label="Large" placeholder="Enter your password" />
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
      <PasswordInput size="sm" label="Small" placeholder="Enter your password" />
      <PasswordInput size="md" label="Medium" placeholder="Enter your password" />
      <PasswordInput size="lg" label="Large" placeholder="Enter your password" />
    </div>
}`,...(q=(V=u.parameters)==null?void 0:V.docs)==null?void 0:q.source}}};var D,M,C;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<PasswordInput label="Default" placeholder="Enter your password" />
<PasswordInput label="With value" defaultValue="hunter2pass" />
<PasswordInput label="Required" placeholder="Enter your password" required />
<PasswordInput label="With helper" placeholder="Enter your password" helperText="Must be at least 8 characters." />
<PasswordInput label="Error state" placeholder="Enter your password" error="Password is too short." />
<PasswordInput label="Disabled" defaultValue="hunter2pass" disabled />
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
      <PasswordInput label="Default" placeholder="Enter your password" />
      <PasswordInput label="With value" defaultValue="hunter2pass" />
      <PasswordInput label="Required" placeholder="Enter your password" required />
      <PasswordInput label="With helper" placeholder="Enter your password" helperText="Must be at least 8 characters." />
      <PasswordInput label="Error state" placeholder="Enter your password" error="Password is too short." />
      <PasswordInput label="Disabled" defaultValue="hunter2pass" disabled />
    </div>
}`,...(C=(M=c.parameters)==null?void 0:M.docs)==null?void 0:C.source}}};var R,k,A,L,G;t.parameters={...t.parameters,docs:{...(R=t.parameters)==null?void 0:R.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
const [value, setValue] = useState("");
const strength =
  value.length === 0 ? "" : value.length < 8 ? "Weak" : value.length < 12 ? "Good" : "Strong";

<PasswordInput
  label="Create password"
  placeholder="Enter your password"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  helperText={strength ? "Strength: " + strength : "Must be at least 8 characters."}
/>
\`.trim()
      }
    }
  },
  render: () => {
    const [value, setValue] = useState("");
    const strength = value.length === 0 ? "" : value.length < 8 ? "Weak" : value.length < 12 ? "Good" : "Strong";
    return <div style={{
      maxWidth: "400px"
    }}>
        <PasswordInput label="Create password" placeholder="Enter your password" value={value} onChange={e => setValue(e.target.value)} helperText={strength ? \`Strength: \${strength}\` : "Must be at least 8 characters."} />
      </div>;
  }
}`,...(A=(k=t.parameters)==null?void 0:k.docs)==null?void 0:A.source},description:{story:"Live strength hint driven from the controlled value.",...(G=(L=t.parameters)==null?void 0:L.docs)==null?void 0:G.description}}};const J=["Default","Required","WithHelperText","WithError","NoToggle","AllSizes","AllStates","Controlled"];export{u as AllSizes,c as AllStates,t as Controlled,o as Default,p as NoToggle,l as Required,d as WithError,n as WithHelperText,J as __namedExportsOrder,B as default};
