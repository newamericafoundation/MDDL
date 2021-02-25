<template>
  <div>
    <v-progress-circular indeterminate color="primary" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'
import { UserRole } from '@/types/user'

@Component({
  layout: 'centered',

  head() {
    return {
      title: this.$t('navigation.signIn') as string,
    }
  },
})
export default class Login extends Vue {
  mounted() {
    if (!!this.$route && this.$route.query.role) {
      const index = Number(this.$route.query.role)
      userStore.setRole(index)
      this.$router.push(this.localePath('/'))
    } else {
      this.$auth.loginWith(this.$config.authStrategy)
    }
  }
}
</script>
