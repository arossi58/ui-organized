var M=Object.defineProperty;var a=(r,L)=>M(r,"name",{value:L,configurable:!0});import{I as l,j as e}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const G={title:"Components/Forms/Input",component:l,parameters:{layout:"padded",docs:{description:{component:"A single-line text field with an optional `label`, `helperText`, and `error` message; use `size` for density and the `required` / `disabled` booleans to convey state."}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},placeholder:{control:"text"},helperText:{control:"text"},error:{control:"text"},disabled:{control:"boolean"},required:{control:"boolean"}}},s={args:{label:"Email address",placeholder:"you@example.com",size:"md"}},d={args:{label:"Email address",placeholder:"you@example.com",required:!0}},t={args:{label:"Username",placeholder:"johndoe",helperText:"Must be 3–20 characters. Letters and numbers only."}},i={args:{label:"Email address",placeholder:"you@example.com",error:"Please enter a valid email address."}},o={parameters:{docs:{source:{code:`
<Input size="sm" label="Small" placeholder="Small input" />
<Input size="md" label="Medium" placeholder="Medium input" />
<Input size="lg" label="Large" placeholder="Large input" />
`.trim()}}},render:a(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(l,{size:"sm",label:"Small",placeholder:"Small input"}),e.jsx(l,{size:"md",label:"Medium",placeholder:"Medium input"}),e.jsx(l,{size:"lg",label:"Large",placeholder:"Large input"})]}),"render")},n={parameters:{docs:{source:{code:`
<Input label="Default" placeholder="Placeholder text" />
<Input label="With value" defaultValue="Entered data" />
<Input label="Required" placeholder="Required field" required />
<Input label="With helper" placeholder="Placeholder text" helperText="This is helper text." />
<Input label="Error state" placeholder="Placeholder text" error="This field is required." />
<Input label="Disabled" placeholder="Disabled state" disabled />
`.trim()}}},render:a(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(l,{label:"Default",placeholder:"Placeholder text"}),e.jsx(l,{label:"With value",defaultValue:"Entered data"}),e.jsx(l,{label:"Required",placeholder:"Required field",required:!0}),e.jsx(l,{label:"With helper",placeholder:"Placeholder text",helperText:"This is helper text."}),e.jsx(l,{label:"Error state",placeholder:"Placeholder text",error:"This field is required."}),e.jsx(l,{label:"Disabled",placeholder:"Disabled state",disabled:!0})]}),"render")},p={parameters:{docs:{source:{code:`
{(["sm", "md", "lg"] as const).map((size) => (
  <>
    <Input size={size} label={"Size: " + size} placeholder="Default" />
    <Input size={size} label={"Size: " + size + " — required"} placeholder="Required" required />
    <Input size={size} label={"Size: " + size + " — error"} placeholder="Error" error="Error message." />
    <Input size={size} label={"Size: " + size + " — disabled"} placeholder="Disabled" disabled />
  </>
))}
`.trim()}}},render:a(()=>e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"24px",maxWidth:"400px"},children:["sm","md","lg"].map(r=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(l,{size:r,label:`Size: ${r}`,placeholder:"Default"}),e.jsx(l,{size:r,label:`Size: ${r} — required`,placeholder:"Required",required:!0}),e.jsx(l,{size:r,label:`Size: ${r} — error`,placeholder:"Error",error:"Error message."}),e.jsx(l,{size:r,label:`Size: ${r} — disabled`,placeholder:"Disabled",disabled:!0})]},r))}),"render")};var c,u,m;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    size: "md"
  }
}`,...(m=(u=s.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var h,b,x;d.parameters={...d.parameters,docs:{...(h=d.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    required: true
  }
}`,...(x=(b=d.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var z,g,f;t.parameters={...t.parameters,docs:{...(z=t.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    label: "Username",
    placeholder: "johndoe",
    helperText: "Must be 3–20 characters. Letters and numbers only."
  }
}`,...(f=(g=t.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var I,S,q;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    error: "Please enter a valid email address."
  }
}`,...(q=(S=i.parameters)==null?void 0:S.docs)==null?void 0:q.source}}};var D,y,E;o.parameters={...o.parameters,docs:{...(D=o.parameters)==null?void 0:D.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Input size="sm" label="Small" placeholder="Small input" />
<Input size="md" label="Medium" placeholder="Medium input" />
<Input size="lg" label="Large" placeholder="Large input" />
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
      <Input size="sm" label="Small" placeholder="Small input" />
      <Input size="md" label="Medium" placeholder="Medium input" />
      <Input size="lg" label="Large" placeholder="Large input" />
    </div>
}`,...(E=(y=o.parameters)==null?void 0:y.docs)==null?void 0:E.source}}};var j,v,T;n.parameters={...n.parameters,docs:{...(j=n.parameters)==null?void 0:j.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Input label="Default" placeholder="Placeholder text" />
<Input label="With value" defaultValue="Entered data" />
<Input label="Required" placeholder="Required field" required />
<Input label="With helper" placeholder="Placeholder text" helperText="This is helper text." />
<Input label="Error state" placeholder="Placeholder text" error="This field is required." />
<Input label="Disabled" placeholder="Disabled state" disabled />
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
      <Input label="Default" placeholder="Placeholder text" />
      <Input label="With value" defaultValue="Entered data" />
      <Input label="Required" placeholder="Required field" required />
      <Input label="With helper" placeholder="Placeholder text" helperText="This is helper text." />
      <Input label="Error state" placeholder="Placeholder text" error="This field is required." />
      <Input label="Disabled" placeholder="Disabled state" disabled />
    </div>
}`,...(T=(v=n.parameters)==null?void 0:v.docs)==null?void 0:T.source}}};var W,R,P;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
{(["sm", "md", "lg"] as const).map((size) => (
  <>
    <Input size={size} label={"Size: " + size} placeholder="Default" />
    <Input size={size} label={"Size: " + size + " — required"} placeholder="Required" required />
    <Input size={size} label={"Size: " + size + " — error"} placeholder="Error" error="Error message." />
    <Input size={size} label={"Size: " + size + " — disabled"} placeholder="Disabled" disabled />
  </>
))}
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "400px"
  }}>
      {(["sm", "md", "lg"] as const).map(size => <div key={size} style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
          <Input size={size} label={\`Size: \${size}\`} placeholder="Default" />
          <Input size={size} label={\`Size: \${size} — required\`} placeholder="Required" required />
          <Input size={size} label={\`Size: \${size} — error\`} placeholder="Error" error="Error message." />
          <Input size={size} label={\`Size: \${size} — disabled\`} placeholder="Disabled" disabled />
        </div>)}
    </div>
}`,...(P=(R=p.parameters)==null?void 0:R.docs)==null?void 0:P.source}}};const H=["Default","Required","WithHelperText","WithError","AllSizes","AllStates","AllVariantsGrid"];export{o as AllSizes,n as AllStates,p as AllVariantsGrid,s as Default,d as Required,i as WithError,t as WithHelperText,H as __namedExportsOrder,G as default};
