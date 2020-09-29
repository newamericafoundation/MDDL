---
to: 'components/<%=h.changeCase.pascal(name)%>/<%=h.changeCase.pascal(name)%>.stories.ts'
---
<%
  const componentName = h.changeCase.pascal(name)
%>export default {
  title: 'Components/<%=componentName%>',
}

export const StoryName = () => '<<%=componentName%> />'
