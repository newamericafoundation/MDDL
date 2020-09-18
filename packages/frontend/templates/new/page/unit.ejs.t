---
to: 'pages/<%=h.changeCase.pascal(name)%>/<%=h.changeCase.pascal(name)%>.spec.ts'
---
<%
  const pageName = h.changeCase.pascal(name)
%>import { shallowMount } from '@vue/test-utils'
import <%= pageName %> from '@/pages/<%= pageName %>/index.vue'
import Layout from '@/layouts/default.vue'

describe('<%=pageName%> component', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(<%= pageName %>, { stubs: { Layout } })
    expect(wrapper.html()).toBeTruthy()
  })
})
