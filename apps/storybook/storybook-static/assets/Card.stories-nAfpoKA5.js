var b=Object.defineProperty;var e=(a,H)=>b(a,"name",{value:H,configurable:!0});import{aE as d,j as n,aF as i,aG as p,aH as z,B as l,aD as w}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const I={title:"Components/Layout/Card",component:d,parameters:{layout:"padded",docs:{description:{component:"Cards group related content in a surface. Compose `<Card>` with `<CardHeader>`, `<CardBody>`, and `<CardFooter>`, and use `variant` for emphasis and `padding` for density."}}},argTypes:{variant:{control:"select",options:["default","outlined","elevated"]},padding:{control:"select",options:["none","sm","md","lg"]}}},r={parameters:{docs:{source:{code:`
<Card variant="default" padding="md">
  <CardHeader>
    <strong>Card title</strong>
  </CardHeader>
  <CardBody>
    <p>This is the card body content. It can contain any content you need.</p>
  </CardBody>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>
`.trim()}}},render:e(a=>n.jsxs(d,{...a,style:{maxWidth:"380px"},children:[n.jsx(p,{children:n.jsx("strong",{children:"Card title"})}),n.jsx(i,{children:n.jsx("p",{style:{margin:0,color:"var(--color-text-text-secondary)",fontSize:"var(--type-size-body-medium)"},children:"This is the card body content. It can contain any content you need."})}),n.jsx(z,{children:n.jsx(l,{size:"sm",children:"Action"})})]}),"render"),args:{variant:"default",padding:"md"}},t={parameters:{docs:{source:{code:`
<Card variant="default">
  <CardHeader>
    <strong>default</strong>
  </CardHeader>
  <CardBody>
    <p>Card with default variant.</p>
  </CardBody>
</Card>
<Card variant="outlined">
  <CardHeader>
    <strong>outlined</strong>
  </CardHeader>
  <CardBody>
    <p>Card with outlined variant.</p>
  </CardBody>
</Card>
<Card variant="elevated">
  <CardHeader>
    <strong>elevated</strong>
  </CardHeader>
  <CardBody>
    <p>Card with elevated variant.</p>
  </CardBody>
</Card>
`.trim()}}},render:e(()=>n.jsx("div",{style:{display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"flex-start"},children:["default","outlined","elevated"].map(a=>n.jsxs(d,{variant:a,style:{width:"240px"},children:[n.jsx(p,{children:n.jsx("strong",{children:a})}),n.jsx(i,{children:n.jsxs("p",{style:{margin:0,color:"var(--color-text-text-secondary)",fontSize:"var(--type-size-body-medium)"},children:["Card with ",a," variant."]})})]},a))}),"render")},o={parameters:{docs:{source:{code:`
<Card variant="outlined" padding="none">
  <CardBody>
    <p>padding="none"</p>
  </CardBody>
</Card>
<Card variant="outlined" padding="sm">
  <CardBody>
    <p>padding="sm"</p>
  </CardBody>
</Card>
<Card variant="outlined" padding="md">
  <CardBody>
    <p>padding="md"</p>
  </CardBody>
</Card>
<Card variant="outlined" padding="lg">
  <CardBody>
    <p>padding="lg"</p>
  </CardBody>
</Card>
`.trim()}}},render:e(()=>n.jsx("div",{style:{display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"flex-start"},children:["none","sm","md","lg"].map(a=>n.jsx(d,{variant:"outlined",padding:a,style:{width:"200px"},children:n.jsx(i,{children:n.jsxs("p",{style:{margin:0,color:"var(--color-text-text-secondary)",fontSize:"var(--type-size-body-small)"},children:['padding="',a,'"']})})},a))}),"render")},s={parameters:{docs:{source:{code:`
<Card>
  <CardHeader>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <strong>Subscription</strong>
      <Badge variant="success" size="sm">Active</Badge>
    </div>
  </CardHeader>
  <CardBody>
    <p>You are on the Pro plan. Your next billing date is January 1, 2026.</p>
  </CardBody>
  <CardFooter>
    <div style={{ display: "flex", gap: "8px" }}>
      <Button intent="secondary" size="sm">Cancel plan</Button>
      <Button size="sm">Upgrade</Button>
    </div>
  </CardFooter>
</Card>
`.trim()}}},render:e(()=>n.jsxs(d,{style:{maxWidth:"380px"},children:[n.jsx(p,{children:n.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[n.jsx("strong",{children:"Subscription"}),n.jsx(w,{variant:"success",size:"sm",children:"Active"})]})}),n.jsx(i,{children:n.jsx("p",{style:{margin:"0 0 12px",color:"var(--color-text-text-secondary)",fontSize:"var(--type-size-body-medium)"},children:"You are on the Pro plan. Your next billing date is January 1, 2026."})}),n.jsx(z,{children:n.jsxs("div",{style:{display:"flex",gap:"8px"},children:[n.jsx(l,{intent:"secondary",size:"sm",children:"Cancel plan"}),n.jsx(l,{size:"sm",children:"Upgrade"})]})})]}),"render")};var c,C,y;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Card variant="default" padding="md">
  <CardHeader>
    <strong>Card title</strong>
  </CardHeader>
  <CardBody>
    <p>This is the card body content. It can contain any content you need.</p>
  </CardBody>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>
\`.trim()
      }
    }
  },
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
}`,...(y=(C=r.parameters)==null?void 0:C.docs)==null?void 0:y.source}}};var m,g,u;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Card variant="default">
  <CardHeader>
    <strong>default</strong>
  </CardHeader>
  <CardBody>
    <p>Card with default variant.</p>
  </CardBody>
</Card>
<Card variant="outlined">
  <CardHeader>
    <strong>outlined</strong>
  </CardHeader>
  <CardBody>
    <p>Card with outlined variant.</p>
  </CardBody>
</Card>
<Card variant="elevated">
  <CardHeader>
    <strong>elevated</strong>
  </CardHeader>
  <CardBody>
    <p>Card with elevated variant.</p>
  </CardBody>
</Card>
\`.trim()
      }
    }
  },
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
}`,...(u=(g=t.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};var x,v,B;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Card variant="outlined" padding="none">
  <CardBody>
    <p>padding="none"</p>
  </CardBody>
</Card>
<Card variant="outlined" padding="sm">
  <CardBody>
    <p>padding="sm"</p>
  </CardBody>
</Card>
<Card variant="outlined" padding="md">
  <CardBody>
    <p>padding="md"</p>
  </CardBody>
</Card>
<Card variant="outlined" padding="lg">
  <CardBody>
    <p>padding="lg"</p>
  </CardBody>
</Card>
\`.trim()
      }
    }
  },
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
}`,...(B=(v=o.parameters)==null?void 0:v.docs)==null?void 0:B.source}}};var h,f,j;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Card>
  <CardHeader>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <strong>Subscription</strong>
      <Badge variant="success" size="sm">Active</Badge>
    </div>
  </CardHeader>
  <CardBody>
    <p>You are on the Pro plan. Your next billing date is January 1, 2026.</p>
  </CardBody>
  <CardFooter>
    <div style={{ display: "flex", gap: "8px" }}>
      <Button intent="secondary" size="sm">Cancel plan</Button>
      <Button size="sm">Upgrade</Button>
    </div>
  </CardFooter>
</Card>
\`.trim()
      }
    }
  },
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
}`,...(j=(f=s.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};const W=["Default","AllVariants","AllPaddingSizes","RichContent"];export{o as AllPaddingSizes,t as AllVariants,r as Default,s as RichContent,W as __namedExportsOrder,I as default};
