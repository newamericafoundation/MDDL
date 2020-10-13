import { api } from '@/plugins/api-accessor'
import { createStore } from '@/.nuxt/store'
import initialiseStores from '@/plugins/store-accessor'
import { DocumentCreate, Document } from 'api-client'

jest.mock('@/plugins/api-accessor', () => ({
  api: {
    user: {
      listUserDocuments: jest.fn((userId: string) =>
        Promise.resolve({
          data: {
            documents: [],
          },
        }),
      ),
      addUserDocument: jest.fn(
        (userId: string, documentCreate: DocumentCreate) =>
          Promise.resolve({
            data: {
              id: 'testDocumentId',
              name: documentCreate.name,
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

test('UserStore.getDocuments [Happy case]', async () => {
  const store = createStore()
  initialiseStores({ store })
  const docs = await store.dispatch('user/getDocuments')

  expect(
    (<jest.Mock<typeof api.user.listUserDocuments>>(
      (api.user.listUserDocuments as any)
    )).mock.calls.length,
  ).toBe(1)
})

// TODO: implement me after upload api changes

test('UserStore.uploadDocument [Empty file list]', async () => {
  const store = createStore()
  initialiseStores({ store })
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
  const store = createStore()
  initialiseStores({ store })
  // const file = new File(new Array(10000001).fill('a'), 'large')
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
  const store = createStore()
  initialiseStores({ store })
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
  const store = createStore()
  initialiseStores({ store })
  const file = new File(['test'], 'test.png', {
    type: 'image/png',
  })
  expect.assertions(5)
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

  const formData = new FormData()
  formData.append('testFormKey', 'testFormValue')
  formData.append('file', file)
  expect(axiosPost.mock.calls.length).toBe(1)
  expect(axiosPost.mock.calls[0][0]).toBe('uploadUrl')
  expect(axiosPost.mock.calls[0][1]).toEqual(formData)
})
