<template>
  <v-row align="center" justify="center">
    <v-col v-if="error" cols="auto">{{ $t('cbo.errorAcceptingInvite') }}</v-col>
    <v-col v-else cols="auto">
      <v-progress-circular indeterminate />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { snackbarStore, userStore } from '@/plugins/store-accessor'
import { UserDelegatedAccess } from 'api-client'
import { UserRole } from '../../../../types/user'

@Component({
  layout: 'empty',
})
export default class Accept extends Vue {
  error = false

  async mounted() {
    if (this.$route.params.id) {
      const delegate = await this.$store
        .dispatch('delegate/acceptInvite', this.$route.params.id)
        .then((delegate: UserDelegatedAccess) => {
          snackbarStore.setParams({
            message: 'toast.acceptedDelegateInvite',
          })
          snackbarStore.setVisible(true)
          userStore.setRole(UserRole.CBO)
          this.$router.push(this.localePath('/'))
        })
        .catch((e) => {
          this.error = true
        })
    } else {
      this.error = true
    }
  }
}
</script>
