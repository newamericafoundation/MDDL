<template>
  <div v-if="clients.length">
    <slot />
    <v-card v-for="(client, i) in clients" :key="i" rounded="0">
      <v-list-item class="grow py-4" @click="impersonate(client)">
        <v-list-item-avatar>
          <v-icon right size="24">$profile</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="subtitle-1">
            {{ client.allowsAccessToUser.givenName }}
            {{ client.allowsAccessToUser.familyName }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action v-if="deletable" class="my-0">
          <v-btn
            icon
            class="mx-4"
            @click="
              clientToDelete = client
              showConfirmation = true
            "
          >
            <v-icon>$close</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-divider class="full-width" />
    </v-card>
    <ConfirmationDialog
      v-model="showConfirmation"
      title="cbo.removeConfirmationTitle"
      body="cbo.removeConfirmationBody"
    >
      <template v-slot:post-title>
        <br />
        <span class="pt-2 primary--text">
          {{ clientToDelete.allowsAccessToUser.givenName }}
          {{ clientToDelete.allowsAccessToUser.familyName }}
        </span>
      </template>
    </ConfirmationDialog>
  </div>
  <v-progress-circular
    v-else-if="loading && !showConfirmation"
    indeterminate
    :size="50"
    color="primary"
  />
  <div v-else class="ma-12">
    <v-img
      max-width="30rem"
      class="mx-auto"
      :src="require('@/static/images/upload.svg')"
    />
    <p class="capitalize text-center">{{ $t('cbo.noClients') }}</p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { DelegatedClient } from '@/types/delegate'
import { capitalize } from '@/assets/js/stringUtils'
import { userStore } from '@/plugins/store-accessor'

@Component
export default class ClientList extends Vue {
  @Prop({ default: false }) deletable: boolean
  clients: DelegatedClient[] = []
  clientToDelete: DelegatedClient | null = null
  showConfirmation = false
  loading = true
  capitalize = capitalize

  mounted() {
    this.loadDelegatedClients().then((clients: DelegatedClient[]) => {
      this.loading = false
    })
  }

  async removeClient() {
    this.loading = true
    await this.$store.dispatch('delegate/delete', this.clientToDelete!.id)
    this.clientToDelete = null
    this.showConfirmation = false
    await this.loadDelegatedClients()
    await userStore.clearOwnerId()
    this.loading = false
  }

  impersonate(client: DelegatedClient) {
    // we only want select or delete - not both
    if (!this.deletable) {
      userStore.setOwnerId(client.allowsAccessToUser.id)
      this.$router.push(this.localePath('/')) // reload
    }
  }

  loadDelegatedClients() {
    return this.$store
      .dispatch('user/fetchDelegatedClients')
      .then((clients) => (this.clients = clients))
  }
}
</script>

<style scoped lang="scss">
.v-progress-circular {
  top: 40vh;
  left: calc(50% - 25px);
  position: relative;
}
</style>
