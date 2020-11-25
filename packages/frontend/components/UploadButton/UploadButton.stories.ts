import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'
import { Document } from 'api-client'
import UploadButton from './UploadButton.vue'

export default { title: 'Components/UploadButton' }

const mockUploadStore = new Vuex.Store({
  modules: {
    user: {
      namespaced: true,
      actions: {
        uploadDocument(
          _context,
          {
            onUploadProgress = () => {
              // default empty function
            },
          }: {
            file: File
            onUploadProgress?: (e: ProgressEvent) => void
          },
        ): Promise<Document> {
          const mockUploadPromise = new Promise<Document>(resolve => {
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
                resolve({
                  name: 'Test document',
                  id: '1',
                  description: 'My test document',
                  createdDate: '2020-01-01T10:10:10Z',
                  files: [],
                  links: [],
                })
              }
            }, 250)
          })

          return mockUploadPromise
        },
      },
    },
  },
})

storiesOf('Components/UploadButton', module).add('Default', () => ({
  components: { UploadButton },
  store: mockUploadStore,
  template: '<UploadButton />',
}))
