var k=Object.defineProperty;var s=(i,a)=>k(i,"name",{value:a,configurable:!0});import{aw as t,j as e,r as W}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const I={title:"Components/Feedback/Alert",component:t,parameters:{layout:"padded",docs:{description:{component:"Alerts surface contextual feedback. Use `variant` to set the tone (info, success, warning, error), `title` for an optional heading, and `onDismiss` to render a dismiss button."}}},argTypes:{variant:{control:"select",options:["info","success","warning","error"]},title:{control:"text"},children:{control:"text"}}},n={args:{variant:"info",title:"Heads up",children:"This is an informational alert message."}},l={parameters:{docs:{source:{code:`
<Alert variant="info" title="Information">
  This is an informational alert. Use it to provide neutral guidance.
</Alert>
<Alert variant="success" title="Success">
  Your changes have been saved successfully.
</Alert>
<Alert variant="warning" title="Warning">
  This action may have unintended side effects. Proceed with caution.
</Alert>
<Alert variant="error" title="Error">
  Something went wrong. Please try again or contact support.
</Alert>
`.trim()}}},render:s(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",maxWidth:"520px"},children:[e.jsx(t,{variant:"info",title:"Information",children:"This is an informational alert. Use it to provide neutral guidance."}),e.jsx(t,{variant:"success",title:"Success",children:"Your changes have been saved successfully."}),e.jsx(t,{variant:"warning",title:"Warning",children:"This action may have unintended side effects. Proceed with caution."}),e.jsx(t,{variant:"error",title:"Error",children:"Something went wrong. Please try again or contact support."})]}),"render")},o={parameters:{docs:{source:{code:`
<Alert variant="info">Informational message without a title.</Alert>
<Alert variant="success">Your file was uploaded successfully.</Alert>
<Alert variant="warning">Your session is about to expire.</Alert>
<Alert variant="error">Failed to load data. Refresh the page.</Alert>
`.trim()}}},render:s(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",maxWidth:"520px"},children:[e.jsx(t,{variant:"info",children:"Informational message without a title."}),e.jsx(t,{variant:"success",children:"Your file was uploaded successfully."}),e.jsx(t,{variant:"warning",children:"Your session is about to expire."}),e.jsx(t,{variant:"error",children:"Failed to load data. Refresh the page."})]}),"render")},c={parameters:{docs:{source:{code:`
<Alert
  variant="info"
  title="Dismissible alert"
  onDismiss={() => setVisible(false)}
>
  Click the dismiss button to hide this alert.
</Alert>
`.trim()}}},render:s(()=>{const[i,a]=W.useState(!0);return i?e.jsx("div",{style:{maxWidth:"520px"},children:e.jsx(t,{variant:"info",title:"Dismissible alert",onDismiss:s(()=>a(!1),"onDismiss"),children:"Click the dismiss button to hide this alert."})}):e.jsx("p",{style:{color:"var(--color-text-tertiary)"},children:"Alert was dismissed."})},"render")},d={parameters:{docs:{source:{code:`
{variants.filter((v) => !dismissed[v]).map((variant) => (
  <Alert
    key={variant}
    variant={variant}
    title={variant.charAt(0).toUpperCase() + variant.slice(1) + " alert"}
    onDismiss={() => setDismissed((prev) => ({ ...prev, [variant]: true }))}
  >
    This is a dismissible {variant} alert.
  </Alert>
))}
`.trim()}}},render:s(()=>{const[i,a]=W.useState({}),u=["info","success","warning","error"];return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",maxWidth:"520px"},children:[u.filter(r=>!i[r]).map(r=>e.jsxs(t,{variant:r,title:`${r.charAt(0).toUpperCase()+r.slice(1)} alert`,onDismiss:s(()=>a(Y=>({...Y,[r]:!0})),"onDismiss"),children:["This is a dismissible ",r," alert."]},r)),u.every(r=>i[r])&&e.jsx("p",{style:{color:"var(--color-text-tertiary)"},children:"All alerts dismissed."})]})},"render")};var m,p,v;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    variant: "info",
    title: "Heads up",
    children: "This is an informational alert message."
  }
}`,...(v=(p=n.parameters)==null?void 0:p.docs)==null?void 0:v.source}}};var h,f,A;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Alert variant="info" title="Information">
  This is an informational alert. Use it to provide neutral guidance.
