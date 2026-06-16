var g=Object.defineProperty;var t=(h,C)=>g(h,"name",{value:C,configurable:!0});import{at as n,j as e,au as c,av as m}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const y={title:"Components/Disclosure/Collapsible",component:n,parameters:{layout:"padded",docs:{description:{component:"A single disclosure section that animates open and closed. Compose `<Collapsible>` with `<CollapsibleTrigger>` and `<CollapsibleContent>`."}}}},s={render:t(()=>e.jsxs(n,{style:{maxWidth:360},children:[e.jsx(c,{children:"Show details"}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"This content is revealed when the trigger is activated. Its height animates via Base UI's panel measurement, so it works with dynamic content."})})]}),"render")},a={render:t(()=>e.jsxs(n,{defaultOpen:!0,style:{maxWidth:360},children:[e.jsx(c,{children:"Hide details"}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"Starts expanded via `defaultOpen`."})})]}),"render")};var l,i,r;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <Collapsible style={{
    maxWidth: 360
  }}>
      <CollapsibleTrigger>Show details</CollapsibleTrigger>
      <CollapsibleContent>
        <p style={{
        margin: 0
      }}>
          This content is revealed when the trigger is activated. Its height animates via Base UI's
          panel measurement, so it works with dynamic content.
        </p>
      </CollapsibleContent>
    </Collapsible>
}`,...(r=(i=s.parameters)==null?void 0:i.docs)==null?void 0:r.source}}};var o,p,d;a.parameters={...a.parameters,docs:{...(o=a.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => <Collapsible defaultOpen style={{
    maxWidth: 360
  }}>
      <CollapsibleTrigger>Hide details</CollapsibleTrigger>
      <CollapsibleContent>
        <p style={{
        margin: 0
      }}>Starts expanded via \`defaultOpen\`.</p>
      </CollapsibleContent>
    </Collapsible>
}`,...(d=(p=a.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};const j=["Default","InitiallyOpen"];export{s as Default,a as InitiallyOpen,j as __namedExportsOrder,y as default};
