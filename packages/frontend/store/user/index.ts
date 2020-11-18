import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators'
import { api } from '@/plugins/api-accessor'
import {
  Collection,
  SharedCollectionListItem as ClientSharedCollectionListItem,
  CollectionCreate,
  CollectionListItem,
  Document,
  DocumentListItem,
  FileContentTypeEnum,
  User as ApiUser,
  UserDelegatedAccessCreate,
  UserDelegatedAccess,
  UserDelegatedAccessList,
} from 'api-client'
import { SharedCollectionListItem } from '@/types/transformed'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { hashFile } from '@/assets/js/hash/'
import { UserRole } from '@/types/user'

@Module({
  name: 'user',
  stateFactory: true,
  namespaced: true,
})
export default class User extends VuexModule {
  _userId: string | null = null
  _documents: DocumentListItem[] = []
  _collections: CollectionListItem[] = []
  _sharedCollections: SharedCollectionListItem[] = []
  _timeoutId: number | null
  _role: UserRole = UserRole.CLIENT

  get documents() {
    return this._documents
  }

  get collections() {
    return this._collections
  }

  get sharedCollections() {
    return this._sharedCollections
  }

  get userId() {
    return this._userId
  }

  get role() {
    return this._role
  }

  @Mutation
  setUserId(userId: string) {
    this._userId = userId
  }

  @Action
  fetchRole() {
    const storedRole = localStorage.getItem('datalocker.role')
    if (storedRole !== null) {
      const role = parseInt(storedRole)
      if (isNaN(role) || !Object.keys(UserRole).includes(storedRole)) {
        this.setRole(UserRole.CLIENT)
      } else {
        this.setRole(role)
      }
    }
  }

  @Action
  setRole(role: UserRole) {
    this._role = role
    localStorage.setItem('datalocker.role', role.toString())
  }

  // TODO: Update after upload API changes
  @Action
  async uploadDocument({
    fileList,
    name,
    onUploadProgress = () => {
      // default empty function
    },
  }: {
    fileList: FileList
    name: string
    onUploadProgress?: (e: ProgressEvent) => void
  }): Promise<Document> {
    // FileList has a weird spec, with no iterator. This converts it to an array
    const files = Array.from(fileList)

    if (!files.length)
      return Promise.reject(new Error('Files must not be an empty list'))

    if (!this._userId) return Promise.reject(new Error('UserID not set'))

    for (const file of files) {
      if (file.size > Math.pow(10, 7))
        throw new Error(`File ${file.name} is too large`)
      else if (file.size <= 0) throw new Error(`File ${file.name} is empty`)
    }

    const hashes = await Promise.all(files.map(hashFile))

    const addResponse: AxiosResponse<Document> = await api.user.addUserDocument(
      this._userId,
      {
        name,
        files: files.map((file, i) => ({
          name: file.name,
          contentType: file.type as FileContentTypeEnum,
          sha256Checksum: hashes[i],
          contentLength: file.size,
        })),
      },
    )

    const axiosInstance = axios.create()
    // don't put our API token in the request otherwise we confuse AWS
    delete axiosInstance.defaults.headers.common.Authorization

    const totalUploadSize = files.reduce((sum, file) => sum + file.size, 0)
    const uploadProgress = new Array(files.length).fill(0)

    await Promise.all(
      addResponse.data.files.map((documentFile, i) => {
        const options: AxiosRequestConfig = {
          onUploadProgress: (e) => {
            uploadProgress[i] = e.loaded
            onUploadProgress(
              new ProgressEvent('upload', {
                loaded: uploadProgress.reduce((sum, val) => sum + val, 0),
                total: totalUploadSize,
              }),
            )
          },
        }

        const uploadLink = (documentFile.links as any[]).find(
          (l) => l.type === 'POST',
        )

        if (!uploadLink)
          return Promise.reject(
            new Error(
              `No upload link for file ${documentFile.name} (${documentFile.id})`,
            ),
          )

        const file = files.find(
          (_, i) => hashes[i] === documentFile.sha256Checksum,
        )
        if (!file)
          Promise.reject(
            new Error(
              `Corrupted hash for file ${documentFile.name} (${documentFile.id})`,
            ),
          )

        const formData = new FormData()
        Object.keys(uploadLink.includeFormData).forEach((key) =>
          formData.append(key, uploadLink.includeFormData[key]),
        )
        formData.append('file', file!)
        return axiosInstance.post(uploadLink.href, formData, options)
      }),
    )

    return addResponse.data
  }

