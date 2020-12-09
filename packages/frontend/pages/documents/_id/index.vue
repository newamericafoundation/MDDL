<template>
  <div>
    <AppBar :empty="$vuetify.breakpoint.xs" :breadcrumbs="breadcrumbs">
      <template v-if="$vuetify.breakpoint.xs" v-slot:nav-action>
        <BackButton tabindex="0" />
      </template>
      <template
        v-if="!!document && userStore.isClient && $vuetify.breakpoint.xs"
        v-slot:actions
      >
        <DocumentMenu color="primary" :on-delete="onDelete" />
        <ShareButton :preselected="[document.id]" />
      </template>
      <template
        v-else-if="
          !!document && userStore.isClient && $vuetify.breakpoint.smAndUp
        "
        v-slot:actionsBeneath
      >
        <ShareButton class="my-2" :preselected="[document.id]" />
      </template>
    </AppBar>
    <v-main>
      <v-container v-if="document" class="pa-2 pa-sm-12">
        <template v-if="document.files.length === 1">
          <DocumentFile :document="document" :file="document.files[0]" />
        </template>
        <v-carousel v-else v-model="currentPage">
          <v-carousel-item
            v-for="(file, i) in document.files"
            :key="`page-${i}`"
          >
            <DocumentFile :document="document" :file="file" />
          </v-carousel-item>
        </v-carousel>
        <template v-if="document.description">
          <v-expansion-panels class="mt-4 px-2">
            <v-expansion-panel>
              <v-expansion-panel-header
                class="body-1 font-weight-medium"
                expand-icon="mdi-menu-down"
              >
                {{ capitalize($t('document.description')) }}
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-4 body-1">
                {{ document.description }}
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <div class="vertical-space" />
        </template>
      </v-container>
      <div v-else>
        <v-skeleton-loader
          class="my-2"
          type="list-item-three-line, image, list-item"
        ></v-skeleton-loader>
      </div>
    </v-main>
    <DesktopSideBar>
      <DocumentActions :document="document" />
      <v-divider />
      <div class="pl-8">
        <span class="font-weight-bold">
          {{ $t('dateAdded') }}
        </span>
        <br />
        <span class="grey-7--text">
          {{ documentDate }}
        </span>
      </div>
    </DesktopSideBar>

    <v-dialog
      v-if="document"
      v-model="showDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card rounded="0">
        <v-toolbar flat>
          <v-btn
            class="mr-2 a11y-focus"
            :title="`${$t('navigation.close')}`"
            icon
            :disabled="loading"
            tabindex="0"
            @click.stop="closeDetails"
          >
            <v-icon small>$chevron-left</v-icon>
          </v-btn>
          <v-toolbar-title>{{ $t('controls.editDetails') }}</v-toolbar-title>
          <v-spacer />
          <v-btn
            color="primary"
            text
            :disabled="!valid || loading"
            @click="editDetails"
          >
            {{ $t('controls.done') }}
          </v-btn>
        </v-toolbar>
        <v-container class="pa-8">
          <ValidationObserver ref="observer">
            <v-form @submit.prevent>
              <p class="subtitle-1 capitalize">{{ $t('document.fileName') }}</p>
              <ValidationProvider
                v-slot="{ errors }"
                name="name"
                rules="required|max:255"
              >
                <v-text-field
                  v-model="newName"
                  :error-messages="errors"
                  outlined
                  :placeholder="capitalize($t('document.editNamePlaceholder'))"
                />
              </ValidationProvider>
              <p class="subtitle-1 capitalize">
                {{ $t('document.description') }}
              </p>
              <ValidationProvider
                v-slot="{ errors }"
                name="description"
                rules="max:500"
              >
                <v-textarea
                  v-model="newDescription"
                  :error-messages="errors"
                  outlined
                  :placeholder="
                    capitalize($t('document.enterDescriptionPlaceholder'))
                  "
                />
              </ValidationProvider>
            </v-form>
          </ValidationObserver>
        </v-container>
      </v-card>
    </v-dialog>
    <FooterLinks />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import {
  Document,
  DocumentFile,
  FileDownloadDispositionTypeEnum,
} from 'api-client'
import { format } from 'date-fns'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { capitalize } from '@/assets/js/stringUtils'
import download from '@/assets/js/download'
import { UpdateDocumentInput } from '@/store/document'
import { Breadcrumb } from '@/types/nav'
import { userStore } from '@/plugins/store-accessor'
import { UserRole } from '@/types/user'

