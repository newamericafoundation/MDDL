import snackbar from '@/store/snackbar'
import { createStore } from '@/.nuxt/store'
import initialiseStores from '@/plugins/store-accessor'
import { ThemeColor } from '@/types/theme'

const createTestStore = () => {
  const store = createStore()
  initialiseStores({ store })
  return store
}

test('SnackbarStore [All in one happy case]', async () => {
  const store = createTestStore()
  const mockClickAction = jest.fn()
  const mockSnackParams = {
    message: 'testMessage',
    actions: [
      {
        name: 'testClickAction',
        do: mockClickAction,
      },
      {
        name: 'testLinkAction',
        to: '',
      },
    ],
    dismissable: false,
    color: ThemeColor.INFO,
  }
  await store.commit('snackbar/setParams', mockSnackParams)

  expect(store.getters['snackbar/isVisible']).toBe(false)
  expect(store.getters['snackbar/message']).toBe(mockSnackParams.message)
  expect(store.getters['snackbar/clickActions'].length).toBe(1)
  expect(store.getters['snackbar/clickActions'][0]).toEqual(
    mockSnackParams.actions[0],
  )
  expect(store.getters['snackbar/linkActions'].length).toBe(1)
  expect(store.getters['snackbar/linkActions'][0]).toEqual(
    mockSnackParams.actions[1],
  )
  expect(store.getters['snackbar/isDismissable']).toBe(false)
  expect(store.getters['snackbar/color']).toBe(ThemeColor.INFO)
  expect(store.getters['snackbar/progress']).toBe(null)
})
