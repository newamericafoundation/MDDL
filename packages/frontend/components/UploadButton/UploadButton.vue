<template>
  <button
    class="upload-container"
    tabindex="0"
    @keydown.enter="openFileInput()"
  >
    <label
      for="file-input"
      :class="[
        'upload-label',
        'font-weight-medium',
        'body-1',
        `px-${px}`,
        textButton ? 'text' : 'v-btn',
        { disabled: isLoading },
        { 'v-btn--outlined': outlined },
        { 'font-weight-bold': textButton },
      ]"
    >
      <v-icon v-if="prependIcon" class="mr-4" small v-text="prependIcon" />
      {{ $t(label) }}
      <input
        id="file-input"
        ref="fileInput"
        type="file"
        :multiple="multiple"
        class="fileInput"
        accept="application/pdf, image/jpeg, image/png, image/tiff"
        @click="resetSelection"
        @keydown.enter="resetSelection()"
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
          <v-btn class="mr-2 a11y-focus" icon @click.stop="reset">
            <v-icon small>$chevron-left</v-icon>
          </v-btn>

          <v-toolbar-title>
            {{ $t('document.editDetailsTitle') }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            color="primary"
            text
            :disabled="!documentName"
            @keydown.enter="uploadDocument()"
            @click="uploadDocument"
          >
            {{ $t('controls.done') }}
          </v-btn>
        </v-toolbar>
        <v-container class="pa-8">
          <p class="subtitle-1">{{ $t('document.fileName') }}</p>
          <ValidationObserver ref="observer">
            <v-form @submit.prevent>
              <ValidationProvider
                v-slot="{ errors }"
                name="name"
                rules="required|max:255"
              >
                <v-text-field
                  v-model="documentName"
                  :error-messages="errors"
                  outlined
                  :placeholder="$t('document.enterNamePlaceholder')"
                />
              </ValidationProvider>
            </v-form>
          </ValidationObserver>
        </v-container>
      </v-card>
    </v-dialog>
  </button>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { snackbarStore } from '@/plugins/store-accessor'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import SnackParams from '@/types/snackbar'

@Component({
  components: {
    ValidationObserver,
    ValidationProvider,
  },
})
export default class UploadButton extends Vue {
  @Prop({ default: 'controls.upload' })
  label: string

  @Prop({ default: null })
  prependIcon: string

  @Prop({ default: false })
  textButton: boolean

  @Prop({ default: false }) outlined: boolean

  @Prop({ default: '4' }) px: string | number

  multiple = false
  showDialog = false
  files: FileList = {
    length: 0,
    item: () => null,
  }

  snackMessage = ''
  documentName = ''

  resetSelection(event: any) {
    event.target.value = ''
  }

  onFileInput(event: any) {
    if (event?.target?.files && event.target.files.length) {
      for (const file of event.target.files) {
        if (file.size > this.$config.maxFileSize) {
          snackbarStore.setParams({
            message: 'toast.fileTooLarge',
          })
          snackbarStore.setVisible(true)
          return
        }
      }
      this.files = event.target.files
      this.documentName = event.target.files[0].name
        .split('.')
        .slice(0, -1)
        .join('.')
      this.showDialog = true
    }
  }

  async uploadDocument() {
    snackbarStore.setParams({
      message: 'toast.uploading',
      dismissable: false,
      timeoutMilliseconds: 0,
    } as SnackParams)
    snackbarStore.setProgress(0)
    snackbarStore.setVisible(true)

    this.showDialog = false

    const document = await this.$store.dispatch('user/uploadDocument', {
      fileList: this.files,
      name: this.documentName,
      onUploadProgress: (e: ProgressEvent) => {
        snackbarStore.setProgress(Math.round((e.loaded / e.total) * 100))
      },
    })

    snackbarStore.setParams({
      message: 'toast.uploadComplete',
      actions: [
        {
          name: 'controls.view',
          to: `/documents/${document.id}`,
        },
      ],
    })

    this.$emit('complete')

    this.reset()
  }

  get isLoading() {
    return snackbarStore.isVisible && snackbarStore.progress !== null
  }

  openFileInput() {
    ;(this as any).$refs.fileInput.click()
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
  min-width: $button-min-width;
  justify-content: start;

  &:not(.disabled) {
    cursor: pointer;
  }
  &.v-btn {
    padding: 0.5rem 0.7rem 0.5rem 0.5rem;
    background-color: var(--primary);
    color: var(--white);
    height: 36px;
    &.v-btn--outlined {
      background-color: transparent !important;
      color: var(--primary);
      box-shadow: none !important;
    }
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
