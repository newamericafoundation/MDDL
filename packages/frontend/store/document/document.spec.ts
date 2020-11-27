import { api } from '@/plugins/api-accessor'
import { createStore } from '@/.nuxt/store'
import initialiseStores, { userStore } from '@/plugins/store-accessor'
import {
  Document,
  FileDownloadDispositionTypeEnum,
  FileContentTypeEnum,
  DocumentFile,
} from 'api-client'
import VueAnalytics from 'vue-analytics'
import createMockGa from '@/__mocks__/vue-analytics'
import { UserRole } from '@/types/user'

jest.mock('@/plugins/api-accessor', () => ({
  api: {
    document: {
      downloadDocumentFileById: jest.fn(
        (
          documentId: string,
          fileId: string,
          disposition: FileDownloadDispositionTypeEnum,
        ) =>
          Promise.resolve({
            data: {
              href: 'http://blah',
            },
          }),
      ),
    },
  },
}))

const axiosPost = jest.fn()

jest.mock('axios', () => ({
  create: () => ({
    post: axiosPost,
    defaults: {
      headers: {
        common: {},
      },
    },
  }),
}))

Date.now = jest.fn(() => new Date(Date.UTC(2020, 10, 22)).valueOf())

const createTestStore = ($ga?: VueAnalytics) => {
  const store = createStore()
  initialiseStores({
    store,
    $ga: $ga || createMockGa(),
  })
  // store.commit('user/setRole', UserRole.CLIENT)
  return store
}

test('DocumentStore.downloadFile [Happy case]', async () => {
  const mockGa = createMockGa()
  const store = createTestStore(mockGa)
  store.commit('user/_setRole', 0)
  expect.assertions(5)
  const documentFile = {
    id: '1',
    name: 'test_document.png',
    contentType: FileContentTypeEnum.ImagePng,
    sha256Checksum: 'a',
    contentLength: 1,
    createdDate: '2020-11-22T00:00:00.000Z',
    links: [],
  } as DocumentFile
  await store.dispatch('document/downloadFile', {
    document: {
      id: '',
      name: 'Test Document',
      description: null,
      createdDate: '2020-11-22T00:00:00.000Z',
      files: [documentFile],
      links: [],
    } as Document,
    file: documentFile,
    disposition: FileDownloadDispositionTypeEnum.Attachment,
  })

  expect(
    (<jest.Mock<typeof api.document.downloadDocumentFileById>>(
      (api.document.downloadDocumentFileById as any)
    )).mock.calls.length,
  ).toBe(1)

  const eventCalls = (<jest.Mock>mockGa.event).mock.calls
  expect(eventCalls.length).toBe(1)
  expect(eventCalls[0][0].eventCategory).toBeDefined()
  expect(eventCalls[0][0].eventAction).toBe(
    FileDownloadDispositionTypeEnum.Attachment,
  )
  expect(eventCalls[0][0].eventLabel).toBe(UserRole[UserRole.CLIENT])
})
