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
        {{ translatedLabel }}
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
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { snackbarStore } from '@/plugins/store-accessor'
import { Document } from 'api-client'

@Component
export default class UploadButton extends Vue {
  @Prop({ default: 'upload' })
  label: string

  @Prop({ default: null })
  prependIcon: string

  @Prop({ default: false })
  textButton: boolean

  file: File | null = null
  multiple = false
  snackMessage = ''

  onFileInput(event: any) {
    if (event?.target?.files && event.target.files.length) {
      snackbarStore.setParams({
        message: 'uploading',
        dismissable: false,
      })
      snackbarStore.setProgress(0)
      snackbarStore.setVisible(true)

      this.$store
        .dispatch('user/uploadDocument', {
          fileList: event.target.files,
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
                to: `/documents/${document.id}`,
              },
              {
                name: 'view',
                to: `/documents/${document.id}`,
              },
            ],
          })

          return this.$store.dispatch('user/getDocuments')
        })
    }
  }

  get isLoading() {
    return snackbarStore.isVisible && snackbarStore.progress !== null
  }

  get translatedLabel() {
    return this.$i18n.t(this.label)
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
