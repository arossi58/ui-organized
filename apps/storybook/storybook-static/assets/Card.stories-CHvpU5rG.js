import{C as r,j as e,b as o,c as l,d as z,a as i,B}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const w={title:"Components/Card",component:r,parameters:{layout:"padded"},argTypes:{variant:{control:"select",options:["default","outlined","elevated"]},padding:{control:"select",options:["none","sm","md","lg"]}}},a={render:n=>e.jsxs(r,{...n,style:{maxWidth:"380px"},children:[e.jsx(l,{children:e.jsx("strong",{children:"Card title"})}),e.jsx(o,{children:e.jsx("p",{style:{margin:0,color:"var(--color-text-text-secondary)",fontSize:"var(--type-size-body-medium)"},children:"This is the card body content. It can contain any content you need."})}),e.jsx(z,{children:e.jsx(i,{size:"sm",children:"Action"})})]}),args:{variant:"default",padding:"md"}},t={render:()=>e.jsx("div",{style:{display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"flex-start"},children:["default","outlined","elevated"].map(n=>e.jsxs(r,{variant:n,style:{width:"240px"},children:[e.jsx(l,{children:e.jsx("strong",{children:n})}),e.jsx(o,{children:e.jsxs("p",{style:{margin:0,color:"var(--color-text-text-secondary)",fontSize:"var(--type-size-body-medium)"},children:["Card with ",n," variant."]})})]},n))})},s={render:()=>e.jsx("div",{style:{display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"flex-start"},children:["none","sm","md","lg"].map(n=>e.jsx(r,{variant:"outlined",padding:n,style:{width:"200px"},children:e.jsx(o,{children:e.jsxs("p",{style:{margin:0,color:"var(--color-text-text-secondary)",fontSize:"var(--type-size-body-small)"},children:['padding="',n,'"']})})},n))})},d={render:()=>e.jsxs(r,{style:{maxWidth:"380px"},children:[e.jsx(l,{children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("strong",{children:"Subscription"}),e.jsx(B,{variant:"success",size:"sm",children:"Active"})]})}),e.jsx(o,{children:e.jsx("p",{style:{margin:"0 0 12px",color:"var(--color-text-text-secondary)",fontSize:"var(--type-size-body-medium)"},children:"You are on the Pro plan. Your next billing date is January 1, 2026."})}),e.jsx(z,{children:e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsx(i,{intent:"secondary",size:"sm",children:"Cancel plan"}),e.jsx(i,{size:"sm",children:"Upgrade"})]})})]})};var c,p,x;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: args => <Card {...args} style={{
    maxWidth: "380px"
  }}>
      <CardHeader>
        <strong>Card title</strong>
      </CardHeader>
      <CardBody>
        <p style={{
        margin: 0,
        color: "var(--color-text-text-secondary)",
        fontSize: "var(--type-size-body-medium)"
      }}>
          This is the card body content. It can contain any content you need.
        </p>
      </CardBody>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>,
  args: {
    variant: "default",
    padding: "md"
  }
}`,...(x=(p=a.parameters)==null?void 0:p.docs)==null?void 0:x.source}}};var y,m,g;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    alignItems: "flex-start"
  }}>
      {(["default", "outlined", "elevated"] as const).map(variant => <Card key={variant} variant={variant} style={{
      width: "240px"
    }}>
          <CardHeader>
            <strong>{variant}</strong>
          </CardHeader>
          <CardBody>
            <p style={{
          margin: 0,
          color: "var(--color-text-text-secondary)",
          fontSize: "var(--type-size-body-medium)"
        }}>
              Card with {variant} variant.
            </p>
          </CardBody>
        </Card>)}
    </div>
}`,...(g=(m=t.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var u,h,v;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    alignItems: "flex-start"
  }}>
      {(["none", "sm", "md", "lg"] as const).map(padding => <Card key={padding} variant="outlined" padding={padding} style={{
      width: "200px"
    }}>
          <CardBody>
            <p style={{
          margin: 0,
          color: "var(--color-text-text-secondary)",
          fontSize: "var(--type-size-body-small)"
        }}>
              padding="{padding}"
            </p>
          </CardBody>
        </Card>)}
    </div>
}`,...(v=(h=s.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var C,f,j;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <Card style={{
    maxWidth: "380px"
  }}>
      <CardHeader>
        <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
          <strong>Subscription</strong>
          <Badge variant="success" size="sm">Active</Badge>
        </div>
      </CardHeader>
      <CardBody>
        <p style={{
        margin: "0 0 12px",
        color: "var(--color-text-text-secondary)",
        fontSize: "var(--type-size-body-medium)"
      }}>
          You are on the Pro plan. Your next billing date is January 1, 2026.
        </p>
      </CardBody>
      <CardFooter>
        <div style={{
        display: "flex",
        gap: "8px"
      }}>
          <Button intent="secondary" size="sm">Cancel plan</Button>
          <Button size="sm">Upgrade</Button>
        </div>
      </CardFooter>
    </Card>
}`,...(j=(f=d.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};const A=["Default","AllVariants","AllPaddingSizes","RichContent"];export{s as AllPaddingSizes,t as AllVariants,a as Default,d as RichContent,A as __namedExportsOrder,w as default};
