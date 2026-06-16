var H=Object.defineProperty;var a=(p,l)=>H(p,"name",{value:l,configurable:!0});import{S as r,j as e,r as _}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const k={title:"Components/Forms/SearchInput",component:r,parameters:{layout:"padded",docs:{description:{component:"A single-line search field built on `Input` — adds a leading search icon and, while the field has a value, a clear button (toggle with `clearable`). Supports the same `label`, `helperText`, `error`, `size`, and `required` / `disabled` props."}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},placeholder:{control:"text"},helperText:{control:"text"},error:{control:"text"},clearable:{control:"boolean"},disabled:{control:"boolean"},required:{control:"boolean"}}},c={args:{label:"Search",placeholder:"Search…",size:"md"}},n={args:{label:"Search",placeholder:"Search…",defaultValue:"Design system"}},o={args:{label:"Search products",placeholder:"Search…",helperText:"Search by name, SKU, or category."}},s={args:{label:"Search",placeholder:"Search…",error:"No results match your search."}},h={args:{label:"Search",placeholder:"Search…",defaultValue:"Read-only example",clearable:!1}},u={parameters:{docs:{source:{code:`
<SearchInput size="sm" label="Small" placeholder="Search…" />
<SearchInput size="md" label="Medium" placeholder="Search…" />
<SearchInput size="lg" label="Large" placeholder="Search…" />
`.trim()}}},render:a(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(r,{size:"sm",label:"Small",placeholder:"Search…"}),e.jsx(r,{size:"md",label:"Medium",placeholder:"Search…"}),e.jsx(r,{size:"lg",label:"Large",placeholder:"Search…"})]}),"render")},d={parameters:{docs:{source:{code:`
<SearchInput label="Default" placeholder="Search…" />
<SearchInput label="With value" defaultValue="Entered query" />
<SearchInput label="Required" placeholder="Search…" required />
<SearchInput label="With helper" placeholder="Search…" helperText="Search by name or SKU." />
<SearchInput label="Error state" placeholder="Search…" error="No results found." />
<SearchInput label="Disabled" placeholder="Search…" defaultValue="Entered query" disabled />
`.trim()}}},render:a(()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsx(r,{label:"Default",placeholder:"Search…"}),e.jsx(r,{label:"With value",defaultValue:"Entered query"}),e.jsx(r,{label:"Required",placeholder:"Search…",required:!0}),e.jsx(r,{label:"With helper",placeholder:"Search…",helperText:"Search by name or SKU."}),e.jsx(r,{label:"Error state",placeholder:"Search…",error:"No results found."}),e.jsx(r,{label:"Disabled",placeholder:"Search…",defaultValue:"Entered query",disabled:!0})]}),"render")},t={parameters:{docs:{source:{code:`
const fruits = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Mango"];
const [query, setQuery] = useState("");
const matches = fruits.filter((f) => f.toLowerCase().includes(query.toLowerCase()));

<SearchInput
  label="Search fruit"
  placeholder="Search…"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery("")}
  helperText={query ? matches.length + " match(es)" : "Start typing to filter."}
/>
`.trim()}}},render:a(()=>{const p=["Apple","Apricot","Banana","Blueberry","Cherry","Mango"],[l,S]=_.useState(""),U=p.filter(i=>i.toLowerCase().includes(l.toLowerCase()));return e.jsx("div",{style:{maxWidth:"400px"},children:e.jsx(r,{label:"Search fruit",placeholder:"Search…",value:l,onChange:a(i=>S(i.target.value),"onChange"),onClear:a(()=>S(""),"onClear"),helperText:l?`${U.length} match(es)`:"Start typing to filter."})})},"render")};var m,b,y;c.parameters={...c.parameters,docs:{...(m=c.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: "Search",
    placeholder: "Search…",
    size: "md"
  }
}`,...(y=(b=c.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var f,x,g;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: "Search",
    placeholder: "Search…",
    defaultValue: "Design system"
  }
}`,...(g=(x=n.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var I,q,C;o.parameters={...o.parameters,docs:{...(I=o.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: "Search products",
    placeholder: "Search…",
    helperText: "Search by name, SKU, or category."
  }
}`,...(C=(q=o.parameters)==null?void 0:q.docs)==null?void 0:C.source}}};var v,W,z;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    label: "Search",
    placeholder: "Search…",
    error: "No results match your search."
  }
}`,...(z=(W=s.parameters)==null?void 0:W.docs)==null?void 0:z.source}}};var E,D,j;h.parameters={...h.parameters,docs:{...(E=h.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: "Search",
    placeholder: "Search…",
    defaultValue: "Read-only example",
    clearable: false
  }
}`,...(j=(D=h.parameters)==null?void 0:D.docs)==null?void 0:j.source}}};var T,V,A;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<SearchInput size="sm" label="Small" placeholder="Search…" />
<SearchInput size="md" label="Medium" placeholder="Search…" />
<SearchInput size="lg" label="Large" placeholder="Search…" />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "400px"
  }}>
      <SearchInput size="sm" label="Small" placeholder="Search…" />
      <SearchInput size="md" label="Medium" placeholder="Search…" />
      <SearchInput size="lg" label="Large" placeholder="Search…" />
    </div>
}`,...(A=(V=u.parameters)==null?void 0:V.docs)==null?void 0:A.source}}};var L,w,Q;d.parameters={...d.parameters,docs:{...(L=d.parameters)==null?void 0:L.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<SearchInput label="Default" placeholder="Search…" />
<SearchInput label="With value" defaultValue="Entered query" />
<SearchInput label="Required" placeholder="Search…" required />
<SearchInput label="With helper" placeholder="Search…" helperText="Search by name or SKU." />
<SearchInput label="Error state" placeholder="Search…" error="No results found." />
<SearchInput label="Disabled" placeholder="Search…" defaultValue="Entered query" disabled />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "400px"
  }}>
      <SearchInput label="Default" placeholder="Search…" />
      <SearchInput label="With value" defaultValue="Entered query" />
      <SearchInput label="Required" placeholder="Search…" required />
      <SearchInput label="With helper" placeholder="Search…" helperText="Search by name or SKU." />
      <SearchInput label="Error state" placeholder="Search…" error="No results found." />
      <SearchInput label="Disabled" placeholder="Search…" defaultValue="Entered query" disabled />
    </div>
}`,...(Q=(w=d.parameters)==null?void 0:w.docs)==null?void 0:Q.source}}};var B,M,N,R,K;t.parameters={...t.parameters,docs:{...(B=t.parameters)==null?void 0:B.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
const fruits = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Mango"];
const [query, setQuery] = useState("");
const matches = fruits.filter((f) => f.toLowerCase().includes(query.toLowerCase()));

<SearchInput
  label="Search fruit"
  placeholder="Search…"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery("")}
  helperText={query ? matches.length + " match(es)" : "Start typing to filter."}
/>
\`.trim()
      }
    }
  },
  render: () => {
    const fruits = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Mango"];
    const [query, setQuery] = useState("");
    const matches = fruits.filter(f => f.toLowerCase().includes(query.toLowerCase()));
    return <div style={{
      maxWidth: "400px"
    }}>
        <SearchInput label="Search fruit" placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} onClear={() => setQuery("")} helperText={query ? \`\${matches.length} match(es)\` : "Start typing to filter."} />
      </div>;
  }
}`,...(N=(M=t.parameters)==null?void 0:M.docs)==null?void 0:N.source},description:{story:"Controlled search with a live result count driven from the field's value.",...(K=(R=t.parameters)==null?void 0:R.docs)==null?void 0:K.description}}};const G=["Default","WithValue","WithHelperText","WithError","NotClearable","AllSizes","AllStates","Controlled"];export{u as AllSizes,d as AllStates,t as Controlled,c as Default,h as NotClearable,s as WithError,o as WithHelperText,n as WithValue,G as __namedExportsOrder,k as default};
