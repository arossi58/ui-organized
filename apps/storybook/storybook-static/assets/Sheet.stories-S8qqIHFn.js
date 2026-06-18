var C=Object.defineProperty;var r=(t,y)=>C(t,"name",{value:y,configurable:!0});import{aj as o,j as e,ak as p,al as S,am as b,an as g,ao as x,ap as a}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const T={title:"Components/Overlay/Sheet",component:o,parameters:{layout:"centered",docs:{description:{component:"An edge-anchored panel built on the Dialog primitive. `<SheetContent>` takes `side` (top/right/bottom/left) and `size` (sm/md/lg) and slides in from the chosen edge."}}}},n={render:r(()=>e.jsxs(o,{children:[e.jsx(p,{className:"btn btn--primary btn--md",children:"Open sheet"}),e.jsxs(S,{children:[e.jsx(b,{children:"Edit profile"}),e.jsx(g,{children:"Make changes to your profile here. Click save when you're done."}),e.jsxs(x,{children:[e.jsx(a,{className:"btn btn--secondary btn--md",children:"Cancel"}),e.jsx(a,{className:"btn btn--primary btn--md",children:"Save"})]})]})]}),"render")},s={render:r(()=>e.jsx("div",{style:{display:"flex",gap:12,flexWrap:"wrap"},children:["top","right","bottom","left"].map(t=>e.jsxs(o,{children:[e.jsx(p,{className:"btn btn--secondary btn--md",children:t}),e.jsxs(S,{side:t,children:[e.jsxs(b,{children:["Side: ",t]}),e.jsxs(g,{children:["The panel slides in from the ",t," edge."]}),e.jsx(x,{children:e.jsx(a,{className:"btn btn--primary btn--md",children:"Close"})})]})]},t))}),"render")};var i,l,d;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger className="btn btn--primary btn--md">Open sheet</SheetTrigger>
      <SheetContent>
        <SheetTitle>Edit profile</SheetTitle>
        <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
        <SheetFooter>
          <SheetClose className="btn btn--secondary btn--md">Cancel</SheetClose>
          <SheetClose className="btn btn--primary btn--md">Save</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
}`,...(d=(l=n.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var h,c,m;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12,
    flexWrap: "wrap"
  }}>
      {(["top", "right", "bottom", "left"] as const).map(side => <Sheet key={side}>
          <SheetTrigger className="btn btn--secondary btn--md">{side}</SheetTrigger>
          <SheetContent side={side}>
            <SheetTitle>Side: {side}</SheetTitle>
            <SheetDescription>The panel slides in from the {side} edge.</SheetDescription>
            <SheetFooter>
              <SheetClose className="btn btn--primary btn--md">Close</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>)}
    </div>
}`,...(m=(c=s.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};const N=["Default","Sides"];export{n as Default,s as Sides,N as __namedExportsOrder,T as default};
