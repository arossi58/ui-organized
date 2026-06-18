var I=Object.defineProperty;var e=(i,o)=>I(i,"name",{value:o,configurable:!0});import{B as n,j as t}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const M={title:"Components/Actions/Button",component:n,parameters:{layout:"padded",docs:{description:{component:"Buttons trigger actions. Use `intent` to convey emphasis and tone, `size` for density, and `icon` / `iconPosition` to pair a label with a leading or trailing icon."}}},argTypes:{intent:{control:"select",options:["primary","secondary","tertiary","ghost","destructive","destructive-ghost"]},size:{control:"select",options:["sm","md","lg"]},icon:{control:"select",options:[void 0,"plus","arrow-right","download","trash","edit","check","close"]},iconPosition:{control:"select",options:["left","right"]},disabled:{control:"boolean"},children:{control:"text"}}},s={args:{children:"Button",intent:"primary",size:"md"}},r={parameters:{docs:{source:{code:`
<Button intent="primary">Primary</Button>
<Button intent="secondary">Secondary</Button>
<Button intent="tertiary">Tertiary</Button>
<Button intent="ghost">Ghost</Button>
<Button intent="destructive">Destructive</Button>
<Button intent="destructive-ghost">Destructive Ghost</Button>
`.trim()}}},render:e(()=>t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"},children:[t.jsx(n,{intent:"primary",children:"Primary"}),t.jsx(n,{intent:"secondary",children:"Secondary"}),t.jsx(n,{intent:"tertiary",children:"Tertiary"}),t.jsx(n,{intent:"ghost",children:"Ghost"}),t.jsx(n,{intent:"destructive",children:"Destructive"}),t.jsx(n,{intent:"destructive-ghost",children:"Destructive Ghost"})]}),"render")},a={parameters:{docs:{source:{code:`
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
`.trim()}}},render:e(()=>t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[t.jsx(n,{size:"sm",children:"Small"}),t.jsx(n,{size:"md",children:"Medium"}),t.jsx(n,{size:"lg",children:"Large"})]}),"render")},d={parameters:{docs:{source:{code:`
<Button icon="plus" iconPosition="left">Add item</Button>
<Button icon="arrow-right" iconPosition="right">Continue</Button>
<Button intent="secondary" icon="download" iconPosition="left">Download</Button>
<Button intent="destructive" icon="trash" iconPosition="left">Delete</Button>

<Button size="sm" icon="plus">Small</Button>
<Button size="md" icon="plus">Medium</Button>
<Button size="lg" icon="plus">Large</Button>
`.trim()}}},render:e(()=>t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[t.jsx(n,{icon:"plus",iconPosition:"left",children:"Add item"}),t.jsx(n,{icon:"arrow-right",iconPosition:"right",children:"Continue"}),t.jsx(n,{intent:"secondary",icon:"download",iconPosition:"left",children:"Download"}),t.jsx(n,{intent:"destructive",icon:"trash",iconPosition:"left",children:"Delete"})]}),t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[t.jsx(n,{size:"sm",icon:"plus",children:"Small"}),t.jsx(n,{size:"md",icon:"plus",children:"Medium"}),t.jsx(n,{size:"lg",icon:"plus",children:"Large"})]})]}),"render")},c={parameters:{docs:{source:{code:`
<Button intent="primary" disabled>Primary</Button>
<Button intent="secondary" disabled>Secondary</Button>
<Button intent="tertiary" disabled>Tertiary</Button>
<Button intent="ghost" disabled>Ghost</Button>
<Button intent="destructive" disabled>Destructive</Button>
<Button intent="destructive-ghost" disabled>Destructive Ghost</Button>
`.trim()}}},render:e(()=>t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"},children:[t.jsx(n,{intent:"primary",disabled:!0,children:"Primary"}),t.jsx(n,{intent:"secondary",disabled:!0,children:"Secondary"}),t.jsx(n,{intent:"tertiary",disabled:!0,children:"Tertiary"}),t.jsx(n,{intent:"ghost",disabled:!0,children:"Ghost"}),t.jsx(n,{intent:"destructive",disabled:!0,children:"Destructive"}),t.jsx(n,{intent:"destructive-ghost",disabled:!0,children:"Destructive Ghost"})]}),"render")},u={parameters:{docs:{source:{code:`
{(["primary", "secondary", "tertiary", "ghost", "destructive", "destructive-ghost"] as const).map((intent) =>
  (["sm", "md", "lg"] as const).map((size) => (
    <Button key={intent + size} intent={intent} size={size}>
      {intent} {size}
    </Button>
  )),
)}
`.trim()}}},render:e(()=>t.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:["primary","secondary","tertiary","ghost","destructive","destructive-ghost"].map(i=>t.jsx("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:["sm","md","lg"].map(o=>t.jsxs(n,{intent:i,size:o,children:[i," ",o]},o))},i))}),"render")};var l,m,p;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    children: "Button",
    intent: "primary",
    size: "md"
  }
}`,...(p=(m=s.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var B,y,g;r.parameters={...r.parameters,docs:{...(B=r.parameters)==null?void 0:B.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Button intent="primary">Primary</Button>
<Button intent="secondary">Secondary</Button>
<Button intent="tertiary">Tertiary</Button>
<Button intent="ghost">Ghost</Button>
<Button intent="destructive">Destructive</Button>
<Button intent="destructive-ghost">Destructive Ghost</Button>
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  }}>
      <Button intent="primary">Primary</Button>
      <Button intent="secondary">Secondary</Button>
      <Button intent="tertiary">Tertiary</Button>
      <Button intent="ghost">Ghost</Button>
      <Button intent="destructive">Destructive</Button>
      <Button intent="destructive-ghost">Destructive Ghost</Button>
    </div>
}`,...(g=(y=r.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var h,x,v;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "12px"
  }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
}`,...(v=(x=a.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var z,f,j;d.parameters={...d.parameters,docs:{...(z=d.parameters)==null?void 0:z.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Button icon="plus" iconPosition="left">Add item</Button>
<Button icon="arrow-right" iconPosition="right">Continue</Button>
<Button intent="secondary" icon="download" iconPosition="left">Download</Button>
<Button intent="destructive" icon="trash" iconPosition="left">Delete</Button>

<Button size="sm" icon="plus">Small</Button>
<Button size="md" icon="plus">Medium</Button>
<Button size="lg" icon="plus">Large</Button>
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  }}>
      <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }}>
        <Button icon="plus" iconPosition="left">Add item</Button>
        <Button icon="arrow-right" iconPosition="right">Continue</Button>
        <Button intent="secondary" icon="download" iconPosition="left">Download</Button>
        <Button intent="destructive" icon="trash" iconPosition="left">Delete</Button>
      </div>
      <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }}>
        <Button size="sm" icon="plus">Small</Button>
        <Button size="md" icon="plus">Medium</Button>
        <Button size="lg" icon="plus">Large</Button>
      </div>
    </div>
}`,...(j=(f=d.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};var D,b,P;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Button intent="primary" disabled>Primary</Button>
<Button intent="secondary" disabled>Secondary</Button>
<Button intent="tertiary" disabled>Tertiary</Button>
<Button intent="ghost" disabled>Ghost</Button>
<Button intent="destructive" disabled>Destructive</Button>
<Button intent="destructive-ghost" disabled>Destructive Ghost</Button>
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  }}>
      <Button intent="primary" disabled>Primary</Button>
      <Button intent="secondary" disabled>Secondary</Button>
      <Button intent="tertiary" disabled>Tertiary</Button>
      <Button intent="ghost" disabled>Ghost</Button>
      <Button intent="destructive" disabled>Destructive</Button>
      <Button intent="destructive-ghost" disabled>Destructive Ghost</Button>
    </div>
}`,...(P=(b=c.parameters)==null?void 0:b.docs)==null?void 0:P.source}}};var S,w,G;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
{(["primary", "secondary", "tertiary", "ghost", "destructive", "destructive-ghost"] as const).map((intent) =>
  (["sm", "md", "lg"] as const).map((size) => (
    <Button key={intent + size} intent={intent} size={size}>
      {intent} {size}
    </Button>
  )),
)}
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  }}>
      {(["primary", "secondary", "tertiary", "ghost", "destructive", "destructive-ghost"] as const).map(intent => <div key={intent} style={{
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }}>
          {(["sm", "md", "lg"] as const).map(size => <Button key={size} intent={intent} size={size}>
              {intent} {size}
            </Button>)}
        </div>)}
    </div>
}`,...(G=(w=u.parameters)==null?void 0:w.docs)==null?void 0:G.source}}};const W=["Default","AllIntents","AllSizes","WithIcon","Disabled","AllVariantsGrid"];export{r as AllIntents,a as AllSizes,u as AllVariantsGrid,s as Default,c as Disabled,d as WithIcon,W as __namedExportsOrder,M as default};
