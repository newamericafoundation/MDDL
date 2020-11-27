import { api } from '@/plugins/api-accessor'
import { createStore } from '@/.nuxt/store'
import initialiseStores from '@/plugins/store-accessor'
import {
  DocumentCreate,
  Document,
  CollectionCreate,
  UserDelegatedAccessCreate,
  UserDelegatedAccessStatus,
  User,
} from 'api-client'
import VueAnalytics from 'vue-analytics'
import createMockGa from '@/__mocks__/vue-analytics'
import { UserRole } from '@/types/user'

jest.mock('@/plugins/api-accessor', () => ({
  api: {
    user: {
      listUserDocuments: jest.fn((userId: string) =>
        Promise.resolve({
          data: {
            documents: [
              {
                id: '1',
                name: 'Test One',
                createdDate: '2020-11-11T00:30:00.000Z',
                links: [],
              },
              {
                id: '2',
                name: 'Test Two',
                createdDate: '2020-11-01T00:30:00.000Z',
                links: [],
              },
            ],
          },
        }),
      ),
      listAccountDelegates: jest.fn((userId: string) =>
        Promise.resolve({
          data: {
            delegatedAccess: [
              {
                id: '1',
                email: 'one@twobulls.com',
                allowsAccessToUser: null,
                createdDate: '2020-11-22T00:00:00.000Z',
                status: UserDelegatedAccessStatus.INVITATIONSENT,
                links: [],
              },
            ],
          },
        }),
      ),
      addUserDocument: jest.fn(
        (userId: string, documentCreate: DocumentCreate) =>
          Promise.resolve({
            data: {
              id: 'testDocumentId',
              name: documentCreate.name,
              description: 'my test document',
              createdDate: Date.now().toLocaleString(),
              files: [
                {
                  name: documentCreate.files[0].name,
                  id: 'testFileId',
                  sha256Checksum:
                    '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
                  contentType: 'image/jpeg',
                  contentLength: 2000,
                  createdDate: '2020-01-12T10:11:12.123Z',
                  links: [
                    {
                      href: 'uploadUrl',
                      type: 'POST',
                      rel: 'upload',
                      includeFormData: {
                        testFormKey: 'testFormValue',
                      },
                    },
                  ],
                },
              ],
              links: [],
            } as Document,
          }),
      ),
      addUserCollection: jest.fn((ownerId: string, payload: CollectionCreate) =>
        Promise.resolve({
          id: 'test_collection',
          name: 'Test Collection',
          createdDate: '2020-11-22T00:00:00.000Z',
          links: [],
        }),
      ),
      addAccountDelegate: jest.fn(
        (userId: string, payload: UserDelegatedAccessCreate) =>
          Promise.resolve({
            id: '1',
            email: 'one@twobulls.com',
            allowsAccessToUser: null,
            createdDate: '2020-11-22T00:00:00.000Z',
            status: UserDelegatedAccessStatus.INVITATIONSENT,
            links: [],
          }),
      ),
      acceptTerms: jest.fn((userId: string) =>
        Promise.resolve({
          data: {
            id: '',
            givenName: '',
            familyName: '',
            termsOfUseAccepted: true,
            links: [],
          } as User,
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
  store.commit('user/setUserId', 'ABC123')
  return store
}

test('UserStore.getDocuments [Happy case]', async () => {
  const store = createTestStore()
  const docs = await store.dispatch('user/getDocuments')

  expect(
    (<jest.Mock<typeof api.user.listUserDocuments>>(
      (api.user.listUserDocuments as any)
    )).mock.calls.length,
  ).toBe(1)
})

// TODO: implement me after upload api changes

test('UserStore.uploadDocument [Empty file list]', async () => {
  const store = createTestStore()
  expect.assertions(1)
  try {
    await store.dispatch('user/uploadDocument', {
      fileList: [],
      onUploadProgress: () => {
        // empty
      },
    })
  } catch (e) {
    expect((e as Error).message).toMatch('Files must not be an empty list')
  }
})

test('UserStore.uploadDocument [Oversize file]', async () => {
  const store = createTestStore()
  const file = {
    size: 10000001,
    name: 'large',
  }
  expect.assertions(1)
  try {
    await store.dispatch('user/uploadDocument', {
      fileList: [file],
      onUploadProgress: () => {
        // empty
      },
    })
  } catch (e) {
    expect((e as Error).message).toMatch(`File ${file.name} is too large`)
  }
})

test('UserStore.uploadDocument [Empty file]', async () => {
  const store = createTestStore()
  const file = new File([], 'empty')
  expect.assertions(1)
  try {
    await store.dispatch('user/uploadDocument', {
      fileList: [file],
      onUploadProgress: () => {
        // empty
      },
    })
  } catch (e) {
    expect((e as Error).message).toMatch(`File ${file.name} is empty`)
  }
})

test('UserStore.uploadDocument [Happy case]', async () => {
  const store = createTestStore()
  const file = new File(['test'], 'test.png', {
    type: 'image/png',
  })
  expect.assertions(2)
  await store.dispatch('user/uploadDocument', {
    fileList: [file],
    onUploadProgress: () => {
      // empty
    },
  })

  expect(
    (<jest.Mock<typeof api.user.addUserDocument>>(
      (api.user.addUserDocument as any)
    )).mock.calls.length,
  ).toBe(1)

  expect(
    (<jest.Mock<typeof api.user.addUserDocument>>(
      (api.user.addUserDocument as any)
    )).mock.calls[0][1].files,
  ).toEqual([
    {
      name: file.name,
      contentType: file.type,
      sha256Checksum:
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      contentLength: file.size,
    },
  ])
})

test('UserStore.createCollection [Happy case]', async () => {
  const mockGa = createMockGa()
  const store = createTestStore(mockGa)
  store.commit('user/_setRole', 0)
  expect.assertions(18)
  await store.dispatch('user/createCollection', {
    name: 'Test Collection',
    documentIds: ['1', '2', '3', '4'],
    individualEmailAddresses: [
      'one@twobulls.com',
      'two@twobulls.com',
      'three@twobulls.com',
    ],
  })

  expect(
    (<jest.Mock<typeof api.user.addUserCollection>>(
      (api.user.addUserCollection as any)
    )).mock.calls.length,
  ).toBe(1)

  const eventCalls = (<jest.Mock>mockGa.event).mock.calls
  expect(eventCalls.length).toBe(4)
  for (const call of eventCalls) {
    expect(call[0].eventCategory).toBeDefined()
    expect(call[0].eventAction).toBeDefined()
    expect(call[0].eventLabel).toBe(UserRole[UserRole.CLIENT])
  }
  expect(eventCalls[0][0].eventValue).toBe(3) // three email addresses
  expect(eventCalls[1][0].eventValue).toBe(4) // four document IDs
  expect(eventCalls[2][0].eventValue).toBe(20) // oldest is 20 days ago
  expect(eventCalls[3][0].eventValue).toBe(10) // newest is 10 days ago
})

test('UserStore.delegateAccess [Happy case]', async () => {
  const mockGa = createMockGa()
  const store = createTestStore(mockGa)
  expect.assertions(4)
  await store.dispatch('user/delegateAccess', {
    email: 'one@twobulls.com',
  })

  expect(
    (<jest.Mock<typeof api.user.addAccountDelegate>>(
      (api.user.addAccountDelegate as any)
    )).mock.calls.length,
  ).toBe(1)

  const eventCalls = (<jest.Mock>mockGa.event).mock.calls
  expect(eventCalls.length).toBe(1)
  expect(eventCalls[0][0].eventCategory).toBeDefined()
  expect(eventCalls[0][0].eventValue).toBe(1) // one new delegate
})

test('UserStore.acceptTerms [Happy case]', async () => {
  const mockGa = createMockGa()
  const store = createTestStore(mockGa)
  store.commit('user/_setRole', 0)
  expect.assertions(4)
  await store.dispatch('user/acceptTerms')

  expect(
    (<jest.Mock<typeof api.user.acceptTerms>>(api.user.acceptTerms as any)).mock
      .calls.length,
  ).toBe(1)

  const eventCalls = (<jest.Mock>mockGa.event).mock.calls
  expect(eventCalls.length).toBe(1)
  expect(eventCalls[0][0].eventCategory).toBeDefined()
  expect(eventCalls[0][0].eventLabel).toBe(UserRole[UserRole.CLIENT])
})
