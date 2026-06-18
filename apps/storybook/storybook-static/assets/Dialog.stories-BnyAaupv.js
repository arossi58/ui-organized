var u=Object.defineProperty;var t=(a,x)=>u(a,"name",{value:x,configurable:!0});import{a1 as i,j as e,a2 as p,a3 as m,a4 as b,a5 as h,a6 as j,a7 as s}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const f={title:"Components/Overlay/Dialog",component:i,parameters:{layout:"centered",docs:{description:{component:"A modal dialog with a backdrop and focus trap. Compose `<Dialog>` with `<DialogTrigger>`, `<DialogContent>` (sizes: sm/md/lg/fullscreen), `<DialogTitle>`, `<DialogDescription>`, and `<DialogFooter>`."}}}},n={render:t(()=>e.jsxs(i,{children:[e.jsx(p,{className:"btn btn--primary btn--md",children:"Delete project"}),e.jsxs(m,{children:[e.jsx(b,{children:"Delete project"}),e.jsx(h,{children:"This action cannot be undone. This permanently deletes the project and all of its data."}),e.jsxs(j,{children:[e.jsx(s,{className:"btn btn--secondary btn--md",children:"Cancel"}),e.jsx(s,{className:"btn btn--destructive btn--md",children:"Delete"})]})]})]}),"render")},o={render:t(()=>e.jsx("div",{style:{display:"flex",gap:12},children:["sm","md","lg"].map(a=>e.jsxs(i,{children:[e.jsx(p,{className:"btn btn--secondary btn--md",children:a}),e.jsxs(m,{size:a,children:[e.jsxs(b,{children:["Size: ",a]}),e.jsx(h,{children:"The dialog popup width adapts to the chosen size preset."}),e.jsx(j,{children:e.jsx(s,{className:"btn btn--primary btn--md",children:"Got it"})})]})]},a))}),"render")};var l,r,c;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger className="btn btn--primary btn--md">Delete project</DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete project</DialogTitle>
        <DialogDescription>
          This action cannot be undone. This permanently deletes the project and all of its data.
        </DialogDescription>
        <DialogFooter>
          <DialogClose className="btn btn--secondary btn--md">Cancel</DialogClose>
          <DialogClose className="btn btn--destructive btn--md">Delete</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...(c=(r=n.parameters)==null?void 0:r.docs)==null?void 0:c.source}}};var d,g,D;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12
  }}>
      {(["sm", "md", "lg"] as const).map(size => <Dialog key={size}>
          <DialogTrigger className="btn btn--secondary btn--md">{size}</DialogTrigger>
          <DialogContent size={size}>
            <DialogTitle>Size: {size}</DialogTitle>
            <DialogDescription>
              The dialog popup width adapts to the chosen size preset.
            </DialogDescription>
            <DialogFooter>
              <DialogClose className="btn btn--primary btn--md">Got it</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>)}
    </div>
}`,...(D=(g=o.parameters)==null?void 0:g.docs)==null?void 0:D.source}}};const z=["Default","Sizes"];export{n as Default,o as Sizes,z as __namedExportsOrder,f as default};
