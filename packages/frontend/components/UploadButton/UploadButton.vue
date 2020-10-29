<template>
  <div>
    <label
      :class="[
        'upload-label',
        textButton ? 'text' : 'v-btn capitalize',
        { disabled: isLoading },
      ]"
    >
      <v-icon v-if="prependIcon" v-text="prependIcon" />
      <p :class="[{ 'font-weight-bold': textButton }, 'capitalize', 'ma-0']">
        {{ $t(label) }}
      </p>
      <input
        type="file"
        :multiple="multiple"
        :disabled="isLoading"
        class="fileInput"
        accept="application/pdf, image/jpeg, image/png, image/tiff"
        @change="onFileInput"
      />
    </label>
    <v-dialog
      v-model="showDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <template v-slot:activator="{ on, attrs }">
        <slot name="activator" v-bind="attrs" v-on="on" />
      </template>
      <v-card>
        <v-toolbar flat>
          <v-icon class="mr-2" @click.stop="reset">$chevron-left</v-icon>
          <v-toolbar-title>{{ $t('details') }}</v-toolbar-title>
          <v-spacer />
          <v-btn
            color="primary"
            text
            :disabled="!documentName"
            @click="uploadDocument"
          >
            {{ $t('upload') }}
          </v-btn>
        </v-toolbar>
        <v-container class="pa-8">
          <p class="subtitle-1">{{ capitalize($t('name')) }}</p>
          <ValidationObserver ref="observer">
            <v-form @submit.prevent>
              <ValidationProvider
                v-slot="{ errors }"
                name="name"
                rules="required"
              >
                <v-text-field
                  v-model="documentName"
                  :error-messages="errors"
                  outlined
                  :placeholder="capitalize($t('enterDocumentNamePlaceholder'))"
                />
              </ValidationProvider>
            </v-form>
          </ValidationObserver>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { snackbarStore } from '@/plugins/store-accessor'
import { Document } from 'api-client'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { capitalize } from '@/assets/js/stringUtils'

@Component({
  components: {
    ValidationObserver,
    ValidationProvider,
  },
})
export default class UploadButton extends Vue {
  capitalize = capitalize

  @Prop({ default: 'upload' })
  label: string

  @Prop({ default: null })
  prependIcon: string

  @Prop({ default: false })
  textButton: boolean

  multiple = false
  showDialog = false
  files: FileList = {
    length: 0,
    item: () => null,
  }

  snackMessage = ''
  documentName = ''

  onFileInput(event: any) {
    if (event?.target?.files && event.target.files.length) {
      this.files = event.target.files
      this.showDialog = true
    }
  }

  uploadDocument() {
    snackbarStore.setParams({
      message: 'uploading',
      dismissable: false,
    })
    snackbarStore.setProgress(0)
    snackbarStore.setVisible(true)

    this.showDialog = false

    this.$store
      .dispatch('user/uploadDocument', {
        fileList: this.files,
        name: this.documentName,
        onUploadProgress: (e: ProgressEvent) => {
          snackbarStore.setProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      .then((document: Document) => {
        snackbarStore.setParams({
          message: 'uploadComplete',
          actions: [
            {
              name: 'rename',
              to: `/documents/${document.id}/edit`,
            },
            {
              name: 'view',
              to: `/documents/${document.id}`,
            },
          ],
        })

        this.$store.dispatch('user/getDocuments')

        this.reset()
      })
  }

  get isLoading() {
    return snackbarStore.isVisible && snackbarStore.progress !== null
  }

  reset() {
    this.showDialog = false
    this.files = {
      length: 0,
      item: () => null,
    }
    this.snackMessage = ''
    this.documentName = ''
  }
}
</script>

<style scoped lang="scss">
.upload-label {
  &:not(.disabled) {
    cursor: pointer;
  }
  &.v-btn {
    padding: 0.5rem 0.7rem 0.5rem 0.5rem;
    background-color: var(--primary);
    color: var(--white);
    height: 36px;
    &.disabled {
      background-color: var(--grey-3);
      color: var(--grey-5);
      .v-icon {
        color: var(--grey-5);
      }
    }
    .v-icon {
      padding: 0;
      color: var(--white);
    }
  }
  &.text {
    color: var(--primary);
    &.disabled {
      color: var(--grey-5);
    }
  }
  & > input {
    display: none;
  }

  .upload-text .v-snack__content {
    padding-top: 0;
  }
}
</style>
