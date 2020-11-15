import { Context } from '@nuxt/types'

/**
 * Check user role + logged in status and perform appropriate redirect
 * @param store
 * @param route
 * @param redirect
 * @param $auth
 */
export default ({ store, route, redirect, $auth }: Context) => {
  const role = sessionStorage.getItem('datalocker.role')

  if (!role) {
    $auth.logout()
  } else if (store.state.auth.loggedIn) {
    if (route.path === '/') redirect('/dashboard')
  }
}
