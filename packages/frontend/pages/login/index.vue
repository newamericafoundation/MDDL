<template>
  <div>
    <v-progress-circular indeterminate color="primary" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

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
    this.$auth.loginWith(this.$config.authStrategy)
  }
}
</script>
