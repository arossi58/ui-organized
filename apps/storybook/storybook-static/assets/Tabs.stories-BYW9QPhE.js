var I=Object.defineProperty;var l=(_,z)=>I(_,"name",{value:z,configurable:!0});import{G as c,j as e}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const n=[{value:"overview",label:"Overview",content:e.jsx("p",{style:{margin:0},children:"Overview panel content goes here."})},{value:"analytics",label:"Analytics",content:e.jsx("p",{style:{margin:0},children:"Analytics data and charts."})},{value:"settings",label:"Settings",content:e.jsx("p",{style:{margin:0},children:"Configuration and preferences."})},{value:"billing",label:"Billing",disabled:!0,content:e.jsx("p",{style:{margin:0},children:"Billing information."})}],O={title:"Components/Navigation/Tabs",component:c,parameters:{layout:"padded",docs:{description:{component:"Tabs organize content into switchable panels. Pass a `tabs` array of `{ value, label, content, disabled }` items, set the initial panel with `defaultValue`, and use `orientation` and `size` to adjust layout and density."}}},argTypes:{orientation:{control:"select",options:["horizontal","vertical"]},size:{control:"select",options:["default","small"]}}},a={parameters:{docs:{source:{code:`
<Tabs tabs={BASIC_TABS} defaultValue="overview" />
`.trim()}}},args:{tabs:n,defaultValue:"overview"}},t={parameters:{docs:{source:{code:`
<Tabs tabs={BASIC_TABS} defaultValue="overview" orientation="horizontal" />
`.trim()}}},args:{tabs:n,defaultValue:"overview",orientation:"horizontal"}},o={parameters:{docs:{source:{code:`
<Tabs tabs={BASIC_TABS} defaultValue="overview" orientation="vertical" />
`.trim()}}},args:{tabs:n,defaultValue:"overview",orientation:"vertical"}},r={parameters:{docs:{source:{code:`
<Tabs tabs={BASIC_TABS} defaultValue="overview" size="small" />
`.trim()}}},args:{tabs:n,defaultValue:"overview",size:"small"}},s={parameters:{docs:{source:{code:`
<Tabs
  tabs={[
    { value: "overview", label: "Overview", content: <p>Overview panel content goes here.</p> },
    { value: "analytics", label: "Analytics", content: <p>Analytics data and charts.</p> },
    { value: "settings", label: "Settings", content: <p>Configuration and preferences.</p> },
    { value: "billing", label: "Billing", disabled: true, content: <p>Billing information.</p> },
  ]}
  defaultValue="overview"
/>
`.trim()}}},render:l(()=>e.jsx(c,{tabs:n,defaultValue:"overview"}),"render")},i={parameters:{docs:{source:{code:`
<Tabs
  tabs={[
    {
      value: "profile",
      label: "Profile",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p>Manage your personal information and account settings.</p>
        </div>
      ),
    },
    {
      value: "notifications",
      label: "Notifications",
      content: <p>Configure how and when you receive notifications.</p>,
    },
    {
      value: "security",
      label: "Security",
      content: <p>Manage your password, two-factor authentication, and sessions.</p>,
    },
  ]}
  defaultValue="profile"
/>
`.trim()}}},render:l(()=>e.jsx(c,{tabs:[{value:"profile",label:"Profile",content:e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:e.jsx("p",{style:{margin:0,color:"var(--color-text-text-secondary)"},children:"Manage your personal information and account settings."})})},{value:"notifications",label:"Notifications",content:e.jsx("p",{style:{margin:0,color:"var(--color-text-text-secondary)"},children:"Configure how and when you receive notifications."})},{value:"security",label:"Security",content:e.jsx("p",{style:{margin:0,color:"var(--color-text-text-secondary)"},children:"Manage your password, two-factor authentication, and sessions."})}],defaultValue:"profile"}),"render")};var u,d,p;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Tabs tabs={BASIC_TABS} defaultValue="overview" />
\`.trim()
      }
    }
  },
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview"
  }
}`,...(p=(d=a.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var v,m,f;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Tabs tabs={BASIC_TABS} defaultValue="overview" orientation="horizontal" />
\`.trim()
      }
    }
  },
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    orientation: "horizontal"
  }
}`,...(f=(m=t.parameters)==null?void 0:m.docs)==null?void 0:f.source}}};var b,g,y;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Tabs tabs={BASIC_TABS} defaultValue="overview" orientation="vertical" />
\`.trim()
      }
    }
  },
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    orientation: "vertical"
  }
}`,...(y=(g=o.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var w,S,h;r.parameters={...r.parameters,docs:{...(w=r.parameters)==null?void 0:w.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Tabs tabs={BASIC_TABS} defaultValue="overview" size="small" />
\`.trim()
      }
    }
  },
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    size: "small"
  }
}`,...(h=(S=r.parameters)==null?void 0:S.docs)==null?void 0:h.source}}};var x,A,B;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Tabs
  tabs={[
    { value: "overview", label: "Overview", content: <p>Overview panel content goes here.</p> },
    { value: "analytics", label: "Analytics", content: <p>Analytics data and charts.</p> },
    { value: "settings", label: "Settings", content: <p>Configuration and preferences.</p> },
    { value: "billing", label: "Billing", disabled: true, content: <p>Billing information.</p> },
  ]}
  defaultValue="overview"
/>
\`.trim()
      }
    }
  },
  render: () => <Tabs tabs={BASIC_TABS} defaultValue="overview" />
}`,...(B=(A=s.parameters)==null?void 0:A.docs)==null?void 0:B.source}}};var T,V,C;i.parameters={...i.parameters,docs:{...(T=i.parameters)==null?void 0:T.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Tabs
  tabs={[
    {
      value: "profile",
      label: "Profile",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p>Manage your personal information and account settings.</p>
        </div>
      ),
    },
    {
      value: "notifications",
      label: "Notifications",
      content: <p>Configure how and when you receive notifications.</p>,
    },
    {
      value: "security",
      label: "Security",
      content: <p>Manage your password, two-factor authentication, and sessions.</p>,
    },
  ]}
  defaultValue="profile"
/>
\`.trim()
      }
    }
  },
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
}`,...(C=(V=i.parameters)==null?void 0:V.docs)==null?void 0:C.source}}};const N=["Default","Horizontal","Vertical","Small","WithDisabledTab","RichContent"];export{a as Default,t as Horizontal,i as RichContent,r as Small,o as Vertical,s as WithDisabledTab,N as __namedExportsOrder,O as default};