@Component({
  layout: 'empty',
  components: {
    ValidationObserver,
    ValidationProvider,
  },
  head() {
    return {
      title: (this as ViewDocument).title,
    }
  },
})
export default class ViewDocument extends Vue {
  capitalize = capitalize
  showMenu = false
  loading = true
  document: Document | null = null
  currentPage = 'page-0'
  showDialog = false
  newName = ''
  newDescription = ''
  recompute = false
  title = ''
  userStore = userStore

  async mounted() {
    this.title = capitalize(this.$t('tabTitles.document') as string)
    const data: Document = await this.$store.dispatch(
      'document/getById',
      this.$route.params.id,
    )

    this.document = data
    this.newName = data.name
    this.newDescription = data.description ?? ''

    this.loading = false

    if (this.$route.query.showDetails === 'true') {
      this.showDialog = true
    }
    this.title = this.document.name
  }

  get documentDate() {
    if (this.document) {
      return format(new Date(this.document.createdDate), 'LLL d, yyyy')
    }
    return ''
  }

  get documentContentSize() {
    if (!this.document) return ''
    const totalBytes = this.document.files
      .map((f) => f.contentLength)
      .reduce(
        (fileContentLength, documentContentLength) =>
          fileContentLength + documentContentLength,
        0,
      )
    const mb = totalBytes / 1000000
    return mb.toFixed(2)
  }

  async editDetails() {
    if (!this.document) return

    this.loading = true
    this.document.name = this.newName
    this.document.description = this.newDescription
    const update: UpdateDocumentInput = {
      id: this.document.id,
      name: this.newName,
      description:
        this.newDescription && this.newDescription.length
          ? this.newDescription
          : null,
    }
    await this.$store.dispatch('document/update', update)
    this.closeDetails()
    this.loading = false
  }

  onDelete() {
    this.$router.push(this.localePath('/'))
  }

  closeDetails() {
    this.newName = this.document!.name
    this.newDescription = this.document!.description ?? ''
    this.showDialog = false
  }

  get valid() {
    // Referencing this.recompute forces this.$refs.observer to be updated
    // eslint-disable-next-line no-unused-expressions
    this.recompute
    return this.$refs.observer instanceof ValidationObserver
      ? (this.$refs.observer as any).flags.valid
      : false
  }

  /**
   * Unfortunately we need this little hack to get Vue to
   * recognise when ValidationObserver is added to the DOM
   */
  @Watch('showDialog')
  recomputer() {
    setTimeout(() => {
      this.recompute = !this.recompute
    }, 100)
  }

  get breadcrumbs() {
    const crumbs: Breadcrumb[] = [
      {
        title: userStore.isClient
          ? 'navigation.dashboard'
          : 'navigation.clients',
        to: '/dashboard',
      },
    ]
    if (
      !userStore.isClient &&
      this.$route.query.ownerName &&
      this.$route.query.ownerId
    )
      crumbs.push({
        title: this.$route.query.ownerName as string,
        to: `/collections/owner/${this.$route.query.ownerId}`,
      })
    if (this.document)
      crumbs.push({
        title: this.document.name,
      })
    return crumbs
  }
}
</script>

<style lang="scss">
.container {
  min-height: calc(100vh - 4rem);
  .vertical-space {
    min-height: 20rem;
  }
}
</style>
