import { Vue, Component } from 'nuxt-property-decorator'

@Component
export class Login extends Vue {
  setRoleLoginRedirect(role: string) {
    localStorage.setItem('datalocker.role', role)
    this.$router.push('/login')
  }
}
