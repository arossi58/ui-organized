import{f as l,j as e}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";const z={title:"Foundation/Icon",component:l,parameters:{layout:"padded"},argTypes:{name:{control:"select",options:["chevron-down","chevron-up","chevron-left","chevron-right","arrow-left","arrow-right","close","check","plus","minus","copy","edit","trash","download","upload","refresh","check-circle","alert-circle","alert-triangle","info","loader","search","eye","eye-off","user","users","lock","unlock","mail","phone","settings","home","calendar","clock","star","heart","bookmark","tag","menu","grid","list","sort-asc","sort-desc","filter","external-link","arrow-up","arrow-down"]},size:{control:{type:"range",min:12,max:48,step:2}},label:{control:"text"}}},n={args:{name:"check-circle",size:24}},a={render:()=>{const r=["chevron-down","chevron-up","chevron-left","chevron-right","arrow-left","arrow-right","arrow-up","arrow-down","external-link","close","check","plus","minus","copy","edit","trash","download","upload","refresh","sort-asc","sort-desc","filter","check-circle","alert-circle","alert-triangle","info","loader","search","eye","eye-off","bookmark","star","heart","tag","menu","grid","list","user","users","lock","unlock","mail","phone","settings","home","calendar","clock"];return e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(100px, 1fr))",gap:"16px"},children:r.map(s=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",padding:"12px 8px"},children:[e.jsx(l,{name:s,size:20}),e.jsx("span",{style:{fontSize:"11px",color:"var(--color-text-text-tertiary)",textAlign:"center",fontFamily:"monospace"},children:s})]},s))})}},t={render:()=>e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"24px"},children:[12,16,20,24,32,40,48].map(r=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"},children:[e.jsx(l,{name:"star",size:r}),e.jsxs("span",{style:{fontSize:"11px",color:"var(--color-text-text-tertiary)"},children:[r,"px"]})]},r))})},o={args:{name:"alert-triangle",size:24,label:"Warning"}};var c,i,p;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    name: "check-circle",
    size: 24
  }
}`,...(p=(i=n.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var d,m,x;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => {
    const icons = ["chevron-down", "chevron-up", "chevron-left", "chevron-right", "arrow-left", "arrow-right", "arrow-up", "arrow-down", "external-link", "close", "check", "plus", "minus", "copy", "edit", "trash", "download", "upload", "refresh", "sort-asc", "sort-desc", "filter", "check-circle", "alert-circle", "alert-triangle", "info", "loader", "search", "eye", "eye-off", "bookmark", "star", "heart", "tag", "menu", "grid", "list", "user", "users", "lock", "unlock", "mail", "phone", "settings", "home", "calendar", "clock"] as const;
    return <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
      gap: "16px"
    }}>
        {icons.map(name => <div key={name} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        padding: "12px 8px"
      }}>
            <Icon name={name} size={20} />
            <span style={{
          fontSize: "11px",
          color: "var(--color-text-text-tertiary)",
          textAlign: "center",
          fontFamily: "monospace"
        }}>
              {name}
            </span>
          </div>)}
      </div>;
  }
}`,...(x=(m=a.parameters)==null?void 0:m.docs)==null?void 0:x.source}}};var u,g,h;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "24px"
  }}>
      {[12, 16, 20, 24, 32, 40, 48].map(size => <div key={size} style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px"
    }}>
          <Icon name="star" size={size} />
          <span style={{
        fontSize: "11px",
        color: "var(--color-text-text-tertiary)"
      }}>{size}px</span>
        </div>)}
    </div>
}`,...(h=(g=t.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var f,y,k;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    name: "alert-triangle",
    size: 24,
    label: "Warning"
  }
}`,...(k=(y=o.parameters)==null?void 0:y.docs)==null?void 0:k.source}}};const I=["Default","AllIcons","Sizes","WithLabel"];export{a as AllIcons,n as Default,t as Sizes,o as WithLabel,I as __namedExportsOrder,z as default};
