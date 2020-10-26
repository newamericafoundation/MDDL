import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { api } from '@/plugins/api-accessor'

@Module({
  name: 'collection',
  stateFactory: true,
  namespaced: true,
})
export default class Collection extends VuexModule {}
