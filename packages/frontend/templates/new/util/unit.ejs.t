---
to: 'utils/<%= h.changeCase.camel(name) %>/<%= h.changeCase.camel(name) %>.spec.ts'
---
<%
  const fileName = h.changeCase.camel(name)
%>import <%= fileName %> from '@/utils/<%= fileName %>/<%= fileName %>.ts'

describe('<%= fileName %> util', () => {
  it('fails until a passing test is added', () => {
    expect(false).toBe(true)
  })
})
