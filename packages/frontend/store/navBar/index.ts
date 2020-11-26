import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({
  name: 'navBar',
  stateFactory: true,
  namespaced: true,
})
export default class NavBar extends VuexModule {
  _side = false

  get side() {
    return this._side
  }

  @Mutation
  setSideNav(payload: boolean) {
    this._side = payload
  }
}
