<template>
  <div>
    <v-menu v-model="showMenu" absolute offset-y style="max-width: 600px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          :title="`${$t('document.documentMenu')}`"
          v-bind="attrs"
          icon
          class="ml-4 text-body-1 font-weight-medium documentMenu a11y-focus"
          color="primary"
          v-on="on"
          @click.prevent="() => {}"
          @keydown.enter="focusDocumentMenuList"
          @keydown.space="focusDocumentMenuList"
        >
          <v-icon>$dots-horizontal</v-icon>
        </v-btn>
      </template>

      <v-list ref="documentMenuList" class="a11y-focus" tabindex="-1">
        <v-list-item v-if="editDetails">
          <v-btn
            class="justify-start"
            text
            @click="editDetails"
            @keydown.enter="editDetails"
          >
            <v-icon small class="mr-2" color="primary">$pencil</v-icon>
            {{ $t('controls.editDetails') }}
          </v-btn>
        </v-list-item>
        <v-list-item v-if="deleteDoc">
          <v-btn
            class="justify-start"
            text
            @click="showConfirmationDialog()"
            @keydown.enter="showConfirmationDialog()"
          >
            <v-icon small class="mr-2" color="primary">$delete</v-icon>
            {{ $t('controls.delete') }}
          </v-btn>
        </v-list-item>
        <v-list-item>
          <v-btn
            class="justify-start"
            text
            @click="download"
            @keydown.enter="download"
          >
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

  focusDocumentMenuList() {
    setTimeout(() => {
      const documentMenuListEl = (this as any).$refs.documentMenuList.$el
      documentMenuListEl.focus()
    }, 300) // small buffer to counter el render delay
  }

  showConfirmationDialog() {
    this.showConfirmation = true
    this.$emit('focusConfirmationDialog')
  }
}
</script>
