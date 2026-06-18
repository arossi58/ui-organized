var h=Object.defineProperty;var r=(e,u)=>h(e,"name",{value:u,configurable:!0});import{as as n,j as s}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const p=[{value:"what",title:"What is this design system?",content:"A React component library built on Base UI primitives, themed with design tokens."},{value:"how",title:"How do I install it?",content:"Add @ui-organized/react and import the stylesheet once at your app root."},{value:"themes",title:"Does it support dark mode?",content:"Yes — toggle the data-theme attribute and every component re-themes instantly.",disabled:!1}],g={title:"Components/Disclosure/Accordion",component:n,parameters:{layout:"padded",docs:{description:{component:"A vertically stacked set of expandable panels. Pass an `items` array; use `multiple`, `variant`, and `size`."}}},argTypes:{variant:{control:"select",options:["default","bordered","separated"]},size:{control:"select",options:["sm","md","lg"]},multiple:{control:"boolean"}}},t={render:r(e=>s.jsx("div",{style:{width:480},children:s.jsx(n,{...e})}),"render"),args:{items:p,multiple:!0,variant:"default",size:"md",defaultValue:["what"]}},a={render:r(()=>s.jsx("div",{style:{width:480,display:"flex",flexDirection:"column",gap:24},children:["default","bordered","separated"].map(e=>s.jsx(n,{items:p,variant:e,defaultValue:["what"]},e))}),"render")};var o,i,d;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => <div style={{
    width: 480
  }}>
      <Accordion {...args} />
    </div>,
  args: {
    items: ITEMS,
    multiple: true,
    variant: "default",
    size: "md",
    defaultValue: ["what"]
  }
}`,...(d=(i=t.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};var l,c,m;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 480,
    display: "flex",
    flexDirection: "column",
    gap: 24
  }}>
      {(["default", "bordered", "separated"] as const).map(variant => <Accordion key={variant} items={ITEMS} variant={variant} defaultValue={["what"]} />)}
    </div>
}`,...(m=(c=a.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};const x=["Default","Variants"];export{t as Default,a as Variants,x as __namedExportsOrder,g as default};
