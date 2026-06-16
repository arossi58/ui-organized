var he=Object.defineProperty;var s=(n,t)=>he(n,"name",{value:t,configurable:!0});import{x as a,j as e,y as f,z as h,A as l}from"./iframe-BdMZ4otN.js";import"./preload-helper-BCNDPehi.js";function S({children:n,collapsed:t=!1}){return e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"var(--spacing-space-02)",width:t?"72px":"260px",padding:"var(--spacing-space-04)",borderRadius:"var(--radius-interactive)",background:"var(--color-surface-base)",border:"1px solid var(--color-border-primary)",transition:"width 200ms ease"},children:n})}s(S,"NavSurface");const Ce={title:"Components/Navigation/Navigation",component:a,parameters:{layout:"padded",docs:{description:{component:"Navigation primitives for an application sidebar. `NavItem` is a top-level entry with an optional `icon`, `selected` / `disabled` states, a `collapsed` (icon-only) mode, and nestable `NavSubItem` children that turn it into an expandable group. `Sidebar` is the full container that arranges a logo, the scrollable nav, and a footer, with an optional `collapsible` rail."}}},argTypes:{icon:{control:"select",options:[void 0,"home","settings","user","grid","calendar","mail"]},selected:{control:"boolean"},disabled:{control:"boolean"}},decorators:[(n,t)=>t.parameters.noSurface?e.jsx(n,{}):e.jsx(S,{children:e.jsx(n,{})})]},m={args:{label:"Dashboard",icon:"home",selected:!1,disabled:!1}},b={args:{label:"Dashboard",icon:"home",selected:!0}},v={args:{label:"Dashboard",icon:"home",disabled:!0}},p={args:{label:"Dashboard"}},o={parameters:{noSurface:!0,docs:{source:{code:`
<NavItem label="Home" icon="home" collapsed />
<NavItem label="Dashboard" icon="grid" selected collapsed />
<NavItem label="Messages" icon="mail" collapsed />
<NavItem label="Calendar" icon="calendar" collapsed />
<NavItem label="Settings" icon="settings" collapsed />
<NavItem label="Archived" icon="bookmark" disabled collapsed />
`.trim()}}},render:s(()=>e.jsxs(S,{collapsed:!0,children:[e.jsx(a,{label:"Home",icon:"home",collapsed:!0}),e.jsx(a,{label:"Dashboard",icon:"grid",selected:!0,collapsed:!0}),e.jsx(a,{label:"Messages",icon:"mail",collapsed:!0}),e.jsx(a,{label:"Calendar",icon:"calendar",collapsed:!0}),e.jsx(a,{label:"Settings",icon:"settings",collapsed:!0}),e.jsx(a,{label:"Archived",icon:"bookmark",disabled:!0,collapsed:!0})]}),"render")},r={parameters:{noSurface:!0,docs:{source:{code:`
<NavItem label="Home" icon="home" />
<NavItem label="Dashboard" icon="grid" selected />
<NavItem label="Messages" icon="mail" />
<NavItem label="Settings" icon="settings" />

<NavItem label="Home" icon="home" collapsed />
<NavItem label="Dashboard" icon="grid" selected collapsed />
<NavItem label="Messages" icon="mail" collapsed />
<NavItem label="Settings" icon="settings" collapsed />
`.trim()}}},render:s(()=>e.jsxs("div",{style:{display:"flex",gap:"var(--spacing-space-04)",alignItems:"flex-start"},children:[e.jsxs(S,{children:[e.jsx(a,{label:"Home",icon:"home"}),e.jsx(a,{label:"Dashboard",icon:"grid",selected:!0}),e.jsx(a,{label:"Messages",icon:"mail"}),e.jsx(a,{label:"Settings",icon:"settings"})]}),e.jsxs(S,{collapsed:!0,children:[e.jsx(a,{label:"Home",icon:"home",collapsed:!0}),e.jsx(a,{label:"Dashboard",icon:"grid",selected:!0,collapsed:!0}),e.jsx(a,{label:"Messages",icon:"mail",collapsed:!0}),e.jsx(a,{label:"Settings",icon:"settings",collapsed:!0})]})]}),"render")},u={parameters:{docs:{source:{code:`
<NavItem label="Reports" icon="grid" selected defaultExpanded>
  <NavSubItem label="Overview" selected />
  <NavSubItem label="Revenue" />
  <NavSubItem label="Traffic" />
  <NavSubItem label="Conversions" />
  <NavSubItem label="Retention" />
</NavItem>
`.trim()}}},render:s(()=>e.jsxs(a,{label:"Reports",icon:"grid",selected:!0,defaultExpanded:!0,children:[e.jsx(l,{label:"Overview",selected:!0}),e.jsx(l,{label:"Revenue"}),e.jsx(l,{label:"Traffic"}),e.jsx(l,{label:"Conversions"}),e.jsx(l,{label:"Retention"})]}),"render")},I={parameters:{docs:{source:{code:`
<NavItem label="Reports" icon="grid">
  <NavSubItem label="Overview" />
  <NavSubItem label="Revenue" />
  <NavSubItem label="Traffic" />
</NavItem>
`.trim()}}},render:s(()=>e.jsxs(a,{label:"Reports",icon:"grid",children:[e.jsx(l,{label:"Overview"}),e.jsx(l,{label:"Revenue"}),e.jsx(l,{label:"Traffic"})]}),"render")},g={parameters:{docs:{source:{code:`
<NavSubItem label="Default" />
<NavSubItem label="Selected" selected />
<NavSubItem label="Disabled" disabled />
`.trim()}}},render:s(()=>e.jsxs(e.Fragment,{children:[e.jsx(l,{label:"Default"}),e.jsx(l,{label:"Selected",selected:!0}),e.jsx(l,{label:"Disabled",disabled:!0})]}),"render")},N={parameters:{docs:{source:{code:`
<NavItem label="Home" icon="home" />
<NavItem label="Dashboard" icon="grid" selected defaultExpanded>
  <NavSubItem label="Overview" selected />
  <NavSubItem label="Activity" />
  <NavSubItem label="Insights" />
</NavItem>
<NavItem label="Messages" icon="mail" />
<NavItem label="Calendar" icon="calendar">
  <NavSubItem label="Upcoming" />
  <NavSubItem label="Past events" />
</NavItem>
<NavItem label="Team" icon="users" />
<NavItem label="Settings" icon="settings" />
<NavItem label="Archived" icon="bookmark" disabled />
`.trim()}}},render:s(()=>e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Home",icon:"home"}),e.jsxs(a,{label:"Dashboard",icon:"grid",selected:!0,defaultExpanded:!0,children:[e.jsx(l,{label:"Overview",selected:!0}),e.jsx(l,{label:"Activity"}),e.jsx(l,{label:"Insights"})]}),e.jsx(a,{label:"Messages",icon:"mail"}),e.jsxs(a,{label:"Calendar",icon:"calendar",children:[e.jsx(l,{label:"Upcoming"}),e.jsx(l,{label:"Past events"})]}),e.jsx(a,{label:"Team",icon:"users"}),e.jsx(a,{label:"Settings",icon:"settings"}),e.jsx(a,{label:"Archived",icon:"bookmark",disabled:!0})]}),"render")};function x({children:n}){return e.jsx("div",{style:{height:"100vh",display:"flex"},children:n})}s(x,"SidebarStage");const j=e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:"var(--spacing-space-02)",color:"var(--color-text-text-primary)",fontFamily:"var(--type-font-heading)",fontWeight:600,fontSize:"20px",whiteSpace:"nowrap"},children:[e.jsx(h,{name:"grid",size:24}),"UI Organized"]}),C=e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Home",icon:"home"}),e.jsxs(a,{label:"Dashboard",icon:"grid",selected:!0,defaultExpanded:!0,children:[e.jsx(l,{label:"Overview",selected:!0}),e.jsx(l,{label:"Activity"}),e.jsx(l,{label:"Insights"})]}),e.jsx(a,{label:"Messages",icon:"mail"}),e.jsxs(a,{label:"Calendar",icon:"calendar",children:[e.jsx(l,{label:"Upcoming"}),e.jsx(l,{label:"Past events"})]}),e.jsx(a,{label:"Team",icon:"users"}),e.jsx(a,{label:"Settings",icon:"settings"})]}),i={parameters:{noSurface:!0,layout:"fullscreen",docs:{source:{code:`
<Sidebar
  logo={<span className="brand"><Icon name="grid" size={24} /> UI Organized</span>}
  logoCollapsed={<Icon name="grid" size={24} />}
  footer={<NavItem label="Help & Support" icon="info" />}
>
  <NavItem label="Home" icon="home" />
  <NavItem label="Dashboard" icon="grid" selected defaultExpanded>
    <NavSubItem label="Overview" selected />
    <NavSubItem label="Activity" />
    <NavSubItem label="Insights" />
  </NavItem>
  <NavItem label="Messages" icon="mail" />
  <NavItem label="Calendar" icon="calendar">
    <NavSubItem label="Upcoming" />
    <NavSubItem label="Past events" />
  </NavItem>
  <NavItem label="Team" icon="users" />
  <NavItem label="Settings" icon="settings" />
</Sidebar>
`.trim()}}},render:s(()=>e.jsx(x,{children:e.jsx(f,{logo:j,logoCollapsed:e.jsx(h,{name:"grid",size:24}),footer:e.jsx(a,{label:"Help & Support",icon:"info"}),children:C})}),"render")},c={parameters:{noSurface:!0,layout:"fullscreen",docs:{source:{code:`
<Sidebar
  collapsible
  logo={<span className="brand"><Icon name="grid" size={24} /> UI Organized</span>}
  logoCollapsed={<Icon name="grid" size={24} />}
  footer={<NavItem label="Help & Support" icon="info" />}
>
  <NavItem label="Home" icon="home" />
  <NavItem label="Dashboard" icon="grid" selected defaultExpanded>
    <NavSubItem label="Overview" selected />
    <NavSubItem label="Activity" />
    <NavSubItem label="Insights" />
  </NavItem>
  <NavItem label="Messages" icon="mail" />
  <NavItem label="Calendar" icon="calendar">
    <NavSubItem label="Upcoming" />
    <NavSubItem label="Past events" />
  </NavItem>
  <NavItem label="Team" icon="users" />
  <NavItem label="Settings" icon="settings" />
</Sidebar>
`.trim()}}},render:s(()=>e.jsx(x,{children:e.jsx(f,{collapsible:!0,logo:j,logoCollapsed:e.jsx(h,{name:"grid",size:24}),footer:e.jsx(a,{label:"Help & Support",icon:"info"}),children:C})}),"render")},d={parameters:{noSurface:!0,layout:"fullscreen",docs:{source:{code:`
<Sidebar
  collapsible
  defaultCollapsed
  logo={<span className="brand"><Icon name="grid" size={24} /> UI Organized</span>}
  logoCollapsed={<Icon name="grid" size={24} />}
  footer={<NavItem label="Help & Support" icon="info" />}
>
  <NavItem label="Home" icon="home" />
  <NavItem label="Dashboard" icon="grid" selected defaultExpanded>
    <NavSubItem label="Overview" selected />
    <NavSubItem label="Activity" />
    <NavSubItem label="Insights" />
  </NavItem>
  <NavItem label="Messages" icon="mail" />
  <NavItem label="Calendar" icon="calendar">
    <NavSubItem label="Upcoming" />
    <NavSubItem label="Past events" />
  </NavItem>
  <NavItem label="Team" icon="users" />
  <NavItem label="Settings" icon="settings" />
</Sidebar>
`.trim()}}},render:s(()=>e.jsx(x,{children:e.jsx(f,{collapsible:!0,defaultCollapsed:!0,logo:j,logoCollapsed:e.jsx(h,{name:"grid",size:24}),footer:e.jsx(a,{label:"Help & Support",icon:"info"}),children:C})}),"render")};var y,D,H;m.parameters={...m.parameters,docs:{...(y=m.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    label: "Dashboard",
    icon: "home",
    selected: false,
    disabled: false
  }
}`,...(H=(D=m.parameters)==null?void 0:D.docs)==null?void 0:H.source}}};var w,z,O;b.parameters={...b.parameters,docs:{...(w=b.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    label: "Dashboard",
    icon: "home",
    selected: true
  }
}`,...(O=(z=b.parameters)==null?void 0:z.docs)==null?void 0:O.source}}};var E,k,R;v.parameters={...v.parameters,docs:{...(E=v.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: "Dashboard",
    icon: "home",
    disabled: true
  }
}`,...(R=(k=v.parameters)==null?void 0:k.docs)==null?void 0:R.source}}};var M,T,A;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    label: "Dashboard"
  }
}`,...(A=(T=p.parameters)==null?void 0:T.docs)==null?void 0:A.source}}};var U,P,W,F,V;o.parameters={...o.parameters,docs:{...(U=o.parameters)==null?void 0:U.docs,source:{originalSource:`{
  parameters: {
    noSurface: true,
    docs: {
      source: {
        code: \`
<NavItem label="Home" icon="home" collapsed />
<NavItem label="Dashboard" icon="grid" selected collapsed />
<NavItem label="Messages" icon="mail" collapsed />
<NavItem label="Calendar" icon="calendar" collapsed />
<NavItem label="Settings" icon="settings" collapsed />
<NavItem label="Archived" icon="bookmark" disabled collapsed />
\`.trim()
      }
    }
  },
  render: () => <NavSurface collapsed>
      <NavItem label="Home" icon="home" collapsed />
      <NavItem label="Dashboard" icon="grid" selected collapsed />
      <NavItem label="Messages" icon="mail" collapsed />
      <NavItem label="Calendar" icon="calendar" collapsed />
      <NavItem label="Settings" icon="settings" collapsed />
      <NavItem label="Archived" icon="bookmark" disabled collapsed />
    </NavSurface>
}`,...(W=(P=o.parameters)==null?void 0:P.docs)==null?void 0:W.source},description:{story:`Collapsed rail. Hiding the label shrinks each item's width down to a square —
the height is unchanged from the expanded state and the icon sits inside even
padding on all four sides (rather than ballooning to fill the rail width).`,...(V=(F=o.parameters)==null?void 0:F.docs)==null?void 0:V.description}}};var _,q,B,G,J;r.parameters={...r.parameters,docs:{...(_=r.parameters)==null?void 0:_.docs,source:{originalSource:`{
  parameters: {
    noSurface: true,
    docs: {
      source: {
        code: \`
<NavItem label="Home" icon="home" />
<NavItem label="Dashboard" icon="grid" selected />
<NavItem label="Messages" icon="mail" />
<NavItem label="Settings" icon="settings" />

<NavItem label="Home" icon="home" collapsed />
<NavItem label="Dashboard" icon="grid" selected collapsed />
<NavItem label="Messages" icon="mail" collapsed />
<NavItem label="Settings" icon="settings" collapsed />
\`.trim()
      }
    }
  },
  render: () => <div style={{
    display: "flex",
    gap: "var(--spacing-space-04)",
    alignItems: "flex-start"
  }}>
      <NavSurface>
        <NavItem label="Home" icon="home" />
        <NavItem label="Dashboard" icon="grid" selected />
        <NavItem label="Messages" icon="mail" />
        <NavItem label="Settings" icon="settings" />
      </NavSurface>
      <NavSurface collapsed>
        <NavItem label="Home" icon="home" collapsed />
        <NavItem label="Dashboard" icon="grid" selected collapsed />
        <NavItem label="Messages" icon="mail" collapsed />
        <NavItem label="Settings" icon="settings" collapsed />
      </NavSurface>
    </div>
}`,...(B=(q=r.parameters)==null?void 0:q.docs)==null?void 0:B.source},description:{story:`Expanded vs. collapsed, side by side: collapsing changes only the width. Each
row keeps the exact same height, so the icons stay aligned across both rails.`,...(J=(G=r.parameters)==null?void 0:G.docs)==null?void 0:J.description}}};var K,L,Q;u.parameters={...u.parameters,docs:{...(K=u.parameters)==null?void 0:K.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<NavItem label="Reports" icon="grid" selected defaultExpanded>
  <NavSubItem label="Overview" selected />
  <NavSubItem label="Revenue" />
  <NavSubItem label="Traffic" />
  <NavSubItem label="Conversions" />
  <NavSubItem label="Retention" />
</NavItem>
\`.trim()
      }
    }
  },
  render: () => <NavItem label="Reports" icon="grid" selected defaultExpanded>
      <NavSubItem label="Overview" selected />
      <NavSubItem label="Revenue" />
      <NavSubItem label="Traffic" />
      <NavSubItem label="Conversions" />
      <NavSubItem label="Retention" />
    </NavItem>
}`,...(Q=(L=u.parameters)==null?void 0:L.docs)==null?void 0:Q.source}}};var X,Y,Z;I.parameters={...I.parameters,docs:{...(X=I.parameters)==null?void 0:X.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<NavItem label="Reports" icon="grid">
  <NavSubItem label="Overview" />
  <NavSubItem label="Revenue" />
  <NavSubItem label="Traffic" />
</NavItem>
\`.trim()
      }
    }
  },
  render: () => <NavItem label="Reports" icon="grid">
      <NavSubItem label="Overview" />
      <NavSubItem label="Revenue" />
      <NavSubItem label="Traffic" />
    </NavItem>
}`,...(Z=(Y=I.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var $,ee,ae;g.parameters={...g.parameters,docs:{...($=g.parameters)==null?void 0:$.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<NavSubItem label="Default" />
<NavSubItem label="Selected" selected />
<NavSubItem label="Disabled" disabled />
\`.trim()
      }
    }
  },
  render: () => <>
      <NavSubItem label="Default" />
      <NavSubItem label="Selected" selected />
      <NavSubItem label="Disabled" disabled />
    </>
}`,...(ae=(ee=g.parameters)==null?void 0:ee.docs)==null?void 0:ae.source}}};var le,se,ne;N.parameters={...N.parameters,docs:{...(le=N.parameters)==null?void 0:le.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`
<NavItem label="Home" icon="home" />
<NavItem label="Dashboard" icon="grid" selected defaultExpanded>
  <NavSubItem label="Overview" selected />
  <NavSubItem label="Activity" />
  <NavSubItem label="Insights" />
</NavItem>
<NavItem label="Messages" icon="mail" />
<NavItem label="Calendar" icon="calendar">
  <NavSubItem label="Upcoming" />
  <NavSubItem label="Past events" />
</NavItem>
<NavItem label="Team" icon="users" />
<NavItem label="Settings" icon="settings" />
<NavItem label="Archived" icon="bookmark" disabled />
\`.trim()
      }
    }
  },
  render: () => <>
      <NavItem label="Home" icon="home" />
      <NavItem label="Dashboard" icon="grid" selected defaultExpanded>
        <NavSubItem label="Overview" selected />
        <NavSubItem label="Activity" />
        <NavSubItem label="Insights" />
      </NavItem>
      <NavItem label="Messages" icon="mail" />
      <NavItem label="Calendar" icon="calendar">
        <NavSubItem label="Upcoming" />
        <NavSubItem label="Past events" />
      </NavItem>
      <NavItem label="Team" icon="users" />
      <NavItem label="Settings" icon="settings" />
      <NavItem label="Archived" icon="bookmark" disabled />
    </>
}`,...(ne=(se=N.parameters)==null?void 0:se.docs)==null?void 0:ne.source}}};var te,oe,re,ie,ce;i.parameters={...i.parameters,docs:{...(te=i.parameters)==null?void 0:te.docs,source:{originalSource:`{
  parameters: {
    noSurface: true,
    layout: "fullscreen",
    docs: {
      source: {
        code: \`
<Sidebar
  logo={<span className="brand"><Icon name="grid" size={24} /> UI Organized</span>}
  logoCollapsed={<Icon name="grid" size={24} />}
  footer={<NavItem label="Help & Support" icon="info" />}
>
  <NavItem label="Home" icon="home" />
  <NavItem label="Dashboard" icon="grid" selected defaultExpanded>
    <NavSubItem label="Overview" selected />
    <NavSubItem label="Activity" />
    <NavSubItem label="Insights" />
  </NavItem>
  <NavItem label="Messages" icon="mail" />
  <NavItem label="Calendar" icon="calendar">
    <NavSubItem label="Upcoming" />
    <NavSubItem label="Past events" />
  </NavItem>
  <NavItem label="Team" icon="users" />
  <NavItem label="Settings" icon="settings" />
</Sidebar>
\`.trim()
      }
    }
  },
  render: () => <SidebarStage>
      <Sidebar logo={Wordmark} logoCollapsed={<Icon name="grid" size={24} />} footer={<NavItem label="Help & Support" icon="info" />}>
        {SidebarItems}
      </Sidebar>
    </SidebarStage>
}`,...(re=(oe=i.parameters)==null?void 0:oe.docs)==null?void 0:re.source},description:{story:"The complete sidebar: logo slot, scrollable nav, and a footer slot.",...(ce=(ie=i.parameters)==null?void 0:ie.docs)==null?void 0:ce.description}}};var de,me,be,ve,pe;c.parameters={...c.parameters,docs:{...(de=c.parameters)==null?void 0:de.docs,source:{originalSource:`{
  parameters: {
    noSurface: true,
    layout: "fullscreen",
    docs: {
      source: {
        code: \`
<Sidebar
  collapsible
  logo={<span className="brand"><Icon name="grid" size={24} /> UI Organized</span>}
  logoCollapsed={<Icon name="grid" size={24} />}
  footer={<NavItem label="Help & Support" icon="info" />}
>
  <NavItem label="Home" icon="home" />
  <NavItem label="Dashboard" icon="grid" selected defaultExpanded>
    <NavSubItem label="Overview" selected />
    <NavSubItem label="Activity" />
    <NavSubItem label="Insights" />
  </NavItem>
  <NavItem label="Messages" icon="mail" />
  <NavItem label="Calendar" icon="calendar">
    <NavSubItem label="Upcoming" />
    <NavSubItem label="Past events" />
  </NavItem>
  <NavItem label="Team" icon="users" />
  <NavItem label="Settings" icon="settings" />
</Sidebar>
\`.trim()
      }
    }
  },
  render: () => <SidebarStage>
      <Sidebar collapsible logo={Wordmark} logoCollapsed={<Icon name="grid" size={24} />} footer={<NavItem label="Help & Support" icon="info" />}>
        {SidebarItems}
      </Sidebar>
    </SidebarStage>
}`,...(be=(me=c.parameters)==null?void 0:me.docs)==null?void 0:be.source},description:{story:"Collapsible sidebar — pass `collapsible` and the expand/collapse toggle is\nrendered (and wired up) in the footer automatically. Click it to collapse the\nwhole sidebar to an icon-only rail.",...(pe=(ve=c.parameters)==null?void 0:ve.docs)==null?void 0:pe.description}}};var ue,Ie,ge,Ne,Se;d.parameters={...d.parameters,docs:{...(ue=d.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  parameters: {
    noSurface: true,
    layout: "fullscreen",
    docs: {
      source: {
        code: \`
<Sidebar
  collapsible
  defaultCollapsed
  logo={<span className="brand"><Icon name="grid" size={24} /> UI Organized</span>}
  logoCollapsed={<Icon name="grid" size={24} />}
  footer={<NavItem label="Help & Support" icon="info" />}
>
  <NavItem label="Home" icon="home" />
  <NavItem label="Dashboard" icon="grid" selected defaultExpanded>
    <NavSubItem label="Overview" selected />
    <NavSubItem label="Activity" />
    <NavSubItem label="Insights" />
  </NavItem>
  <NavItem label="Messages" icon="mail" />
  <NavItem label="Calendar" icon="calendar">
    <NavSubItem label="Upcoming" />
    <NavSubItem label="Past events" />
  </NavItem>
  <NavItem label="Team" icon="users" />
  <NavItem label="Settings" icon="settings" />
</Sidebar>
\`.trim()
      }
    }
  },
  render: () => <SidebarStage>
      <Sidebar collapsible defaultCollapsed logo={Wordmark} logoCollapsed={<Icon name="grid" size={24} />} footer={<NavItem label="Help & Support" icon="info" />}>
        {SidebarItems}
      </Sidebar>
    </SidebarStage>
}`,...(ge=(Ie=d.parameters)==null?void 0:Ie.docs)==null?void 0:ge.source},description:{story:"Start collapsed — drive the collapsed state yourself via `defaultCollapsed`.",...(Se=(Ne=d.parameters)==null?void 0:Ne.docs)==null?void 0:Se.description}}};const ye=["Default","Selected","Disabled","WithoutIcon","CollapsedRail","ExpandedVsCollapsed","Expandable","ExpandableCollapsed","SubItemStates","SidebarNav","FullSidebar","CollapsibleSidebar","SidebarStartCollapsed"];export{o as CollapsedRail,c as CollapsibleSidebar,m as Default,v as Disabled,u as Expandable,I as ExpandableCollapsed,r as ExpandedVsCollapsed,i as FullSidebar,b as Selected,N as SidebarNav,d as SidebarStartCollapsed,g as SubItemStates,p as WithoutIcon,ye as __namedExportsOrder,Ce as default};
