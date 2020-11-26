import { Context } from '@nuxt/types'
import { userStore } from '@/plugins/store-accessor'

/**
 * Check user role + logged in status and perform appropriate redirect
 * @param store
 * @param route
 * @param redirect
 * @param $auth
 */
export default async ({ store, route, redirect, $auth, app }: Context) => {
  if (store.state.auth.loggedIn) {
    const promises: Promise<any>[] = []
    if (!userStore.userId) {
      userStore.setUserId($auth.user.username)
    }
    if (!userStore.profile) {
      promises.push(userStore.fetchProfile())
    }
    if (
      userStore.role === null &&
      !['/', '/agency', '/community']
        .map((s) => app.localePath(s))
        .includes(route.path)
    ) {
      promises.push(userStore.fetchRole())
    }
    await Promise.all(promises)
    if (
      !userStore.profile!.termsOfUseAccepted &&
      route.path !== app.localePath('/terms-of-use')
    ) {
      redirect(app.localePath('/terms-of-use'))
    }

    if (route.path === app.localePath('/'))
      redirect(app.localePath('/dashboard'))
  }
}
