var m=Object.defineProperty;var t=(a,n)=>m(a,"name",{value:n,configurable:!0});import{aA as u,j as e,aB as b}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const g={title:"Components/Feedback/Toast",parameters:{layout:"centered",docs:{description:{component:"Transient notifications. Wrap your app once in `<ToastProvider>`, then call `useToastManager().add({ title, description, type })`. Status (`info`/`success`/`warning`/`error`) drives the accent and icon."}}},decorators:[a=>e.jsx(b,{children:e.jsx(a,{})})]},o={render:t(function(){const n=u();return e.jsxs("div",{style:{display:"flex",gap:12,flexWrap:"wrap"},children:[e.jsx("button",{className:"btn btn--secondary btn--md",onClick:t(()=>n.add({title:"Heads up",description:"Something happened.",type:"info"}),"onClick"),children:"Info"}),e.jsx("button",{className:"btn btn--secondary btn--md",onClick:t(()=>n.add({title:"Saved",description:"Your changes are live.",type:"success"}),"onClick"),children:"Success"}),e.jsx("button",{className:"btn btn--secondary btn--md",onClick:t(()=>n.add({title:"Careful",description:"This may need attention.",type:"warning"}),"onClick"),children:"Warning"}),e.jsx("button",{className:"btn btn--secondary btn--md",onClick:t(()=>n.add({title:"Error",description:"Something went wrong.",type:"error"}),"onClick"),children:"Error"})]})},"StatusExample")},s={render:t(function(){const n=u();return e.jsx("button",{className:"btn btn--primary btn--md",onClick:t(()=>n.add({title:"Item deleted",description:"The file was moved to trash.",type:"info",actionProps:{children:"Undo"}}),"onClick"),children:"Delete with undo"})},"ActionExample")};var r,i,d;o.parameters={...o.parameters,docs:{...(r=o.parameters)==null?void 0:r.docs,source:{originalSource:`{
  render: function StatusExample() {
    const toast = useToastManager();
    return <div style={{
      display: "flex",
      gap: 12,
      flexWrap: "wrap"
    }}>
        <button className="btn btn--secondary btn--md" onClick={() => toast.add({
        title: "Heads up",
        description: "Something happened.",
        type: "info"
      })}>
          Info
        </button>
        <button className="btn btn--secondary btn--md" onClick={() => toast.add({
        title: "Saved",
        description: "Your changes are live.",
        type: "success"
      })}>
          Success
        </button>
        <button className="btn btn--secondary btn--md" onClick={() => toast.add({
        title: "Careful",
        description: "This may need attention.",
        type: "warning"
      })}>
          Warning
        </button>
        <button className="btn btn--secondary btn--md" onClick={() => toast.add({
        title: "Error",
        description: "Something went wrong.",
        type: "error"
      })}>
          Error
        </button>
      </div>;
  }
}`,...(d=(i=o.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};var c,l,p;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: function ActionExample() {
    const toast = useToastManager();
    return <button className="btn btn--primary btn--md" onClick={() => toast.add({
      title: "Item deleted",
      description: "The file was moved to trash.",
      type: "info",
      actionProps: {
        children: "Undo"
      }
    })}>
        Delete with undo
      </button>;
  }
}`,...(p=(l=s.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};const x=["Statuses","WithAction"];export{o as Statuses,s as WithAction,x as __namedExportsOrder,g as default};
