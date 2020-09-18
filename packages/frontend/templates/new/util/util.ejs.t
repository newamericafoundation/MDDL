---
to: 'utils/<%= h.changeCase.camel(name) %>/<%= h.changeCase.camel(name) %>.ts'
---
<%
  const fileName = h.changeCase.camel(name)
%>export default function <%= fileName %>() {
  return ''
}
