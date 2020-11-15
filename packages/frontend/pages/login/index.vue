<template>
  <div>
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { capitalize } from '../../assets/js/stringUtils'

@Component({
  layout: 'centered',

  head() {
    return {
      title: capitalize(this.$t('navigation.signIn') as string),
    }
  },
})
export default class Login extends Vue {
  mounted() {
    this.$auth.loginWith('oauth2')
  }
}
</script>