  @Mutation
  setDocuments(documents: DocumentListItem[]) {
    this._documents = documents
  }

  @Mutation
  setCollections(collections: CollectionListItem[]) {
    this._collections = collections
  }

  @Mutation
  setSharedCollections(collections: SharedCollectionListItem[]) {
    this._sharedCollections = collections
  }

  @Action({ rawError: true })
  getUser(id: string): Promise<ApiUser> {
    return api.user.getUser(id).then((response) => {
      return response.data
    })
  }

  @Action({ rawError: true, commit: 'setDocuments' })
  scheduleDocumentsRefresh(delayMs = 8000): Promise<DocumentListItem[]> {
    if (!this._userId) return Promise.reject(new Error('UserID not set'))
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
    }
    const userId = this._userId
    return new Promise<DocumentListItem[]>((resolve, reject) => {
      this._timeoutId = window.setTimeout(() => {
        api.user
          .listUserDocuments(userId)
          .then((response) => {
            resolve(response.data.documents ? response.data.documents : [])
          })
          .catch(reject)
          .finally(() => (this._timeoutId = null))
      }, delayMs)
    })
  }

  @Action({ rawError: true, commit: 'setDocuments' })
  getDocuments(): Promise<DocumentListItem[]> {
    if (!this._userId) return Promise.reject(new Error('UserID not set'))
    return api.user.listUserDocuments(this._userId).then((response) => {
      return response.data.documents ? response.data.documents : []
    })
  }

  @Action({ rawError: true, commit: 'setCollections' })
  getCollections(): Promise<CollectionListItem[]> {
    if (!this._userId) return Promise.reject(new Error('UserID not set'))
    return api.user.listUserCollections(this._userId).then((response) => {
      return response.data.collections ? response.data.collections : []
    })
  }

  @Action({ rawError: true, commit: 'setSharedCollections' })
  getSharedCollections(): Promise<SharedCollectionListItem[]> {
    if (!this._userId) return Promise.reject(new Error('UserID not set'))
    return api.user.listUserCollectionsShared(this._userId).then((response) => {
      return (response.data.sharedCollections
        ? response.data.sharedCollections
        : []
      ).map(
        (c: ClientSharedCollectionListItem) =>
          (Object.assign({}, c, {
            collection: {
              ...c.collection,
              createdDate: new Date(c.collection.createdDate),
            },
          }) as unknown) as SharedCollectionListItem,
      )
    })
  }

  @Action({ rawError: true, commit: 'setDocuments' })
  async createCollection(payload: CollectionCreate): Promise<Collection> {
    if (!this._userId) return Promise.reject(new Error('UserID not set'))
    const { data } = await api.user.addUserCollection(this._userId, payload)
    return data
  }

  @Action({ rawError: true })
  async fetchDelegates(): Promise<UserDelegatedAccess[]> {
    if (!this._userId) return Promise.reject(new Error('UserID not set'))
    const { data } = await api.user.listAccountDelegates(this._userId)
    return data.delegatedAccess
  }

  @Action({ rawError: true })
  async delegateAccess(
    payload: UserDelegatedAccessCreate,
  ): Promise<UserDelegatedAccess> {
    if (!this._userId) return Promise.reject(new Error('UserID not set'))
    const { data } = await api.user.addAccountDelegate(this._userId, payload)
    return data
  }
}
