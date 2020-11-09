<template>
  <div />
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { capitalize } from '../../assets/js/stringUtils'

@Component({
  head() {
    return {
      title: capitalize(this.$t('signIn') as string),
    }
  },
})
export default class Login extends Vue {
  mounted() {
    this.$auth.loginWith('oauth2')
  }
}
</script>
