---
to: 'store/<%= h.changeCase.camel(name) %>/<%= h.changeCase.camel(name) %>.spec.ts'
---
<%
  const fileName = h.changeCase.camel(name)
%>import <%= fileName %> from '@/store/<%= fileName %>'

describe('<%= fileName %> store module', () => {
  it('fails until a passing test is added', () => {
    expect(false).toBe(true)
  })
})
