import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { api } from '@/plugins/api-accessor'
import { userStore } from '@/plugins/store-accessor'

@Module({
  name: 'delegate',
  stateFactory: true,
  namespaced: true,
})
export default class Delegate extends VuexModule {
  @Action({ rawError: true })
  async delete(delegateId: string) {
    if (!userStore.userId) return Promise.reject(new Error('UserID not set'))
    const { data } = await api.delegate.deleteAccountDelegate(
      userStore.userId,
      delegateId,
    )
    return data
  }
}
