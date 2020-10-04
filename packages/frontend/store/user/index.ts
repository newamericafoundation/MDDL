import { Module, VuexModule, Action } from 'vuex-module-decorators'
import { api } from '@/plugins/api-accessor'
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { DocumentListItem } from 'api-client'

@Module({
  name: 'user',
  stateFactory: true,
  namespaced: true,
})
export default class User extends VuexModule {
  userId = 'test'

  @Action({ rawError: true })
  getDocuments(): Promise<DocumentListItem[]> {
    return api.user
      .listUserDocuments(this.userId)
      .then((response) =>
        response.data.documents ? response.data.documents : [],
      )
  }
}
