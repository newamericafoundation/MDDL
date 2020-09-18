---
to: 'components/<%=h.changeCase.pascal(name)%>/<%=h.changeCase.pascal(name)%>.stories.ts'
---
<%
  const componentName = h.changeCase.pascal(name)
%>export default {
  title: '<%=componentName%>'
}

export const NuxtWebsite = () => '<<%=componentName%> />'
