import { UserRole } from '@/types/user'
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export class Login extends Vue {
  setRoleLoginRedirect(role: UserRole) {
    this.$store.dispatch('user/setRole', role)
    this.$router.push('/login')
  }
}
