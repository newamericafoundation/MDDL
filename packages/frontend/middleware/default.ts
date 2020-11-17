import { UserRole } from '@/types/user'
import { Context } from '@nuxt/types'
import { userStore } from '@/plugins/store-accessor'

/**
 * Check user role + logged in status and perform appropriate redirect
 * @param store
 * @param route
 * @param redirect
 * @param $auth
 */
export default ({ store, route, redirect, $auth }: Context) => {
  if (store.state.auth.loggedIn) {
    if (!userStore.userId) {
      userStore.setUserId($auth.user.username)
    }
    if (route.path === '/') redirect('/dashboard')
  }
}
