<template>
  <div />
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'

@Component({
  auth: false,
})
export default class Authorize extends Vue {
  async mounted() {
    if (this.$route.hash) {
      const values: { [index: string]: any } = {
        access_token: '',
        expires_in: '',
        id_token: '',
        state: '',
        token_type: '',
      }
      for (const item of this.$route.hash
        .slice(1)
        .split('&')
        .map(x => x.split('='))) {
        values[item[0]] = item[1]
      }
      const user = await this.$auth.setUserToken(
        'Bearer ' + values.access_token,
      )
    }

    await this.redirectToDashboard(this.isLoggedIn)
    if (!this.isLoggedIn) {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  @Watch('isLoggedIn')
  redirectToDashboard(loggedIn: boolean) {
    if (loggedIn) {
      return this.$router.replace('/dashboard')
    }
    return Promise.resolve()
  }

  get isLoggedIn() {
    return this.$auth.loggedIn
  }
}
</script>
