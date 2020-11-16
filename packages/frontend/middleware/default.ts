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
  const storedRole = localStorage.getItem('datalocker.role')
  if (storedRole !== null) {
    const role = parseInt(storedRole)
    if (isNaN(role) || !Object.keys(UserRole).includes(storedRole)) {
      // next line will also update session storage
      store.dispatch('user/setRole', UserRole.CLIENT)
    } else {
      store.dispatch('user/setRole', role)
    }
  }

  if (store.state.auth.loggedIn) {
    if (!userStore.userId) {
      userStore.setUserId($auth.user.username)
    }
    if (route.path === '/') redirect('/dashboard')
  }
}
