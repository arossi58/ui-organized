import{a as e,j as t}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const A={title:"Components/Button",component:e,parameters:{layout:"padded"},argTypes:{intent:{control:"select",options:["primary","secondary","tertiary","ghost","destructive","destructive-ghost"]},size:{control:"select",options:["sm","md","lg"]},icon:{control:"select",options:[void 0,"plus","arrow-right","download","trash","edit","check","close"]},iconPosition:{control:"select",options:["left","right"]},disabled:{control:"boolean"},children:{control:"text"}}},n={args:{children:"Button",intent:"primary",size:"md"}},i={render:()=>t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"},children:[t.jsx(e,{intent:"primary",children:"Primary"}),t.jsx(e,{intent:"secondary",children:"Secondary"}),t.jsx(e,{intent:"tertiary",children:"Tertiary"}),t.jsx(e,{intent:"ghost",children:"Ghost"}),t.jsx(e,{intent:"destructive",children:"Destructive"}),t.jsx(e,{intent:"destructive-ghost",children:"Destructive Ghost"})]})},s={render:()=>t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[t.jsx(e,{size:"sm",children:"Small"}),t.jsx(e,{size:"md",children:"Medium"}),t.jsx(e,{size:"lg",children:"Large"})]})},r={render:()=>t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[t.jsx(e,{icon:"plus",iconPosition:"left",children:"Add item"}),t.jsx(e,{icon:"arrow-right",iconPosition:"right",children:"Continue"}),t.jsx(e,{intent:"secondary",icon:"download",iconPosition:"left",children:"Download"}),t.jsx(e,{intent:"destructive",icon:"trash",iconPosition:"left",children:"Delete"})]}),t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[t.jsx(e,{size:"sm",icon:"plus",children:"Small"}),t.jsx(e,{size:"md",icon:"plus",children:"Medium"}),t.jsx(e,{size:"lg",icon:"plus",children:"Large"})]})]})},o={render:()=>t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"},children:[t.jsx(e,{intent:"primary",disabled:!0,children:"Primary"}),t.jsx(e,{intent:"secondary",disabled:!0,children:"Secondary"}),t.jsx(e,{intent:"tertiary",disabled:!0,children:"Tertiary"}),t.jsx(e,{intent:"ghost",disabled:!0,children:"Ghost"}),t.jsx(e,{intent:"destructive",disabled:!0,children:"Destructive"}),t.jsx(e,{intent:"destructive-ghost",disabled:!0,children:"Destructive Ghost"})]})},a={render:()=>t.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:["primary","secondary","tertiary","ghost","destructive","destructive-ghost"].map(d=>t.jsx("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:["sm","md","lg"].map(l=>t.jsxs(e,{intent:d,size:l,children:[d," ",l]},l))},d))})};var c,u,p;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    children: "Button",
    intent: "primary",
    size: "md"
  }
}`,...(p=(u=n.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var m,x,y;i.parameters={...i.parameters,docs:{...(m=i.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(y=(x=i.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var g,h,B;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "12px"
  }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
}`,...(B=(h=s.parameters)==null?void 0:h.docs)==null?void 0:B.source}}};var v,f,j;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(j=(f=r.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};var z,D,b;o.parameters={...o.parameters,docs:{...(z=o.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(b=(D=o.parameters)==null?void 0:D.docs)==null?void 0:b.source}}};var I,S,P;a.parameters={...a.parameters,docs:{...(I=a.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(P=(S=a.parameters)==null?void 0:S.docs)==null?void 0:P.source}}};const W=["Default","AllIntents","AllSizes","WithIcon","Disabled","AllVariantsGrid"];export{i as AllIntents,s as AllSizes,a as AllVariantsGrid,n as Default,o as Disabled,r as WithIcon,W as __namedExportsOrder,A as default};
