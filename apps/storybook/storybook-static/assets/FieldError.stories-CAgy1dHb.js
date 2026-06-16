var V=Object.defineProperty;var s=(D,S)=>V(D,"name",{value:S,configurable:!0});import{F as C,j as o,I as L}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const T={title:"Components/Forms/FieldError",component:C,parameters:{layout:"padded",docs:{description:{component:"FieldError renders a validation error pill from the message passed as `children`, and renders nothing when the message is empty; it typically sits beneath an invalid form control."}}},argTypes:{children:{control:"text"}}},e={args:{children:"Error message"}},r={args:{children:""}},a={args:{children:"Please enter a valid email address before continuing."}},n={parameters:{docs:{source:{code:`
<Input
  label="Email"
  placeholder="you@example.com"
  defaultValue="not-an-email"
  error="Enter a valid email address."
/>
`.trim()}}},render:s(()=>o.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"320px"},children:o.jsx(L,{label:"Email",placeholder:"you@example.com",defaultValue:"not-an-email",error:"Enter a valid email address."})}),"render")};var t,i,l,d,c;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    children: "Error message"
  }
}`,...(l=(i=e.parameters)==null?void 0:i.docs)==null?void 0:l.source},description:{story:"The error pill on its own, matching Figma 580:7201.",...(c=(d=e.parameters)==null?void 0:d.docs)==null?void 0:c.description}}};var m,p,u,g,h;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    children: ""
  }
}`,...(u=(p=r.parameters)==null?void 0:p.docs)==null?void 0:u.source},description:{story:"Renders nothing when there is no message.",...(h=(g=r.parameters)==null?void 0:g.docs)==null?void 0:h.description}}};var x,y,f,E,v;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    children: "Please enter a valid email address before continuing."
  }
}`,...(f=(y=a.parameters)==null?void 0:y.docs)==null?void 0:f.source},description:{story:"Longer copy wraps inside the pill rather than overflowing the field.",...(v=(E=a.parameters)==null?void 0:E.docs)==null?void 0:v.description}}};var F,b,w,I,j;n.parameters={...n.parameters,docs:{...(F=n.parameters)==null?void 0:F.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Input
  label="Email"
  placeholder="you@example.com"
  defaultValue="not-an-email"
  error="Enter a valid email address."
/>
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "320px"
  }}>
      <Input label="Email" placeholder="you@example.com" defaultValue="not-an-email" error="Enter a valid email address." />
    </div>
}`,...(w=(b=n.parameters)==null?void 0:b.docs)==null?void 0:w.source},description:{story:"How it appears in context, wired under an invalid form control.",...(j=(I=n.parameters)==null?void 0:I.docs)==null?void 0:j.description}}};const W=["Default","Empty","LongMessage","InFormContext"];export{e as Default,r as Empty,n as InFormContext,a as LongMessage,W as __namedExportsOrder,T as default};
