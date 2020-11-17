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
        <v-list-item>
          <v-btn class="justify-start" text @click="editDetails">
            <v-icon small class="mr-2" color="primary">$pencil</v-icon>
            {{ $t('controls.editDetails') }}
          </v-btn>
        </v-list-item>
        <v-list-item>
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
    <v-dialog v-model="showConfirmation" width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2">
          {{ capitalize($t('document.deleteConfirmationTitle')) }}
        </v-card-title>

        <v-card-text class="mt-2">
          {{ $t('document.deleteConfirmationBody') }}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showConfirmation = false">
            {{ capitalize($t('controls.cancel')) }}
          </v-btn>
          <v-btn color="primary" text @click="confirmDelete">
            {{ capitalize($t('controls.confirm')) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { capitalize } from '@/assets/js/stringUtils'

@Component
export default class DocumentMenu extends Vue {
  @Prop({ required: true }) download: () => void
  @Prop({ required: true }) editDetails: () => void
  @Prop({ required: true }) deleteDoc: () => void

  capitalize = capitalize
  showMenu = false
  showConfirmation = false

  confirmDelete() {
    this.deleteDoc()
    this.showConfirmation = false
  }
}
</script>
