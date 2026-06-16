var h=Object.defineProperty;var a=(n,j)=>h(n,"name",{value:j,configurable:!0});import{g as r,j as e,h as v}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const P={title:"Components/Actions/Toggle",component:r,parameters:{layout:"centered",docs:{description:{component:"A two-state button that can be on or off. Use a standalone `<Toggle>` (`pressed`/`defaultPressed`) or group several inside `<ToggleGroup>` for single- or multi-select."}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},disabled:{control:"boolean"}}},s={render:a(n=>e.jsx(r,{...n,children:e.jsx("span",{children:"Bookmark"})}),"render"),args:{icon:"bookmark",defaultPressed:!1,size:"md"}},o={render:a(()=>e.jsxs(v,{defaultValue:["grid"],children:[e.jsx(r,{value:"list",icon:"list","aria-label":"List view"}),e.jsx(r,{value:"grid",icon:"grid","aria-label":"Grid view"})]}),"render")},l={render:a(()=>e.jsxs(v,{defaultValue:["star"],multiple:!0,children:[e.jsx(r,{value:"star",icon:"star","aria-label":"Star"}),e.jsx(r,{value:"heart",icon:"heart","aria-label":"Heart"}),e.jsx(r,{value:"bookmark",icon:"bookmark","aria-label":"Bookmark"})]}),"render")},t={render:a(()=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx(r,{size:"sm",defaultPressed:!0,children:"sm"}),e.jsx(r,{size:"md",defaultPressed:!0,children:"md"}),e.jsx(r,{size:"lg",defaultPressed:!0,children:"lg"})]}),"render")};var i,d,g;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <Toggle {...args}>
      <span>Bookmark</span>
    </Toggle>,
  args: {
    icon: "bookmark",
    defaultPressed: false,
    size: "md"
  }
}`,...(g=(d=s.parameters)==null?void 0:d.docs)==null?void 0:g.source}}};var c,u,m;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <ToggleGroup defaultValue={["grid"]}>
      <Toggle value="list" icon="list" aria-label="List view" />
      <Toggle value="grid" icon="grid" aria-label="Grid view" />
    </ToggleGroup>
}`,...(m=(u=o.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var p,f,T;l.parameters={...l.parameters,docs:{...(p=l.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <ToggleGroup defaultValue={["star"]} multiple>
      <Toggle value="star" icon="star" aria-label="Star" />
      <Toggle value="heart" icon="heart" aria-label="Heart" />
      <Toggle value="bookmark" icon="bookmark" aria-label="Bookmark" />
    </ToggleGroup>
}`,...(T=(f=l.parameters)==null?void 0:f.docs)==null?void 0:T.source}}};var b,k,x;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: 12
  }}>
      <Toggle size="sm" defaultPressed>sm</Toggle>
      <Toggle size="md" defaultPressed>md</Toggle>
      <Toggle size="lg" defaultPressed>lg</Toggle>
    </div>
}`,...(x=(k=t.parameters)==null?void 0:k.docs)==null?void 0:x.source}}};const y=["Default","SingleSelectGroup","MultiSelectGroup","Sizes"];export{s as Default,l as MultiSelectGroup,o as SingleSelectGroup,t as Sizes,y as __namedExportsOrder,P as default};
