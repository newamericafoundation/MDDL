---
to: 'pages/<%=h.changeCase.camel(name)%>/<%=h.changeCase.camel(name)%>.stories.ts'
---
<%
  const componentName = h.changeCase.pascal(name)
%>export default {
  title: 'Pages/<%=componentName%>',
}

export const StoryName = () => '<<%=componentName%> />'