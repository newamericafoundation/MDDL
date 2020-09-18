---
to: 'layouts/<%=h.changeCase.pascal(name)%>/<%=h.changeCase.pascal(name)%>.spec.ts'
---
<%
  const layoutName = h.changeCase.pascal(name)
%>import { shallowMount } from '@vue/test-utils'
import <%= layoutName %> from '@/layouts/<%= layoutName %>/<%= layoutName %>.vue'



describe('<%=layoutName%> layout', () => {
  it('exports a valid layout', () => {
    const wrapper = shallowMount(<%= layoutName %>)
    expect(wrapper.html()).toBeTruthy()
  })
})
