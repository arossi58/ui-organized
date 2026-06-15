import{F as j,j as o,I as D}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const L={title:"Components/FieldError",component:j,parameters:{layout:"padded"},argTypes:{children:{control:"text"}}},e={args:{children:"Error message"}},r={args:{children:""}},a={args:{children:"Please enter a valid email address before continuing."}},s={render:()=>o.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"320px"},children:o.jsx(D,{label:"Email",placeholder:"you@example.com",defaultValue:"not-an-email",error:"Enter a valid email address."})})};var n,t,i,d,c;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    children: "Error message"
  }
}`,...(i=(t=e.parameters)==null?void 0:t.docs)==null?void 0:i.source},description:{story:"The error pill on its own, matching Figma 580:7201.",...(c=(d=e.parameters)==null?void 0:d.docs)==null?void 0:c.description}}};var l,p,m,u,g;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    children: ""
  }
}`,...(m=(p=r.parameters)==null?void 0:p.docs)==null?void 0:m.source},description:{story:"Renders nothing when there is no message.",...(g=(u=r.parameters)==null?void 0:u.docs)==null?void 0:g.description}}};var x,h,f,y,E;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    children: "Please enter a valid email address before continuing."
  }
}`,...(f=(h=a.parameters)==null?void 0:h.docs)==null?void 0:f.source},description:{story:"Longer copy wraps inside the pill rather than overflowing the field.",...(E=(y=a.parameters)==null?void 0:y.docs)==null?void 0:E.description}}};var v,w,F,I,b;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "320px"
  }}>
      <Input label="Email" placeholder="you@example.com" defaultValue="not-an-email" error="Enter a valid email address." />
    </div>
}`,...(F=(w=s.parameters)==null?void 0:w.docs)==null?void 0:F.source},description:{story:"How it appears in context, wired under an invalid form control.",...(b=(I=s.parameters)==null?void 0:I.docs)==null?void 0:b.description}}};const M=["Default","Empty","LongMessage","InFormContext"];export{e as Default,r as Empty,s as InFormContext,a as LongMessage,M as __namedExportsOrder,L as default};
