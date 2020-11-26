import { Vue, Component } from 'nuxt-property-decorator'
import { navBarStore } from '@/plugins/store-accessor'

@Component
export default class Navigation extends Vue {
  setSideNav(value: boolean) {
    return this.$store.commit('navBar/setSideNav', value)
  }

  toggleSideNav() {
    return this.$store.commit('navBar/setSideNav', !navBarStore.side)
  }

  closeSideNav() {
    return this.$store.commit('navBar/setSideNav', false)
  }
}
