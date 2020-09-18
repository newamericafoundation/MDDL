---
to: 'components/<%=h.changeCase.pascal(name)%>/<%=h.changeCase.pascal(name)%>.spec.ts'
---
<%
  const componentName = h.changeCase.pascal(name)
%>import { shallowMount } from '@vue/test-utils'
import <%= componentName %> from '@/components/<%= componentName %>/<%= componentName %>.vue'

describe('<%=componentName%> component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(<%= componentName %>)
    expect(wrapper.html()).toBeTruthy()
  })
})
