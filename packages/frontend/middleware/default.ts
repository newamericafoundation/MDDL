import { Context } from '@nuxt/types'
import { userStore } from '@/plugins/store-accessor'
import decode from 'jwt-claims'
import { UserRole } from '@/types/user'

/**
 * Check user role + logged in status and perform appropriate redirect
 * @param store
 * @param route
 * @param redirect
 * @param $auth
 */
export default async ({
  store,
  route,
  redirect,
  $auth,
  app,
  $config,
}: Context) => {
  switch (route.path) {
    case app.localePath('/client'):
      userStore.setRole(UserRole.CLIENT)
      break
    case app.localePath('/agency'):
      userStore.setRole(UserRole.AGENT)
      break
    case app.localePath('/community'):
      userStore.setRole(UserRole.CBO)
      break
    default:
      await userStore.fetchRole()
  }

  if (store.state.auth.loggedIn) {
    const promises: Promise<any>[] = []
    if (!userStore.userId) {
      const claims = decode($auth.getToken($config.authStrategy))
      userStore.setUserId(claims[$config.authTokenIdClaim])
    }
    if (!userStore.profile) {
      promises.push(userStore.fetchProfile())
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
