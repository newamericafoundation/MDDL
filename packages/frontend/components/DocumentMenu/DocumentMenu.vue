<template>
  <div>
    <v-menu v-model="showMenu" absolute offset-y style="max-width: 600px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          :title="`${$t('document.documentMenu')}`"
          v-bind="attrs"
          icon
          class="ml-4 text-body-1 font-weight-medium documentMenu a11y-focus"
          :color="color"
          v-on="on"
          @click.prevent="() => {}"
          @keydown.enter="focusDocumentMenuList"
          @keydown.space="focusDocumentMenuList"
        >
          <v-icon>$dots-horizontal</v-icon>
        </v-btn>
      </template>

      <DocumentActions
        ref="documentMenuList"
        :document="document"
        :on-delete="onDelete"
        class="a11y-focus"
        tabindex="-1"
      />
    </v-menu>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { Document, DocumentListItem } from 'api-client'

@Component
export default class DocumentMenu extends Vue {
  @Prop({ default: 'grey-7' }) color: string
  @Prop({ required: true }) document: DocumentListItem | Document
  @Prop({ default: () => {} }) onDelete: () => void

  showMenu = false

  focusDocumentMenuList() {
    setTimeout(() => {
      const documentMenuListEl = (this as any).$refs.documentMenuList.$el
      documentMenuListEl.focus()
    }, 300) // small buffer to counter el render delay
  }
}
</script>
