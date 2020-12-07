<template>
  <div v-if="clients.length">
    <v-data-table
      v-show="$vuetify.breakpoint.smAndUp"
      :headers="headers"
      :items="clients"
      hide-default-footer
      :item-class="() => (deletable ? '' : 'clickable')"
      class="mx-5"
      @click:row="impersonate"
    >
      <template v-slot:item.icon>
        <v-icon color="primary">$profile</v-icon>
      </template>
      <template v-slot:item.name="{ item }">
        {{ item.allowsAccessToUser.name }}
      </template>
      <template v-slot:item.createdDate="{ item }">
        {{ format(new Date(item.createdDate), 'LLL d, yyyy') }}
      </template>
      <template v-slot:item.close="{ item }">
        <v-btn
          :title="`${$t('navigation.close')}`"
          icon
          class="mx-4"
          @click="
            clientToDelete = item
            showConfirmation = true
          "
        >
          <v-icon>$close</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <v-card
      v-for="(client, i) in clients"
      v-show="$vuetify.breakpoint.xs"
      :key="i"
      rounded="0"
    >
      <v-divider v-if="i === 0" class="full-width my-0" />
      <v-list-item class="grow py-4" @click="impersonate(client)">
        <v-list-item-avatar>
          <v-icon right size="24">$profile</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="subtitle-1">
            {{ client.allowsAccessToUser.name }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action v-if="deletable" class="my-0">
          <v-btn
            :title="`${$t('navigation.close')}`"
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
      <v-divider class="full-width my-0" />
    </v-card>
    <ConfirmationDialog
      v-model="showConfirmation"
      title="cbo.removeConfirmationTitle"
      body="cbo.removeConfirmationBody"
      :on-confirm="removeClient"
    >
      <template v-slot:post-title>
        <br />
        <span class="pt-2 primary--text">
          {{ clientToDeleteName }}
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
  <EmptyState
    v-else
    class="ma-12"
    title="cbo.noClientsTitle"
    body="cbo.noClientsBody"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { DelegatedClient } from '@/types/delegate'
import { capitalize } from '@/assets/js/stringUtils'
import { userStore } from '@/plugins/store-accessor'
import { DataTableHeader } from 'vuetify'
import { format } from 'date-fns'

@Component
export default class ClientList extends Vue {
  @Prop({ default: false }) deletable: boolean
  clients: DelegatedClient[] = []
  clientToDelete: DelegatedClient | null = null
  showConfirmation = false
  loading = true
  capitalize = capitalize
  headers: DataTableHeader[] = []
  format = format

  mounted() {
    this.loadDelegatedClients().then((clients: DelegatedClient[]) => {
      this.loading = false
    })
    // We have to define headers in mounted function since this.$i18n is undefined otherwise
    this.headers = [
      {
        text: '',
        class: 'blue-super-light',
        align: 'start',
        sortable: false,
        value: 'icon',
        width: '3rem',
      },
      {
        text: this.$t('agent.sharedFolderNameLabel') as string,
        class: 'blue-super-light',
        align: 'start',
        sortable: true,
        value: 'name',
      },
      {
        text: this.$t('dateAdded') as string,
        class: 'blue-super-light',
        value: 'createdDate',
        sortable: true,
      },
    ]
    if (this.deletable)
      this.headers.push({
        text: '',
        class: 'blue-super-light',
        align: 'end',
        sortable: false,
        value: 'close',
        width: '3rem',
      })
  }

  get clientToDeleteName() {
    return this.clientToDelete
      ? `${this.clientToDelete.allowsAccessToUser.name}`
      : ''
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
