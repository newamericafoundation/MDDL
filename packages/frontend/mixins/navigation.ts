import { Vue, Component } from 'nuxt-property-decorator'
import { navBarStore } from '@/plugins/store-accessor'

@Component
export default class Navigation extends Vue {
  setSideNav(value: boolean) {
    return this.$store.commit('navBar/setSideNav', value)
  }

  toggleSideNav(keyInput: boolean) {
    this.$store.commit('navBar/setSideNav', !navBarStore.side)
    if (keyInput) {
      this.$nuxt.$emit('focusSideNav')
    }
  }

  closeSideNav() {
    return this.$store.commit('navBar/setSideNav', false)
  }
}
