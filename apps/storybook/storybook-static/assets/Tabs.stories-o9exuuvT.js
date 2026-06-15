import{T as i,j as e}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const a=[{value:"overview",label:"Overview",content:e.jsx("p",{style:{margin:0},children:"Overview panel content goes here."})},{value:"analytics",label:"Analytics",content:e.jsx("p",{style:{margin:0},children:"Analytics data and charts."})},{value:"settings",label:"Settings",content:e.jsx("p",{style:{margin:0},children:"Configuration and preferences."})},{value:"billing",label:"Billing",disabled:!0,content:e.jsx("p",{style:{margin:0},children:"Billing information."})}],z={title:"Components/Tabs",component:i,parameters:{layout:"padded"},argTypes:{orientation:{control:"select",options:["horizontal","vertical"]},size:{control:"select",options:["default","small"]}}},n={args:{tabs:a,defaultValue:"overview"}},t={args:{tabs:a,defaultValue:"overview",orientation:"horizontal"}},r={args:{tabs:a,defaultValue:"overview",orientation:"vertical"}},o={args:{tabs:a,defaultValue:"overview",size:"small"}},s={render:()=>e.jsx(i,{tabs:a,defaultValue:"overview"})},l={render:()=>e.jsx(i,{tabs:[{value:"profile",label:"Profile",content:e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:e.jsx("p",{style:{margin:0,color:"var(--color-text-text-secondary)"},children:"Manage your personal information and account settings."})})},{value:"notifications",label:"Notifications",content:e.jsx("p",{style:{margin:0,color:"var(--color-text-text-secondary)"},children:"Configure how and when you receive notifications."})},{value:"security",label:"Security",content:e.jsx("p",{style:{margin:0,color:"var(--color-text-text-secondary)"},children:"Manage your password, two-factor authentication, and sessions."})}],defaultValue:"profile"})};var c,u,d;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview"
  }
}`,...(d=(u=n.parameters)==null?void 0:u.docs)==null?void 0:d.source}}};var p,m,v;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    orientation: "horizontal"
  }
}`,...(v=(m=t.parameters)==null?void 0:m.docs)==null?void 0:v.source}}};var f,g,y;r.parameters={...r.parameters,docs:{...(f=r.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    orientation: "vertical"
  }
}`,...(y=(g=r.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var b,x,h;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    size: "small"
  }
}`,...(h=(x=o.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var S,w,A;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <Tabs tabs={BASIC_TABS} defaultValue="overview" />
}`,...(A=(w=s.parameters)==null?void 0:w.docs)==null?void 0:A.source}}};var B,T,V;l.parameters={...l.parameters,docs:{...(B=l.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <Tabs tabs={[{
    value: "profile",
    label: "Profile",
    content: <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
              <p style={{
        margin: 0,
        color: "var(--color-text-text-secondary)"
      }}>
                Manage your personal information and account settings.
              </p>
            </div>
  }, {
    value: "notifications",
    label: "Notifications",
    content: <p style={{
      margin: 0,
      color: "var(--color-text-text-secondary)"
    }}>
              Configure how and when you receive notifications.
            </p>
  }, {
    value: "security",
    label: "Security",
    content: <p style={{
      margin: 0,
      color: "var(--color-text-text-secondary)"
    }}>
              Manage your password, two-factor authentication, and sessions.
            </p>
  }]} defaultValue="profile" />
}`,...(V=(T=l.parameters)==null?void 0:T.docs)==null?void 0:V.source}}};const _=["Default","Horizontal","Vertical","Small","WithDisabledTab","RichContent"];export{n as Default,t as Horizontal,l as RichContent,o as Small,r as Vertical,s as WithDisabledTab,_ as __namedExportsOrder,z as default};
