var d=Object.defineProperty;var a=(m,l)=>d(m,"name",{value:l,configurable:!0});import{p as M,j as e,q as t,s as i,t as s,v as n,w as g}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const j={title:"Components/Navigation/Menubar",component:M,parameters:{layout:"centered",docs:{description:{component:"A horizontal bar of menus (File / Edit / View …). Place one `<Menu>` per entry inside `<Menubar>` and style each `<MenuTrigger>` with the `menubar__trigger` class."}}}},r={render:a(()=>e.jsxs(M,{children:[e.jsxs(t,{children:[e.jsx(i,{className:"menubar__trigger",children:"File"}),e.jsxs(s,{children:[e.jsx(n,{children:"New file"}),e.jsx(n,{children:"Open…"}),e.jsx(g,{}),e.jsx(n,{children:"Save"})]})]}),e.jsxs(t,{children:[e.jsx(i,{className:"menubar__trigger",children:"Edit"}),e.jsxs(s,{children:[e.jsx(n,{icon:"copy",children:"Copy"}),e.jsx(n,{icon:"edit",children:"Find & replace"})]})]}),e.jsxs(t,{children:[e.jsx(i,{className:"menubar__trigger",children:"View"}),e.jsxs(s,{children:[e.jsx(n,{icon:"grid",children:"Grid"}),e.jsx(n,{icon:"list",children:"List"})]})]})]}),"render")};var u,c,o;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <Menubar>
      <Menu>
        <MenuTrigger className="menubar__trigger">File</MenuTrigger>
        <MenuContent>
          <MenuItem>New file</MenuItem>
          <MenuItem>Open…</MenuItem>
          <MenuSeparator />
          <MenuItem>Save</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger className="menubar__trigger">Edit</MenuTrigger>
        <MenuContent>
          <MenuItem icon="copy">Copy</MenuItem>
          <MenuItem icon="edit">Find &amp; replace</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger className="menubar__trigger">View</MenuTrigger>
        <MenuContent>
          <MenuItem icon="grid">Grid</MenuItem>
          <MenuItem icon="list">List</MenuItem>
        </MenuContent>
      </Menu>
    </Menubar>
}`,...(o=(c=r.parameters)==null?void 0:c.docs)==null?void 0:o.source}}};const _=["Default"];export{r as Default,_ as __namedExportsOrder,j as default};
