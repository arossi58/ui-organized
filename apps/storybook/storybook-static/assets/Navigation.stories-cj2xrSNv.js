import{N as a,j as e,S as f,f as S,g as s}from"./iframe-CDqQ4Mo8.js";import"./preload-helper-C1FmrZbK.js";function x({children:l,collapsed:h=!1}){return e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"var(--spacing-space-02)",width:h?"72px":"260px",padding:"var(--spacing-space-04)",borderRadius:"var(--radius-interactive)",background:"var(--color-surface-base)",border:"1px solid var(--color-border-primary)",transition:"width 200ms ease"},children:l})}const je={title:"Components/Navigation",component:a,parameters:{layout:"padded"},argTypes:{icon:{control:"select",options:[void 0,"home","settings","user","grid","calendar","mail"]},selected:{control:"boolean"},disabled:{control:"boolean"}},decorators:[(l,h)=>h.parameters.noSurface?e.jsx(l,{}):e.jsx(x,{children:e.jsx(l,{})})]},d={args:{label:"Dashboard",icon:"home",selected:!1,disabled:!1}},c={args:{label:"Dashboard",icon:"home",selected:!0}},p={args:{label:"Dashboard",icon:"home",disabled:!0}},b={args:{label:"Dashboard"}},r={parameters:{noSurface:!0},render:()=>e.jsxs(x,{collapsed:!0,children:[e.jsx(a,{label:"Home",icon:"home",collapsed:!0}),e.jsx(a,{label:"Dashboard",icon:"grid",selected:!0,collapsed:!0}),e.jsx(a,{label:"Messages",icon:"mail",collapsed:!0}),e.jsx(a,{label:"Calendar",icon:"calendar",collapsed:!0}),e.jsx(a,{label:"Settings",icon:"settings",collapsed:!0}),e.jsx(a,{label:"Archived",icon:"bookmark",disabled:!0,collapsed:!0})]})},o={parameters:{noSurface:!0},render:()=>e.jsxs("div",{style:{display:"flex",gap:"var(--spacing-space-04)",alignItems:"flex-start"},children:[e.jsxs(x,{children:[e.jsx(a,{label:"Home",icon:"home"}),e.jsx(a,{label:"Dashboard",icon:"grid",selected:!0}),e.jsx(a,{label:"Messages",icon:"mail"}),e.jsx(a,{label:"Settings",icon:"settings"})]}),e.jsxs(x,{collapsed:!0,children:[e.jsx(a,{label:"Home",icon:"home",collapsed:!0}),e.jsx(a,{label:"Dashboard",icon:"grid",selected:!0,collapsed:!0}),e.jsx(a,{label:"Messages",icon:"mail",collapsed:!0}),e.jsx(a,{label:"Settings",icon:"settings",collapsed:!0})]})]})},m={render:()=>e.jsxs(a,{label:"Reports",icon:"grid",selected:!0,defaultExpanded:!0,children:[e.jsx(s,{label:"Overview",selected:!0}),e.jsx(s,{label:"Revenue"}),e.jsx(s,{label:"Traffic"}),e.jsx(s,{label:"Conversions"}),e.jsx(s,{label:"Retention"})]})},u={render:()=>e.jsxs(a,{label:"Reports",icon:"grid",children:[e.jsx(s,{label:"Overview"}),e.jsx(s,{label:"Revenue"}),e.jsx(s,{label:"Traffic"})]})},g={render:()=>e.jsxs(e.Fragment,{children:[e.jsx(s,{label:"Default"}),e.jsx(s,{label:"Selected",selected:!0}),e.jsx(s,{label:"Disabled",disabled:!0})]})},v={render:()=>e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Home",icon:"home"}),e.jsxs(a,{label:"Dashboard",icon:"grid",selected:!0,defaultExpanded:!0,children:[e.jsx(s,{label:"Overview",selected:!0}),e.jsx(s,{label:"Activity"}),e.jsx(s,{label:"Insights"})]}),e.jsx(a,{label:"Messages",icon:"mail"}),e.jsxs(a,{label:"Calendar",icon:"calendar",children:[e.jsx(s,{label:"Upcoming"}),e.jsx(s,{label:"Past events"})]}),e.jsx(a,{label:"Team",icon:"users"}),e.jsx(a,{label:"Settings",icon:"settings"}),e.jsx(a,{label:"Archived",icon:"bookmark",disabled:!0})]})};function j({children:l}){return e.jsx("div",{style:{height:"100vh",display:"flex"},children:l})}const I=e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:"var(--spacing-space-02)",color:"var(--color-text-text-primary)",fontFamily:"var(--type-font-heading)",fontWeight:600,fontSize:"20px",whiteSpace:"nowrap"},children:[e.jsx(S,{name:"grid",size:24}),"UI Organized"]}),N=e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Home",icon:"home"}),e.jsxs(a,{label:"Dashboard",icon:"grid",selected:!0,defaultExpanded:!0,children:[e.jsx(s,{label:"Overview",selected:!0}),e.jsx(s,{label:"Activity"}),e.jsx(s,{label:"Insights"})]}),e.jsx(a,{label:"Messages",icon:"mail"}),e.jsxs(a,{label:"Calendar",icon:"calendar",children:[e.jsx(s,{label:"Upcoming"}),e.jsx(s,{label:"Past events"})]}),e.jsx(a,{label:"Team",icon:"users"}),e.jsx(a,{label:"Settings",icon:"settings"})]}),n={parameters:{noSurface:!0,layout:"fullscreen"},render:()=>e.jsx(j,{children:e.jsx(f,{logo:I,logoCollapsed:e.jsx(S,{name:"grid",size:24}),footer:e.jsx(a,{label:"Help & Support",icon:"info"}),children:N})})},t={parameters:{noSurface:!0,layout:"fullscreen"},render:()=>e.jsx(j,{children:e.jsx(f,{collapsible:!0,logo:I,logoCollapsed:e.jsx(S,{name:"grid",size:24}),footer:e.jsx(a,{label:"Help & Support",icon:"info"}),children:N})})},i={parameters:{noSurface:!0,layout:"fullscreen"},render:()=>e.jsx(j,{children:e.jsx(f,{collapsible:!0,defaultCollapsed:!0,logo:I,logoCollapsed:e.jsx(S,{name:"grid",size:24}),footer:e.jsx(a,{label:"Help & Support",icon:"info"}),children:N})})};var y,C,D;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    label: "Dashboard",
    icon: "home",
    selected: false,
    disabled: false
  }
}`,...(D=(C=d.parameters)==null?void 0:C.docs)==null?void 0:D.source}}};var w,k,H;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    label: "Dashboard",
    icon: "home",
    selected: true
  }
}`,...(H=(k=c.parameters)==null?void 0:k.docs)==null?void 0:H.source}}};var E,R,z;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: "Dashboard",
    icon: "home",
    disabled: true
  }
}`,...(z=(R=p.parameters)==null?void 0:R.docs)==null?void 0:z.source}}};var M,O,T;b.parameters={...b.parameters,docs:{...(M=b.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    label: "Dashboard"
  }
}`,...(T=(O=b.parameters)==null?void 0:O.docs)==null?void 0:T.source}}};var A,W,F,U,P;r.parameters={...r.parameters,docs:{...(A=r.parameters)==null?void 0:A.docs,source:{originalSource:`{
  parameters: {
    noSurface: true
  },
  render: () => <NavSurface collapsed>
      <NavItem label="Home" icon="home" collapsed />
      <NavItem label="Dashboard" icon="grid" selected collapsed />
      <NavItem label="Messages" icon="mail" collapsed />
      <NavItem label="Calendar" icon="calendar" collapsed />
      <NavItem label="Settings" icon="settings" collapsed />
      <NavItem label="Archived" icon="bookmark" disabled collapsed />
    </NavSurface>
}`,...(F=(W=r.parameters)==null?void 0:W.docs)==null?void 0:F.source},description:{story:`Collapsed rail. Hiding the label shrinks each item's width down to a square —
the height is unchanged from the expanded state and the icon sits inside even
padding on all four sides (rather than ballooning to fill the rail width).`,...(P=(U=r.parameters)==null?void 0:U.docs)==null?void 0:P.description}}};var V,_,q,B,G;o.parameters={...o.parameters,docs:{...(V=o.parameters)==null?void 0:V.docs,source:{originalSource:`{
  parameters: {
    noSurface: true
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
}`,...(q=(_=o.parameters)==null?void 0:_.docs)==null?void 0:q.source},description:{story:`Expanded vs. collapsed, side by side: collapsing changes only the width. Each
row keeps the exact same height, so the icons stay aligned across both rails.`,...(G=(B=o.parameters)==null?void 0:B.docs)==null?void 0:G.description}}};var J,K,L;m.parameters={...m.parameters,docs:{...(J=m.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => <NavItem label="Reports" icon="grid" selected defaultExpanded>
      <NavSubItem label="Overview" selected />
      <NavSubItem label="Revenue" />
      <NavSubItem label="Traffic" />
      <NavSubItem label="Conversions" />
      <NavSubItem label="Retention" />
    </NavItem>
}`,...(L=(K=m.parameters)==null?void 0:K.docs)==null?void 0:L.source}}};var Q,X,Y;u.parameters={...u.parameters,docs:{...(Q=u.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  render: () => <NavItem label="Reports" icon="grid">
      <NavSubItem label="Overview" />
      <NavSubItem label="Revenue" />
      <NavSubItem label="Traffic" />
    </NavItem>
}`,...(Y=(X=u.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,$,ee;g.parameters={...g.parameters,docs:{...(Z=g.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  render: () => <>
      <NavSubItem label="Default" />
      <NavSubItem label="Selected" selected />
      <NavSubItem label="Disabled" disabled />
    </>
}`,...(ee=($=g.parameters)==null?void 0:$.docs)==null?void 0:ee.source}}};var ae,se,le;v.parameters={...v.parameters,docs:{...(ae=v.parameters)==null?void 0:ae.docs,source:{originalSource:`{
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
}`,...(le=(se=v.parameters)==null?void 0:se.docs)==null?void 0:le.source}}};var re,oe,ne,te,ie;n.parameters={...n.parameters,docs:{...(re=n.parameters)==null?void 0:re.docs,source:{originalSource:`{
  parameters: {
    noSurface: true,
    layout: "fullscreen"
  },
  render: () => <SidebarStage>
      <Sidebar logo={Wordmark} logoCollapsed={<Icon name="grid" size={24} />} footer={<NavItem label="Help & Support" icon="info" />}>
        {SidebarItems}
      </Sidebar>
    </SidebarStage>
}`,...(ne=(oe=n.parameters)==null?void 0:oe.docs)==null?void 0:ne.source},description:{story:"The complete sidebar: logo slot, scrollable nav, and a footer slot.",...(ie=(te=n.parameters)==null?void 0:te.docs)==null?void 0:ie.description}}};var de,ce,pe,be,me;t.parameters={...t.parameters,docs:{...(de=t.parameters)==null?void 0:de.docs,source:{originalSource:`{
  parameters: {
    noSurface: true,
    layout: "fullscreen"
  },
  render: () => <SidebarStage>
      <Sidebar collapsible logo={Wordmark} logoCollapsed={<Icon name="grid" size={24} />} footer={<NavItem label="Help & Support" icon="info" />}>
        {SidebarItems}
      </Sidebar>
    </SidebarStage>
}`,...(pe=(ce=t.parameters)==null?void 0:ce.docs)==null?void 0:pe.source},description:{story:"Collapsible sidebar — pass `collapsible` and the expand/collapse toggle is\nrendered (and wired up) in the footer automatically. Click it to collapse the\nwhole sidebar to an icon-only rail.",...(me=(be=t.parameters)==null?void 0:be.docs)==null?void 0:me.description}}};var ue,ge,ve,xe,Se;i.parameters={...i.parameters,docs:{...(ue=i.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  parameters: {
    noSurface: true,
    layout: "fullscreen"
  },
  render: () => <SidebarStage>
      <Sidebar collapsible defaultCollapsed logo={Wordmark} logoCollapsed={<Icon name="grid" size={24} />} footer={<NavItem label="Help & Support" icon="info" />}>
        {SidebarItems}
      </Sidebar>
    </SidebarStage>
}`,...(ve=(ge=i.parameters)==null?void 0:ge.docs)==null?void 0:ve.source},description:{story:"Start collapsed — drive the collapsed state yourself via `defaultCollapsed`.",...(Se=(xe=i.parameters)==null?void 0:xe.docs)==null?void 0:Se.description}}};const Ie=["Default","Selected","Disabled","WithoutIcon","CollapsedRail","ExpandedVsCollapsed","Expandable","ExpandableCollapsed","SubItemStates","SidebarNav","FullSidebar","CollapsibleSidebar","SidebarStartCollapsed"];export{r as CollapsedRail,t as CollapsibleSidebar,d as Default,p as Disabled,m as Expandable,u as ExpandableCollapsed,o as ExpandedVsCollapsed,n as FullSidebar,c as Selected,v as SidebarNav,i as SidebarStartCollapsed,g as SubItemStates,b as WithoutIcon,Ie as __namedExportsOrder,je as default};
