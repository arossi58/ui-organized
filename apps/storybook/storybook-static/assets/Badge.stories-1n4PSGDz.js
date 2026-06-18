var R=Object.defineProperty;var r=(e,n)=>R(e,"name",{value:n,configurable:!0});import{aD as s,j as a}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const i=["success","info","info-secondary","caution","warning","error"],l=["sm","md","lg"],D={title:"Components/Data Display/Badge",component:s,parameters:{layout:"padded",docs:{description:{component:"Badges label and categorize content. Use `variant` to convey status (success, info, info-secondary, caution, warning, error), `size` for density, and `emphasized` to toggle between a solid and subdued style."}}},argTypes:{variant:{control:"select",options:i},size:{control:"select",options:l},emphasized:{control:"boolean"},children:{control:"text"}}},d={args:{children:"Status",variant:"success",size:"md",emphasized:!0}},t={parameters:{docs:{source:{code:`
<Badge variant="success" emphasized>success</Badge>
<Badge variant="info" emphasized>info</Badge>
<Badge variant="info-secondary" emphasized>info-secondary</Badge>
<Badge variant="caution" emphasized>caution</Badge>
<Badge variant="warning" emphasized>warning</Badge>
<Badge variant="error" emphasized>error</Badge>
`.trim()}}},render:r(()=>a.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:i.map(e=>a.jsx(s,{variant:e,emphasized:!0,children:e},e))}),"render")},c={parameters:{docs:{source:{code:`
<Badge variant="success" emphasized={false}>success</Badge>
<Badge variant="info" emphasized={false}>info</Badge>
<Badge variant="info-secondary" emphasized={false}>info-secondary</Badge>
<Badge variant="caution" emphasized={false}>caution</Badge>
<Badge variant="warning" emphasized={false}>warning</Badge>
<Badge variant="error" emphasized={false}>error</Badge>
`.trim()}}},render:r(()=>a.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:i.map(e=>a.jsx(s,{variant:e,emphasized:!1,children:e},e))}),"render")},o={parameters:{docs:{source:{code:`
<Badge variant="success" size="sm">sm</Badge>
<Badge variant="success" size="md">md</Badge>
<Badge variant="success" size="lg">lg</Badge>
`.trim()}}},render:r(()=>a.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:l.map(e=>a.jsx(s,{variant:"success",size:e,children:e},e))}),"render")},p={parameters:{docs:{source:{code:`
{SIZES.map((size) => (
  <React.Fragment key={size}>
    {VARIANTS.map((variant) => (
      <Badge key={variant} variant={variant} size={size} emphasized>
        {variant}
      </Badge>
    ))}
    {VARIANTS.map((variant) => (
      <Badge key={variant} variant={variant} size={size} emphasized={false}>
        {variant}
      </Badge>
    ))}
  </React.Fragment>
))}
`.trim()}}},render:r(()=>a.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:l.map(e=>a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[a.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:i.map(n=>a.jsx(s,{variant:n,size:e,emphasized:!0,children:n},n))}),a.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:i.map(n=>a.jsx(s,{variant:n,size:e,emphasized:!1,children:n},n))})]},e))}),"render")};var m,g,v;d.parameters={...d.parameters,docs:{...(m=d.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    children: "Status",
    variant: "success",
    size: "md",
    emphasized: true
  }
}`,...(v=(g=d.parameters)==null?void 0:g.docs)==null?void 0:v.source}}};var B,u,z;t.parameters={...t.parameters,docs:{...(B=t.parameters)==null?void 0:B.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Badge variant="success" emphasized>success</Badge>
<Badge variant="info" emphasized>info</Badge>
<Badge variant="info-secondary" emphasized>info-secondary</Badge>
<Badge variant="caution" emphasized>caution</Badge>
<Badge variant="warning" emphasized>warning</Badge>
<Badge variant="error" emphasized>error</Badge>
\`.trim()
      }
    }
  },
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
}`,...(z=(u=t.parameters)==null?void 0:u.docs)==null?void 0:z.source}}};var f,h,x;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Badge variant="success" emphasized={false}>success</Badge>
<Badge variant="info" emphasized={false}>info</Badge>
<Badge variant="info-secondary" emphasized={false}>info-secondary</Badge>
<Badge variant="caution" emphasized={false}>caution</Badge>
<Badge variant="warning" emphasized={false}>warning</Badge>
<Badge variant="error" emphasized={false}>error</Badge>
\`.trim()
      }
    }
  },
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
}`,...(x=(h=c.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var y,S,I;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Badge variant="success" size="sm">sm</Badge>
<Badge variant="success" size="md">md</Badge>
<Badge variant="success" size="lg">lg</Badge>
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "8px"
  }}>
      {SIZES.map(size => <Badge key={size} variant="success" size={size}>
          {size}
        </Badge>)}
    </div>
}`,...(I=(S=o.parameters)==null?void 0:S.docs)==null?void 0:I.source}}};var A,w,j;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
{SIZES.map((size) => (
  <React.Fragment key={size}>
    {VARIANTS.map((variant) => (
      <Badge key={variant} variant={variant} size={size} emphasized>
        {variant}
      </Badge>
    ))}
    {VARIANTS.map((variant) => (
      <Badge key={variant} variant={variant} size={size} emphasized={false}>
        {variant}
      </Badge>
    ))}
  </React.Fragment>
))}
\`.trim()
      }
    }
  },
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
}`,...(j=(w=p.parameters)==null?void 0:w.docs)==null?void 0:j.source}}};const E=["Default","Emphasized","Subdued","AllSizes","AllVariantsGrid"];export{o as AllSizes,p as AllVariantsGrid,d as Default,t as Emphasized,c as Subdued,E as __namedExportsOrder,D as default};
