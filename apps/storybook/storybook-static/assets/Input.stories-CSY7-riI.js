import{I as r,j as e}from"./iframe-mpPisOQX.js";import"./preload-helper-C1FmrZbK.js";const A={title:"Components/Input",component:r,parameters:{layout:"padded"},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},placeholder:{control:"text"},helperText:{control:"text"},error:{control:"text"},disabled:{control:"boolean"},required:{control:"boolean"}}},a={args:{label:"Email address",placeholder:"you@example.com",size:"md"}},s={args:{label:"Email address",placeholder:"you@example.com",required:!0}},d={args:{label:"Username",placeholder:"johndoe",helperText:"Must be 3–20 characters. Letters and numbers only."}},t={args:{label:"Email address",placeholder:"you@example.com",error:"Please enter a valid email address."}},o={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(r,{size:"sm",label:"Small",placeholder:"Small input"}),e.jsx(r,{size:"md",label:"Medium",placeholder:"Medium input"}),e.jsx(r,{size:"lg",label:"Large",placeholder:"Large input"})]})},i={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(r,{label:"Default",placeholder:"Placeholder text"}),e.jsx(r,{label:"With value",defaultValue:"Entered data"}),e.jsx(r,{label:"Required",placeholder:"Required field",required:!0}),e.jsx(r,{label:"With helper",placeholder:"Placeholder text",helperText:"This is helper text."}),e.jsx(r,{label:"Error state",placeholder:"Placeholder text",error:"This field is required."}),e.jsx(r,{label:"Disabled",placeholder:"Disabled state",disabled:!0})]})},n={render:()=>e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"24px",maxWidth:"400px"},children:["sm","md","lg"].map(l=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(r,{size:l,label:`Size: ${l}`,placeholder:"Default"}),e.jsx(r,{size:l,label:`Size: ${l} — required`,placeholder:"Required",required:!0}),e.jsx(r,{size:l,label:`Size: ${l} — error`,placeholder:"Error",error:"Error message."}),e.jsx(r,{size:l,label:`Size: ${l} — disabled`,placeholder:"Disabled",disabled:!0})]},l))})};var p,c,u;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    size: "md"
  }
}`,...(u=(c=a.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var m,x,h;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    required: true
  }
}`,...(h=(x=s.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var b,g,f;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: "Username",
    placeholder: "johndoe",
    helperText: "Must be 3–20 characters. Letters and numbers only."
  }
}`,...(f=(g=d.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var y,z,S;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    error: "Please enter a valid email address."
  }
}`,...(S=(z=t.parameters)==null?void 0:z.docs)==null?void 0:S.source}}};var j,D,q;o.parameters={...o.parameters,docs:{...(j=o.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(q=(D=o.parameters)==null?void 0:D.docs)==null?void 0:q.source}}};var E,v,I;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(I=(v=i.parameters)==null?void 0:v.docs)==null?void 0:I.source}}};var W,T,R;n.parameters={...n.parameters,docs:{...(W=n.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(R=(T=n.parameters)==null?void 0:T.docs)==null?void 0:R.source}}};const L=["Default","Required","WithHelperText","WithError","AllSizes","AllStates","AllVariantsGrid"];export{o as AllSizes,i as AllStates,n as AllVariantsGrid,a as Default,s as Required,t as WithError,d as WithHelperText,L as __namedExportsOrder,A as default};
