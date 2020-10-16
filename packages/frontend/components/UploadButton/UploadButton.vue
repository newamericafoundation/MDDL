<template>
  <div>
    <label v-if="textButton" class="upload-label text">
      <v-icon v-if="prependIcon" v-text="prependIcon" />
      <p class="font-weight-bold">{{ label }}</p>
      <input
        type="file"
        :multiple="multiple"
        class="fileInput"
        accept="application/pdf, image/jpeg, image/png, image/tiff"
        @change="onFileInput"
      />
    </label>
    <label v-else class="upload-label v-btn">
      <v-icon v-if="prependIcon" v-text="prependIcon" />
      {{ label }}
      <input
        type="file"
        :multiple="multiple"
        class="fileInput"
        accept="application/pdf, image/jpeg, image/png, image/tiff"
        @change="onFileInput"
      />
    </label>
    <v-dialog v-model="showProgressDialog" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Uploading...
          <v-progress-linear
            :value="uploadPercentage"
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <SnackBar v-model="showSnackbar">
      Document Uploaded
      <!-- TODO: Show me once view document is finished -->
      <template v-show="false" v-slot:action="{ attrs }">
        <nuxt-link
          v-if="document"
          v-bind="attrs"
          :to="`documents/${document.id}`"
        >
          Rename
        </nuxt-link>
        <nuxt-link
          v-if="document"
          v-bind="attrs"
          :to="`documents/${document.id}`"
        >
          View
        </nuxt-link>
      </template>
    </SnackBar>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class UploadButton extends Vue {
  @Prop({ default: 'Upload' })
  label: string

  @Prop({ default: null })
  prependIcon: string

  @Prop({ default: false })
  textButton: boolean

  file: File | null = null
  uploadPercentage = 0
  showProgressDialog = false
  showSnackbar = false
  document: Document | null = null
  multiple = false

  onFileInput(event: any) {
    if (event?.target?.files && event.target.files.length) {
      this.showProgressDialog = true
      this.$store
        .dispatch('user/uploadDocument', {
          fileList: event.target.files,
          onUploadProgress: (e: ProgressEvent) => {
            this.uploadPercentage = Math.round((e.loaded / e.total) * 100)
          },
        })
        .then((document: Document) => {
          this.document = document
          this.showProgressDialog = false
          this.showSnackbar = true
          return this.$store.dispatch('user/getDocuments')
        })
    }
  }
}
</script>

<style scoped lang="scss">
.upload-label {
  cursor: pointer;
  &.v-btn {
    padding: 0.5rem 0.7rem 0.5rem 0.5rem;
    background-color: var(--primary);
    color: var(--white);
    & > .v-icon {
      padding: 0;
      color: var(--white);
    }
  }
  &.text {
    color: var(--primary);
  }
  & > input {
    display: none;
  }
}
</style>
