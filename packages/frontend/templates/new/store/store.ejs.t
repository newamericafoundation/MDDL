---
to: 'store/<%= h.changeCase.camel(name) %>/index.ts'
---
<%
  const storeName = h.changeCase.camel(name)
%>import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

@Module({
  name: '<%= storeName %>',
  stateFactory: true,
  namespaced: true,
})
export default class <%= h.changeCase.pascal(name) %> extends VuexModule {

}
