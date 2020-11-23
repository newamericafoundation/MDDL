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
import { snackbarStore } from '@/plugins/store-accessor'
import { UserDelegatedAccess } from 'api-client'

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
          snackbarStore.setProgress(-1)
          snackbarStore.setParams({
            message: 'toast.acceptedDelegateInvite',
            actions: [
              {
                name: 'toast.switchAccount',
                do: async () => {
                  await this.$store.commit(
                    'user/setOwnerId',
                    delegate.allowsAccessToUser!.id,
                  )
                  await snackbarStore.setVisible(false)
                  this.$router.push(this.localePath('/'))
                },
              },
            ],
          })
          snackbarStore.setVisible(true)
          this.$router.push(this.localePath('/'))
        })
        .catch(e => {
          this.error = true
        })
    } else {
      this.error = true
    }
  }
}
</script>
