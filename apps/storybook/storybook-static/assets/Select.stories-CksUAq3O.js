var L=Object.defineProperty;var d=(E,V)=>L(E,"name",{value:V,configurable:!0});import{e as l,j as r}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";const e=[{value:"apple",label:"Apple"},{value:"banana",label:"Banana"},{value:"cherry",label:"Cherry"},{value:"durian",label:"Durian",disabled:!0},{value:"elderberry",label:"Elderberry"}],C={title:"Components/Forms/Select",component:l,parameters:{layout:"padded",docs:{description:{component:"A dropdown field driven by an `options` array (each with `value`, `label`, and optional `disabled`); supports a `label`, `helperText`, and `error` message, plus `size` for density and the `required` / `disabled` booleans for state."}}},argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},placeholder:{control:"text"},helperText:{control:"text"},error:{control:"text"},disabled:{control:"boolean"},required:{control:"boolean"}}},t={parameters:{docs:{source:{code:`
<Select options={FRUIT_OPTIONS} label="Favorite fruit" placeholder="Select a fruit…" size="md" />
`.trim()}}},args:{options:e,label:"Favorite fruit",placeholder:"Select a fruit…",size:"md"}},a={parameters:{docs:{source:{code:`
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  helperText="We use this to personalize your experience."
/>
`.trim()}}},args:{options:e,label:"Favorite fruit",placeholder:"Select a fruit…",helperText:"We use this to personalize your experience."}},o={parameters:{docs:{source:{code:`
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  error="Please select an option."
/>
`.trim()}}},args:{options:e,label:"Favorite fruit",placeholder:"Select a fruit…",error:"Please select an option."}},s={parameters:{docs:{source:{code:`
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  required
  helperText="This field is required."
