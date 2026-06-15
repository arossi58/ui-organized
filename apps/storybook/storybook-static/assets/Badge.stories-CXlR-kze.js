import{B as s,j as a}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const r=["success","info","info-secondary","caution","warning","error"],c=["sm","md","lg"],E={title:"Components/Badge",component:s,parameters:{layout:"padded"},argTypes:{variant:{control:"select",options:r},size:{control:"select",options:c},emphasized:{control:"boolean"},children:{control:"text"}}},i={args:{children:"Status",variant:"success",size:"md",emphasized:!0}},t={render:()=>a.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:r.map(e=>a.jsx(s,{variant:e,emphasized:!0,children:e},e))})},p={render:()=>a.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:r.map(e=>a.jsx(s,{variant:e,emphasized:!1,children:e},e))})},d={render:()=>a.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:c.map(e=>a.jsx(s,{variant:"success",size:e,children:e},e))})},l={render:()=>a.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:c.map(e=>a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[a.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:r.map(n=>a.jsx(s,{variant:n,size:e,emphasized:!0,children:n},n))}),a.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:r.map(n=>a.jsx(s,{variant:n,size:e,emphasized:!1,children:n},n))})]},e))})};var o,m,x;i.parameters={...i.parameters,docs:{...(o=i.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    children: "Status",
    variant: "success",
    size: "md",
    emphasized: true
  }
}`,...(x=(m=i.parameters)==null?void 0:m.docs)==null?void 0:x.source}}};var g,u,v;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  }}>
      {VARIANTS.map(variant => <Badge key={variant} variant={variant} emphasized>
          {variant}
        </Badge>)}
    </div>
}`,...(v=(u=t.parameters)==null?void 0:u.docs)==null?void 0:v.source}}};var y,f,h;p.parameters={...p.parameters,docs:{...(y=p.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  }}>
      {VARIANTS.map(variant => <Badge key={variant} variant={variant} emphasized={false}>
          {variant}
        </Badge>)}
    </div>
}`,...(h=(f=p.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};var z,S,I;d.parameters={...d.parameters,docs:{...(z=d.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "8px"
  }}>
      {SIZES.map(size => <Badge key={size} variant="success" size={size}>
          {size}
        </Badge>)}
    </div>
}`,...(I=(S=d.parameters)==null?void 0:S.docs)==null?void 0:I.source}}};var j,A,B;l.parameters={...l.parameters,docs:{...(j=l.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }}>
      {SIZES.map(size => <div key={size} style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    }}>
          <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap"
      }}>
            {VARIANTS.map(variant => <Badge key={variant} variant={variant} size={size} emphasized>
                {variant}
              </Badge>)}
          </div>
          <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap"
      }}>
            {VARIANTS.map(variant => <Badge key={variant} variant={variant} size={size} emphasized={false}>
                {variant}
              </Badge>)}
          </div>
        </div>)}
    </div>
}`,...(B=(A=l.parameters)==null?void 0:A.docs)==null?void 0:B.source}}};const V=["Default","Emphasized","Subdued","AllSizes","AllVariantsGrid"];export{d as AllSizes,l as AllVariantsGrid,i as Default,t as Emphasized,p as Subdued,V as __namedExportsOrder,E as default};
