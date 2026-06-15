import{A as s,j as e,r as W}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const C={title:"Components/Alert",component:s,parameters:{layout:"padded"},argTypes:{variant:{control:"select",options:["info","success","warning","error"]},title:{control:"text"},children:{control:"text"}}},i={args:{variant:"info",title:"Heads up",children:"This is an informational alert message."}},a={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",maxWidth:"520px"},children:[e.jsx(s,{variant:"info",title:"Information",children:"This is an informational alert. Use it to provide neutral guidance."}),e.jsx(s,{variant:"success",title:"Success",children:"Your changes have been saved successfully."}),e.jsx(s,{variant:"warning",title:"Warning",children:"This action may have unintended side effects. Proceed with caution."}),e.jsx(s,{variant:"error",title:"Error",children:"Something went wrong. Please try again or contact support."})]})},n={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",maxWidth:"520px"},children:[e.jsx(s,{variant:"info",children:"Informational message without a title."}),e.jsx(s,{variant:"success",children:"Your file was uploaded successfully."}),e.jsx(s,{variant:"warning",children:"Your session is about to expire."}),e.jsx(s,{variant:"error",children:"Failed to load data. Refresh the page."})]})},l={render:()=>{const[r,c]=W.useState(!0);return r?e.jsx("div",{style:{maxWidth:"520px"},children:e.jsx(s,{variant:"info",title:"Dismissible alert",onDismiss:()=>c(!1),children:"Click the dismiss button to hide this alert."})}):e.jsx("p",{style:{color:"var(--color-text-text-tertiary)"},children:"Alert was dismissed."})}},o={render:()=>{const[r,c]=W.useState({}),d=["info","success","warning","error"];return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",maxWidth:"520px"},children:[d.filter(t=>!r[t]).map(t=>e.jsxs(s,{variant:t,title:`${t.charAt(0).toUpperCase()+t.slice(1)} alert`,onDismiss:()=>c(T=>({...T,[t]:!0})),children:["This is a dismissible ",t," alert."]},t)),d.every(t=>r[t])&&e.jsx("p",{style:{color:"var(--color-text-text-tertiary)"},children:"All alerts dismissed."})]})}};var m,p,u;i.parameters={...i.parameters,docs:{...(m=i.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    variant: "info",
    title: "Heads up",
    children: "This is an informational alert message."
  }
}`,...(u=(p=i.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var x,v,h;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(h=(v=a.parameters)==null?void 0:v.docs)==null?void 0:h.source}}};var f,g,y;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(y=(g=n.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var A,b,D;l.parameters={...l.parameters,docs:{...(A=l.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => {
    const [visible, setVisible] = useState(true);
    return visible ? <div style={{
      maxWidth: "520px"
    }}>
        <Alert variant="info" title="Dismissible alert" onDismiss={() => setVisible(false)}>
          Click the dismiss button to hide this alert.
        </Alert>
      </div> : <p style={{
      color: "var(--color-text-text-tertiary)"
    }}>Alert was dismissed.</p>;
  }
}`,...(D=(b=l.parameters)==null?void 0:b.docs)==null?void 0:D.source}}};var w,j,S;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
        color: "var(--color-text-text-tertiary)"
      }}>All alerts dismissed.</p>}
      </div>;
  }
}`,...(S=(j=o.parameters)==null?void 0:j.docs)==null?void 0:S.source}}};const E=["Default","AllVariants","WithoutTitle","Dismissible","AllVariantsDismissible"];export{a as AllVariants,o as AllVariantsDismissible,i as Default,l as Dismissible,n as WithoutTitle,E as __namedExportsOrder,C as default};