</Alert>
<Alert variant="success" title="Success">
  Your changes have been saved successfully.
</Alert>
<Alert variant="warning" title="Warning">
  This action may have unintended side effects. Proceed with caution.
</Alert>
<Alert variant="error" title="Error">
  Something went wrong. Please try again or contact support.
</Alert>
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "520px"
  }}>
      <Alert variant="info" title="Information">
        This is an informational alert. Use it to provide neutral guidance.
      </Alert>
      <Alert variant="success" title="Success">
        Your changes have been saved successfully.
      </Alert>
      <Alert variant="warning" title="Warning">
        This action may have unintended side effects. Proceed with caution.
      </Alert>
      <Alert variant="error" title="Error">
        Something went wrong. Please try again or contact support.
      </Alert>
    </div>
}`,...(A=(f=l.parameters)==null?void 0:f.docs)==null?void 0:A.source}}};var x,g,y;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Alert variant="info">Informational message without a title.</Alert>
<Alert variant="success">Your file was uploaded successfully.</Alert>
<Alert variant="warning">Your session is about to expire.</Alert>
<Alert variant="error">Failed to load data. Refresh the page.</Alert>
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "520px"
  }}>
      <Alert variant="info">Informational message without a title.</Alert>
      <Alert variant="success">Your file was uploaded successfully.</Alert>
      <Alert variant="warning">Your session is about to expire.</Alert>
      <Alert variant="error">Failed to load data. Refresh the page.</Alert>
    </div>
}`,...(y=(g=o.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var b,w,D;c.parameters={...c.parameters,docs:{...(b=c.parameters)==null?void 0:b.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Alert
  variant="info"
  title="Dismissible alert"
  onDismiss={() => setVisible(false)}
>
  Click the dismiss button to hide this alert.
</Alert>
\`.trim()
      }
    }
  },
  render: () => {
    const [visible, setVisible] = useState(true);
    return visible ? <div style={{
      maxWidth: "520px"
    }}>
        <Alert variant="info" title="Dismissible alert" onDismiss={() => setVisible(false)}>
          Click the dismiss button to hide this alert.
        </Alert>
      </div> : <p style={{
      color: "var(--color-text-tertiary)"
    }}>Alert was dismissed.</p>;
  }
}`,...(D=(w=c.parameters)==null?void 0:w.docs)==null?void 0:D.source}}};var j,S,T;d.parameters={...d.parameters,docs:{...(j=d.parameters)==null?void 0:j.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
{variants.filter((v) => !dismissed[v]).map((variant) => (
  <Alert
    key={variant}
    variant={variant}
    title={variant.charAt(0).toUpperCase() + variant.slice(1) + " alert"}
    onDismiss={() => setDismissed((prev) => ({ ...prev, [variant]: true }))}
  >
    This is a dismissible {variant} alert.
  </Alert>
))}
\`.trim()
      }
    }
  },
  render: () => {
    const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
    const variants = ["info", "success", "warning", "error"] as const;
    return <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      maxWidth: "520px"
    }}>
        {variants.filter(v => !dismissed[v]).map(variant => <Alert key={variant} variant={variant} title={\`\${variant.charAt(0).toUpperCase() + variant.slice(1)} alert\`} onDismiss={() => setDismissed(prev => ({
        ...prev,
        [variant]: true
      }))}>
            This is a dismissible {variant} alert.
          </Alert>)}
        {variants.every(v => dismissed[v]) && <p style={{
        color: "var(--color-text-tertiary)"
      }}>All alerts dismissed.</p>}
      </div>;
  }
}`,...(T=(S=d.parameters)==null?void 0:S.docs)==null?void 0:T.source}}};const P=["Default","AllVariants","WithoutTitle","Dismissible","AllVariantsDismissible"];export{l as AllVariants,d as AllVariantsDismissible,n as Default,c as Dismissible,o as WithoutTitle,P as __namedExportsOrder,I as default};
