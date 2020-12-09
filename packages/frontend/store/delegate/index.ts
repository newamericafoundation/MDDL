import { Module, VuexModule, Action } from 'vuex-module-decorators'
import { api } from '@/plugins/api-accessor'
import { UserDelegatedAccess } from 'api-client'
import { userStore } from '@/plugins/store-accessor'
import { UserRole } from '@/types/user'

@Module({
  name: 'delegate',
  stateFactory: true,
  namespaced: true,
})
export default class Delegate extends VuexModule {
  @Action({ rawError: true })
  async delete(delegateId: string) {
    const { data } = await api.delegate.deleteAccountDelegate(delegateId)
    return data
  }

  @Action({ rawError: true })
  async acceptInvite(delegateId: string): Promise<UserDelegatedAccess> {
    const { data } = await api.delegate.acceptDelegatedAccount(delegateId)
    await this.$ga.event({
      eventCategory: 'delegate_user_accepted',
      eventAction: 'accepted',
      eventLabel: UserRole[userStore.role!],
    })
    return data
  }
}
