var d=Object.defineProperty;var o=(c,u)=>d(c,"name",{value:u,configurable:!0});import{W as i,j as e,X as x,Y as l,Z as C,_ as p,$ as t,a0 as m}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const y={title:"Components/Overlay/ContextMenu",component:i,parameters:{layout:"centered",docs:{description:{component:"A menu that opens at the cursor on right-click (or long-press). Compose `<ContextMenu>` with `<ContextMenuTrigger>` (the target area) and `<ContextMenuContent>` of items."}}}},n={render:o(()=>e.jsxs(i,{children:[e.jsx(x,{style:{display:"grid",placeItems:"center",width:280,height:140,border:"1px dashed var(--color-border-primary)",borderRadius:8,color:"var(--color-text-tertiary)",userSelect:"none"},children:"Right-click here"}),e.jsxs(l,{children:[e.jsxs(C,{children:[e.jsx(p,{children:"Actions"}),e.jsx(t,{icon:"copy",children:"Copy"}),e.jsx(t,{icon:"edit",children:"Rename"}),e.jsx(t,{icon:"download",children:"Download"})]}),e.jsx(m,{}),e.jsx(t,{icon:"trash",destructive:!0,children:"Delete"})]})]}),"render")};var r,a,s;n.parameters={...n.parameters,docs:{...(r=n.parameters)==null?void 0:r.docs,source:{originalSource:`{
  render: () => <ContextMenu>
      <ContextMenuTrigger style={{
      display: "grid",
      placeItems: "center",
      width: 280,
      height: 140,
      border: "1px dashed var(--color-border-primary)",
      borderRadius: 8,
      color: "var(--color-text-tertiary)",
      userSelect: "none"
    }}>
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Actions</ContextMenuGroupLabel>
          <ContextMenuItem icon="copy">Copy</ContextMenuItem>
          <ContextMenuItem icon="edit">Rename</ContextMenuItem>
          <ContextMenuItem icon="download">Download</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem icon="trash" destructive>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
}`,...(s=(a=n.parameters)==null?void 0:a.docs)==null?void 0:s.source}}};const j=["Default"];export{n as Default,j as __namedExportsOrder,y as default};
