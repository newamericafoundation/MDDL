<template>
  <div>
    <v-menu v-model="showMenu" absolute offset-y style="max-width: 600px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          icon
          class="ml-4 text-body-1 font-weight-medium documentMenu"
          color="primary"
          v-on="on"
        >
          <v-icon>$dots-horizontal</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item v-if="editDetails">
          <v-btn class="justify-start" text @click="editDetails">
            <v-icon small class="mr-2" color="primary">$pencil</v-icon>
            {{ $t('controls.editDetails') }}
          </v-btn>
        </v-list-item>
        <v-list-item v-if="deleteDoc">
          <v-btn class="justify-start" text @click="showConfirmation = true">
            <v-icon small class="mr-2" color="primary">$delete</v-icon>
            {{ $t('controls.delete') }}
          </v-btn>
        </v-list-item>
        <v-list-item>
          <v-btn class="justify-start" text @click="download">
            <v-icon small class="mr-2" color="primary">$download</v-icon>
            {{ $t('controls.download') }}
          </v-btn>
        </v-list-item>
      </v-list>
    </v-menu>

    <ConfirmationDialog
      v-model="showConfirmation"
      body="document.deleteConfirmationBody"
      title="document.deleteConfirmationTitle"
      :on-confirm="confirmDelete"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { capitalize } from '@/assets/js/stringUtils'

@Component
export default class DocumentMenu extends Vue {
  @Prop({ default: null }) editDetails: () => void
  @Prop({ default: null }) deleteDoc: null | (() => void)
  @Prop({ default: null }) download: () => void

  capitalize = capitalize
  showMenu = false
  showConfirmation = false

  confirmDelete() {
    this.deleteDoc!()
    this.showConfirmation = false
  }
}
</script>
