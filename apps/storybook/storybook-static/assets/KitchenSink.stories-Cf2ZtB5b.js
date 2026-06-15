import{r as i,j as e,A as s,B as n,C as v,c as g,b as y,I as r,i as b,R as j,k as C,e as B,d as S,a,T as A,f as D}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const I={title:"Overview/Kitchen Sink",parameters:{layout:"padded"}},t={render:()=>{const[x,u]=i.useState(!0),[o,m]=i.useState(!1),[f,h]=i.useState(!0);return e.jsxs("div",{style:{maxWidth:"720px",display:"flex",flexDirection:"column",gap:"32px"},children:[f&&e.jsx(s,{variant:"info",title:"Design system preview",onDismiss:()=>h(!1),children:"This kitchen sink demonstrates all components rendered together in a realistic layout."}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:[e.jsx(n,{variant:"default",children:"Default"}),e.jsx(n,{variant:"info",children:"Info"}),e.jsx(n,{variant:"success",children:"Active"}),e.jsx(n,{variant:"warning",children:"Beta"}),e.jsx(n,{variant:"error",children:"Deprecated"})]}),e.jsxs(v,{children:[e.jsx(g,{children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("strong",{children:"Account settings"}),e.jsx(n,{variant:"success",size:"sm",children:"Pro"})]})}),e.jsx(y,{children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsxs("div",{style:{display:"flex",gap:"16px"},children:[e.jsx("div",{style:{flex:1},children:e.jsx(r,{label:"First name",placeholder:"Jane"})}),e.jsx("div",{style:{flex:1},children:e.jsx(r,{label:"Last name",placeholder:"Smith"})})]}),e.jsx(r,{label:"Email address",placeholder:"jane@example.com",helperText:"Used for login and notifications."}),e.jsx(b,{label:"Country",placeholder:"Select a country…",options:[{value:"us",label:"United States"},{value:"ca",label:"Canada"},{value:"gb",label:"United Kingdom"},{value:"au",label:"Australia"}]}),e.jsx(j,{label:"Account type",defaultValue:"personal",orientation:"horizontal",options:[{value:"personal",label:"Personal"},{value:"team",label:"Team"},{value:"enterprise",label:"Enterprise"}]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[e.jsx(C,{label:"Enable email notifications",checked:x,onCheckedChange:u}),e.jsx(B,{label:"I agree to the terms and conditions",checked:o,onCheckedChange:m})]})]})}),e.jsx(S,{children:e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsx(a,{intent:"secondary",children:"Cancel"}),e.jsx(a,{intent:"primary",icon:"check",iconPosition:"left",disabled:!o,children:"Save changes"})]})})]}),e.jsx(A,{defaultValue:"components",tabs:[{value:"components",label:"Components",content:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",paddingTop:"4px"},children:[e.jsxs("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:[e.jsx(a,{size:"sm",intent:"primary",icon:"plus",children:"New"}),e.jsx(a,{size:"sm",intent:"secondary",icon:"download",children:"Export"}),e.jsx(a,{size:"sm",intent:"ghost",icon:"filter",children:"Filter"}),e.jsx(a,{size:"sm",intent:"destructive",icon:"trash",children:"Delete"})]}),e.jsx(s,{variant:"success",title:"All systems operational",children:"No incidents or degraded performance reported."}),e.jsx(s,{variant:"warning",children:"Scheduled maintenance on Sunday 02:00–04:00 UTC."})]})},{value:"icons",label:"Icons",content:e.jsx("div",{style:{display:"flex",gap:"16px",flexWrap:"wrap",paddingTop:"4px"},children:["check-circle","alert-triangle","info","search","user","settings","calendar","mail"].map(l=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px"},children:[e.jsx(D,{name:l,size:20}),e.jsx("span",{style:{fontSize:"11px",color:"var(--color-text-text-tertiary)",fontFamily:"monospace"},children:l})]},l))})},{value:"disabled",label:"Disabled",disabled:!0,content:null}]})]})}};var d,c,p;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => {
    const [notificationsOn, setNotificationsOn] = useState(true);
    const [agreed, setAgreed] = useState(false);
    const [alertVisible, setAlertVisible] = useState(true);
    return <div style={{
      maxWidth: "720px",
      display: "flex",
      flexDirection: "column",
      gap: "32px"
    }}>

        {/* Alert */}
        {alertVisible && <Alert variant="info" title="Design system preview" onDismiss={() => setAlertVisible(false)}>
            This kitchen sink demonstrates all components rendered together in a realistic layout.
          </Alert>}

        {/* Badges row */}
        <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap"
      }}>
          <Badge variant="default">Default</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Beta</Badge>
          <Badge variant="error">Deprecated</Badge>
        </div>

        {/* Card with form */}
        <Card>
          <CardHeader>
            <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
              <strong>Account settings</strong>
              <Badge variant="success" size="sm">Pro</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
              <div style={{
              display: "flex",
              gap: "16px"
            }}>
                <div style={{
                flex: 1
              }}>
                  <Input label="First name" placeholder="Jane" />
                </div>
                <div style={{
                flex: 1
              }}>
                  <Input label="Last name" placeholder="Smith" />
                </div>
              </div>
              <Input label="Email address" placeholder="jane@example.com" helperText="Used for login and notifications." />
              <Select label="Country" placeholder="Select a country…" options={[{
              value: "us",
              label: "United States"
            }, {
              value: "ca",
              label: "Canada"
            }, {
              value: "gb",
              label: "United Kingdom"
            }, {
              value: "au",
              label: "Australia"
            }]} />
              <RadioGroup label="Account type" defaultValue="personal" orientation="horizontal" options={[{
              value: "personal",
              label: "Personal"
            }, {
              value: "team",
              label: "Team"
            }, {
              value: "enterprise",
              label: "Enterprise"
            }]} />
              <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
                <Switch label="Enable email notifications" checked={notificationsOn} onCheckedChange={setNotificationsOn} />
                <Checkbox label="I agree to the terms and conditions" checked={agreed} onCheckedChange={setAgreed} />
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <div style={{
            display: "flex",
            gap: "8px"
          }}>
              <Button intent="secondary">Cancel</Button>
              <Button intent="primary" icon="check" iconPosition="left" disabled={!agreed}>
                Save changes
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="components" tabs={[{
        value: "components",
        label: "Components",
        content: <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          paddingTop: "4px"
        }}>
                  <div style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap"
          }}>
                    <Button size="sm" intent="primary" icon="plus">New</Button>
                    <Button size="sm" intent="secondary" icon="download">Export</Button>
                    <Button size="sm" intent="ghost" icon="filter">Filter</Button>
                    <Button size="sm" intent="destructive" icon="trash">Delete</Button>
                  </div>
                  <Alert variant="success" title="All systems operational">
                    No incidents or degraded performance reported.
                  </Alert>
                  <Alert variant="warning">
                    Scheduled maintenance on Sunday 02:00–04:00 UTC.
                  </Alert>
                </div>
      }, {
        value: "icons",
        label: "Icons",
        content: <div style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          paddingTop: "4px"
        }}>
                  {(["check-circle", "alert-triangle", "info", "search", "user", "settings", "calendar", "mail"] as const).map(name => <div key={name} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px"
          }}>
                      <Icon name={name} size={20} />
                      <span style={{
              fontSize: "11px",
              color: "var(--color-text-text-tertiary)",
              fontFamily: "monospace"
            }}>
                        {name}
                      </span>
                    </div>)}
                </div>
      }, {
        value: "disabled",
        label: "Disabled",
        disabled: true,
        content: null
      }]} />

      </div>;
  }
}`,...(p=(c=t.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};const z=["Default"];export{t as Default,z as __namedExportsOrder,I as default};
