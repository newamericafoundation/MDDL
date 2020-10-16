import { Context } from '@nuxt/types'

export default ({ store, route, redirect }: Context) => {
  if (store.state.auth.loggedIn) {
    if (route.path === '/') redirect('/dashboard')
  } else {
    // if (route.path !== '/login' && route.path !== '/dashboard')
    //   redirect('/login')
  }
}
