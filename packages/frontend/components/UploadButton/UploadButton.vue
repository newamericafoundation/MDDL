<template>
  <div>
    <label class="upload-label v-btn">
      <v-icon>mdi-plus</v-icon>
      Upload
      <input
        type="file"
        :multiple="false"
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
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class UploadButton extends Vue {
  file: File | null = null
  uploadPercentage = 0
  showProgressDialog = false
  showSnackbar = false
  document: Document | null = null

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
  padding: 0.5rem 0.7rem 0.5rem 0.5rem;
  background-color: var(--indigo);
  & > input {
    display: none;
  }
  & > .v-icon {
    padding: 0;
  }
}
.upload-label,
.upload-label .v-icon {
  color: var(--white);
}
</style>
