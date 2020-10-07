import { Module, VuexModule, Action } from 'vuex-module-decorators'
import { api } from '@/plugins/api-accessor'
import { Document, DocumentListItem, FileContentTypeEnum } from 'api-client'
// import { AxiosResponse } from 'axios'
import hashFile from '@/assets/js/hash/'

@Module({
  name: 'user',
  stateFactory: true,
  namespaced: true,
})
export default class User extends VuexModule {
  userId = 'test'

  @Action
  async uploadDocument({
    file,
    onUploadProgress = () => {
      // default empty function
    },
  }: {
    file: File
    onUploadProgress?: (e: ProgressEvent) => void
  }): Promise<Document> {
    // file greater than 10 mB
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File too large')
    }

    const sha256Checksum = await hashFile(file)

    const { data } = await api.user.addUserDocument(this.userId, {
      name: file.name,
      files: [
        {
          name: file.name.split('.').slice(0, -1).join('.'),
          contentType: file.type as FileContentTypeEnum,
          sha256Checksum,
        },
      ],
    })

    // TODO: upload file to s3 and remove mock code
    const mockUploadPromise = new Promise<Document>((resolve) => {
      let mockUploadIterations = 0
      const mockUploadInterval = window.setInterval(() => {
        if (mockUploadIterations <= 10) {
          onUploadProgress(
            new ProgressEvent('upload', {
              lengthComputable: true,
              loaded: mockUploadIterations * 20,
              total: 200,
            }),
          )
          mockUploadIterations += 1
        } else {
          window.clearInterval(mockUploadInterval)
          resolve(data)
        }
      }, 250)
    })

    return mockUploadPromise

    // const instance = axios.create()
    // // don't put our API token in the request otherwise we confuse AWS
    // delete instance.defaults.headers.common.Authorization

    // const options: AxiosRequestConfig = {
    //   headers: {
    //     'Content-Type': file.type,
    //     'Content-Disposition': `attachment; filename=${file.name}`,
    //   },
    //   onUploadProgress,
    // }
    // await instance.put(data.url, file, options)
  }

  @Action
  getDocuments(): Promise<DocumentListItem[]> {
    return api.user
      .listUserDocuments(this.userId)
      .then((response) =>
        response.data.documents ? response.data.documents : [],
      )
  }
}
