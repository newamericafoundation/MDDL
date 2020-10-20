<template>
  <div>
    <label
      :class="[
        'upload-label',
        textButton ? 'text' : 'v-btn',
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
    <SnackBar v-model="showSnackbar" :dismissable="!isLoading">
      <p class="ma-0">{{ $t(snackMessage) }}</p>
      <!-- TODO: Show me once view document is finished -->
      <template v-show="false" v-slot:action="{ attrs }">
        <nuxt-link
          v-if="document"
          v-bind="attrs"
          :to="localePath(`/documents/${document.id}`)"
          class="font-weight-bold capitalize"
        >
          {{ $t('rename') }}
        </nuxt-link>
        <nuxt-link
          v-if="document"
          v-bind="attrs"
          :to="localePath(`/documents/${document.id}`)"
          class="font-weight-bold capitalize"
        >
          {{ $t('view') }}
        </nuxt-link>
      </template>
      <v-progress-linear
        :value="uploadPercentage"
        color="success"
        class="mb-0"
      ></v-progress-linear>
    </SnackBar>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class UploadButton extends Vue {
  @Prop({ default: 'upload' })
  label: string

  @Prop({ default: null })
  prependIcon: string

  @Prop({ default: false })
  textButton: boolean

  file: File | null = null
  uploadPercentage = 0
  showSnackbar = false
  document: Document | null = null
  multiple = false
  snackMessage = ''

  onFileInput(event: any) {
    if (event?.target?.files && event.target.files.length) {
      this.showSnackbar = true
      this.snackMessage = 'uploading'
      this.$store
        .dispatch('user/uploadDocument', {
          fileList: event.target.files,
          onUploadProgress: (e: ProgressEvent) => {
            this.uploadPercentage = Math.round((e.loaded / e.total) * 100)
          },
        })
        .then((document: Document) => {
          this.document = document
          this.snackMessage = 'uploadComplete'
          return this.$store.dispatch('user/getDocuments')
        })
    }
  }

  get isLoading() {
    return this.showSnackbar && this.uploadPercentage < 100
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
