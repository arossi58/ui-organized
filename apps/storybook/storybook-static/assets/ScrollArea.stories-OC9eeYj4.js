var m=Object.defineProperty;var i=(t,r)=>m(t,"name",{value:r,configurable:!0});import{aI as a,j as e}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const v={title:"Components/Layout/ScrollArea",component:a,parameters:{layout:"padded",docs:{description:{component:"A scrollable container with a themed scrollbar. Give the Root a bounded height via `style`/`className` so its content can overflow."}}}},o={render:i(()=>e.jsx(a,{style:{height:200,width:280,border:"1px solid var(--color-border-secondary)",borderRadius:8},children:e.jsx("div",{style:{padding:16,display:"flex",flexDirection:"column",gap:8},children:Array.from({length:30},(t,r)=>e.jsxs("div",{children:["Item ",r+1]},r))})}),"render")},n={render:i(()=>e.jsx(a,{orientation:"both",style:{height:200,width:280,border:"1px solid var(--color-border-secondary)",borderRadius:8},children:e.jsx("div",{style:{padding:16,width:600},children:Array.from({length:20},(t,r)=>e.jsxs("p",{style:{whiteSpace:"nowrap",margin:"0 0 8px"},children:["Row ",r+1," — this line is wider than the viewport to force horizontal scrolling."]},r))})}),"render")};var d,s,l;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <ScrollArea style={{
    height: 200,
    width: 280,
    border: "1px solid var(--color-border-secondary)",
    borderRadius: 8
  }}>
      <div style={{
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }}>
        {Array.from({
        length: 30
      }, (_, i) => <div key={i}>Item {i + 1}</div>)}
      </div>
    </ScrollArea>
}`,...(l=(s=o.parameters)==null?void 0:s.docs)==null?void 0:l.source}}};var c,h,p;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <ScrollArea orientation="both" style={{
    height: 200,
    width: 280,
    border: "1px solid var(--color-border-secondary)",
    borderRadius: 8
  }}>
      <div style={{
      padding: 16,
      width: 600
    }}>
        {Array.from({
        length: 20
      }, (_, i) => <p key={i} style={{
        whiteSpace: "nowrap",
        margin: "0 0 8px"
      }}>
            Row {i + 1} — this line is wider than the viewport to force horizontal scrolling.
          </p>)}
      </div>
    </ScrollArea>
}`,...(p=(h=n.parameters)==null?void 0:h.docs)==null?void 0:p.source}}};const w=["Vertical","Both"];export{n as Both,o as Vertical,w as __namedExportsOrder,v as default};
