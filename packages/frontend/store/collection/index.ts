import { Module, VuexModule, Action } from 'vuex-module-decorators'
import { api } from '@/plugins/api-accessor'
import { DocumentListItem } from 'api-client'

@Module({
  name: 'collection',
  stateFactory: true,
  namespaced: true,
})
export default class Collection extends VuexModule {
  @Action({ rawError: true })
  getDocuments(collectionId: string): Promise<DocumentListItem[]> {
    return api.collection
      .getCollectionDocuments(collectionId)
      .then(response => {
        return response.data.documents ? response.data.documents : []
      })
  }
}
