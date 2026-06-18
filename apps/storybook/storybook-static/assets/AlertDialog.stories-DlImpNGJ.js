var x=Object.defineProperty;var r=(C,b)=>x(C,"name",{value:b,configurable:!0});import{H as n,j as e,J as D,K as d,L as A,O as m,Q as u,U as p,V as h}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const y={title:"Components/Overlay/AlertDialog",component:n,parameters:{layout:"centered",docs:{description:{component:"A focus-trapping confirmation dialog dismissed via explicit actions. Compose `<AlertDialog>` with `<AlertDialogContent>`, `<AlertDialogTitle>`, `<AlertDialogDescription>`, and a footer of `<AlertDialogCancel>` + `<AlertDialogConfirm>`."}}}},l={render:r(()=>e.jsxs(n,{children:[e.jsx(D,{className:"btn btn--destructive btn--md",children:"Delete account"}),e.jsxs(d,{children:[e.jsx(A,{children:"Delete account?"}),e.jsx(m,{children:"This permanently deletes your account and all associated data. This action cannot be undone."}),e.jsxs(u,{children:[e.jsx(p,{children:"Cancel"}),e.jsx(h,{intent:"destructive",children:"Delete"})]})]})]}),"render")},t={render:r(()=>e.jsxs(n,{children:[e.jsx(D,{className:"btn btn--primary btn--md",children:"Publish"}),e.jsxs(d,{children:[e.jsx(A,{children:"Publish changes?"}),e.jsx(m,{children:"Your changes will become visible to everyone immediately."}),e.jsxs(u,{children:[e.jsx(p,{children:"Cancel"}),e.jsx(h,{children:"Publish"})]})]})]}),"render")};var i,o,a;l.parameters={...l.parameters,docs:{...(i=l.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <AlertDialog>
      <AlertDialogTrigger className="btn btn--destructive btn--md">Delete account</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete account?</AlertDialogTitle>
        <AlertDialogDescription>
          This permanently deletes your account and all associated data. This action cannot be
          undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogConfirm intent="destructive">Delete</AlertDialogConfirm>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
}`,...(a=(o=l.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var s,c,g;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: () => <AlertDialog>
      <AlertDialogTrigger className="btn btn--primary btn--md">Publish</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Publish changes?</AlertDialogTitle>
        <AlertDialogDescription>
          Your changes will become visible to everyone immediately.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogConfirm>Publish</AlertDialogConfirm>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
}`,...(g=(c=t.parameters)==null?void 0:c.docs)==null?void 0:g.source}}};const v=["Default","Confirmation"];export{t as Confirmation,l as Default,v as __namedExportsOrder,y as default};
