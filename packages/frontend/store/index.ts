// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { Store } from 'vuex'
import { initialiseStores } from '@/utils/store-accessor'
const initializer = (store: Store<any>) => initialiseStores(store)
export const plugins = [initializer]
export * from '@/utils/store-accessor'
