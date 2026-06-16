var g=Object.defineProperty;var o=(n,x)=>g(n,"name",{value:x,configurable:!0});import{a as r,j as e}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const a=[{value:"apple",label:"Apple"},{value:"banana",label:"Banana"},{value:"blueberry",label:"Blueberry"},{value:"grapes",label:"Grapes"},{value:"orange",label:"Orange"},{value:"pineapple",label:"Pineapple"},{value:"strawberry",label:"Strawberry"}],F={title:"Components/Forms/Combobox",component:r,parameters:{layout:"padded",docs:{description:{component:"A searchable Select. Type to filter `options` by label; shows an empty state when nothing matches. Mirrors Select's field API (label, helper text, error, sizes)."}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},disabled:{control:"boolean"}}},l={render:o(n=>e.jsx("div",{style:{width:280},children:e.jsx(r,{...n})}),"render"),args:{label:"Favorite fruit",placeholder:"Search fruits…",options:a,helperText:"Start typing to filter"}},s={render:o(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16,width:280},children:[e.jsx(r,{label:"Small",size:"sm",placeholder:"Search…",options:a}),e.jsx(r,{label:"Medium",size:"md",placeholder:"Search…",options:a}),e.jsx(r,{label:"Large",size:"lg",placeholder:"Search…",options:a})]}),"render")},t={render:o(()=>e.jsx("div",{style:{width:280},children:e.jsx(r,{label:"Fruit",placeholder:"Search…",options:a,error:"Please pick one"})}),"render")};var i,p,c;l.parameters={...l.parameters,docs:{...(i=l.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div style={{
    width: 280
  }}>
      <Combobox {...args} />
    </div>,
  args: {
    label: "Favorite fruit",
    placeholder: "Search fruits…",
    options: FRUITS,
    helperText: "Start typing to filter"
  }
}`,...(c=(p=l.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};var d,m,b;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: 280
  }}>
      <Combobox label="Small" size="sm" placeholder="Search…" options={FRUITS} />
      <Combobox label="Medium" size="md" placeholder="Search…" options={FRUITS} />
      <Combobox label="Large" size="lg" placeholder="Search…" options={FRUITS} />
    </div>
}`,...(b=(m=s.parameters)==null?void 0:m.docs)==null?void 0:b.source}}};var h,u,S;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 280
  }}>
      <Combobox label="Fruit" placeholder="Search…" options={FRUITS} error="Please pick one" />
    </div>
}`,...(S=(u=t.parameters)==null?void 0:u.docs)==null?void 0:S.source}}};const j=["Default","Sizes","WithError"];export{l as Default,s as Sizes,t as WithError,j as __namedExportsOrder,F as default};
