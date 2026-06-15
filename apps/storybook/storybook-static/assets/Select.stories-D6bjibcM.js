import{i as l,j as r}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const e=[{value:"apple",label:"Apple"},{value:"banana",label:"Banana"},{value:"cherry",label:"Cherry"},{value:"durian",label:"Durian",disabled:!0},{value:"elderberry",label:"Elderberry"}],V={title:"Components/Select",component:l,parameters:{layout:"padded"},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},placeholder:{control:"text"},helperText:{control:"text"},error:{control:"text"},disabled:{control:"boolean"},required:{control:"boolean"}}},a={args:{options:e,label:"Favorite fruit",placeholder:"Select a fruit…",size:"md"}},t={args:{options:e,label:"Favorite fruit",placeholder:"Select a fruit…",helperText:"We use this to personalize your experience."}},o={args:{options:e,label:"Favorite fruit",placeholder:"Select a fruit…",error:"Please select an option."}},s={args:{options:e,label:"Favorite fruit",placeholder:"Select a fruit…",required:!0,helperText:"This field is required."}},i={args:{options:e,label:"Favorite fruit",defaultValue:"cherry"}},n={args:{options:e,label:"Favorite fruit",placeholder:"Select a fruit…",disabled:!0}},p={render:()=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[r.jsx(l,{options:e,size:"sm",label:"Small",placeholder:"Small select"}),r.jsx(l,{options:e,size:"md",label:"Medium",placeholder:"Medium select"}),r.jsx(l,{options:e,size:"lg",label:"Large",placeholder:"Large select"})]})},c={render:()=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[r.jsx(l,{options:e,label:"Default",placeholder:"Default state"}),r.jsx(l,{options:e,label:"Required",placeholder:"Required state",required:!0}),r.jsx(l,{options:e,label:"With helper",placeholder:"With helper",helperText:"This is helper text."}),r.jsx(l,{options:e,label:"With value",defaultValue:"apple"}),r.jsx(l,{options:e,label:"Error state",placeholder:"Error state",error:"This field is required."}),r.jsx(l,{options:e,label:"Disabled",placeholder:"Disabled state",disabled:!0})]})};var d,u,h;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    size: "md"
  }
}`,...(h=(u=a.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var m,b,S;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    helperText: "We use this to personalize your experience."
  }
}`,...(S=(b=t.parameters)==null?void 0:b.docs)==null?void 0:S.source}}};var x,f,T;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    error: "Please select an option."
  }
}`,...(T=(f=o.parameters)==null?void 0:f.docs)==null?void 0:T.source}}};var O,g,I;s.parameters={...s.parameters,docs:{...(O=s.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    required: true,
    helperText: "This field is required."
  }
}`,...(I=(g=s.parameters)==null?void 0:g.docs)==null?void 0:I.source}}};var F,v,R;i.parameters={...i.parameters,docs:{...(F=i.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    defaultValue: "cherry"
  }
}`,...(R=(v=i.parameters)==null?void 0:v.docs)==null?void 0:R.source}}};var D,y,P;n.parameters={...n.parameters,docs:{...(D=n.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    disabled: true
  }
}`,...(P=(y=n.parameters)==null?void 0:y.docs)==null?void 0:P.source}}};var W,_,N;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "400px"
  }}>
      <Select options={FRUIT_OPTIONS} size="sm" label="Small" placeholder="Small select" />
      <Select options={FRUIT_OPTIONS} size="md" label="Medium" placeholder="Medium select" />
      <Select options={FRUIT_OPTIONS} size="lg" label="Large" placeholder="Large select" />
    </div>
}`,...(N=(_=p.parameters)==null?void 0:_.docs)==null?void 0:N.source}}};var U,q,j;c.parameters={...c.parameters,docs:{...(U=c.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "400px"
  }}>
      <Select options={FRUIT_OPTIONS} label="Default" placeholder="Default state" />
      <Select options={FRUIT_OPTIONS} label="Required" placeholder="Required state" required />
      <Select options={FRUIT_OPTIONS} label="With helper" placeholder="With helper" helperText="This is helper text." />
      <Select options={FRUIT_OPTIONS} label="With value" defaultValue="apple" />
      <Select options={FRUIT_OPTIONS} label="Error state" placeholder="Error state" error="This field is required." />
      <Select options={FRUIT_OPTIONS} label="Disabled" placeholder="Disabled state" disabled />
    </div>
}`,...(j=(q=c.parameters)==null?void 0:q.docs)==null?void 0:j.source}}};const A=["Default","WithHelperText","WithError","Required","WithDefaultValue","Disabled","AllSizes","AllStates"];export{p as AllSizes,c as AllStates,a as Default,n as Disabled,s as Required,i as WithDefaultValue,o as WithError,t as WithHelperText,A as __namedExportsOrder,V as default};
