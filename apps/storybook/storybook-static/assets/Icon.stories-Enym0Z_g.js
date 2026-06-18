var w=Object.defineProperty;var c=(r,n)=>w(r,"name",{value:n,configurable:!0});import{z as l,j as e}from"./iframe-DHbPW4q5.js";import"./preload-helper-BCNDPehi.js";const j={title:"Foundation/Icon",component:l,parameters:{layout:"padded",docs:{description:{component:"Icon renders a named glyph from the active icon library (set via IconProvider). Choose the glyph with `name`, its pixel `size`, and pass an optional `label` to expose it to assistive tech (otherwise it is treated as decorative)."}}},argTypes:{name:{control:"select",options:["chevron-down","chevron-up","chevron-left","chevron-right","arrow-left","arrow-right","close","check","plus","minus","copy","edit","trash","download","upload","refresh","check-circle","alert-circle","alert-triangle","info","loader","search","eye","eye-off","user","users","lock","unlock","mail","phone","settings","home","calendar","clock","star","heart","bookmark","tag","menu","grid","list","sort-asc","sort-desc","filter","external-link","arrow-up","arrow-down"]},size:{control:{type:"range",min:12,max:48,step:2}},label:{control:"text"}}},a={args:{name:"check-circle",size:24}},o={parameters:{docs:{source:{code:`
const names = [
  "chevron-down", "chevron-up", "chevron-left", "chevron-right",
  "arrow-left", "arrow-right", "arrow-up", "arrow-down", "external-link",
  "close", "check", "plus", "minus", "copy", "edit", "trash",
  "download", "upload", "refresh", "sort-asc", "sort-desc", "filter",
  "check-circle", "alert-circle", "alert-triangle", "info", "loader",
  "search", "eye", "eye-off", "bookmark", "star", "heart", "tag",
  "menu", "grid", "list", "user", "users", "lock", "unlock",
  "mail", "phone", "settings", "home", "calendar", "clock",
] as const;

{names.map((name) => (
  <Icon key={name} name={name} size={20} />
))}
`.trim()}}},render:c(()=>{const r=["chevron-down","chevron-up","chevron-left","chevron-right","arrow-left","arrow-right","arrow-up","arrow-down","external-link","close","check","plus","minus","copy","edit","trash","download","upload","refresh","sort-asc","sort-desc","filter","check-circle","alert-circle","alert-triangle","info","loader","search","eye","eye-off","bookmark","star","heart","tag","menu","grid","list","user","users","lock","unlock","mail","phone","settings","home","calendar","clock"];return e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(100px, 1fr))",gap:"16px"},children:r.map(n=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",padding:"12px 8px"},children:[e.jsx(l,{name:n,size:20}),e.jsx("span",{style:{fontSize:"11px",color:"var(--color-text-tertiary)",textAlign:"center",fontFamily:"monospace"},children:n})]},n))})},"render")},s={parameters:{docs:{source:{code:`
{[12, 16, 20, 24, 32, 40, 48].map((size) => (
  <Icon key={size} name="star" size={size} />
))}
`.trim()}}},render:c(()=>e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"24px"},children:[12,16,20,24,32,40,48].map(r=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"},children:[e.jsx(l,{name:"star",size:r}),e.jsxs("span",{style:{fontSize:"11px",color:"var(--color-text-tertiary)"},children:[r,"px"]})]},r))}),"render")},t={args:{name:"alert-triangle",size:24,label:"Warning"}};var i,p,d;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    name: "check-circle",
    size: 24
  }
}`,...(d=(p=a.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var m,h,u;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
const names = [
  "chevron-down", "chevron-up", "chevron-left", "chevron-right",
  "arrow-left", "arrow-right", "arrow-up", "arrow-down", "external-link",
  "close", "check", "plus", "minus", "copy", "edit", "trash",
  "download", "upload", "refresh", "sort-asc", "sort-desc", "filter",
  "check-circle", "alert-circle", "alert-triangle", "info", "loader",
  "search", "eye", "eye-off", "bookmark", "star", "heart", "tag",
  "menu", "grid", "list", "user", "users", "lock", "unlock",
  "mail", "phone", "settings", "home", "calendar", "clock",
] as const;

{names.map((name) => (
  <Icon key={name} name={name} size={20} />
))}
\`.trim()
      }
    }
  },
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
          color: "var(--color-text-tertiary)",
          textAlign: "center",
          fontFamily: "monospace"
        }}>
              {name}
            </span>
          </div>)}
      </div>;
  }
}`,...(u=(h=o.parameters)==null?void 0:h.docs)==null?void 0:u.source}}};var g,f,x;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
{[12, 16, 20, 24, 32, 40, 48].map((size) => (
  <Icon key={size} name="star" size={size} />
))}
\`.trim()
      }
    }
  },
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
        color: "var(--color-text-tertiary)"
      }}>{size}px</span>
        </div>)}
    </div>
}`,...(x=(f=s.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};var y,k,v;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    name: "alert-triangle",
    size: 24,
    label: "Warning"
  }
}`,...(v=(k=t.parameters)==null?void 0:k.docs)==null?void 0:v.source}}};const S=["Default","AllIcons","Sizes","WithLabel"];export{o as AllIcons,a as Default,s as Sizes,t as WithLabel,S as __namedExportsOrder,j as default};
