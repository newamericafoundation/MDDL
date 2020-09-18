---
to: 'pages/<%=h.changeCase.pascal(name)%>/<%=h.changeCase.pascal(name)%>.stories.ts'
---
<%
  const pageName = h.changeCase.pascal(name);
%>import { shallowMount } from '@vue/test-utils';
import <%= pageName %> from '@/pages/<%= pageName %>/index.vue';

describe('<%=pageName%> page', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(<%= pageName %>);
    expect(wrapper.html()).toBeTruthy();
  });
});
