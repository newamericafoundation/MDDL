import { Context } from '@nuxt/types'

export default function ({ store, route, redirect }: Context) {
  if (route.path === '/') redirect('/dashboard')
  // TODO: Check whether user is logged in etc. and redirect appropriately
}
