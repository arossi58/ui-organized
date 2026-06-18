var I=Object.defineProperty;var n=(u,s)=>I(u,"name",{value:s,configurable:!0});import{q as a,j as e,s as x,t as g,v as t,w as b,r as c,ab as y,ac as f,ad as v,ae as w,af as i}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const T={title:"Components/Overlay/Menu",component:a,parameters:{layout:"centered",docs:{description:{component:"A dropdown menu of actions. Compose `<Menu>` with `<MenuTrigger>`, `<MenuContent>`, `<MenuItem>` (optionally `icon` / `destructive`), `<MenuSeparator>`, groups, and checkbox/radio items."}}}},r={render:n(()=>e.jsxs(a,{children:[e.jsx(x,{className:"btn btn--secondary btn--md",children:"Actions"}),e.jsxs(g,{children:[e.jsx(t,{icon:"user",children:"Profile"}),e.jsx(t,{icon:"settings",children:"Settings"}),e.jsx(t,{icon:"copy",children:"Duplicate"}),e.jsx(b,{}),e.jsx(t,{icon:"trash",destructive:!0,children:"Delete"})]})]}),"render")},o={render:n(function(){const[s,C]=c.useState(!0),[S,j]=c.useState("comfortable");return e.jsxs(a,{children:[e.jsx(x,{className:"btn btn--secondary btn--md",children:"View"}),e.jsxs(g,{children:[e.jsx(y,{checked:s,onCheckedChange:C,children:"Show grid"}),e.jsx(b,{}),e.jsxs(f,{children:[e.jsx(v,{children:"Density"}),e.jsxs(w,{value:S,onValueChange:n(G=>j(String(G)),"onValueChange"),children:[e.jsx(i,{value:"comfortable",children:"Comfortable"}),e.jsx(i,{value:"compact",children:"Compact"})]})]})]})]})},"GroupsExample")};var d,m,l;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <Menu>
      <MenuTrigger className="btn btn--secondary btn--md">Actions</MenuTrigger>
      <MenuContent>
        <MenuItem icon="user">Profile</MenuItem>
        <MenuItem icon="settings">Settings</MenuItem>
        <MenuItem icon="copy">Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem icon="trash" destructive>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
}`,...(l=(m=r.parameters)==null?void 0:m.docs)==null?void 0:l.source}}};var p,M,h;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: function GroupsExample() {
    const [showGrid, setShowGrid] = useState(true);
    const [density, setDensity] = useState("comfortable");
    return <Menu>
        <MenuTrigger className="btn btn--secondary btn--md">View</MenuTrigger>
        <MenuContent>
          <MenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
            Show grid
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>Density</MenuGroupLabel>
            <MenuRadioGroup value={density} onValueChange={v => setDensity(String(v))}>
              <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
              <MenuRadioItem value="compact">Compact</MenuRadioItem>
            </MenuRadioGroup>
          </MenuGroup>
        </MenuContent>
      </Menu>;
  }
}`,...(h=(M=o.parameters)==null?void 0:M.docs)==null?void 0:h.source}}};const A=["Default","GroupsAndSelection"];export{r as Default,o as GroupsAndSelection,A as __namedExportsOrder,T as default};
