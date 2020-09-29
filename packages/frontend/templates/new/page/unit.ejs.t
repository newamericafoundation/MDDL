---
to: 'pages/<%=h.changeCase.camel(name)%>/<%=h.changeCase.camel(name)%>.spec.ts'
---
<%
  const pageName = h.changeCase.pascal(name)
%>import { shallowMount } from '@vue/test-utils'
import <%= pageName %> from '@/pages/<%= h.changeCase.camel(name) %>/index.vue'
import Layout from '@/layouts/default.vue'

describe('<%=pageName%> component', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(<%= pageName %>, { stubs: { Layout } })
    expect(wrapper.html()).toBeTruthy()
  })
})
