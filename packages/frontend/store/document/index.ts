/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Module, VuexModule, Action } from 'vuex-module-decorators'
import { api } from '@/plugins/api-accessor'
import { AxiosResponse } from 'axios'
import {
  Document,
  DocumentFile,
  FileDownloadDispositionTypeEnum,
} from 'api-client'

@Module({
  name: 'document',
  stateFactory: true,
  namespaced: true,
})
export default class DocumentStore extends VuexModule {
  @Action
  getById(id: string): Promise<Document> {
    return api.document
      .getDocumentById(id)
      .then((response: AxiosResponse<Document>) => response.data)
  }

  @Action
  update(document: Document) {
    api.document.updateDocumentById(document.id!, {
      name: document.name,
    })
  }

  @Action
  download(payload: {
    document: Document
    disposition: FileDownloadDispositionTypeEnum | undefined
  }): Promise<string[]> {
    const { document, disposition } = payload
    return Promise.all(
      document.files.map((file) =>
        api.document
          .downloadDocumentFileById(
            document.id,
            file.id,
            disposition ?? FileDownloadDispositionTypeEnum.Attachment,
          )
          .then((r) => r.data.href),
      ),
    )
  }

  @Action
  downloadFile(payload: {
    document: Document
    file: DocumentFile
    disposition: FileDownloadDispositionTypeEnum | undefined
  }): Promise<string> {
    const { document, file, disposition } = payload
    return api.document
      .downloadDocumentFileById(
        document.id,
        file.id,
        disposition ?? FileDownloadDispositionTypeEnum.Attachment,
      )
      .then((r) => r.data.href)
  }
}