/>
`.trim()}}},args:{options:e,label:"Favorite fruit",placeholder:"Select a fruit…",required:!0,helperText:"This field is required."}},i={parameters:{docs:{source:{code:`
<Select options={FRUIT_OPTIONS} label="Favorite fruit" defaultValue="cherry" />
`.trim()}}},args:{options:e,label:"Favorite fruit",defaultValue:"cherry"}},n={parameters:{docs:{source:{code:`
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  disabled
/>
`.trim()}}},args:{options:e,label:"Favorite fruit",placeholder:"Select a fruit…",disabled:!0}},c={parameters:{docs:{source:{code:`
<Select options={FRUIT_OPTIONS} size="sm" label="Small" placeholder="Small select" />
<Select options={FRUIT_OPTIONS} size="md" label="Medium" placeholder="Medium select" />
<Select options={FRUIT_OPTIONS} size="lg" label="Large" placeholder="Large select" />
`.trim()}}},render:d(()=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[r.jsx(l,{options:e,size:"sm",label:"Small",placeholder:"Small select"}),r.jsx(l,{options:e,size:"md",label:"Medium",placeholder:"Medium select"}),r.jsx(l,{options:e,size:"lg",label:"Large",placeholder:"Large select"})]}),"render")},p={parameters:{docs:{source:{code:`
<Select options={FRUIT_OPTIONS} label="Default" placeholder="Default state" />
<Select options={FRUIT_OPTIONS} label="Required" placeholder="Required state" required />
<Select options={FRUIT_OPTIONS} label="With helper" placeholder="With helper" helperText="This is helper text." />
<Select options={FRUIT_OPTIONS} label="With value" defaultValue="apple" />
<Select options={FRUIT_OPTIONS} label="Error state" placeholder="Error state" error="This field is required." />
<Select options={FRUIT_OPTIONS} label="Disabled" placeholder="Disabled state" disabled />
`.trim()}}},render:d(()=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[r.jsx(l,{options:e,label:"Default",placeholder:"Default state"}),r.jsx(l,{options:e,label:"Required",placeholder:"Required state",required:!0}),r.jsx(l,{options:e,label:"With helper",placeholder:"With helper",helperText:"This is helper text."}),r.jsx(l,{options:e,label:"With value",defaultValue:"apple"}),r.jsx(l,{options:e,label:"Error state",placeholder:"Error state",error:"This field is required."}),r.jsx(l,{options:e,label:"Disabled",placeholder:"Disabled state",disabled:!0})]}),"render")};var u,h,S;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Select options={FRUIT_OPTIONS} label="Favorite fruit" placeholder="Select a fruit…" size="md" />
\`.trim()
      }
    }
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    size: "md"
  }
}`,...(S=(h=t.parameters)==null?void 0:h.docs)==null?void 0:S.source}}};var T,m,b;a.parameters={...a.parameters,docs:{...(T=a.parameters)==null?void 0:T.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  helperText="We use this to personalize your experience."
/>
\`.trim()
      }
    }
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    helperText: "We use this to personalize your experience."
  }
}`,...(b=(m=a.parameters)==null?void 0:m.docs)==null?void 0:b.source}}};var O,I,f;o.parameters={...o.parameters,docs:{...(O=o.parameters)==null?void 0:O.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  error="Please select an option."
/>
\`.trim()
      }
    }
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    error: "Please select an option."
  }
}`,...(f=(I=o.parameters)==null?void 0:I.docs)==null?void 0:f.source}}};var F,x,R;s.parameters={...s.parameters,docs:{...(F=s.parameters)==null?void 0:F.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  required
  helperText="This field is required."
/>
\`.trim()
      }
    }
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    required: true,
    helperText: "This field is required."
  }
}`,...(R=(x=s.parameters)==null?void 0:x.docs)==null?void 0:R.source}}};var P,_,N;i.parameters={...i.parameters,docs:{...(P=i.parameters)==null?void 0:P.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Select options={FRUIT_OPTIONS} label="Favorite fruit" defaultValue="cherry" />
\`.trim()
      }
    }
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    defaultValue: "cherry"
  }
}`,...(N=(_=i.parameters)==null?void 0:_.docs)==null?void 0:N.source}}};var U,v,g;n.parameters={...n.parameters,docs:{...(U=n.parameters)==null?void 0:U.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  disabled
/>
\`.trim()
      }
    }
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    disabled: true
  }
}`,...(g=(v=n.parameters)==null?void 0:v.docs)==null?void 0:g.source}}};var q,D,W;c.parameters={...c.parameters,docs:{...(q=c.parameters)==null?void 0:q.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Select options={FRUIT_OPTIONS} size="sm" label="Small" placeholder="Small select" />
<Select options={FRUIT_OPTIONS} size="md" label="Medium" placeholder="Medium select" />
<Select options={FRUIT_OPTIONS} size="lg" label="Large" placeholder="Large select" />
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
      <Select options={FRUIT_OPTIONS} size="sm" label="Small" placeholder="Small select" />
      <Select options={FRUIT_OPTIONS} size="md" label="Medium" placeholder="Medium select" />
      <Select options={FRUIT_OPTIONS} size="lg" label="Large" placeholder="Large select" />
    </div>
}`,...(W=(D=c.parameters)==null?void 0:D.docs)==null?void 0:W.source}}};var y,z,j;p.parameters={...p.parameters,docs:{...(y=p.parameters)==null?void 0:y.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<Select options={FRUIT_OPTIONS} label="Default" placeholder="Default state" />
<Select options={FRUIT_OPTIONS} label="Required" placeholder="Required state" required />
<Select options={FRUIT_OPTIONS} label="With helper" placeholder="With helper" helperText="This is helper text." />
<Select options={FRUIT_OPTIONS} label="With value" defaultValue="apple" />
<Select options={FRUIT_OPTIONS} label="Error state" placeholder="Error state" error="This field is required." />
<Select options={FRUIT_OPTIONS} label="Disabled" placeholder="Disabled state" disabled />
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
      <Select options={FRUIT_OPTIONS} label="Default" placeholder="Default state" />
      <Select options={FRUIT_OPTIONS} label="Required" placeholder="Required state" required />
      <Select options={FRUIT_OPTIONS} label="With helper" placeholder="With helper" helperText="This is helper text." />
      <Select options={FRUIT_OPTIONS} label="With value" defaultValue="apple" />
      <Select options={FRUIT_OPTIONS} label="Error state" placeholder="Error state" error="This field is required." />
      <Select options={FRUIT_OPTIONS} label="Disabled" placeholder="Disabled state" disabled />
    </div>
}`,...(j=(z=p.parameters)==null?void 0:z.docs)==null?void 0:j.source}}};const H=["Default","WithHelperText","WithError","Required","WithDefaultValue","Disabled","AllSizes","AllStates"];export{c as AllSizes,p as AllStates,t as Default,n as Disabled,s as Required,i as WithDefaultValue,o as WithError,a as WithHelperText,H as __namedExportsOrder,C as default};
